import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { inngest } from '../../../../lib/inngest';

/**
 * Enterprise Property Management System (PMS) Integration Gateway
 * Handles incoming webhooks for:
 * - RESERVATION_CREATED / BOOKING_CREATED
 * - CHECK_IN
 * - CHECK_OUT
 * - ROOM_STATUS_UPDATE
 */
export async function POST(request: Request) {
  try {
    // 1. Secret / API Key Validation
    const authHeader = request.headers.get('authorization') || '';
    const signatureHeader = request.headers.get('x-pms-signature') || request.headers.get('x-api-key') || '';
    const configuredSecret = process.env.PMS_WEBHOOK_SECRET;

    if (configuredSecret) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token !== configuredSecret && signatureHeader !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized PMS Webhook signature or token.' }, { status: 401 });
      }
    }

    const payload = await request.json();
    const { eventType, propertyId: rawPropertyId, booking, room, guest } = payload;

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType in PMS webhook payload.' }, { status: 400 });
    }

    // 2. Resolve Property
    let property = null;
    if (rawPropertyId) {
      property = await db.property.findUnique({ where: { id: rawPropertyId } });
    }

    if (!property) {
      property = await db.property.findFirst({ where: { status: 'ACTIVE' } });
    }

    if (!property) {
      return NextResponse.json({ error: 'Active property not found.' }, { status: 404 });
    }

    // 3. Process Event Type
    switch (eventType) {
      case 'BOOKING_CREATED':
      case 'RESERVATION_CREATED': {
        const guestName = guest?.name || booking?.guestName || 'Guest';
        const guestPhone = guest?.phone || booking?.guestPhone || '';
        const guestEmail = guest?.email || booking?.guestEmail || '';
        const roomNumber = room?.roomNumber || booking?.roomNumber || 'Unassigned';
        const checkInDate = booking?.checkIn ? new Date(booking.checkIn) : new Date();
        const checkOutDate = booking?.checkOut ? new Date(booking.checkOut) : new Date(Date.now() + 86400000);

        // Find or create Room
        let dbRoom = await db.room.findFirst({
          where: { propertyId: property.id, roomNumber },
        });

        if (!dbRoom && roomNumber !== 'Unassigned') {
          dbRoom = await db.room.create({
            data: {
              propertyId: property.id,
              roomNumber,
              roomType: room?.roomType || 'Standard Deluxe',
              status: 'AVAILABLE',
            },
          });
        }

        // Find or create Guest
        let dbGuest = null;
        if (guestPhone || guestEmail) {
          dbGuest = await db.guest.findFirst({
            where: {
              propertyId: property.id,
              OR: [
                ...(guestPhone ? [{ phone: guestPhone }] : []),
                ...(guestEmail ? [{ email: guestEmail }] : []),
              ],
            },
          });
        }

        if (!dbGuest) {
          dbGuest = await db.guest.create({
            data: {
              propertyId: property.id,
              name: guestName,
              phone: guestPhone || null,
              email: guestEmail || null,
            },
          });
        }

        // Create Booking record
        const dbBooking = await db.booking.create({
          data: {
            propertyId: property.id,
            guestId: dbGuest.id,
            roomId: dbRoom ? dbRoom.id : (await db.room.findFirst({ where: { propertyId: property.id } }))!.id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            status: 'CONFIRMED',
          },
        });

        // Log Event
        const dbEvent = await db.event.create({
          data: {
            propertyId: property.id,
            type: 'BOOKING_CREATED',
            source: 'PMS',
            metadata: {
              pmsBookingId: booking?.id || dbBooking.id,
              guestName: dbGuest.name,
              guestPhone: dbGuest.phone,
              roomNumber,
              checkIn: checkInDate.toISOString(),
              checkOut: checkOutDate.toISOString(),
            },
            processed: false,
          },
        });

        // Trigger Inngest workflow
        await inngest.send({
          name: 'booking.created',
          data: {
            propertyId: property.id,
            bookingId: dbBooking.id,
            guestName: dbGuest.name,
            roomNumber,
            checkIn: checkInDate.toISOString(),
            eventId: dbEvent.id,
          },
        });

        return NextResponse.json({
          success: true,
          action: 'BOOKING_SYNCED',
          bookingId: dbBooking.id,
          eventId: dbEvent.id,
        });
      }

      case 'CHECK_IN': {
        const bookingId = booking?.id;
        if (bookingId) {
          await db.booking.update({
            where: { id: bookingId },
            data: { status: 'CHECKED_IN' },
          });

          if (booking?.roomId) {
            await db.room.update({
              where: { id: booking.roomId },
              data: { status: 'OCCUPIED' },
            });
          }
        }
        return NextResponse.json({ success: true, action: 'CHECKIN_PROCESSED' });
      }

      case 'CHECK_OUT': {
        const bookingId = booking?.id;
        if (bookingId) {
          const updatedBooking = await db.booking.update({
            where: { id: bookingId },
            data: { status: 'CHECKED_OUT' },
            include: { room: true },
          });

          if (updatedBooking.room) {
            await db.room.update({
              where: { id: updatedBooking.room.id },
              data: { status: 'DIRTY' },
            });
          }
        }
        return NextResponse.json({ success: true, action: 'CHECKOUT_PROCESSED' });
      }

      default:
        return NextResponse.json({ error: `Unsupported PMS eventType: ${eventType}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[PMS API Gateway] Webhook Error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
