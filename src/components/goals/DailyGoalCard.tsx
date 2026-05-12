'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Circle, Trash2, 
  ChevronDown, ChevronUp, Clock, ListTodo, 
  Pencil, Check, X, FileText, AlertCircle, Plus
} from 'lucide-react';
import { useUpdateDailyGoal } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GoalService } from '@/lib/services';
import { useQueryClient } from '@tanstack/react-query';

const PRIORITY_CONFIG = {
  LOW:      { color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20'  },
  MEDIUM:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  CRITICAL: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
};

export function DailyGoalCard({ goal }: { goal: any }) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateDailyGoal();
  
  const [expanded, setExpanded] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(String(goal.progress));
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(goal.title);

  const cfg = PRIORITY_CONFIG[goal.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  const handleToggleComplete = async () => {
    if (goal.failed) return;
    await updateMutation.mutateAsync({
      id: goal.id,
      data: { completed: !goal.completed }
    });
  };

  const handleProgressSave = async () => {
    const v = Math.min(100, Math.max(0, parseInt(progressInput) || 0));
    await updateMutation.mutateAsync({
      id: goal.id,
      data: { progress: v }
    });
    setEditingProgress(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this goal?')) {
      await GoalService.deleteDaily(goal.id);
      queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
    }
  };

  const statusIcon = goal.completed
    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
    : goal.failed
    ? <XCircle className="w-5 h-5 text-red-400" />
    : <Circle className="w-5 h-5 text-gray-500" />;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className={cn(
        'overflow-hidden transition-all duration-300 rounded-[2rem] border-white/5 bg-white/[0.02]',
        goal.completed && 'border-green-500/20 bg-green-500/5',
        goal.failed && 'border-red-500/20 bg-red-500/5 opacity-70',
        !goal.completed && !goal.failed && 'hover:border-white/10 hover:bg-white/[0.04] hover:shadow-xl'
      )}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggleComplete}
              className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
              disabled={goal.failed}
            >
              {statusIcon}
            </button>

            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div className="flex gap-2">
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="h-8 text-sm bg-gray-900/60 rounded-xl"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { updateMutation.mutate({ id: goal.id, data: { title: titleInput } }); setEditingTitle(false); }
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                  />
                </div>
              ) : (
                <p className={cn('font-bold text-white leading-snug tracking-tight', goal.completed && 'line-through opacity-60', goal.failed && 'line-through text-gray-500')}>
                  {goal.title}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                  {goal.priority}
                </span>
                {goal.timeEstimateMinutes > 0 && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3" /> {goal.timeEstimateMinutes}m
                  </span>
                )}
                {goal.subtasks?.length > 0 && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
                    <ListTodo className="w-3 h-3" /> {goal.subtasks.filter((s:any)=>s.completed).length}/{goal.subtasks.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/5" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2 px-0.5">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Progress</span>
              <button
                className="text-[11px] font-black text-white hover:text-amber-400 transition-colors"
                onClick={() => { setProgressInput(String(goal.progress)); setEditingProgress(true); }}
                disabled={goal.failed || goal.completed}
              >
                {goal.progress}%
              </button>
            </div>
            {editingProgress ? (
              <div className="flex gap-2 mb-2">
                <Input
                  type="number" min={0} max={100}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="h-8 text-xs bg-gray-900/60 rounded-xl flex-1"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProgressSave(); if (e.key === 'Escape') setEditingProgress(false); }}
                />
                <Button size="sm" className="h-8 text-xs px-3 rounded-xl bg-amber-500 text-black font-bold" onClick={handleProgressSave}>Set</Button>
              </div>
            ) : (
              <Progress
                value={goal.progress}
                className={cn('h-2 rounded-full bg-white/5', goal.completed && '[&>div]:bg-green-500', goal.failed && '[&>div]:bg-red-500', !goal.completed && !goal.failed && '[&>div]:bg-amber-500')}
              />
            )}
          </div>

          {/* Expanded panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                  {goal.notes && (
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Notes
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{goal.notes}</p>
                    </div>
                  )}

                  {/* Subtasks */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                      <ListTodo className="w-3 h-3" /> Subtasks
                    </p>
                    <div className="space-y-2">
                      {goal.subtasks?.map((st: any) => (
                        <div key={st.id} className="flex items-center gap-3 group bg-white/[0.01] p-2 rounded-xl border border-white/5">
                          <button 
                            onClick={async () => {
                              await GoalService.updateDaily(goal.id, {
                                subtasks: goal.subtasks.map((s:any) => s.id === st.id ? { ...s, completed: !s.completed } : s)
                              });
                              queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
                            }} 
                            className={cn(
                              "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                              st.completed ? "bg-green-500 border-green-500" : "border-white/20 hover:border-amber-500/50"
                            )}
                          >
                            {st.completed && <Check className="w-3 h-3 text-black font-bold" />}
                          </button>
                          <span className={cn('text-sm flex-1 font-medium', st.completed ? 'line-through text-gray-600' : 'text-gray-300')}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <AddSubtaskField goal={goal} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingTitle(true)}
                      className="h-9 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleDelete}
                      className="h-9 rounded-xl text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/5"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Goal
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddSubtaskField({ goal }: { goal: any }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-amber-400 transition-colors uppercase tracking-widest px-1"
      >
        <Plus className="w-3 h-3" /> Add Subtask
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        className="h-9 text-xs bg-gray-900/60 rounded-xl"
        autoFocus
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && value.trim()) {
            await GoalService.updateDaily(goal.id, {
              subtasks: [...(goal.subtasks || []), { title: value.trim(), completed: false }]
            });
            queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
            setValue('');
            setIsAdding(false);
          }
          if (e.key === 'Escape') setIsAdding(false);
        }}
      />
      <Button 
        size="sm" 
        className="h-9 px-3 rounded-xl bg-amber-500 text-black font-bold"
        onClick={async () => {
          if (!value.trim()) return;
          await GoalService.updateDaily(goal.id, {
            subtasks: [...(goal.subtasks || []), { title: value.trim(), completed: false }]
          });
          queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
          setValue('');
          setIsAdding(false);
        }}
      >
        Add
      </Button>
      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => setIsAdding(false)}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

