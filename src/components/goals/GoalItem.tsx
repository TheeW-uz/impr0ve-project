'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Clock, MoreVertical } from 'lucide-react';
import { Goal } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GoalItem({ goal }: { goal: Goal }) {
  const { updateGoal, deleteGoal } = useStore();

  const handleProgressChange = (increment: number) => {
    const newProgress = Math.min(100, Math.max(0, goal.progress + increment));
    updateGoal(goal.id, { 
      progress: newProgress,
      history: [...(goal.history || []), { date: new Date().toISOString(), progress: newProgress }]
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10",
        goal.completed && "border-green-500/50 bg-green-500/5"
      )}>
        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  goal.priority === 'High' ? "bg-red-500/20 text-red-400" :
                  goal.priority === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                  "bg-blue-500/20 text-blue-400"
                )}>
                  {goal.priority}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                  {goal.category}
                </span>
              </div>
              <CardTitle className="text-lg font-bold group-hover:text-primary-400 transition-colors">
                {goal.title}
              </CardTitle>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {goal.notes && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {goal.notes}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-medium text-gray-500">Progress</span>
              <span className="text-sm font-bold text-white">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2 bg-white/5" />
            
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1 rounded-xl"
                onClick={() => handleProgressChange(10)}
              >
                +10%
              </Button>
              <Button 
                variant={goal.completed ? "default" : "outline"} 
                size="sm"
                className={cn(
                  "rounded-xl",
                  goal.completed ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "border-white/10"
                )}
                onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
              >
                {goal.completed ? <Check className="w-4 h-4" /> : "Complete"}
              </Button>
            </div>
          </div>

          {goal.deadline && (
            <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
              <Clock className="w-3 h-3" />
              <span>Ends {new Date(goal.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
