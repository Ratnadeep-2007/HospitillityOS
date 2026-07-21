import crypto from 'crypto';

/**
 * Validates incoming Twilio Webhook Signature (X-Twilio-Signature header)
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string
): boolean {
  if (!signature || !authToken) return false;

  // Twilio signature creation: Sort keys alphabetically and append key+value to URL
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Sends an outbound WhatsApp or SMS message via Twilio REST API
 */
export async function sendTwilioMessage(params: {
  to: string;
  body: string;
  isWhatsapp?: boolean;
}): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = params.isWhatsapp
    ? process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
    : process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Twilio Service] Credentials missing in environment. Outbound message skipped.');
    return { success: false, error: 'Twilio credentials not configured in environment' };
  }

  let formattedTo = params.to;
  if (params.isWhatsapp && !formattedTo.startsWith('whatsapp:')) {
    formattedTo = `whatsapp:${formattedTo}`;
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('From', fromNumber);
  formData.append('To', formattedTo);
  formData.append('Body', params.body);

  try {
    const res = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Twilio Service] API Error:', data);
      return { success: false, error: data.message || 'Twilio dispatch failed' };
    }

    console.log(`[Twilio Service] Message dispatched successfully. SID: ${data.sid}`);
    return { success: true, sid: data.sid };
  } catch (error) {
    console.error('[Twilio Service] Network Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network failure' };
  }
}
