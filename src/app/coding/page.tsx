'use client';

import { useState, useEffect } from 'react';
import { useStore, computeCodingStreak, todayKey } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { CodingActivity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Terminal, Flame, Plus, X, Trash2, Code,
  Github, Clock, Zap, BarChart3, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'CSS', 'HTML', 'Other'];

// ── Contribution graph ─────────────────────────────────────────────────────────
function ContributionGraph({ activities }: { activities: CodingActivity[] }) {
  const today = new Date();
  const days: { key: string; date: Date; count: number; minutes: number }[] = [];

  // Build last 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayActivities = activities.filter((a) => a.dateKey === key);
    days.push({
      key,
      date: d,
      count: dayActivities.length,
      minutes: dayActivities.reduce((a, act) => a + act.minutesSpent, 0),
    });
  }

  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  const getLevel = (minutes: number) => {
    if (minutes === 0) return 0;
    const ratio = minutes / maxMinutes;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const levelColors = [
    'bg-white/5',
    'bg-emerald-900/60',
    'bg-emerald-700/70',
    'bg-emerald-500/80',
    'bg-emerald-400',
  ];

  // Group into weeks (cols)
  const weeks: typeof days[] = [];
  let week: typeof days = [];
  const firstDay = days[0].date.getDay();
  for (let i = 0; i < firstDay; i++) week.push({ key: '', date: new Date(), count: 0, minutes: 0 });
  days.forEach((d) => {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) weeks.push(week);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {wk.map((day, di) =>
              day.key ? (
                <div
                  key={day.key}
                  title={day.minutes > 0
                    ? `${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.minutes}min, ${day.count} ${day.count === 1 ? 'session' : 'sessions'}`
                    : day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className={cn(
                    'w-[11px] h-[11px] rounded-sm transition-all hover:opacity-80 cursor-default',
                    levelColors[getLevel(day.minutes)]
                  )}
                />
              ) : (
                <div key={di} className="w-[11px] h-[11px]" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[10px] text-gray-600">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn('w-[11px] h-[11px] rounded-sm', c)} />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  );
}

// ── Log Activity Form ──────────────────────────────────────────────────────────
function LogActivityForm({ onClose }: { onClose: () => void }) {
  const { addCodingActivity } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('');
  const [language, setLanguage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !minutes) return;
    addCodingActivity({
      id: uuidv4(),
      dateKey: todayKey(),
      title: title.trim(),
      description: description.trim(),
      minutesSpent: parseInt(minutes) || 0,
      language: language || undefined,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Log Coding Session
              </h3>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Input
              placeholder="What did you work on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-900/60"
              autoFocus
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Minutes Spent</label>
                <Input
                  type="number" placeholder="e.g. 90" min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-gray-900/60"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Language / Tech</label>
                <div className="flex flex-wrap gap-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l} type="button"
                      onClick={() => setLanguage(language === l ? '' : l)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold transition-all',
                        language === l
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      )}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <Input
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-900/60 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 font-bold">
                Log Session
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Coding Page ───────────────────────────────────────────────────────────
export default function CodingPage() {
  const { codingActivities, deleteCodingActivity } = useStore();
  const [loggingActivity, setLoggingActivity] = useState(false);

  const { current: currentStreak, longest: longestStreak } = computeCodingStreak(codingActivities);

  const todayActivities = codingActivities.filter((a) => a.dateKey === todayKey());
  const todayMinutes = todayActivities.reduce((a, act) => a + act.minutesSpent, 0);
  const totalMinutes = codingActivities.reduce((a, act) => a + act.minutesSpent, 0);
  const totalSessions = codingActivities.length;

  // Language breakdown
  const langMap: Record<string, number> = {};
  codingActivities.forEach((a) => {
    if (a.language) langMap[a.language] = (langMap[a.language] || 0) + a.minutesSpent;
  });
  const topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent activities (last 10)
  const recentActivities = [...codingActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Terminal className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              {useAuth.getState().user?.username}'s Coding
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">Every session counts. Track real progress, build real streaks.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!loggingActivity && (
            <Button
              onClick={() => setLoggingActivity(true)}
              className="bg-emerald-500 hover:bg-emerald-600 font-bold gap-2 rounded-2xl h-10 md:h-11"
            >
              <Plus className="w-4 h-4" /> <span className="text-sm">Log Coding Session</span>
            </Button>
          )}
        </AnimatePresence>
      </header>

      {/* Log form */}
      <AnimatePresence>
        {loggingActivity && (
          <LogActivityForm onClose={() => setLoggingActivity(false)} />
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Current Streak',
            value: currentStreak === 0 ? '0 days' : `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
            icon: Flame,
            color: currentStreak > 0 ? 'text-orange-400' : 'text-gray-500',
            bg: currentStreak > 0 ? 'bg-orange-500/10' : 'bg-white/5',
          },
          {
            label: 'Longest Streak',
            value: longestStreak === 0 ? '0 days' : `${longestStreak} days`,
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
          {
            label: 'Today',
            value: todayMinutes > 0 ? `${todayMinutes}min` : '0 min',
            icon: Clock,
            color: todayMinutes > 0 ? 'text-emerald-400' : 'text-gray-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Time',
            value: totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}min`,
            icon: BarChart3,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-white/5 border-white/5 hover:border-white/10 transition-all h-full">
              <CardContent className="p-4 md:p-5 flex flex-row xs:flex-col items-center xs:items-start gap-4 xs:gap-0">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center xs:mb-3 flex-shrink-0', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                  <p className={cn('text-xl md:text-2xl font-black mt-1 truncate', stat.color)}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {/* Contribution and Breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/5 lg:col-span-2 overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-400" />
                Contribution Activity
              </CardTitle>
              <span className="text-[10px] md:text-xs text-gray-500">{totalSessions} total sessions</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-2">
            <div className="overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
              <div className="min-w-fit">
                {codingActivities.length === 0 ? (
                  <div className="py-8 text-center text-gray-600">
                    <Github className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-xs md:text-sm">Start logging sessions — your graph will fill in day by day</p>
                  </div>
                ) : (
                  <ContributionGraph activities={codingActivities} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language breakdown */}
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" /> Language Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            {topLangs.length === 0 ? (
              <p className="text-sm text-gray-600 italic text-center py-6">No language data yet</p>
            ) : (
              <div className="space-y-3">
                {topLangs.map(([lang, mins]) => (
                  <div key={lang} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-300">{lang}</span>
                      <span className="text-gray-500">{mins >= 60 ? `${Math.round(mins / 60)}h ${mins % 60}m` : `${mins}min`}</span>
                    </div>
                    <Progress value={(mins / totalMinutes) * 100} className="h-1.5 [&>div]:bg-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-600 italic text-center py-6">No sessions logged yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{act.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">{new Date(act.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        {act.language && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium">{act.language}</span>
                        )}
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {act.minutesSpent}min
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCodingActivity(act.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
