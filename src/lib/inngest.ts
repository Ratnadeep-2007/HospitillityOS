import { Inngest } from 'inngest';

// Initialize the Inngest client for HospitalityOS
// Defaults to 'local' event key in local development to route to Inngest Dev Server
const rawKey = process.env.INNGEST_EVENT_KEY;
const isDev = process.env.NODE_ENV !== 'production';

const eventKey = (!rawKey || rawKey === 'your-inngest-event-key' || rawKey.trim() === '')
  ? 'local'
  : rawKey;

export const inngest = new Inngest({
  id: 'hospitality-os',
  eventKey,
  isDev,
});
