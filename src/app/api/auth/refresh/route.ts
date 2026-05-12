// POST /api/auth/refresh
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { ok, err } from '@/lib/api-middleware';
import { z } from 'zod';

const schema = z.object({ refreshToken: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err('Refresh token required', 422);

    const { refreshToken } = parsed.data;

    // Verify JWT signature first (fast path)
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return err('Invalid or expired refresh token', 401);
    }

    // Check DB — ensure it exists and is not revoked
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return err('Refresh token revoked or expired', 401);
    }

    // Rotate: revoke old, issue new pair
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const newPayload = { sub: payload.sub, username: payload.username, email: payload.email };
    const accessToken  = signAccessToken(newPayload);
    const newRefresh   = signRefreshToken(newPayload);
    const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: { userId: payload.sub, token: newRefresh, expiresAt },
    });

    return ok({ accessToken, refreshToken: newRefresh });
  } catch (e) {
    console.error('[refresh]', e);
    return err('Internal server error', 500);
  }
}
