'use client';

import { useState } from 'react';
import { useStore, todayKey, displayDate } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyGoal, Subtask } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Check, X, Trash2, ChevronDown, ChevronUp,
  Clock, Flag, FileText, ListTodo, Pencil, AlertCircle,
  CheckCircle2, XCircle, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_CONFIG = {
  Low:      { color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20'  },
  Medium:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  High:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Critical: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
};

function AddDailyGoalForm({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const { addDailyGoal } = useStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<DailyGoal['priority']>('Medium');
  const [timeEstimate, setTimeEstimate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addDailyGoal({
      id: uuidv4(),
      dateKey,
      title: title.trim(),
      notes: notes.trim(),
      priority,
      progress: 0,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
      timeEstimateMinutes: parseInt(timeEstimate) || 0,
      subtasks: [],
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="What do you want to accomplish today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base bg-gray-900/60"
              autoFocus
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block px-1">Priority</label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                    <button
                      key={p} type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1 min-w-[60px] py-2 rounded-xl text-[10px] font-bold uppercase transition-all',
                        priority === p ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} border ${PRIORITY_CONFIG[p].border}` : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      )}
                    >{p === 'Critical' ? 'Crit' : p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block px-1">Est. Minutes</label>
                <Input
                  type="number" placeholder="e.g. 60"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                  className="bg-gray-900/60 h-10 text-sm rounded-xl"
                />
              </div>
            </div>
            <Input
              placeholder="Notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-900/60 text-sm h-10 rounded-xl"
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" className="h-10 px-4 rounded-xl" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/10">
                Add Goal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DailyGoalCard({ goal }: { goal: DailyGoal }) {
  const { updateDailyGoal, deleteDailyGoal, completeDailyGoal, addSubtask, toggleSubtask, deleteSubtask } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(String(goal.progress));
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(goal.title);

  const isToday = goal.dateKey === todayKey();
  const completedSubtasks = goal.subtasks.filter((s) => s.completed).length;
  const cfg = PRIORITY_CONFIG[goal.priority];

  const handleProgressSave = () => {
    const v = Math.min(100, Math.max(0, parseInt(progressInput) || 0));
    updateDailyGoal(goal.id, { progress: v });
    setEditingProgress(false);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    addSubtask('daily', goal.id, {
      id: uuidv4(), title: subtaskInput.trim(), completed: false,
    });
    setSubtaskInput('');
    setAddingSubtask(false);
  };

  const statusIcon = goal.completed
    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
    : goal.failed
    ? <XCircle className="w-5 h-5 text-red-400" />
    : <Circle className="w-5 h-5 text-gray-500" />;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className={cn(
        'overflow-hidden transition-all duration-300',
        goal.completed && 'border-green-500/20 bg-green-500/5',
        goal.failed && 'border-red-500/20 bg-red-500/5 opacity-70',
        !goal.completed && !goal.failed && `${cfg.border} hover:shadow-lg`
      )}>
        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => !goal.failed && completeDailyGoal(goal.id)}
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
                    className="h-8 text-sm bg-gray-900/60"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { updateDailyGoal(goal.id, { title: titleInput }); setEditingTitle(false); }
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { updateDailyGoal(goal.id, { title: titleInput }); setEditingTitle(false); }}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <p className={cn('font-semibold text-white leading-snug', goal.completed && 'line-through opacity-60', goal.failed && 'line-through')}>
                  {goal.title}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                  {goal.priority}
                </span>
                {goal.timeEstimateMinutes > 0 && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {goal.timeEstimateMinutes}m
                  </span>
                )}
                {goal.subtasks.length > 0 && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <ListTodo className="w-3 h-3" /> {completedSubtasks}/{goal.subtasks.length}
                  </span>
                )}
                {goal.completedAt && (
                  <span className="text-[10px] text-green-400">
                    ✓ {new Date(goal.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {goal.failed && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!goal.failed && !goal.completed && isToday && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTitle(true)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => deleteDailyGoal(goal.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 font-medium">Progress</span>
              <button
                className="text-[11px] font-bold text-white hover:text-primary-400 transition-colors"
                onClick={() => { setProgressInput(String(goal.progress)); setEditingProgress(true); }}
                disabled={goal.failed}
              >
                {goal.progress}%
              </button>
            </div>
            {editingProgress ? (
              <div className="flex gap-2">
                <Input
                  type="number" min={0} max={100}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="h-7 text-xs bg-gray-900/60 flex-1"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProgressSave(); if (e.key === 'Escape') setEditingProgress(false); }}
                />
                <Button size="sm" className="h-7 text-xs px-3" onClick={handleProgressSave}>Set</Button>
              </div>
            ) : (
              <Progress
                value={goal.progress}
                className={cn('h-1.5', goal.completed && '[&>div]:bg-green-500', goal.failed && '[&>div]:bg-red-500')}
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
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {/* Notes */}
                  {goal.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-400">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                      <p>{goal.notes}</p>
                    </div>
                  )}

                  {/* Subtasks */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subtasks</p>
                    <div className="space-y-1.5">
                      {goal.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2 group">
                          <button onClick={() => toggleSubtask('daily', goal.id, st.id)} className="w-4 h-4 rounded border border-white/20 flex items-center justify-center flex-shrink-0 hover:border-primary-400 transition-colors">
                            {st.completed && <Check className="w-2.5 h-2.5 text-primary-400" />}
                          </button>
                          <span className={cn('text-sm flex-1', st.completed && 'line-through text-gray-500')}>{st.title}</span>
                          <button onClick={() => deleteSubtask('daily', goal.id, st.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {addingSubtask ? (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Subtask..." value={subtaskInput}
                          onChange={(e) => setSubtaskInput(e.target.value)}
                          className="h-8 text-xs bg-gray-900/60 flex-1"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); if (e.key === 'Escape') setAddingSubtask(false); }}
                        />
                        <Button size="sm" className="h-8 px-3" onClick={handleAddSubtask}>Add</Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddingSubtask(false)}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      !goal.failed && (
                        <button
                          onClick={() => setAddingSubtask(true)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mt-2 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add subtask
                        </button>
                      )
                    )}
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

export function DailyGoalsTab() {
  const { dailyContainers, dailyGoals } = useStore();
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set([todayKey()]));

  const toggleContainer = (key: string) => {
    setExpandedContainers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sortedContainers = [...dailyContainers].sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  return (
    <div className="space-y-6">
      {sortedContainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
          <Clock className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Your daily journey starts here</p>
          <p className="text-sm">Open this page each day to track your goals</p>
        </div>
      ) : (
        sortedContainers.map((container) => {
          const isToday = container.dateKey === todayKey();
          const goals = dailyGoals.filter((g) => g.dateKey === container.dateKey);
          const completed = goals.filter((g) => g.completed).length;
          const failed = goals.filter((g) => g.failed).length;
          const total = goals.length;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isExpanded = expandedContainers.has(container.dateKey);

          return (
            <div key={container.dateKey} className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Container Header */}
              <button
                onClick={() => toggleContainer(container.dateKey)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    isToday ? 'bg-amber-400 shadow-amber-400/50 shadow-lg' : total === 0 ? 'bg-gray-600' : completionRate === 100 ? 'bg-green-400' : 'bg-gray-500'
                  )} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{container.displayDate}</span>
                      {isToday && <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Today</span>}
                    </div>
                    {total > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {completed} done · {failed} failed · {total - completed - failed} pending
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {total > 0 && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{completionRate}%</span>
                      <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', completionRate === 100 ? 'bg-green-500' : 'bg-amber-500')}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </button>

              {/* Container Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {goals.length === 0 && (
                          <p className="text-sm text-gray-600 italic py-2 text-center">No goals for this day yet.</p>
                        )}
                        {goals.map((goal) => (
                          <DailyGoalCard key={goal.id} goal={goal} />
                        ))}
                      </AnimatePresence>

                      {isToday && (
                        <AnimatePresence mode="wait">
                          {addingToDate === container.dateKey ? (
                            <AddDailyGoalForm
                              key="form"
                              dateKey={container.dateKey}
                              onClose={() => setAddingToDate(null)}
                            />
                          ) : (
                            <motion.button
                              key="btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => setAddingToDate(container.dateKey)}
                              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 hover:bg-white/5 transition-all text-sm"
                            >
                              <Plus className="w-4 h-4" /> Add a goal for today
                            </motion.button>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}
