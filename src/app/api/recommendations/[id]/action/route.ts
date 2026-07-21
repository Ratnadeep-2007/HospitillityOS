import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // e.g. "approve", "reject", "dismiss", "execute"

    // 1. Get recommendation
    const recommendation = await db.aIRecommendation.findUnique({
      where: { id },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    let status: 'APPROVED' | 'REJECTED' = 'APPROVED';
    if (action === 'reject' || action === 'dismiss') {
      status = 'REJECTED';
    }

    // 2. Update status in database
    const updatedRec = await db.aIRecommendation.update({
      where: { id },
      data: { status },
    });

    // 3. Log to AuditLog
    await db.auditLog.create({
      data: {
        propertyId: recommendation.propertyId,
        action: `RECOMMENDATION_${action.toUpperCase()}`,
        entityType: 'AI_RECOMMENDATION',
        entityId: recommendation.id,
        details: `AI Staffing recommendation was ${action}ed. Reason: ${recommendation.reason}`,
      },
    });

    // 4. If action is "execute", perform the actual recommendation
    if (action === 'execute') {
      // Find Reception and Housekeeping departments
      const receptionDept = await db.department.findFirst({
        where: { propertyId: recommendation.propertyId, name: 'Reception' },
      });
      const housekeepingDept = await db.department.findFirst({
        where: { propertyId: recommendation.propertyId, name: 'Housekeeping' },
      });

      if (receptionDept && housekeepingDept) {
        // Find receptionist "David Kim" or any RECEPTIONIST
        const userToMove = await db.user.findFirst({
          where: { propertyId: recommendation.propertyId, departmentId: receptionDept.id, role: 'RECEPTIONIST' },
        });

        if (userToMove) {
          await db.user.update({
            where: { id: userToMove.id },
            data: { departmentId: housekeepingDept.id },
          });

          // Log audit log for user move
          await db.auditLog.create({
            data: {
              propertyId: recommendation.propertyId,
              action: 'USER_DEPARTMENT_SHIFTED',
              entityType: 'USER',
              entityId: userToMove.id,
              details: `Shifted employee ${userToMove.name} from Reception to Housekeeping per AI recommendation execution.`,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, recommendation: updatedRec });
  } catch (error) {
    console.error('Failed to take action on recommendation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
