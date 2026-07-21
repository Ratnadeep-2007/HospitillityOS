import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { inngest } from '../../../../lib/inngest';

// Real-world integration API gateway endpoint
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let messageText = '';
    let senderPhone = '';
    let source = 'API';

    let targetPhone = '';
    let jsonPropertyId = '';

    // 1. Parse incoming payload format
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse Twilio standard urlencoded webhook post
      const formData = await request.formData();
      messageText = formData.get('Body') as string || '';
      senderPhone = formData.get('From') as string || '';
      targetPhone = formData.get('To') as string || '';
      source = senderPhone.startsWith('whatsapp:') ? 'WHATSAPP' : 'SMS';
      // Normalize whatsapp prefix if present
      senderPhone = senderPhone.replace('whatsapp:', '');
      targetPhone = targetPhone.replace('whatsapp:', '').trim();
    } else {
      // Parse standard JSON request payload (PMS, IoT, or external APIs)
      const json = await request.json();
      messageText = json.messageText || json.message || '';
      senderPhone = json.guestPhone || json.phone || '';
      targetPhone = json.to || json.To || json.targetPhone || json.propertyPhone || '';
      jsonPropertyId = json.propertyId || '';
      source = json.source || 'API';
      if (targetPhone) {
        targetPhone = targetPhone.replace('whatsapp:', '').trim();
      }
    }

    if (!messageText) {
      return NextResponse.json({ error: 'Missing request payload text / Body.' }, { status: 400 });
    }

    // 2. Resolve property by target phone number or explicit propertyId
    let property = null;
    if (jsonPropertyId) {
      property = await db.property.findUnique({
        where: { id: jsonPropertyId },
      });
    }

    if (!property && targetPhone) {
      property = await db.property.findFirst({
        where: {
          OR: [
            { twilioWhatsappNumber: targetPhone },
            { twilioSmsNumber: targetPhone },
            { twilioPhoneNumber: targetPhone },
            { twilioWhatsappNumber: `whatsapp:${targetPhone}` },
            { twilioSmsNumber: `whatsapp:${targetPhone}` },
          ],
        },
      });
    }

    if (!property && !targetPhone && !jsonPropertyId) {
      property = await db.property.findFirst({
        where: { status: 'ACTIVE' },
      });
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found for target phone number or ID.' },
        { status: 404 }
      );
    }

    let resolvedRoomNumber = 'Unknown';
    let resolvedGuestName = 'Walk-in Guest';

    // 3. Resolve context: Look up Guest by phone number
    if (senderPhone) {
      const guest = await db.guest.findFirst({
        where: {
          propertyId: property.id,
          phone: {
            contains: senderPhone,
          },
        },
        include: {
          bookings: {
            where: {
              status: 'CHECKED_IN',
            },
            include: {
              room: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (guest) {
        resolvedGuestName = guest.name;
        const activeBooking = guest.bookings[0];
        if (activeBooking && activeBooking.room) {
          resolvedRoomNumber = activeBooking.room.roomNumber;
        }
      }
    }

    // 4. Fallback text parsing if room was not found via booking
    if (resolvedRoomNumber === 'Unknown') {
      const roomMatch = messageText.match(/room\s*(\d{3})/i);
      if (roomMatch && roomMatch[1]) {
        resolvedRoomNumber = roomMatch[1];
      }
    }

    // 5. Log the real Event in the database
    const dbEvent = await db.event.create({
      data: {
        propertyId: property.id,
        type: 'GUEST_REQUEST_CREATED',
        source: source,
        metadata: {
          guestName: resolvedGuestName,
          guestPhone: senderPhone,
          roomNumber: resolvedRoomNumber,
          messageText: messageText,
        },
        processed: false,
      },
    });

    // 6. Trigger Inngest background event-driven pipeline
    await inngest.send({
      name: 'guest.request.created',
      data: {
        propertyId: property.id,
        roomNumber: resolvedRoomNumber,
        messageText: messageText,
        eventId: dbEvent.id,
      },
    });

    console.log(`[Enterprise API Gateway] Ingested webhook message successfully. Event ID: ${dbEvent.id}`);

    return NextResponse.json({
      success: true,
      eventId: dbEvent.id,
      resolvedRoomNumber,
      resolvedGuestName,
      status: 'INGESTED',
    });
  } catch (error) {
    console.error('[Enterprise API Gateway] Webhook Ingest Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
