import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { sendInngestEvent } from '../../../../lib/inngest';
import { withApiTenantContext } from '../../../../lib/api-helper';

export async function POST(request: Request) {
  return withApiTenantContext(request, async (propertyId) => {
    try {
      const body = await request.json();
      const { guestId, messageText, source, compensationAmount, compensationDetails } = body;

      if (!guestId) {
        return NextResponse.json({ error: 'Missing required field: guestId is mandatory.' }, { status: 400 });
      }

      // 1. Fetch guest details
      const guest = await db.guest.findUnique({
        where: { id: guestId },
        include: {
          bookings: {
            where: { status: 'CHECKED_IN' },
            include: { room: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!guest) {
        return NextResponse.json({ error: 'Guest not found.' }, { status: 404 });
      }

      const activeBooking = guest.bookings[0];
      const roomNumber = activeBooking?.room?.roomNumber || 'Unknown';
      const senderPhone = guest.phone || '+15550000000';

      // 2. Handle Compensation if provided
      if (compensationAmount && parseFloat(compensationAmount) > 0) {
        const amount = parseFloat(compensationAmount);
        
        // Log to AuditLog
        await db.auditLog.create({
          data: {
            propertyId,
            action: 'COMPENSATION_APPLIED',
            entityType: 'GUEST',
            entityId: guestId,
            details: `Applied $${amount.toFixed(2)} credit to Room ${roomNumber} for Guest ${guest.name} (${compensationDetails || 'Service recovery credit'}).`,
          },
        });

        // Trigger a notification to managers about compensation
        const managers = await db.user.findMany({
          where: { propertyId, role: { in: ['MANAGER', 'SUPERVISOR'] } },
        });

        for (const user of managers) {
          await db.notification.create({
            data: {
              propertyId,
              userId: user.id,
              channel: 'IN_APP',
              recipient: user.email,
              status: 'SENT',
              message: `Service Recovery: $${amount.toFixed(2)} applied for ${guest.name} (Room ${roomNumber}). Reason: ${compensationDetails}.`,
            },
          });
        }

        // Send a standard staff acknowledgment of compensation
        const staffApology = `We have applied a $${amount.toFixed(2)} credit to your room account for: "${compensationDetails}". Please accept our sincere apologies for the inconvenience.`;
        
        await db.event.create({
          data: {
            propertyId,
            type: 'GUEST_REQUEST',
            source: 'STAFF',
            metadata: {
              guestName: guest.name,
              guestPhone: senderPhone,
              roomNumber,
              messageText: staffApology,
            },
            processed: true,
          },
        });

        // Delay the thank you message
        return NextResponse.json({
          success: true,
          compensationApplied: true,
          amount,
          message: 'Compensation applied and logged successfully.'
        });
      }

      // 3. Handle sending standard message (Guest or Staff)
      if (!messageText) {
        return NextResponse.json({ error: 'Missing messageText payload.' }, { status: 400 });
      }

      const isGuestSource = source === 'WHATSAPP' || source === 'SMS';
      const eventType = isGuestSource ? 'GUEST_REQUEST_CREATED' : 'GUEST_REQUEST';

      // Save the message event
      const dbEvent = await db.event.create({
        data: {
          propertyId,
          type: eventType,
          source: source || 'STAFF',
          metadata: {
            guestName: guest.name,
            guestPhone: senderPhone,
            roomNumber,
            messageText,
          },
          processed: !isGuestSource, // Guest messages are processed via Inngest, staff messages are instantly processed
        },
      });

      // 4. Trigger Inngest if message is simulated from Guest
      if (isGuestSource) {
        try {
          await sendInngestEvent({
            name: 'guest.request.created',
            data: {
              propertyId,
              roomNumber,
              messageText,
              eventId: dbEvent.id,
            },
          });
        } catch (inngestErr) {
          console.warn('Inngest offline fallback: Proceeding in database-only mode.', inngestErr);
        }
      }

      return NextResponse.json({
        success: true,
        eventId: dbEvent.id,
        status: isGuestSource ? 'PENDING_WORKFLOW' : 'SENT',
      });

    } catch (error) {
      console.error('Failed to handle guest experience request:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
