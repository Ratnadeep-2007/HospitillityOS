import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { RoomStatus } from '@prisma/client';

const ALLOWED_STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status }: { status: RoomStatus } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Retrieve the existing room
    const existingRoom = await db.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 2. Update the room status
    const room = await db.room.update({
      where: { id },
      data: { status },
    });

    // 3. Save audit log
    await db.auditLog.create({
      data: {
        propertyId: room.propertyId,
        action: 'ROOM_STATUS_UPDATED',
        entityType: 'ROOM',
        entityId: room.id,
        details: `Room ${room.roomNumber} status set to ${status}.`,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Failed to update room status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
