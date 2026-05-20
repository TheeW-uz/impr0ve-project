import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api-middleware';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

const schema = z.object({
  verificationToken: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const { verificationToken } = parsed.data;

    // Decode verification token
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(verificationToken, 'base64').toString());
    } catch (e) {
      return err('Invalid verification token', 400);
    }

    const { userId } = decoded;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return err('User not found', 404);

    // Rate limit: check if a code was sent recently (last 60 seconds)
    const lastCode = await prisma.verificationCode.findFirst({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60000) } },
      orderBy: { createdAt: 'desc' },
    });

    if (lastCode) {
      return err('Please wait at least 60 seconds before requesting a new code', 429);
    }

    // Generate secure 5-digit code
    const code = crypto.randomInt(10000, 99999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: { userId: user.id, codeHash, expiresAt },
    });

    const emailResult = await sendVerificationEmail(user.email, code);
    if (!emailResult || !emailResult.success) {
      console.error('[resend-code] Failed to send verification email', emailResult?.error);
      return err('Failed to send verification email', 502);
    }

    return ok({ message: 'A new verification code has been sent to your email.' });
  } catch (e: any) {
    console.error('[resend-code]', e);
    return err('Internal server error', 500);
  }
}
