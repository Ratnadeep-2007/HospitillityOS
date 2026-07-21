import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { inngest } from '../../../lib/inngest';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, itemName, quantity, unit, estimatedCost, departmentId } = body;

    if (!vendorId || !itemName || !quantity || !unit || !estimatedCost || !departmentId) {
      return NextResponse.json(
        { error: 'Missing required fields: vendorId, itemName, quantity, unit, estimatedCost, and departmentId are mandatory.' },
        { status: 400 }
      );
    }

    // Resolve property ID (default to first active property)
    const defaultProp = await db.property.findFirst();
    if (!defaultProp) {
      return NextResponse.json({ error: 'Property not found. Seed database first.' }, { status: 400 });
    }
    const propertyId = defaultProp.id;

    // Create the Event database record first
    const dbEvent = await db.event.create({
      data: {
        propertyId,
        type: 'PURCHASE_REQUEST_CREATED',
        source: 'MANUAL',
        metadata: {
          vendorId,
          itemName,
          quantity: parseFloat(quantity),
          unit,
          estimatedCost: parseFloat(estimatedCost),
          departmentId,
        },
        processed: false,
      },
    });

    // Send event to Inngest to trigger the worker function
    await inngest.send({
      name: 'purchase.request.created',
      data: {
        propertyId,
        eventId: dbEvent.id,
        vendorId,
        itemName,
        quantity: parseFloat(quantity),
        unit,
        estimatedCost: parseFloat(estimatedCost),
        departmentId,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: dbEvent.id,
      status: 'PURCHASE_REQUEST_INGESTED',
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create purchase request event:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
