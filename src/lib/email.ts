import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
      return null;
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const client = getResend();
    if (!client) {
      // Development fallback: log the code to console so local dev can see it
      console.warn('sendVerificationEmail: Resend client not configured. Falling back to console output.');
      console.info(`Simulated verification code for ${email}: ${code}`);
      return { success: true, data: { simulated: true, email, code } };
    }

    const { data, error } = await client.emails.send({
      from: 'Impr0ve <onboarding@resend.dev>',
      to: email,
      subject: 'Verification Code - New Device Login',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Security Check</h1>
          <p style="font-size: 16px; line-height: 1.5;">We noticed a login attempt from a new device. Use the code below to verify it's you:</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #000;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes. If you didn't attempt to log in, please secure your account immediately.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} Impr0ve. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Error]', error);
      return { success: false, error };
    }

    // Log the provider response for debugging (message id, status etc.)
    try {
      console.info('[Email Sent]', { to: email, id: (data as any)?.id || null, data });
    } catch (e) {
      console.info('[Email Sent] (unable to parse response)');
    }

    return { success: true, data };
  } catch (e) {
    console.error('[Email Exception]', e);
    return { success: false, error: e };
  }
}
