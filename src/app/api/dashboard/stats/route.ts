import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { todayKey } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  // Return last 7 days of completion stats
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const dayGoals = await prisma.dailyGoal.findMany({
      where: { userId: auth.sub, dateKey }
    });
    
    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    
    days.push({
      dateKey,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      hasGoals: total > 0
    });
  }

  return ok(days);
}
