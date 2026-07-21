import { inngest } from '../lib/inngest';
import { db } from '../lib/db';
import { extractTasksFromText } from '../lib/ai';

/**
 * 1. Guest Request Event Handler
 */
export const handleGuestRequest = inngest.createFunction(
  { id: 'handle-guest-request' },
  { event: 'guest.request.created' },
  async ({ event, step }) => {
    const { propertyId, roomNumber, messageText, eventId } = event.data;

    // A. Parse intent using Vercel AI SDK
    const aiResult = await step.run('ai-extract-tasks', async () => {
      return await extractTasksFromText(messageText, { roomNumber });
    });

    // B. Resolve room and active booking context
    const context = await step.run('resolve-room-booking', async () => {
      const room = await db.room.findFirst({
        where: { propertyId, roomNumber },
      });
      let bookingId = null;
      if (room) {
        const activeBooking = await db.booking.findFirst({
          where: { roomId: room.id, status: 'CHECKED_IN' },
        });
        if (activeBooking) bookingId = activeBooking.id;
      }
      return { roomId: room?.id, bookingId };
    });

    // C. Create Workflow
    const workflow = await step.run('create-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          bookingId: context.bookingId,
          type: 'GUEST_REQUEST',
          status: 'IN_PROGRESS',
        },
      });
    });

    // D. Persist Event linkage if eventId is provided
    if (eventId) {
      await step.run('link-event-to-workflow', async () => {
        await db.event.update({
          where: { id: eventId },
          data: { processed: true, workflowId: workflow.id },
        });
      });
    }

    // E. Spawn Tasks
    const spawnedTasks = [];
    for (const extractedTask of aiResult.tasks) {
      const task = await step.run(`create-task-${extractedTask.title.replace(/\s+/g, '-').slice(0, 30)}`, async () => {
        let department = await db.department.findFirst({
          where: { propertyId, name: extractedTask.departmentName },
        });
        if (!department) {
          department = await db.department.findFirst({
            where: { propertyId, name: 'Reception' },
          });
        }
        if (!department) return null;

        const dueMinutes = extractedTask.dueInMinutes || 30;
        const dueDate = new Date(Date.now() + dueMinutes * 60 * 1000);

        const createdTask = await db.task.create({
          data: {
            propertyId,
            workflowId: workflow.id,
            departmentId: department.id,
            roomId: context.roomId,
            title: extractedTask.title,
            description: extractedTask.description,
            priority: extractedTask.priority,
            status: 'PENDING',
            dueDate,
          },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'TASK_CREATED',
            entityType: 'TASK',
            entityId: createdTask.id,
            details: `AI parsed and created task: "${createdTask.title}" for ${department.name}. Due in ${dueMinutes} mins.`,
          },
        });

        // Notifications for users in target department
        const deptUsers = await db.user.findMany({
          where: { propertyId, departmentId: department.id },
        });

        for (const user of deptUsers) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: createdTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `New Guest Request Task: "${createdTask.title}" in Room ${roomNumber || 'Unknown'}.`,
            },
          });
        }

        return { id: createdTask.id, dueMinutes, title: createdTask.title };
      });

      if (task) {
        spawnedTasks.push(task);
      }
    }

    // F. SLA Monitor and Escalation Delay Steps
    for (const task of spawnedTasks) {
      await step.sleep(`wait-sla-${task.id}`, `${task.dueMinutes}m`);

      await step.run(`evaluate-sla-${task.id}`, async () => {
        const currentTask = await db.task.findUnique({
          where: { id: task.id },
        });
        
        if (currentTask && currentTask.status !== 'COMPLETED' && currentTask.status !== 'CANCELLED') {
          await db.task.update({
            where: { id: task.id },
            data: { status: 'ESCALATED' },
          });

          await db.auditLog.create({
            data: {
              propertyId,
              action: 'TASK_SLA_BREACHED',
              entityType: 'TASK',
              entityId: task.id,
              details: `Task "${task.title}" breached SLA deadline. Escalated to Management.`,
            },
          });

          // Notify managers & supervisors
          const escUsers = await db.user.findMany({
            where: {
              propertyId,
              role: { in: ['MANAGER', 'SUPERVISOR'] },
            },
          });

          for (const user of escUsers) {
            await db.notification.create({
              data: {
                propertyId,
                taskId: task.id,
                userId: user.id,
                channel: 'IN_APP',
                recipient: user.email,
                status: 'SENT',
                message: `SLA BREACH ALERT: "${task.title}" is overdue and has been escalated!`,
              },
            });
          }
        }
      });
    }

    return { success: true, tasksCreated: spawnedTasks.length };
  }
);

/**
 * 2. Booking Created Event Handler
 */
export const handleBookingCreated = inngest.createFunction(
  { id: 'handle-booking-created' },
  { event: 'booking.created' },
  async ({ event, step }) => {
    const { propertyId, bookingId, guestName, roomNumber, checkIn, eventId } = event.data;

    const context = await step.run('resolve-booking-details', async () => {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: { room: true },
      });
      return { booking };
    });

    if (!context.booking) return { success: false, error: 'Booking not found' };
    const roomId = context.booking.roomId;

    // Create Pre-Arrival Preparation Workflow
    const workflow = await step.run('create-booking-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          bookingId,
          type: 'BOOKING_PREPARATION',
          status: 'PENDING',
        },
      });
    });

    // Persist Event linkage if eventId is provided
    if (eventId) {
      await step.run('link-event-to-workflow', async () => {
        await db.event.update({
          where: { id: eventId },
          data: { processed: true, workflowId: workflow.id },
        });
      });
    }

    // Workflow Audit Log
    await step.run('create-workflow-audit-log', async () => {
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'WORKFLOW_CREATED',
          entityType: 'WORKFLOW',
          entityId: workflow.id,
          details: `Pre-arrival preparation workflow created for Guest ${guestName} (Room ${roomNumber}).`,
        },
      });
    });

    // 1. Trigger Housekeeping cleanup task
    await step.run('create-housekeeping-task', async () => {
      const hkDept = await db.department.findFirst({
        where: { propertyId, name: 'Housekeeping' },
      });
      if (hkDept) {
        const createdTask = await db.task.create({
          data: {
            propertyId,
            workflowId: workflow.id,
            departmentId: hkDept.id,
            roomId,
            title: `Prepare Room ${roomNumber} for Check-In`,
            description: `Guest ${guestName} arriving. Full room prep & inspect required.`,
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date(checkIn),
          },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'TASK_CREATED',
            entityType: 'TASK',
            entityId: createdTask.id,
            details: `Pre-arrival prep workflow spawned task: "${createdTask.title}" for Housekeeping.`,
          },
        });

        // Notifications
        const hkUsers = await db.user.findMany({
          where: { propertyId, departmentId: hkDept.id },
        });
        for (const user of hkUsers) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: createdTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `New Prep Task: "${createdTask.title}". Guest arriving soon.`,
            },
          });
        }
      }
    });

    // 2. Trigger Front Desk Welcome Kit task
    await step.run('create-reception-task', async () => {
      const fdDept = await db.department.findFirst({
        where: { propertyId, name: 'Reception' },
      });
      if (fdDept) {
        const createdTask = await db.task.create({
          data: {
            propertyId,
            workflowId: workflow.id,
            departmentId: fdDept.id,
            title: `Prepare Welcome Kit: ${guestName}`,
            description: `Check-in key cards, registration card, and welcome vouchers.`,
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: new Date(checkIn),
          },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'TASK_CREATED',
            entityType: 'TASK',
            entityId: createdTask.id,
            details: `Pre-arrival prep workflow spawned task: "${createdTask.title}" for Reception.`,
          },
        });

        // Notifications
        const fdUsers = await db.user.findMany({
          where: { propertyId, departmentId: fdDept.id },
        });
        for (const user of fdUsers) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: createdTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `New Prep Task: "${createdTask.title}". Guest arriving soon.`,
            },
          });
        }
      }
    });

    return { success: true };
  }
);

/**
 * 3. Inventory Low Event Handler
 */
export const handleInventoryLow = inngest.createFunction(
  { id: 'handle-inventory-low' },
  { event: 'inventory.low' },
  async ({ event, step }) => {
    const { propertyId, itemName, currentLevel, minimumLevel, unit, eventId } = event.data;

    const procDept = await step.run('resolve-procurement-department', async () => {
      return await db.department.findFirst({
        where: { propertyId, name: 'Procurement' },
      });
    });

    if (!procDept) return { success: false, error: 'Procurement department not configured' };

    const workflow = await step.run('create-inventory-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          type: 'INVENTORY_REFILL',
          status: 'IN_PROGRESS',
        },
      });
    });

    // Persist Event linkage if eventId is provided
    if (eventId) {
      await step.run('link-event-to-workflow', async () => {
        await db.event.update({
          where: { id: eventId },
          data: { processed: true, workflowId: workflow.id },
        });
      });
    }

    // Workflow Audit Log
    await step.run('create-workflow-audit-log', async () => {
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'WORKFLOW_CREATED',
          entityType: 'WORKFLOW',
          entityId: workflow.id,
          details: `Inventory Refill workflow triggered for item "${itemName}".`,
        },
      });
    });

    // Update the inventory quantity in the database to match the simulated alert level
    await step.run('update-inventory-quantity', async () => {
      const dbItem = await db.inventoryItem.findFirst({
        where: { propertyId, name: itemName },
      });
      if (dbItem) {
        await db.inventoryItem.update({
          where: { id: dbItem.id },
          data: { quantity: currentLevel },
        });
      }
    });

    await step.run('create-procurement-task', async () => {
      const createdTask = await db.task.create({
        data: {
          propertyId,
          workflowId: workflow.id,
          departmentId: procDept.id,
          title: `Restock item: ${itemName}`,
          description: `Alert triggered. Current inventory level is ${currentLevel} ${unit}, falling below the threshold of ${minimumLevel} ${unit}.`,
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 Hours SLA
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'TASK_CREATED',
          entityType: 'TASK',
          entityId: createdTask.id,
          details: `Inventory alert spawned task: "${createdTask.title}" for Procurement.`,
        },
      });

      // Notifications
      const procUsers = await db.user.findMany({
        where: { propertyId, departmentId: procDept.id },
      });
      for (const user of procUsers) {
        await db.notification.create({
          data: {
            propertyId,
            taskId: createdTask.id,
            userId: user.id,
            channel: 'IN_APP',
            recipient: user.email,
            status: 'SENT',
            message: `Low Stock Alert: "${createdTask.title}" requires restocking.`,
          },
        });
      }
    });

    return { success: true };
  }
);

/**
 * 4. Maintenance Due Event Handler
 */
export const handleMaintenanceDue = inngest.createFunction(
  { id: 'handle-maintenance-due' },
  { event: 'maintenance.due' },
  async ({ event, step }) => {
    const { propertyId, assetName, maintenanceType, eventId } = event.data;

    const maintDept = await step.run('resolve-maintenance-department', async () => {
      return await db.department.findFirst({
        where: { propertyId, name: 'Maintenance' },
      });
    });

    if (!maintDept) return { success: false, error: 'Maintenance department not configured' };

    const workflow = await step.run('create-maintenance-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          type: 'MAINTENANCE',
          status: 'PENDING',
        },
      });
    });

    // Persist Event linkage if eventId is provided
    if (eventId) {
      await step.run('link-event-to-workflow', async () => {
        await db.event.update({
          where: { id: eventId },
          data: { processed: true, workflowId: workflow.id },
        });
      });
    }

    // Workflow Audit Log
    await step.run('create-workflow-audit-log', async () => {
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'WORKFLOW_CREATED',
          entityType: 'WORKFLOW',
          entityId: workflow.id,
          details: `Maintenance workflow triggered for asset "${assetName}".`,
        },
      });
    });

    await step.run('create-maintenance-task', async () => {
      const createdTask = await db.task.create({
        data: {
          propertyId,
          workflowId: workflow.id,
          departmentId: maintDept.id,
          title: `Scheduled Maintenance: ${assetName}`,
          description: `Routine maintenance required: "${maintenanceType}"`,
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours SLA
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'TASK_CREATED',
          entityType: 'TASK',
          entityId: createdTask.id,
          details: `Asset alert spawned task: "${createdTask.title}" for Maintenance.`,
        },
      });

      // Notifications
      const maintUsers = await db.user.findMany({
        where: { propertyId, departmentId: maintDept.id },
      });
      for (const user of maintUsers) {
        await db.notification.create({
          data: {
            propertyId,
            taskId: createdTask.id,
            userId: user.id,
            channel: 'IN_APP',
            recipient: user.email,
            status: 'SENT',
            message: `Scheduled Maintenance Task: "${createdTask.title}" for Maintenance.`,
          },
        });
      }
    });

    return { success: true };
  }
);

/**
 * 5. SOP Engine Trigger (Inngest Cron Scheduler)
 * Runs periodically to trigger SOP procedures.
 */
export const checkSopCron = inngest.createFunction(
  { id: 'check-sop-cron' },
  { cron: '0 7 * * *' }, // Runs every morning at 7:00 AM
  async ({ step }) => {
    const activeSops = await step.run('find-active-sops', async () => {
      return await db.sOP.findMany({
        where: { active: true },
      });
    });

    const events = activeSops.map((sop) => ({
      name: 'sop.triggered',
      data: {
        propertyId: sop.propertyId,
        sopId: sop.id,
        sopName: sop.name,
      },
    }));

    if (events.length > 0) {
      await step.run('send-sop-triggered-events', async () => {
        await inngest.send(events);
      });
    }

    return { triggeredCount: events.length };
  }
);

/**
 * 6. SOP Triggered Handler
 * Listens to "sop.triggered", creates Workflow of type SOP and spawns task checklist templates.
 */
export const handleSopTriggered = inngest.createFunction(
  { id: 'handle-sop-triggered' },
  { event: 'sop.triggered' },
  async ({ event, step }) => {
    const { propertyId, sopId, sopName } = event.data;

    // Create Workflow
    const workflow = await step.run('create-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          type: 'SOP',
          status: 'IN_PROGRESS',
        },
      });
    });

    // Create Event Database record
    const dbEvent = await step.run('persist-sop-event', async () => {
      return await db.event.create({
        data: {
          propertyId,
          type: 'SOP_TRIGGERED',
          source: 'SYSTEM',
          metadata: { sopId, sopName },
          processed: true,
          workflowId: workflow.id,
        },
      });
    });

    // Query SOP Task templates
    const templates = await step.run('query-sop-templates', async () => {
      return await db.sOPTaskTemplate.findMany({
        where: { sopId },
        include: { department: true },
      });
    });

    // Workflow Audit Log
    await step.run('create-sop-workflow-audit-log', async () => {
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'WORKFLOW_CREATED',
          entityType: 'WORKFLOW',
          entityId: workflow.id,
          details: `SOP Checklist Workflow triggered: "${sopName}" (Linked Event ID: ${dbEvent.id}).`,
        },
      });
    });

    // Spawn tasks
    const spawnedTasks = [];
    for (const template of templates) {
      const task = await step.run(`create-sop-task-${template.id.slice(0, 8)}`, async () => {
        const createdTask = await db.task.create({
          data: {
            propertyId,
            workflowId: workflow.id,
            departmentId: template.departmentId,
            title: template.title,
            description: template.description,
            priority: template.priority,
            status: 'PENDING',
            dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours SLA
          },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'TASK_CREATED',
            entityType: 'TASK',
            entityId: createdTask.id,
            details: `SOP "${sopName}" spawned task: "${createdTask.title}" for ${template.department.name}.`,
          },
        });

        // Notify department users
        const deptUsers = await db.user.findMany({
          where: { propertyId, departmentId: template.departmentId },
        });

        for (const user of deptUsers) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: createdTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `New SOP Checklist Task: "${createdTask.title}" has been assigned to your department.`,
            },
          });
        }

        return createdTask.id;
      });
      spawnedTasks.push(task);
    }

    return { success: true, tasksCount: spawnedTasks.length };
  }
);

/**
 * 7. Purchase Request Event Handler
 */
export const handlePurchaseRequest = inngest.createFunction(
  { id: 'handle-purchase-request' },
  { event: 'purchase.request.created' },
  async ({ event, step }) => {
    const { propertyId, eventId, vendorId, itemName, quantity, unit, estimatedCost } = event.data;

    // A. Resolve Management department
    const mgmtDept = await step.run('resolve-management-department', async () => {
      return await db.department.findFirst({
        where: { propertyId, name: 'Management' },
      });
    });

    if (!mgmtDept) return { success: false, error: 'Management department not configured' };

    // B. Create PURCHASE_REQUEST workflow
    const workflow = await step.run('create-purchase-workflow', async () => {
      return await db.workflow.create({
        data: {
          propertyId,
          type: 'PURCHASE_REQUEST',
          status: 'PENDING',
        },
      });
    });

    // C. Link Event to Workflow
    if (eventId) {
      await step.run('link-event-to-workflow', async () => {
        await db.event.update({
          where: { id: eventId },
          data: { processed: true, workflowId: workflow.id },
        });
      });
    }

    // D. Fetch vendor details
    const vendor = await step.run('fetch-vendor-details', async () => {
      return await db.vendor.findUnique({
        where: { id: vendorId },
      });
    });

    const vendorName = vendor ? vendor.name : 'Unknown Vendor';

    // E. Create Approval Task
    const approvalTask = await step.run('create-approval-task', async () => {
      const createdTask = await db.task.create({
        data: {
          propertyId,
          workflowId: workflow.id,
          departmentId: mgmtDept.id,
          title: `Approve Purchase: ${quantity} ${unit} of ${itemName}`,
          description: `Purchase request from department for item "${itemName}" from vendor "${vendorName}". Est. Cost: $${estimatedCost}.`,
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours SLA
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'PURCHASE_REQUEST_SUBMITTED',
          entityType: 'TASK',
          entityId: createdTask.id,
          details: `Purchase Request Submitted: "${createdTask.title}". Awaiting Management approval.`,
        },
      });

      // Notify managers
      const managers = await db.user.findMany({
        where: { propertyId, role: { in: ['MANAGER', 'SUPERVISOR'] } },
      });

      for (const user of managers) {
        await db.notification.create({
          data: {
            propertyId,
            taskId: createdTask.id,
            userId: user.id,
            channel: 'IN_APP',
            recipient: user.email,
            status: 'SENT',
            message: `New Purchase Approval Required: "${createdTask.title}". Est Cost: $${estimatedCost}.`,
          },
        });
      }

      return { id: createdTask.id, title: createdTask.title };
    });

    // F. SLA Monitoring (Wait 2 hours)
    await step.sleep(`wait-sla-pr-${approvalTask.id}`, '2h');

    await step.run(`evaluate-sla-pr-${approvalTask.id}`, async () => {
      const currentTask = await db.task.findUnique({
        where: { id: approvalTask.id },
      });

      if (currentTask && currentTask.status !== 'COMPLETED' && currentTask.status !== 'CANCELLED') {
        await db.task.update({
          where: { id: approvalTask.id },
          data: { status: 'ESCALATED' },
        });

        await db.auditLog.create({
          data: {
            propertyId,
            action: 'PURCHASE_REQUEST_SLA_BREACH',
            entityType: 'TASK',
            entityId: approvalTask.id,
            details: `Purchase request approval task "${approvalTask.title}" breached 2-hour SLA. Escalating.`,
          },
        });

        // Notify Owner
        const owners = await db.user.findMany({
          where: { propertyId, role: 'OWNER' },
        });

        for (const user of owners) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: approvalTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `SLA ESCALATION: Purchase request "${approvalTask.title}" is overdue and requires immediate approval!`,
            },
          });
        }
      }
    });

    return { success: true };
  }
);

/**
 * 8. Task Completed Workflow Chaining Handler
 */
export const handleTaskCompleted = inngest.createFunction(
  { id: 'handle-task-completed' },
  { event: 'task.completed' },
  async ({ event, step }) => {
    const { workflowId, title } = event.data;

    // A. Resolve Workflow
    const workflow = await step.run('resolve-workflow', async () => {
      return await db.workflow.findUnique({
        where: { id: workflowId },
      });
    });

    if (!workflow || workflow.type !== 'PURCHASE_REQUEST') {
      return { success: true, message: 'Not a purchase request workflow task' };
    }

    // B. Find source event to get details
    const sourceEvent = await step.run('find-source-event', async () => {
      return await db.event.findFirst({
        where: { workflowId: workflow.id, type: 'PURCHASE_REQUEST_CREATED' },
      });
    });

    if (!sourceEvent) {
      return { success: false, error: 'Source purchase request event not found' };
    }

    const metadata = sourceEvent.metadata as Record<string, string | number | boolean>;
    const itemName = metadata.itemName as string;
    const quantity = metadata.quantity as number;
    const unit = metadata.unit as string;
    const vendorId = metadata.vendorId as string;
    const departmentId = metadata.departmentId as string;
    const propertyId = metadata.propertyId as string;

    // C. Determine next step:
    // If the completed task was the Approval task, spawn Delivery Verification task
    if (title.startsWith('Approve Purchase:')) {
      await step.run('spawn-delivery-verification-task', async () => {
        // Find Procurement department
        let procDept = await db.department.findFirst({
          where: { propertyId, name: 'Procurement' },
        });
        if (!procDept) {
          procDept = await db.department.findFirst({
            where: { propertyId, id: departmentId },
          });
        }
        if (!procDept) return;

        const vendor = await db.vendor.findUnique({
          where: { id: vendorId },
        });
        const vendorName = vendor ? vendor.name : 'Unknown Vendor';

        // Update workflow to IN_PROGRESS
        await db.workflow.update({
          where: { id: workflow.id },
          data: { status: 'IN_PROGRESS' },
        });

        // Create Delivery Verification Task
        const deliveryTask = await db.task.create({
          data: {
            propertyId,
            workflowId: workflow.id,
            departmentId: procDept.id,
            title: `Verify Delivery: ${quantity} ${unit} of ${itemName}`,
            description: `Purchase order approved. Verify delivery of items from vendor "${vendorName}". Once verified, complete this task to update inventory levels automatically.`,
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours SLA
          },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'PURCHASE_REQUEST_APPROVED',
            entityType: 'WORKFLOW',
            entityId: workflow.id,
            details: `Purchase request approved by supervisor. Spawned delivery verification task: "${deliveryTask.title}".`,
          },
        });

        // Notify procurement
        const procUsers = await db.user.findMany({
          where: { propertyId, departmentId: procDept.id },
        });

        for (const user of procUsers) {
          await db.notification.create({
            data: {
              propertyId,
              taskId: deliveryTask.id,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `Delivery Verification Required: "${deliveryTask.title}" has been dispatched.`,
            },
          });
        }
      });
    } 
    // If the completed task was the Delivery Verification task, update inventory and complete workflow
    else if (title.startsWith('Verify Delivery:')) {
      await step.run('complete-delivery-verification', async () => {
        // Find Inventory Item by name (case-insensitive match)
        const inventoryItems = await db.inventoryItem.findMany({
          where: { propertyId },
        });

        const matchingItem = inventoryItems.find(
          (item) => item.name.toLowerCase() === itemName.toLowerCase()
        );

        let finalDetails = `Verified delivery of ${quantity} ${unit} of ${itemName} from vendor.`;

        if (matchingItem) {
          const updatedItem = await db.inventoryItem.update({
            where: { id: matchingItem.id },
            data: {
              quantity: {
                increment: quantity,
              },
            },
          });
          finalDetails += ` Successfully incremented inventory stock for "${updatedItem.name}" to ${updatedItem.quantity} ${updatedItem.unit}.`;
        } else {
          // If the item doesn't exist, create it in the database
          const createdItem = await db.inventoryItem.create({
            data: {
              propertyId,
              departmentId,
              name: itemName,
              unit,
              quantity,
              minimumLevel: 10.0, // Default threshold
            },
          });
          finalDetails += ` Item "${createdItem.name}" did not exist; created new inventory profile with quantity ${quantity} ${unit}.`;
        }

        // Update workflow to COMPLETED
        await db.workflow.update({
          where: { id: workflow.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'INVENTORY_DELIVERY_VERIFIED',
            entityType: 'INVENTORY_ITEM',
            entityId: matchingItem?.id || workflow.id,
            details: finalDetails,
          },
        });

        // Notify originating department of completion
        const deptUsers = await db.user.findMany({
          where: { propertyId, departmentId },
        });

        for (const user of deptUsers) {
          await db.notification.create({
            data: {
              propertyId,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `Delivery Fulfilled: Your requested items (${quantity} ${unit} of "${itemName}") have arrived and been verified!`,
            },
          });
        }
      });
    }

    return { success: true };
  }
);

/**
 * 9. Third-Party Communications Dispatcher
 * Simulates outgoing WhatsApp, Email, SMS, and Push notifications.
 */
export const handleNotificationCreated = inngest.createFunction(
  { id: 'handle-notification-created' },
  { event: 'notification.created' },
  async ({ event, step }) => {
    const { notificationId } = event.data;

    const notif = await step.run('fetch-notification', async () => {
      return await db.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });
    });

    if (!notif) return { success: false, error: 'Notification not found' };

    const dispatchResult = await step.run('dispatch-communication', async () => {
      console.log(`[Notification Dispatcher] Dispatching ${notif.channel} notification ${notif.id}`);
      
      let dispatchLog = '';
      try {
        if (notif.channel === 'EMAIL') {
          const resendApiKey = process.env.RESEND_API_KEY;
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
          if (!resendApiKey) throw new Error('RESEND_API_KEY is not defined in the environment.');

          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: notif.recipient,
              subject: 'HospitalityOS Alert',
              html: `<p>${notif.message}</p>`,
            }),
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Resend API failed: ${errorText}`);
          }
          dispatchLog = `Email sent successfully to <${notif.recipient}> via Resend.`;
          console.log(dispatchLog);
        } else if (notif.channel === 'SMS') {
          const twilioSid = process.env.TWILIO_ACCOUNT_SID;
          const twilioToken = process.env.TWILIO_AUTH_TOKEN;
          const twilioFrom = process.env.TWILIO_FROM_NUMBER;
          if (!twilioSid || !twilioToken || !twilioFrom) {
            throw new Error('Twilio SMS configurations (SID, Token, or From number) are missing in environment.');
          }

          const params = new URLSearchParams();
          params.append('To', notif.recipient);
          params.append('From', twilioFrom);
          params.append('Body', notif.message);

          const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Twilio SMS failed: ${errorText}`);
          }
          dispatchLog = `SMS message sent successfully to ${notif.recipient} via Twilio.`;
          console.log(dispatchLog);
        } else if (notif.channel === 'WHATSAPP') {
          const twilioSid = process.env.TWILIO_ACCOUNT_SID;
          const twilioToken = process.env.TWILIO_AUTH_TOKEN;
          const twilioWaFrom = process.env.TWILIO_WHATSAPP_NUMBER;
          if (!twilioSid || !twilioToken || !twilioWaFrom) {
            throw new Error('Twilio WhatsApp configurations (SID, Token, or WhatsApp From number) are missing in environment.');
          }

          const toNum = notif.recipient.startsWith('whatsapp:') ? notif.recipient : `whatsapp:${notif.recipient}`;
          const fromNum = twilioWaFrom.startsWith('whatsapp:') ? twilioWaFrom : `whatsapp:${twilioWaFrom}`;
          const params = new URLSearchParams();
          params.append('To', toNum);
          params.append('From', fromNum);
          params.append('Body', notif.message);

          const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Twilio WhatsApp failed: ${errorText}`);
          }
          dispatchLog = `WhatsApp message sent successfully to ${notif.recipient} via Twilio.`;
          console.log(dispatchLog);
        } else if (notif.channel === 'PUSH') {
          dispatchLog = `Push notification registered for device of ${notif.user.name}:\n"${notif.message}"`;
          console.log(dispatchLog);
        } else {
          dispatchLog = `In-App notification logged for ${notif.user.name}.`;
        }

        // Update status to SENT in the database
        await db.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT' },
        });

        // Write dispatch entry in the audit log
        await db.auditLog.create({
          data: {
            propertyId: notif.propertyId,
            action: `NOTIFICATION_DISPATCHED_${notif.channel}`,
            entityType: 'NOTIFICATION',
            entityId: notif.id,
            details: `Dispatched ${notif.channel} notification to ${notif.recipient}. Status: SENT. Details: ${dispatchLog}`,
          },
        });

        return { success: true, dispatchLog };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Notification Dispatcher] Dispatch failed: ${errMsg}`);
        
        await db.notification.update({
          where: { id: notificationId },
          data: { status: 'FAILED' },
        });

        await db.auditLog.create({
          data: {
            propertyId: notif.propertyId,
            action: `NOTIFICATION_FAILED_${notif.channel}`,
            entityType: 'NOTIFICATION',
            entityId: notif.id,
            details: `Failed to dispatch ${notif.channel} notification to ${notif.recipient}. Error: ${errMsg}`,
          },
        });

        throw err; // Bubble up error to trigger Inngest retry rules
      }
    });

    return { success: true, dispatchResult };
  }
);

