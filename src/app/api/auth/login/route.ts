// POST /api/auth/login
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { ok, err } from '@/lib/api-middleware';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const { email, password, rememberMe, deviceId, deviceName } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return err('Invalid email or password', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return err('Invalid email or password', 401);

    // ─── Device Verification Logic ───────────────────────────────────────────
    if (deviceId) {
      const trusted = await prisma.trustedDevice.findUnique({
        where: { userId_deviceId: { userId: user.id, deviceId } },
      });

      if (!trusted) {
        // Rate limit: check if a code was sent recently (last 60 seconds)
        const lastCode = await prisma.verificationCode.findFirst({
          where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60000) } },
          orderBy: { createdAt: 'desc' },
        });

        if (lastCode) {
          return ok({
            requiresVerification: true,
            verificationToken: Buffer.from(JSON.stringify({ userId: user.id, deviceId, deviceName, rememberMe })).toString('base64'),
            message: 'A verification code was recently sent. Please check your email.',
          });
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
          console.error('[login] Failed to send verification email', emailResult?.error);
          return err('Failed to send verification email', 502);
        }

        // Verification token is just a base64 encoded JSON to pass data to the verify endpoint
        const verificationToken = Buffer.from(JSON.stringify({ userId: user.id, deviceId, deviceName, rememberMe })).toString('base64');

        return ok({
          requiresVerification: true,
          verificationToken,
          message: 'New device detected. Verification code sent to your email.',
        });
      }

      // Update last used time for trusted device
      await prisma.trustedDevice.update({
        where: { id: trusted.id },
        data: { lastUsedAt: new Date() },
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const payload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Refresh token TTL: 30 days if rememberMe, else 24 hours
    const ttl = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttl);

    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    await prisma.activityLog.create({
      data: { userId: user.id, type: 'USER_LOGIN' },
    });

    return ok({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    console.error('[login]', e);
    return err('Internal server error', 500);
  }
}
