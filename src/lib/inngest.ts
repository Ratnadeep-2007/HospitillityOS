import { Inngest } from 'inngest';

const rawKey = process.env.INNGEST_EVENT_KEY;
const isDev = process.env.NODE_ENV !== 'production' || process.env.INNGEST_DEV === '1';

// Determine if we have a real cloud event key or local key
const isLocalKey = !rawKey || rawKey === 'your-inngest-event-key' || rawKey.trim() === '' || rawKey === 'local';
const eventKey = isLocalKey ? 'local' : rawKey;

export const inngest = new Inngest({
  id: 'hospitality-os',
  eventKey,
  isDev: isDev || isLocalKey,
});

/**
 * Resilient helper function for dispatching events to Inngest.
 * Handles missing or invalid INNGEST_EVENT_KEY in production environments gracefully
 * so API requests succeed even if Inngest Cloud key is not configured on Vercel.
 */
export async function sendInngestEvent(payload: Parameters<typeof inngest.send>[0]) {
  try {
    return await inngest.send(payload);
  } catch (error) {
    console.warn(
      '[Inngest Dispatcher Warning] Failed to dispatch event to Inngest Cloud. ' +
      'Please add INNGEST_EVENT_KEY to Vercel Environment Variables for production background jobs.',
      error
    );
    return { ids: [] };
  }
}
