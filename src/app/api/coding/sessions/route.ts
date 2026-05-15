import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';
import { todayKey } from '@/lib/utils';

const sessionSchema = z.object({
  title: z.string().min(1),
  projectName: z.string().default('General'),
  language: z.string().default('Other'),
  durationMinutes: z.number().int().min(0),
  problemsSolved: z.number().int().min(0).default(0),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).default('Medium'),
  notes: z.string().optional().default(''),
  completed: z.boolean().default(true),
  sessionDate: z.string().optional(), // ISO string
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const sessions = await prisma.codingSession.findMany({
    where: { userId: auth.sub },
    orderBy: { sessionDate: 'desc' },
  });

  return ok(sessions);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const data = parsed.data;
  const sessionDate = data.sessionDate ? new Date(data.sessionDate) : new Date();
  const dateKey = sessionDate.toISOString().split('T')[0];

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create session
    const session = await tx.codingSession.create({
      data: {
        ...data,
        userId: auth.sub,
        sessionDate,
      },
    });

    // 2. Update/Upsert contribution day
    const intensity = Math.min(Math.floor(data.durationMinutes / 30), 4);
    await tx.codingContributionDay.upsert({
      where: { userId_dateKey: { userId: auth.sub, dateKey } },
      create: {
        userId: auth.sub,
        date: sessionDate,
        dateKey,
        count: 1,
        totalMinutes: data.durationMinutes,
        intensity: intensity || 1,
      },
      update: {
        count: { increment: 1 },
        totalMinutes: { increment: data.durationMinutes },
        intensity: { set: intensity || 1 }, // Simplistic intensity update
      }
    });

    // 3. Update Stats
    const stats = await tx.codingStats.upsert({
      where: { userId: auth.sub },
      create: {
        userId: auth.sub,
        totalSessions: 1,
        totalMinutes: data.durationMinutes,
        totalProblems: data.problemsSolved,
        currentStreak: 1,
        longestStreak: 1,
        lastSessionDate: sessionDate,
      },
      update: {
        totalSessions: { increment: 1 },
        totalMinutes: { increment: data.durationMinutes },
        totalProblems: { increment: data.problemsSolved },
        lastSessionDate: sessionDate,
      }
    });

    // TODO: Recalculate streaks if needed, but for now simple increment is okay
    // Real streak calculation should happen here or via a dedicated function

    // 4. Log Activity
    await tx.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'CODING_SESSION_LOGGED',
        entityId: session.id,
        metadata: { title: data.title, duration: data.durationMinutes },
        xpDelta: Math.floor(data.durationMinutes / 2), // Example XP logic
      }
    });

    return session;
  });

  return ok(result, 201);
}
