import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { withApiTenantContext } from '../../../lib/api-helper';

export async function POST(request: Request) {
  return withApiTenantContext(request, async (propertyId) => {
    try {
      const body = await request.json();
      const { title, description, departmentId, priority, roomId, dueDate, assignedUserId } = body;

      if (!title || !departmentId || !priority) {
        return NextResponse.json({ error: 'Missing required fields: title, departmentId, and priority are mandatory.' }, { status: 400 });
      }

      // 1. Create Workflow wrapper of type MANUAL
      const workflow = await db.workflow.create({
        data: {
          propertyId,
          type: 'MANUAL',
          status: 'IN_PROGRESS',
        },
      });

      // 2. Create Task linked to workflow
      const task = await db.task.create({
        data: {
          propertyId,
          workflowId: workflow.id,
          departmentId,
          assignedUserId: assignedUserId || null,
          roomId: roomId || null,
          title,
          description: description || null,
          priority,
          status: 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 4 * 60 * 60 * 1000), // Default 4 hours SLA if not specified
        },
        include: {
          department: true,
          room: true,
        },
      });

      // 3. Log to AuditLog
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'TASK_MANUALLY_CREATED',
          entityType: 'TASK',
          entityId: task.id,
          details: `Task manually created: "${title}" assigned to department "${task.department.name}".`,
        },
      });

      // 4. Create in-app notifications for users in target department
      const deptUsers = await db.user.findMany({
        where: { propertyId, departmentId: departmentId },
      });

      for (const user of deptUsers) {
        await db.notification.create({
          data: {
            propertyId,
            taskId: task.id,
            userId: user.id,
            channel: 'IN_APP',
            recipient: user.email,
            status: 'SENT',
            message: `Manual Task Assigned: "${title}". Priority: ${priority}.`,
          },
        });
      }

      return NextResponse.json(task, { status: 201 });
    } catch (error) {
      console.error('Failed to create manual task:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}

