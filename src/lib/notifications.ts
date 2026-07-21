import { db } from './db';
import { inngest } from './inngest';
import { NotificationChannel } from '@prisma/client';
import { sendTwilioMessage } from './twilio';

export async function sendNotification(params: {
  propertyId: string;
  taskId?: string;
  userId: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
}) {
  // 1. Create notification record in database
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

  // 2. Dispatch outbound Twilio message if channel is WHATSAPP or SMS
  if (params.channel === 'WHATSAPP' || params.channel === 'SMS') {
    try {
      const result = await sendTwilioMessage({
        to: params.recipient,
        body: params.message,
        isWhatsapp: params.channel === 'WHATSAPP',
      });

      await db.notification.update({
        where: { id: notif.id },
        data: {
          status: result.success ? 'SENT' : 'FAILED',
        },
      });
    } catch (err) {
      console.error('[Notification Dispatch] Twilio delivery error:', err);
      await db.notification.update({
        where: { id: notif.id },
        data: { status: 'FAILED' },
      });
    }
  }

  // 3. Send event to Inngest background queue
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
