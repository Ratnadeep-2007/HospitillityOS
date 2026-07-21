# Enterprise Integration Guide: Real External APIs

HospitalityOS features production-ready webhook integration gateways for guest messaging (WhatsApp/SMS) and property management systems (PMS).

---

## 1. Twilio WhatsApp & SMS Integration

### Webhook URL
Point your Twilio WhatsApp / Phone Number incoming message webhook to:
```
POST https://your-domain.com/api/integrations/incoming
```
*Content-Type: `application/x-www-form-urlencoded`*

### Setup Instructions
1. Log into your [Twilio Console](https://console.twilio.com/).
2. Under **Phone Numbers** or **WhatsApp Sandbox Settings**, set the webhook for incoming messages to your deployment URL (`https://your-domain.com/api/integrations/incoming`).
3. Set your environment variables in `.env`:
```env
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
TWILIO_SMS_NUMBER="+15550192834"
```
4. When a guest sends a WhatsApp or SMS message, Twilio signature verification (`X-Twilio-Signature`) is automatically performed. HospitalityOS returns an instant TwiML `<Response>` and dispatches the task into Inngest for AI intent parsing.

---

## 2. Property Management System (PMS) Integration

### Webhook URL
Point your PMS (Cloudbeds, Oracle Opera, Mews) reservation & check-in webhooks to:
```
POST https://your-domain.com/api/integrations/pms
```
*Content-Type: `application/json`*

### Request Headers
```http
Authorization: Bearer YOUR_PMS_WEBHOOK_SECRET
```
*or*
```http
x-pms-signature: YOUR_PMS_WEBHOOK_SECRET
```

### Payload Example (`BOOKING_CREATED`)
```json
{
  "eventType": "BOOKING_CREATED",
  "guest": {
    "name": "Sarah Jenkins",
    "phone": "+15550192834",
    "email": "sarah.j@example.com"
  },
  "booking": {
    "id": "PMS-BOOKING-9982",
    "checkIn": "2026-07-22T14:00:00Z",
    "checkOut": "2026-07-25T11:00:00Z"
  },
  "room": {
    "roomNumber": "304",
    "roomType": "Executive Deluxe Suite"
  }
}
```
