import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { withApiTenantContext } from '../../../lib/api-helper';

export async function GET(request: Request) {
  return withApiTenantContext(request, async () => {
    try {
      // ── Date range: start and end of today ──────────────────────────────────
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // ── Fetch tasks linked to DAILY_CHECKLIST workflows created today ────────
      const tasks = await db.task.findMany({
        where: {
          workflow: {
            type: 'DAILY_CHECKLIST',
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
        include: {
          department: {
            select: { id: true, name: true },
          },
          workflow: {
            select: { id: true, type: true, status: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // ── Group tasks by department name ───────────────────────────────────────
      const grouped: Record<
        string,
        {
          departmentId: string;
          tasks: Array<{
            id: string;
            title: string;
            status: string;
            priority: string;
            dueDate: Date | null;
            workflowId: string;
          }>;
        }
      > = {};

      for (const task of tasks) {
        const deptName = task.department.name;
        if (!grouped[deptName]) {
          grouped[deptName] = { departmentId: task.department.id, tasks: [] };
        }
        grouped[deptName].tasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          workflowId: task.workflowId,
        });
      }

      return NextResponse.json({
        date: now.toISOString().split('T')[0],
        totalTasks: tasks.length,
        departments: grouped,
      });
    } catch (error) {
      console.error('Failed to fetch daily checklists:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}

