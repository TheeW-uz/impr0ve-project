// GET  /api/settings
// PATCH /api/settings
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  dailyReminders: z.boolean().optional(),
  goalDeadlines: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  timezone: z.string().optional(),
  weekStartsOn: z.number().min(0).max(6).optional()
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const settings = await prisma.settings.findUnique({
    where: { userId: auth.sub }
  });

  if (!settings) {
    // Should have been created on register, but handle just in case
    const newSettings = await prisma.settings.create({
      data: { userId: auth.sub }
    });
    return ok(newSettings);
  }

  return ok(settings);
}

export async function PATCH(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const settings = await prisma.settings.update({
    where: { userId: auth.sub },
    data: parsed.data
  });

  return ok(settings);
}
