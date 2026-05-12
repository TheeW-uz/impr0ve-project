// POST /api/auth/register
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { ok, err, validateBody } from '@/lib/api-middleware';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username max 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 422);
    }

    const { email, username, password } = parsed.data;

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return err(`${field} already taken`, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + default settings in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username, passwordHash },
      });
      await tx.settings.create({ data: { userId: newUser.id } });
      return newUser;
    });

    // Issue tokens
    const payload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Persist refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    // Log activity
    await prisma.activityLog.create({
      data: { userId: user.id, type: 'USER_REGISTERED', xpDelta: 50 },
    });

    return ok({ accessToken, refreshToken, user: { id: user.id, email: user.email, username: user.username } }, 201);
  } catch (e: any) {
    console.error('[register]', e);
    return err('Internal server error', 500);
  }
}
