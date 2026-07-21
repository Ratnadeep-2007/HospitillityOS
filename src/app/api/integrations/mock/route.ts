import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '../../../../lib/db';
import { inngest } from '../../../../lib/inngest';

export async function POST(request: Request) {
  try {
    const simData = await request.json();
    
    // Resolve property ID (default to first active property)
    let propertyId = simData.propertyId;
    if (!propertyId) {
      const defaultProp = await db.property.findFirst();
      if (!defaultProp) {
        return NextResponse.json({ error: 'Property not found. Seed database first.' }, { status: 400 });
      }
      propertyId = defaultProp.id;
    }

    console.log(`[Simulator Webhook] Received ${simData.type} for Property: ${propertyId}`);

    let eventName = '';
    
    interface EventDataPayload {
      propertyId: string;
      source?: string;
      timestamp?: string;
      guestName?: string;
      guestPhone?: string;
      roomNumber?: string;
      messageText?: string;
      bookingId?: string;
      checkIn?: string;
      checkOut?: string;
      itemId?: string;
      itemName?: string;
      departmentId?: string;
      currentLevel?: number;
      minimumLevel?: number;
      unit?: string;
      assetId?: string;
      assetName?: string;
      maintenanceType?: string;
      eventId?: string;
      [key: string]: Prisma.InputJsonValue | undefined;
    }

    let eventData: EventDataPayload = { propertyId };

    switch (simData.type) {
      case 'whatsapp_message':
        eventName = 'guest.request.created';
        eventData = {
          propertyId,
          source: 'WHATSAPP',
          timestamp: new Date().toISOString(),
          guestName: simData.metadata.guestName || 'Anonymous Guest',
          guestPhone: simData.metadata.guestPhone || '+15550000000',
          roomNumber: simData.metadata.roomNumber || '101',
          messageText: simData.metadata.messageText || 'Hello, I need some water bottles.',
        };
        break;

      case 'pms_booking':
        const room = await db.room.findFirst({
          where: { propertyId, roomNumber: simData.metadata.roomNumber || '101' },
        });
        if (!room) {
          return NextResponse.json({ error: `Room ${simData.metadata.roomNumber} does not exist.` }, { status: 400 });
        }

        let guest = await db.guest.findFirst({
          where: { propertyId, name: simData.metadata.guestName || 'Guest Simulation' },
        });
        if (!guest) {
          guest = await db.guest.create({
            data: {
              propertyId,
              name: simData.metadata.guestName || 'Guest Simulation',
              email: 'simulated@guest.com',
            },
          });
        }

        const checkIn = new Date();
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 2);

        const booking = await db.booking.create({
          data: {
            propertyId,
            guestId: guest.id,
            roomId: room.id,
            checkIn,
            checkOut,
            status: 'CONFIRMED',
          },
        });

        eventName = 'booking.created';
        eventData = {
          propertyId,
          bookingId: booking.id,
          guestName: guest.name,
          roomNumber: room.roomNumber,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        };
        break;

      case 'inventory_alert':
        eventName = 'inventory.low';
        eventData = {
          propertyId,
          source: 'SYSTEM',
          timestamp: new Date().toISOString(),
          itemId: simData.metadata.itemId || 'mock-item-id',
          itemName: simData.metadata.itemName || 'Linen sheets',
          departmentId: simData.metadata.departmentId || 'mock-dept-id',
          currentLevel: simData.metadata.currentLevel || 5,
          minimumLevel: simData.metadata.minimumLevel || 20,
          unit: 'units',
        };
        break;

      case 'maintenance_due':
        eventName = 'maintenance.due';
        eventData = {
          propertyId,
          source: 'SYSTEM',
          timestamp: new Date().toISOString(),
          assetId: simData.metadata.assetId || 'mock-asset-id',
          assetName: simData.metadata.assetName || 'Lobby Elevator',
          maintenanceType: simData.metadata.maintenanceType || 'Monthly safety check',
        };
        break;

      default:
        return NextResponse.json({ error: 'Unknown simulation type' }, { status: 400 });
    }

    // Create the Event database record first
    const dbEvent = await db.event.create({
      data: {
        propertyId,
        type: eventName.toUpperCase().replace(/\./g, '_'),
        source: eventData.source || (eventName === 'booking.created' ? 'PMS' : 'SYSTEM'),
        metadata: eventData,
        processed: false,
      }
    });

    // Pass the eventId in Inngest event payload
    eventData.eventId = dbEvent.id;

    // Send event to Inngest to trigger the worker function
    await inngest.send({
      name: eventName,
      data: eventData,
    });

    console.log(`[Simulator Webhook] Emitted Inngest event: ${eventName}`);

    return NextResponse.json({
      success: true,
      emittedEvent: eventName,
      status: 'INGESTED_VIA_INNGEST',
    });
  } catch (error) {
    console.error('Simulation webhook trigger error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
