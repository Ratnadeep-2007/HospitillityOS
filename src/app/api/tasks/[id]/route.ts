import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { TaskPriority, TaskStatus } from '@prisma/client';

interface ManagerOverrideBody {
  departmentId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ManagerOverrideBody = await request.json();
    const { departmentId, priority, dueDate, status } = body;

    // Validate at least one field is being updated
    if (!departmentId && !priority && !dueDate && !status) {
      return NextResponse.json(
        { error: 'At least one field (departmentId, priority, dueDate, status) must be provided.' },
        { status: 400 }
      );
    }

    // Validate status if provided — only CANCELLED is allowed via this manager override route
    if (status && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Only CANCELLED status is accepted via manager override. Use the status route for other transitions.' },
        { status: 400 }
      );
    }

    // Validate priority enum if provided
    const validPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the existing task to resolve propertyId and detect department change
    const existingTask = await db.task.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const propertyId = existingTask.propertyId;
    const previousDepartmentId = existingTask.departmentId;
    const isDepartmentChanging = departmentId && departmentId !== previousDepartmentId;

    // Build the update payload
    const updateData: {
      departmentId?: string;
      priority?: TaskPriority;
      dueDate?: Date;
      status?: TaskStatus;
    } = {};

    if (departmentId) updateData.departmentId = departmentId;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) updateData.status = status;

    // Perform the task update
    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        room: true,
      },
    });

    // Build a human-readable details string for the audit log
    const changesSummary: string[] = [];
    if (isDepartmentChanging) {
      changesSummary.push(
        `department reassigned from "${existingTask.department.name}" to "${updatedTask.department.name}"`
      );
    }
    if (priority) changesSummary.push(`priority overridden to ${priority}`);
    if (dueDate) changesSummary.push(`dueDate extended to ${new Date(dueDate).toISOString()}`);
    if (status) changesSummary.push(`status set to ${status}`);

    // Log manager override to AuditLog
    await db.auditLog.create({
      data: {
        propertyId,
        action: 'TASK_MANAGER_OVERRIDE',
        entityType: 'TASK',
        entityId: id,
        details: `Manager override on task "${updatedTask.title}": ${changesSummary.join('; ')}.`,
      },
    });

    // If department was reassigned, notify all users in the new department
    if (isDepartmentChanging && departmentId) {
      const newDeptUsers = await db.user.findMany({
        where: { propertyId, departmentId },
      });

      for (const user of newDeptUsers) {
        await db.notification.create({
          data: {
            propertyId,
            taskId: id,
            userId: user.id,
            channel: 'IN_APP',
            recipient: user.email,
            status: 'SENT',
            message: `Task Reassigned to Your Department: "${updatedTask.title}". Priority: ${updatedTask.priority}.`,
          },
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Failed to apply manager override:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
