import { serve } from 'inngest/next';
import { inngest } from '../../../lib/inngest';
import { 
  handleGuestRequest, 
  handleBookingCreated, 
  handleInventoryLow, 
  handleMaintenanceDue,
  checkSopCron,
  handleSopTriggered,
  handlePurchaseRequest,
  handleTaskCompleted,
  handleNotificationCreated
} from '../../../inngest/functions';

// Serve the Inngest API endpoint on Next.js App Router
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleGuestRequest,
    handleBookingCreated,
    handleInventoryLow,
    handleMaintenanceDue,
    checkSopCron,
    handleSopTriggered,
    handlePurchaseRequest,
    handleTaskCompleted,
    handleNotificationCreated,
  ],
});
