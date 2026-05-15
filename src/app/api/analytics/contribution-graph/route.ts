// GET /api/analytics/contribution-graph
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  // Return all contribution days for the user to build the graph
  const days = await prisma.codingContributionDay.findMany({
    where: { userId: auth.sub },
    orderBy: { dateKey: 'asc' },
  });

  return ok(days);
}
