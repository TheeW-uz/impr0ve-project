// POST /api/auth/logout
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const schema = z.object({ refreshToken: z.string() });

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (parsed.success) {
      await prisma.refreshToken.updateMany({
        where: { token: parsed.data.refreshToken },
        data: { revoked: true },
      });
    }

    if (user) {
      await prisma.activityLog.create({
        data: { userId: user.sub, type: 'USER_LOGOUT' },
      });
    }

    return ok({ message: 'Logged out successfully' });
  } catch (e) {
    console.error('[logout]', e);
    return err('Internal server error', 500);
  }
}
