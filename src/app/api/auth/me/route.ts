// GET  /api/auth/me   — fetch current user profile
// PATCH /api/auth/me  — update profile
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: {
      id: true, email: true, username: true,
      avatarUrl: true, bio: true,
      xp: true, level: true, createdAt: true, updatedAt: true,
      settings: true,
    },
  });
  if (!user) return err('User not found', 404);
  return ok(user);
}

const patchSchema = z.object({
  username : z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio      : z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const { username, bio, avatarUrl } = parsed.data;

  if (username) {
    const conflict = await prisma.user.findFirst({
      where: { username, NOT: { id: auth.sub } },
    });
    if (conflict) return err('Username already taken', 409);
  }

  const user = await prisma.user.update({
    where: { id: auth.sub },
    data: { username, bio, avatarUrl },
    select: { id: true, email: true, username: true, avatarUrl: true, bio: true, xp: true, level: true },
  });

  return ok(user);
}
