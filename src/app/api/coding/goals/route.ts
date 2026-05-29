import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';
import { generateRoadmapFor } from '@/lib/roadmap-generator';

const goalSchema = z.object({
  technology: z.string().min(1),
  currentLevel: z.enum(['Beginner', 'Junior', 'Intermediate', 'Advanced', 'Professional', 'Expert']).default('Beginner'),
  targetLevel: z.enum(['Intermediate', 'Advanced', 'Professional', 'Expert']).default('Advanced'),
  estimatedStudyHours: z.number().int().min(10).max(1000).default(100),
  dailyMinutes: z.number().int().min(15).max(480).default(60),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).default('Medium'),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const goals = await prisma.codingGoal.findMany({
      where: { userId: auth.sub },
      include: {
        roadmap: {
          include: {
            phases: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
            aiRecommendations: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        progressHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok(goals);
  } catch (e: any) {
    console.error('Error fetching coding goals:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 400);
    }

    const { technology, currentLevel, targetLevel, estimatedStudyHours, dailyMinutes, difficulty } = parsed.data;

    // Detect category based on technology name
    let category = 'Languages';
    const techLower = technology.toLowerCase();
    if (['html', 'css', 'react', 'next.js', 'vue', 'angular', 'svelte', 'tailwind', 'bootstrap'].some(t => techLower.includes(t))) {
      category = 'Frontend';
    } else if (['node', 'express', 'django', 'flask', 'spring boot', 'asp.net', 'fastapi', 'laravel', 'nest'].some(t => techLower.includes(t))) {
      category = 'Backend';
    } else if (['flutter', 'react native', 'kotlin android', 'swiftui', 'ios', 'android'].some(t => techLower.includes(t))) {
      category = 'Mobile';
    } else if (['postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra', 'sql'].some(t => techLower.includes(t))) {
      category = 'Databases';
    } else if (['pytorch', 'tensorflow', 'opencv', 'langchain', 'ai', 'machine learning', 'deep learning'].some(t => techLower.includes(t))) {
      category = 'AI/ML';
    } else if (['unity', 'unreal', 'godot', 'game dev', 'pygame'].some(t => techLower.includes(t))) {
      category = 'Game Dev';
    } else if (['cyber', 'hacking', 'security', 'linux', 'reverse engineering', 'network'].some(t => techLower.includes(t))) {
      category = 'Cybersecurity';
    }

    // Call the custom AI learning roadmap generation engine
    const roadmapSyllabus = generateRoadmapFor(
      technology,
      currentLevel,
      targetLevel,
      estimatedStudyHours,
      dailyMinutes
    );

    const goal = await prisma.$transaction(async (tx) => {
      // 1. Create the coding goal
      const createdGoal = await tx.codingGoal.create({
        data: {
          userId: auth.sub,
          technology,
          category,
          currentLevel,
          targetLevel,
          estimatedStudyHours,
          dailyMinutes,
          difficulty,
          status: 'active',
          xpEarned: 0,
        },
      });

      // 2. Create the roadmap
      const createdRoadmap = await tx.codingRoadmap.create({
        data: {
          goalId: createdGoal.id,
          totalPhases: roadmapSyllabus.phases.length,
          completedPhases: 0,
          estimatedWeeks: roadmapSyllabus.estimatedWeeks,
          adaptationNote: roadmapSyllabus.adaptationNote,
        },
      });

      // 3. Create all phases and their associated tasks
      for (const phase of roadmapSyllabus.phases) {
        const createdPhase = await tx.roadmapPhase.create({
          data: {
            roadmapId: createdRoadmap.id,
            title: phase.title,
            description: phase.description,
            order: phase.order,
            completed: false,
          },
        });

        for (const task of phase.tasks) {
          await tx.roadmapTask.create({
            data: {
              phaseId: createdPhase.id,
              title: task.title,
              description: task.description,
              resource: task.resource,
              isProject: task.isProject,
              completed: false,
              order: task.order,
            },
          });
        }
      }

      // 4. Generate the initial smart AI recommendation
      const initialPhaseTitle = roadmapSyllabus.phases[0]?.title || 'Foundations';
      const initialTaskTitle = roadmapSyllabus.phases[0]?.tasks[0]?.title || 'Introduction';
      await tx.aiRecommendation.create({
        data: {
          roadmapId: createdRoadmap.id,
          topic: `Getting Started: ${initialTaskTitle}`,
          reason: `Initializing at your ${currentLevel} skill level for ${technology} requires structural mapping of foundational abstractions before moving to full integration.`,
          exercise: `Read through the ${initialPhaseTitle} objectives, download compilers/SDKs, set up a local workspace folder and execute a Hello World script.`,
          projectIdea: `A ultra-minimalistic Command Line utility showcasing input validations.`,
          detectedPace: 'Normal',
        },
      });

      // 5. Award user 50 XP for mapping a professional coding goal!
      await tx.user.update({
        where: { id: auth.sub },
        data: { xp: { increment: 50 } },
      });

      // 6. Log Activity
      await tx.activityLog.create({
        data: {
          userId: auth.sub,
          type: 'CODING_GOAL_CREATED',
          entityId: createdGoal.id,
          metadata: { technology, targetLevel, estimatedWeeks: roadmapSyllabus.estimatedWeeks },
          xpDelta: 50,
        },
      });

      return createdGoal;
    });

    // Re-fetch goal with its newly created relations to return it fully loaded
    const fullGoal = await prisma.codingGoal.findUnique({
      where: { id: goal.id },
      include: {
        roadmap: {
          include: {
            phases: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
            aiRecommendations: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        progressHistory: true,
      },
    });

    return ok(fullGoal, 201);
  } catch (e: any) {
    console.error('Error creating coding goal:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
