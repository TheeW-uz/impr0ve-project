import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const existing = await prisma.githubAccount.findUnique({
      where: { userId: auth.sub },
    });

    if (!existing) {
      return err('No GitHub account linked', 404);
    }

    await prisma.githubAccount.delete({
      where: { userId: auth.sub },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'GITHUB_ACCOUNT_DISCONNECTED',
        metadata: { username: existing.username },
        xpDelta: 0,
      },
    });

    return ok({ message: 'GitHub account disconnected successfully' });
  } catch (e: any) {
    console.error('Error disconnecting GitHub:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
