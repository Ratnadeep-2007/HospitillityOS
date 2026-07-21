import { Inngest } from 'inngest';

// Initialize the Inngest client with the app ID.
// If the event key is the default placeholder, ignore it to force local dev server routing.
const eventKey = process.env.INNGEST_EVENT_KEY === 'your-inngest-event-key' ? undefined : process.env.INNGEST_EVENT_KEY;

export const inngest = new Inngest({ 
  id: 'hospitality-os',
  eventKey
});
