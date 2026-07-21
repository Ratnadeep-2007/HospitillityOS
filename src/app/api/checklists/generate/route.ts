import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

interface GenerateChecklistBody {
  propertyId?: string;
  date?: string;
}

// Department name → SOP task titles
const DAILY_SOP_TASKS: Record<string, string[]> = {
  Reception: [
    'Morning briefing completed',
    'Pending reservations reviewed',
    'VIP arrivals noted',
  ],
  Housekeeping: [
    'Room inspection rounds completed',
    'Linen inventory counted',
    'Lost & found updated',
  ],
  Kitchen: [
    'Temperature logs recorded',
    'Inventory expiry check',
    'Prep list confirmed with chef',
  ],
  Maintenance: [
    'Daily asset walkaround completed',
    'Preventive maintenance log updated',
    'Fire safety check',
  ],
  Security: [
    'CCTV check',
    'Night patrol report filed',
    'Access log reviewed',
  ],
};

import { withTenantContext, withBypassContext } from '../../../../lib/tenant-context';

export async function POST(request: Request) {
  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let body: GenerateChecklistBody = {};
    try {
      body = await request.json();
    } catch {}

    const { propertyId: bodyPropertyId, date: bodyDate } = body;

    // ── Resolve propertyId ───────────────────────────────────────────────────
    let propertyId = bodyPropertyId;
    if (!propertyId) {
      propertyId = request.headers.get('x-property-id') || undefined;
    }
    if (!propertyId) {
      propertyId = await withBypassContext(async () => {
        const defaultProp = await db.property.findFirst({
          where: { status: 'ACTIVE' },
        });
        return defaultProp?.id;
      });
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'No property found. Seed the database first.' },
        { status: 400 },
      );
    }

    // Wrap the operations inside the resolved tenant context
    return await withTenantContext(propertyId, async () => {
      // ── Resolve date & end-of-day due date ───────────────────────────────────
      const targetDate = bodyDate ? new Date(bodyDate) : new Date();
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // ── Fetch departments for this property ──────────────────────────────────
      const departments = await db.department.findMany({
        where: { propertyId, active: true },
      });

      // Build a map of department name → id (case-insensitive match)
      const deptMap = new Map<string, string>();
      for (const dept of departments) {
        deptMap.set(dept.name.toLowerCase(), dept.id);
      }

      // ── Create the DAILY_CHECKLIST workflow ──────────────────────────────────
      const workflow = await db.workflow.create({
        data: {
          propertyId,
          type: 'DAILY_CHECKLIST',
          status: 'PENDING',
        },
      });

      // ── Create tasks per department ──────────────────────────────────────────
      let tasksGenerated = 0;

      for (const [deptName, taskTitles] of Object.entries(DAILY_SOP_TASKS)) {
        const deptId = deptMap.get(deptName.toLowerCase());
        if (!deptId) {
          // Department not seeded for this property — skip gracefully
          continue;
        }

        for (const title of taskTitles) {
          await db.task.create({
            data: {
              propertyId,
              workflowId: workflow.id,
              departmentId: deptId,
              title,
              priority: 'LOW',
              status: 'PENDING',
              dueDate: endOfDay,
            },
          });
          tasksGenerated++;
        }
      }

      // ── AuditLog ─────────────────────────────────────────────────────────────
      await db.auditLog.create({
        data: {
          propertyId,
          action: 'DAILY_CHECKLISTS_GENERATED',
          entityType: 'WORKFLOW',
          entityId: workflow.id,
          details: `Daily SOP checklist generated: ${tasksGenerated} tasks created for ${Object.keys(DAILY_SOP_TASKS).length} departments.`,
        },
      });

      return NextResponse.json(
        { success: true, tasksGenerated, workflowId: workflow.id },
        { status: 201 },
      );
    });
  } catch (error) {
    console.error('Failed to generate daily checklist:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

