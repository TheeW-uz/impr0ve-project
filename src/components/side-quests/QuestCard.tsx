'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Trophy, Calendar, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function QuestCard({ quest }: { quest: any }) {
  const queryClient = useQueryClient();

  const progress = Math.min(100, Math.round((quest.completedDays / quest.totalDays) * 100));
  const remainingDays = Math.max(0, quest.totalDays - quest.completedDays);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => QuestService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side-quests'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => QuestService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['side-quests'] }),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-500 rounded-[2.5rem] bg-white/[0.02] border-white/5 hover:border-indigo-500/30",
        quest.completed && "border-indigo-500/50 bg-indigo-500/5 shadow-indigo-500/20 shadow-2xl"
      )}>
        {quest.completed && (
          <div className="absolute top-6 right-6">
            <Trophy className="w-6 h-6 text-indigo-400 animate-bounce" />
          </div>
        )}
        
        <CardHeader className="p-8 pb-2">
          <div className="flex justify-between items-start">
            <div>
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Swords className="w-5 h-5" />
               </div>
               <CardTitle className="text-2xl font-black tracking-tighter text-white">
                 {quest.title}
               </CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full hover:bg-red-500/10 text-red-400"
              onClick={() => deleteMutation.mutate(quest.id)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/5"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={226.2}
                  initial={{ strokeDashoffset: 226.2 }}
                  animate={{ strokeDashoffset: 226.2 - (progress / 100) * 226.2 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-indigo-500"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">{progress}%</span>
            </div>
            
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Mission Clock</p>
              <p className="text-lg font-black text-white">
                {quest.completed ? "LEGENDARY" : `${remainingDays} Days Left`}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
              <span>Day {quest.completedDays}</span>
              <span>Target: {quest.totalDays} Days</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/5 rounded-full overflow-hidden" />

            <div className="flex gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-2xl h-14 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-indigo-500/20 text-indigo-300 transition-all"
                onClick={() => updateMutation.mutate({ 
                  id: quest.id, 
                  data: { completedDays: Math.min(quest.totalDays, quest.completedDays + 1) } 
                })}
                disabled={quest.completed}
              >
                Log +1 Day
              </Button>
              <Button 
                variant={quest.completed ? "default" : "outline"}
                className={cn(
                  "rounded-2xl h-14 px-6 font-black transition-all",
                  quest.completed ? "bg-indigo-500 text-white" : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => updateMutation.mutate({ id: quest.id, data: { completed: !quest.completed } })}
              >
                {quest.completed ? <Check className="w-6 h-6" /> : "Finish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

