import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const totalTasks = await db.task.count();
    const pendingTasks = await db.task.count({ where: { status: 'PENDING' } });
    const inProgressTasks = await db.task.count({ where: { status: 'IN_PROGRESS' } });
    const completedTasks = await db.task.count({ where: { status: 'COMPLETED' } });
    const escalatedTasks = await db.task.count({ where: { status: 'ESCALATED' } });

    const recentTasks = await db.task.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        room: true,
      },
    });

    const activeWorkflows = await db.workflow.findMany({
      where: { status: 'IN_PROGRESS' },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    const recommendations = await db.aIRecommendation.findMany({
      where: { status: 'PENDING' },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    const notifications = await db.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        task: true,
        user: true,
      },
    });

    const auditLogs = await db.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
      },
    });

    const departments = await db.department.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    const rooms = await db.room.findMany({
      orderBy: { roomNumber: 'asc' },
    });

    const vendors = await db.vendor.findMany({
      orderBy: { name: 'asc' },
    });

    const inventoryItems = await db.inventoryItem.findMany({
      orderBy: { name: 'asc' },
      include: {
        department: {
          select: { name: true }
        }
      }
    });

    const assets = await db.asset.findMany({
      orderBy: { name: 'asc' },
    });

    // Query active purchase requests constructed dynamically from PURCHASE_REQUEST workflows
    const prWorkflows = await db.workflow.findMany({
      where: { type: 'PURCHASE_REQUEST' },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const vendorsList = await db.vendor.findMany();
    const vendorMap = new Map(vendorsList.map(v => [v.id, v.name]));

    interface PurchaseRequestMetadata {
      vendorId?: string;
      itemName?: string;
      quantity?: number;
      unit?: string;
      estimatedCost?: number;
    }

    const purchaseRequests = prWorkflows.map(wf => {
      const event = wf.events[0];
      const metadata = (event?.metadata as unknown as PurchaseRequestMetadata) || {};
      const vendorName = (metadata.vendorId && vendorMap.get(metadata.vendorId)) || 'Unknown Vendor';
      
      let status = 'Awaiting Manager Approval';
      const approvalTask = wf.tasks.find(t => t.title.startsWith('Approve Purchase:'));
      const deliveryTask = wf.tasks.find(t => t.title.startsWith('Verify Delivery:'));

      if (deliveryTask) {
        status = deliveryTask.status === 'COMPLETED' ? 'Completed' : 'Awaiting Delivery';
      } else if (approvalTask && approvalTask.status === 'COMPLETED') {
        status = 'Awaiting Delivery';
      }

      return {
        id: wf.id.slice(0, 8),
        vendorName,
        itemName: metadata.itemName || 'Unknown Item',
        quantity: metadata.quantity || 0,
        unit: metadata.unit || 'units',
        estimatedCost: metadata.estimatedCost || 0,
        status,
      };
    });

    // Fetch all guests with their checked-in bookings and rooms
    const guests = await db.guest.findMany({
      orderBy: { name: 'asc' },
      include: {
        bookings: {
          include: {
            room: true
          }
        }
      }
    });

    // Fetch all guest requests events (raw chat logs)
    const guestEvents = await db.event.findMany({
      where: {
        type: {
          in: ['GUEST_REQUEST_CREATED', 'GUEST_REQUEST']
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({
      stats: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        escalated: escalatedTasks,
      },
      recentTasks,
      activeWorkflows,
      recommendations,
      notifications,
      auditLogs,
      departments,
      rooms,
      vendors,
      inventoryItems,
      assets,
      purchaseRequests,
      guests,
      guestEvents,
    });
  } catch (error) {
    console.error('Failed to query dashboard stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
