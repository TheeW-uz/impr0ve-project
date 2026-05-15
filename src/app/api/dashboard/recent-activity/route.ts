import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

  const logs = await prisma.activityLog.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 50),
  });

  return ok(logs);
}
