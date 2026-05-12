'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { LifetimeGoal, Milestone, JournalEntry } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Check, X, Trash2, ChevronDown, ChevronUp,
  FileText, Pencil, CheckCircle2, Circle, Infinity,
  BookOpen, Flag, Clock, Star, Milestone as MilestoneIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Career', 'Financial', 'Health', 'Relationships', 'Education', 'Personal', 'Creative', 'Other'];

function AddLifetimeGoalForm({ onClose }: { onClose: () => void }) {
  const { addLifetimeGoal } = useStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Career');
  const [estimatedYears, setEstimatedYears] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addLifetimeGoal({
      id: uuidv4(),
      title: title.trim(),
      notes: notes.trim(),
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      milestones: [],
      journal: [],
      category,
      estimatedYears: parseFloat(estimatedYears) || undefined,
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Mission Title</label>
              <Input
                placeholder="e.g. Become a software engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base bg-gray-900/60"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all',
                        category === c
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      )}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Est. Years to Complete</label>
                <Input
                  type="number" placeholder="e.g. 5"
                  value={estimatedYears}
                  onChange={(e) => setEstimatedYears(e.target.value)}
                  className="bg-gray-900/60 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
              <Input
                placeholder="Why does this matter to you?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-900/60 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                Create Mission
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LifetimeGoalCard({ goal }: { goal: LifetimeGoal }) {
  const {
    updateLifetimeGoal, deleteLifetimeGoal,
    addMilestone, toggleMilestone, deleteMilestone,
    addJournalEntry, deleteJournalEntry,
  } = useStore();

  const [section, setSection] = useState<'overview' | 'milestones' | 'journal'>('overview');
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(String(goal.progress));
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(goal.title);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneInput, setMilestoneInput] = useState('');
  const [addingJournal, setAddingJournal] = useState(false);
  const [journalInput, setJournalInput] = useState('');
  const [expanded, setExpanded] = useState(false);

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const milestoneProgress = goal.milestones.length > 0
    ? Math.round((completedMilestones / goal.milestones.length) * 100)
    : 0;

  const handleProgressSave = () => {
    const v = Math.min(100, Math.max(0, parseInt(progressInput) || 0));
    updateLifetimeGoal(goal.id, { progress: v });
    setEditingProgress(false);
  };

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    addMilestone(goal.id, {
      id: uuidv4(),
      title: milestoneInput.trim(),
      completed: false,
    });
    setMilestoneInput('');
    setAddingMilestone(false);
  };

  const handleAddJournal = () => {
    if (!journalInput.trim()) return;
    addJournalEntry(goal.id, {
      id: uuidv4(),
      date: new Date().toISOString(),
      content: journalInput.trim(),
      progressSnapshot: goal.progress,
    });
    setJournalInput('');
    setAddingJournal(false);
  };

  const estimatedRemaining = goal.estimatedYears
    ? (() => {
        const yearsElapsed = (Date.now() - new Date(goal.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000);
        const remaining = goal.estimatedYears - yearsElapsed;
        if (remaining <= 0) return 'Overdue';
        if (remaining < 1) return `${Math.round(remaining * 12)}mo remaining`;
        return `~${remaining.toFixed(1)}y remaining`;
      })()
    : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className={cn(
        'overflow-hidden transition-all',
        goal.completed ? 'border-green-500/20 bg-green-500/5' : 'border-emerald-500/10 hover:border-emerald-500/30'
      )}>
        <CardContent className="p-0">
          {/* Goal header */}
          <div className="p-5">
            <div className="flex items-start gap-3">
              <button
                onClick={() => updateLifetimeGoal(goal.id, { completed: !goal.completed, completedAt: !goal.completed ? new Date().toISOString() : undefined })}
                className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
              >
                {goal.completed
                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                  : <Circle className="w-5 h-5 text-emerald-600" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <div className="flex gap-2">
                    <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="h-8 text-sm bg-gray-900/60" autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') { updateLifetimeGoal(goal.id, { title: titleInput }); setEditingTitle(false); } if (e.key === 'Escape') setEditingTitle(false); }} />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { updateLifetimeGoal(goal.id, { title: titleInput }); setEditingTitle(false); }}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <p className={cn('font-bold text-white text-lg leading-tight', goal.completed && 'line-through opacity-60')}>{goal.title}</p>
                )}

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {goal.category}
                  </span>
                  {estimatedRemaining && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {estimatedRemaining}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> {completedMilestones}/{goal.milestones.length} milestones
                  </span>
                  {goal.completedAt && (
                    <span className="text-[10px] text-green-400">✓ {new Date(goal.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!goal.completed && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTitle(true)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => deleteLifetimeGoal(goal.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-medium">Overall Progress</span>
                <button
                  className="text-[11px] font-bold text-white hover:text-emerald-400 transition-colors"
                  onClick={() => { setProgressInput(String(goal.progress)); setEditingProgress(true); }}
                >
                  {goal.progress}%
                </button>
              </div>
              {editingProgress ? (
                <div className="flex gap-2">
                  <Input type="number" min={0} max={100} value={progressInput} onChange={(e) => setProgressInput(e.target.value)} className="h-7 text-xs bg-gray-900/60 flex-1" autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleProgressSave(); if (e.key === 'Escape') setEditingProgress(false); }} />
                  <Button size="sm" className="h-7 text-xs px-3 bg-emerald-500 hover:bg-emerald-600" onClick={handleProgressSave}>Set</Button>
                </div>
              ) : (
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
              {goal.milestones.length > 0 && (
                <>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">Milestone Progress</span>
                    <span className="text-[11px] font-bold text-emerald-400">{milestoneProgress}%</span>
                  </div>
                  <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-600/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${milestoneProgress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Expanded sections */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {/* Section tabs */}
                <div className="flex border-t border-white/10">
                  {([
                    { id: 'overview', label: 'Overview', icon: Star },
                    { id: 'milestones', label: 'Milestones', icon: Flag },
                    { id: 'journal', label: 'Journal', icon: BookOpen },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSection(id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all',
                        section === id
                          ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  {/* Overview section */}
                  {section === 'overview' && (
                    <div className="space-y-3">
                      {goal.notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-400 p-3 rounded-xl bg-white/5">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                          <p>{goal.notes}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                          <p className="text-lg font-black text-white">{goal.milestones.length}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Milestones</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                          <p className="text-lg font-black text-emerald-400">{completedMilestones}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Achieved</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                          <p className="text-lg font-black text-white">{goal.journal.length}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Journal Entries</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 text-right">
                        Created {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  )}

                  {/* Milestones section */}
                  {section === 'milestones' && (
                    <div className="space-y-2">
                      {goal.milestones.length === 0 && !addingMilestone && (
                        <p className="text-sm text-gray-600 italic text-center py-4">No milestones yet. Add checkpoints toward this goal.</p>
                      )}
                      {goal.milestones.map((m, i) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                          <button onClick={() => toggleMilestone(goal.id, m.id)} className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', m.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600 hover:border-emerald-500')}>
                            {m.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1">
                            <span className={cn('text-sm font-medium', m.completed && 'line-through text-gray-500')}>{m.title}</span>
                            {m.completedAt && <p className="text-[10px] text-emerald-400 mt-0.5">Achieved {new Date(m.completedAt).toLocaleDateString()}</p>}
                          </div>
                          <span className="text-[10px] text-gray-600">#{i + 1}</span>
                          <button onClick={() => deleteMilestone(goal.id, m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))}
                      {addingMilestone ? (
                        <div className="flex gap-2">
                          <Input placeholder="New milestone..." value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)} className="h-9 text-sm bg-gray-900/60 flex-1" autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddMilestone(); if (e.key === 'Escape') setAddingMilestone(false); }} />
                          <Button size="sm" className="h-9 bg-emerald-500 hover:bg-emerald-600" onClick={handleAddMilestone}>Add</Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setAddingMilestone(false)}><X className="w-3.5 h-3.5" /></Button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingMilestone(true)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add milestone
                        </button>
                      )}
                    </div>
                  )}

                  {/* Journal section */}
                  {section === 'journal' && (
                    <div className="space-y-3">
                      {addingJournal ? (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Write a journal entry about your progress..."
                            value={journalInput}
                            onChange={(e) => setJournalInput(e.target.value)}
                            className="w-full min-h-[100px] px-4 py-3 rounded-2xl border border-white/10 bg-gray-900/60 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setAddingJournal(false)}>Cancel</Button>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddJournal}>Save Entry</Button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingJournal(true)} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all text-sm">
                          <Plus className="w-4 h-4" /> Write a journal entry
                        </button>
                      )}
                      {[...goal.journal].reverse().map((entry) => (
                        <div key={entry.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-[10px] text-gray-500 font-medium">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-[10px] text-emerald-400 mt-0.5">Progress at time: {entry.progressSnapshot}%</p>
                            </div>
                            <button onClick={() => deleteJournalEntry(goal.id, entry.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{entry.content}</p>
                        </div>
                      ))}
                      {goal.journal.length === 0 && !addingJournal && (
                        <p className="text-sm text-gray-600 italic text-center py-4">No journal entries yet. Document your journey.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LifetimeGoalsTab() {
  const { lifetimeGoals } = useStore();
  const [addingGoal, setAddingGoal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const allCategories = ['All', ...CATEGORIES];
  const filtered = filterCategory === 'All'
    ? lifetimeGoals
    : lifetimeGoals.filter((g) => g.category === filterCategory);

  const totalProgress = lifetimeGoals.length > 0
    ? Math.round(lifetimeGoals.reduce((a, g) => a + g.progress, 0) / lifetimeGoals.length)
    : 0;
  const completed = lifetimeGoals.filter((g) => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      {lifetimeGoals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Missions', value: lifetimeGoals.length, color: 'text-white' },
            { label: 'Achieved', value: completed, color: 'text-emerald-400' },
            { label: 'Avg Progress', value: `${totalProgress}%`, color: 'text-emerald-300' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      {lifetimeGoals.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                filterCategory === c
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
              )}
            >{c}</button>
          ))}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence mode="wait">
        {addingGoal ? (
          <AddLifetimeGoalForm key="form" onClose={() => setAddingGoal(false)} />
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setAddingGoal(true)}
            className="w-full flex items-center gap-3 p-4 rounded-3xl border border-dashed border-emerald-500/20 text-gray-500 hover:text-gray-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Add a lifetime mission</p>
              <p className="text-xs text-gray-600">Long-term goals that define who you want to become</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Goals list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && !addingGoal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl"
            >
              <Infinity className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Define your life's biggest missions</p>
              <p className="text-sm">These are the goals that take years to achieve</p>
            </motion.div>
          )}
          {filtered.map((goal) => (
            <LifetimeGoalCard key={goal.id} goal={goal} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
