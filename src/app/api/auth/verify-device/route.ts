import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { ok, err } from '@/lib/api-middleware';
import { z } from 'zod';

const schema = z.object({
  code: z.string().length(5, 'Code must be 5 digits'),
  verificationToken: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const { code, verificationToken } = parsed.data;

    // Decode verification token
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(verificationToken, 'base64').toString());
    } catch (e) {
      return err('Invalid verification token', 400);
    }

    const { userId, deviceId, deviceName, rememberMe } = decoded;

    // Find the latest valid code for this user
    const savedCode = await prisma.verificationCode.findFirst({
      where: {
        userId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!savedCode) {
      return err('Verification code expired or not found', 400);
    }

    const valid = await bcrypt.compare(code, savedCode.codeHash);
    if (!valid) {
      return err('Invalid verification code', 401);
    }

    // Delete the code after use
    await prisma.verificationCode.delete({ where: { id: savedCode.id } });

    // Mark device as trusted
    if (deviceId) {
      await prisma.trustedDevice.upsert({
        where: { userId_deviceId: { userId, deviceId } },
        create: { userId, deviceId, deviceName, lastUsedAt: new Date() },
        update: { deviceName, lastUsedAt: new Date() },
      });
    }

    // Login the user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return err('User not found', 404);

    const payload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const ttl = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttl);

    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    await prisma.activityLog.create({
      data: { userId: user.id, type: 'DEVICE_VERIFIED' },
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
    console.error('[verify-device]', e);
    return err('Internal server error', 500);
  }
}
