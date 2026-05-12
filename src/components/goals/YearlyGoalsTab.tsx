'use client';

import { useState } from 'react';
import { useStore, thisYearKey } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { YearlyGoal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Check, X, Trash2, ChevronDown, ChevronUp,
  FileText, ListTodo, Pencil, AlertCircle,
  CheckCircle2, XCircle, Circle, CalendarRange
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_CONFIG = {
  Low:      { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20'   },
  Medium:   { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20'  },
  High:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20'  },
  Critical: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
};

function AddYearlyGoalForm({ yearKey, onClose }: { yearKey: string; onClose: () => void }) {
  const { addYearlyGoal } = useStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<YearlyGoal['priority']>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addYearlyGoal({
      id: uuidv4(),
      yearKey,
      title: title.trim(),
      notes: notes.trim(),
      priority,
      progress: 0,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="What do you want to achieve this year?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base bg-gray-900/60"
              autoFocus
            />
            <div className="flex gap-1.5">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all',
                    priority === p
                      ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} border ${PRIORITY_CONFIG[p].border}`
                      : 'bg-white/5 text-gray-500 hover:bg-white/10'
                  )}
                >{p === 'Critical' ? 'Crit' : p}</button>
              ))}
            </div>
            <Input
              placeholder="Notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-900/60 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-purple-500 hover:bg-purple-600 text-white font-bold">
                Add Yearly Goal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function YearlyGoalCard({ goal }: { goal: YearlyGoal }) {
  const { updateYearlyGoal, deleteYearlyGoal, completeYearlyGoal, addSubtask, toggleSubtask, deleteSubtask } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(String(goal.progress));
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(goal.title);

  const isCurrentYear = goal.yearKey === thisYearKey();
  const completedSubtasks = goal.subtasks.filter((s) => s.completed).length;
  const cfg = PRIORITY_CONFIG[goal.priority];

  const handleProgressSave = () => {
    const v = Math.min(100, Math.max(0, parseInt(progressInput) || 0));
    updateYearlyGoal(goal.id, { progress: v });
    setEditingProgress(false);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    addSubtask('yearly', goal.id, { id: uuidv4(), title: subtaskInput.trim(), completed: false });
    setSubtaskInput('');
    setAddingSubtask(false);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className={cn(
        'overflow-hidden transition-all',
        goal.completed && 'border-green-500/20 bg-green-500/5',
        goal.failed && 'border-red-500/20 bg-red-500/5 opacity-70',
        !goal.completed && !goal.failed && `${cfg.border} hover:shadow-lg`
      )}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <button onClick={() => !goal.failed && completeYearlyGoal(goal.id)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110" disabled={goal.failed}>
              {goal.completed ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                : goal.failed ? <XCircle className="w-5 h-5 text-red-400" />
                : <Circle className="w-5 h-5 text-gray-500" />}
            </button>

            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div className="flex gap-2">
                  <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="h-8 text-sm bg-gray-900/60" autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateYearlyGoal(goal.id, { title: titleInput }); setEditingTitle(false); } if (e.key === 'Escape') setEditingTitle(false); }} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { updateYearlyGoal(goal.id, { title: titleInput }); setEditingTitle(false); }}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <p className={cn('font-semibold text-white leading-snug', goal.completed && 'line-through opacity-60')}>{goal.title}</p>
              )}

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{goal.priority}</span>
                {goal.subtasks.length > 0 && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <ListTodo className="w-3 h-3" /> {completedSubtasks}/{goal.subtasks.length}
                  </span>
                )}
                {goal.completedAt && <span className="text-[10px] text-green-400">✓ {new Date(goal.completedAt).toLocaleDateString()}</span>}
                {goal.failed && <span className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!goal.failed && !goal.completed && isCurrentYear && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTitle(true)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => deleteYearlyGoal(goal.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 font-medium">Progress</span>
              <button className="text-[11px] font-bold text-white hover:text-purple-400 transition-colors"
                onClick={() => { setProgressInput(String(goal.progress)); setEditingProgress(true); }} disabled={goal.failed}>
                {goal.progress}%
              </button>
            </div>
            {editingProgress ? (
              <div className="flex gap-2">
                <Input type="number" min={0} max={100} value={progressInput} onChange={(e) => setProgressInput(e.target.value)} className="h-7 text-xs bg-gray-900/60 flex-1" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProgressSave(); if (e.key === 'Escape') setEditingProgress(false); }} />
                <Button size="sm" className="h-7 text-xs px-3 bg-purple-500 hover:bg-purple-600" onClick={handleProgressSave}>Set</Button>
              </div>
            ) : (
              <Progress value={goal.progress} className={cn('h-1.5 [&>div]:bg-purple-500', goal.completed && '[&>div]:bg-green-500')} />
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {goal.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-400">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                      <p>{goal.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subtasks</p>
                    <div className="space-y-1.5">
                      {goal.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2 group">
                          <button onClick={() => toggleSubtask('yearly', goal.id, st.id)} className="w-4 h-4 rounded border border-white/20 flex items-center justify-center flex-shrink-0 hover:border-purple-400 transition-colors">
                            {st.completed && <Check className="w-2.5 h-2.5 text-purple-400" />}
                          </button>
                          <span className={cn('text-sm flex-1', st.completed && 'line-through text-gray-500')}>{st.title}</span>
                          <button onClick={() => deleteSubtask('yearly', goal.id, st.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {addingSubtask ? (
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Subtask..." value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} className="h-8 text-xs bg-gray-900/60 flex-1" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); if (e.key === 'Escape') setAddingSubtask(false); }} />
                        <Button size="sm" className="h-8 px-3 bg-purple-500 hover:bg-purple-600" onClick={handleAddSubtask}>Add</Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddingSubtask(false)}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      !goal.failed && <button onClick={() => setAddingSubtask(true)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mt-2 transition-colors"><Plus className="w-3.5 h-3.5" /> Add subtask</button>
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

export function YearlyGoalsTab() {
  const { yearlyContainers, yearlyGoals } = useStore();
  const [addingToYear, setAddingToYear] = useState<string | null>(null);
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set([thisYearKey()]));

  const toggleContainer = (key: string) => {
    setExpandedContainers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sortedContainers = [...yearlyContainers].sort((a, b) => b.yearKey.localeCompare(a.yearKey));

  return (
    <div className="space-y-6">
      {sortedContainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
          <CalendarRange className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Yearly goals accumulate over time</p>
          <p className="text-sm">New year containers are auto-created</p>
        </div>
      ) : (
        sortedContainers.map((container) => {
          const isCurrentYear = container.yearKey === thisYearKey();
          const goals = yearlyGoals.filter((g) => g.yearKey === container.yearKey);
          const completed = goals.filter((g) => g.completed).length;
          const failed = goals.filter((g) => g.failed).length;
          const total = goals.length;
          const avgProgress = total > 0 ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / total) : 0;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isExpanded = expandedContainers.has(container.yearKey);

          return (
            <div key={container.yearKey} className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => toggleContainer(container.yearKey)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', isCurrentYear ? 'bg-purple-400 shadow-purple-400/50 shadow-lg' : 'bg-gray-600')} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{container.displayYear}</span>
                      {isCurrentYear && <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">This Year</span>}
                    </div>
                    {total > 0 && <p className="text-xs text-gray-500 mt-0.5">{completed} done · {failed} failed · avg {avgProgress}% progress</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {total > 0 && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{completionRate}%</span>
                      <p className="text-[10px] text-gray-500">completion</p>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-5 pt-0 space-y-3">
                      {total > 0 && (
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[
                            { label: 'Total', value: total, color: 'text-white' },
                            { label: 'Done', value: completed, color: 'text-green-400' },
                            { label: 'Failed', value: failed, color: 'text-red-400' },
                            { label: 'Avg %', value: `${avgProgress}%`, color: 'text-purple-400' },
                          ].map((s) => (
                            <div key={s.label} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                              <p className={cn('text-lg font-black', s.color)}>{s.value}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <AnimatePresence mode="popLayout">
                        {goals.length === 0 && <p className="text-sm text-gray-600 italic py-2 text-center">No goals for this year yet.</p>}
                        {goals.map((goal) => <YearlyGoalCard key={goal.id} goal={goal} />)}
                      </AnimatePresence>

                      {isCurrentYear && (
                        <AnimatePresence mode="wait">
                          {addingToYear === container.yearKey ? (
                            <AddYearlyGoalForm key="form" yearKey={container.yearKey} onClose={() => setAddingToYear(null)} />
                          ) : (
                            <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              onClick={() => setAddingToYear(container.yearKey)}
                              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 hover:bg-white/5 transition-all text-sm">
                              <Plus className="w-4 h-4" /> Add a yearly goal
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
