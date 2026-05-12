'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Trophy, Calendar } from 'lucide-react';
import { Quest } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function QuestCard({ quest }: { quest: Quest }) {
  const { updateQuest, deleteQuest } = useStore();

  const progress = Math.min(100, Math.round((quest.completedDays / quest.totalDays) * 100));
  const remainingDays = Math.max(0, quest.totalDays - quest.completedDays);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-500",
        quest.completed && "border-primary-500/50 bg-primary-500/5 shadow-primary-500/20 shadow-2xl"
      )}>
        {quest.completed && (
          <div className="absolute top-2 right-2">
            <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
          </div>
        )}
        
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold tracking-tight">
              {quest.title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => deleteQuest(quest.id)}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-white/5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={175.9}
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ strokeDashoffset: 175.9 - (progress / 100) * 175.9 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-primary-500"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">{progress}%</span>
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
              <p className="text-sm font-medium text-white">
                {quest.completed ? "Mission Accomplished" : `${remainingDays} days remaining`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
              <span>Progress</span>
              <span>{quest.completedDays} / {quest.totalDays} Days</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/5" />

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-2xl h-10 font-bold"
                onClick={() => updateQuest(quest.id, { 
                  completedDays: Math.min(quest.totalDays, quest.completedDays + 1) 
                })}
                disabled={quest.completed}
              >
                +1 Day
              </Button>
              <Button 
                variant={quest.completed ? "default" : "outline"}
                className={cn(
                  "rounded-2xl h-10 px-4 font-bold transition-all",
                  quest.completed ? "bg-primary-500 hover:bg-primary-600" : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => updateQuest(quest.id, { completed: !quest.completed })}
              >
                {quest.completed ? <Check className="w-5 h-5" /> : "Finish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
