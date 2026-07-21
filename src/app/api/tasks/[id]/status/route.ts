import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { TaskStatus } from '@prisma/client';
import { sendInngestEvent } from '../../../../../lib/inngest';

const ALLOWED_STATUSES: TaskStatus[] = ['IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'ESCALATED', 'CANCELLED'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, userRole }: { status: TaskStatus; userRole?: string } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Retrieve the existing task to inspect department
    const existingTask = await db.task.findUnique({
      where: { id },
      include: {
        department: true,
        room: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let finalStatus = status;

    // 2. SLA Approval Gate check:
    // If status is transitioning to COMPLETED, and the department is Housekeeping or Maintenance,
    // and the user is NOT a Manager or Supervisor, then transition it to PENDING_APPROVAL instead.
    if (status === 'COMPLETED') {
      const deptName = existingTask.department.name.toLowerCase();
      const isApprovalDept = deptName === 'housekeeping' || deptName === 'maintenance';
      const isSupervisor = userRole === 'MANAGER' || userRole === 'SUPERVISOR';

      if (isApprovalDept && !isSupervisor) {
        finalStatus = 'PENDING_APPROVAL';
      }
    }

    // 3. Update the task status
    const task = await db.task.update({
      where: { id },
      data: { status: finalStatus },
      include: {
        department: true,
        room: true,
      },
    });

    // 4. Save audit log depending on final status
    let auditAction = 'TASK_STATUS_UPDATED';
    let auditDetails = `Task "${task.title}" updated to status ${finalStatus}.`;

    if (finalStatus === 'PENDING_APPROVAL') {
      auditAction = 'TASK_AWAITING_APPROVAL';
      auditDetails = `Task "${task.title}" completed by staff. Awaiting supervisor sign-off.`;
    } else if (status === 'COMPLETED' && finalStatus === 'COMPLETED' && (existingTask.status === 'PENDING_APPROVAL')) {
      auditAction = 'TASK_APPROVED_BY_SUPERVISOR';
      auditDetails = `Supervisor approved and signed off on task "${task.title}".`;
    }

    await db.auditLog.create({
      data: {
        propertyId: task.propertyId,
        action: auditAction,
        entityType: 'TASK',
        entityId: task.id,
        details: auditDetails,
      },
    });

    // 5. If final status is COMPLETED, trigger workflow checks and Inngest events
    if (finalStatus === 'COMPLETED') {
      // Check if all tasks in the workflow are completed
      const siblingTasks = await db.task.findMany({
        where: { workflowId: task.workflowId },
      });

      const allCompleted = siblingTasks.every((t) => t.status === 'COMPLETED');
      if (allCompleted) {
        await db.workflow.update({
          where: { id: task.workflowId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      }

      // Send event to Inngest for event-driven workflow chaining
      try {
        await sendInngestEvent({
          name: 'task.completed',
          data: {
            taskId: task.id,
            workflowId: task.workflowId,
            title: task.title,
            status: 'COMPLETED',
          },
        });
      } catch (inngestErr) {
        console.error('Failed to emit task.completed event to Inngest:', inngestErr);
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update task status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
