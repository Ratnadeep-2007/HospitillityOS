import { db } from './db';
import { inngest } from './inngest';
import { NotificationChannel } from '@prisma/client';

export async function sendNotification(params: {
  propertyId: string;
  taskId?: string;
  userId: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
}) {
  // 1. Create notification in PENDING state
  const notif = await db.notification.create({
    data: {
      propertyId: params.propertyId,
      taskId: params.taskId || null,
      userId: params.userId,
      channel: params.channel,
      recipient: params.recipient,
      status: 'PENDING',
      message: params.message,
    },
  });

  // 2. Send event to Inngest to dispatch the third-party communication
  try {
    await inngest.send({
      name: 'notification.created',
      data: {
        notificationId: notif.id,
      },
    });
  } catch (err) {
    console.error('Failed to send notification.created event to Inngest:', err);
  }

  return notif;
}
