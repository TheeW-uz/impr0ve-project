'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { CodingService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Terminal, Flame, Plus, X, Trash2, Code,
  Github, Clock, Zap, BarChart3, Calendar, Cpu, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'CSS', 'HTML', 'Other'];

function ContributionGraph({ activities }: { activities: any[] }) {
  const today = new Date();
  const days: { key: string; date: Date; count: number; minutes: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
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
    'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]',
  ];

  const weeks: typeof days[] = [];
  let week: typeof days = [];
  const firstDay = days[0].date.getDay();
  for (let i = 0; i < firstDay; i++) week.push({ key: '', date: new Date(), count: 0, minutes: 0 });
  days.forEach((d) => {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) weeks.push(week);

  return (
    <div className="p-1">
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {wk.map((day, di) =>
              day.key ? (
                <div
                  key={day.key}
                  title={day.minutes > 0
                    ? `${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.minutes}min, ${day.count} sessions`
                    : day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className={cn(
                    'w-[11px] h-[11px] rounded-sm transition-all hover:ring-1 hover:ring-emerald-400 cursor-default',
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
      <div className="flex items-center justify-end gap-2 mt-4 pr-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn('w-[10px] h-[10px] rounded-sm', c)} />
        ))}
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">More</span>
      </div>
    </div>
  );
}

function LogActivityForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [language, setLanguage] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => CodingService.logActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !minutes) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      minutesSpent: parseInt(minutes) || 0,
      language: language || undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card className="border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-500/5">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                   <Cpu className="w-6 h-6 text-emerald-400" /> System Log
                 </h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Capture your technical progress</p>
              </div>
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/5" onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Session Title</label>
                  <Input
                    placeholder="e.g. Refactoring Authentication Engine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    autoFocus
                    required
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Time Invested</label>
                    <div className="relative">
                       <Input
                         type="number" placeholder="Minutes" min={1}
                         value={minutes}
                         onChange={(e) => setMinutes(e.target.value)}
                         className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                         required
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Min</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Core Technology</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l} type="button"
                          onClick={() => setLanguage(language === l ? '' : l)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border',
                            language === l
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                              : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'
                          )}
                        >{l}</button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Technical Brief (Optional)</label>
                  <Input
                    placeholder="Details about abstractions, bugs fixed, or features built..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-sm text-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
               </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-black text-gray-500 hover:text-white">Abort</Button>
              <Button type="submit" className="h-12 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20">
                Log Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CodingPage() {
  const queryClient = useQueryClient();
  const [loggingActivity, setLoggingActivity] = useState(false);
  const { user } = useAuth();

  const { data: codingActivities = [], isLoading } = useQuery({
    queryKey: ['coding'],
    queryFn: () => CodingService.getActivities().then(res => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CodingService.deleteActivity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coding'] }),
  });

  const today = new Date().toISOString().split('T')[0];
  const todayActivities = codingActivities.filter((a:any) => a.dateKey === today);
  const todayMinutes = todayActivities.reduce((a:any, act:any) => a + act.minutesSpent, 0);
  const totalMinutes = codingActivities.reduce((a:any, act:any) => a + act.minutesSpent, 0);
  
  const langMap: Record<string, number> = {};
  codingActivities.forEach((a:any) => {
    if (a.language) langMap[a.language] = (langMap[a.language] || 0) + a.minutesSpent;
  });
  const topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recentActivities = [...codingActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 rotate-6">
            <Terminal className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Command Line</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-emerald-500/80 font-black uppercase tracking-[0.2em] text-[10px]">Technical Pulse</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-sm font-medium">{codingActivities.length} Committed Sessions</span>
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!loggingActivity && (
            <Button
              onClick={() => setLoggingActivity(true)}
              className="h-16 px-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-2xl shadow-emerald-500/20 group transition-all"
            >
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
              Log Session
            </Button>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {loggingActivity && (
          <div className="mb-12">
             <LogActivityForm onClose={() => setLoggingActivity(false)} />
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Technical Streak', value: '4 days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Longest Sprint', value: '12 days', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Today Pulse', value: `${todayMinutes}m`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Accumulated XP', value: totalMinutes >= 60 ? `${Math.floor(totalMinutes/60)}h` : `${totalMinutes}m`, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-white/[0.02] border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.04] transition-all">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-6', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{stat.label}</p>
              <p className={cn('text-3xl font-black mt-2 tracking-tight', stat.color)}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-white/[0.02] border-white/5 lg:col-span-2 rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
             <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                    <Github className="w-6 h-6 text-emerald-400" /> Activity Matrix
                  </CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">One year technical heatmap</p>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            {isLoading ? (
               <div className="h-40 bg-white/5 animate-pulse rounded-2xl" />
            ) : (
               <ContributionGraph activities={codingActivities} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <Code className="w-6 h-6 text-emerald-400" /> Stack Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            {topLangs.length === 0 ? (
              <div className="text-center py-12 opacity-20">
                 <Cpu className="w-12 h-12 mx-auto mb-4" />
                 <p className="text-xs font-bold uppercase tracking-widest">No metrics detected</p>
              </div>
            ) : (
              <div className="space-y-6">
                {topLangs.map(([lang, mins]) => (
                  <div key={lang} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-gray-300">{lang}</span>
                      <span className="text-emerald-500">{Math.round((mins / totalMinutes) * 100)}%</span>
                    </div>
                    <Progress value={(mins / totalMinutes) * 100} className="h-2 bg-white/5 [&>div]:bg-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <h2 className="text-3xl font-black text-white tracking-tighter px-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" /> Session History
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentActivities.map((act: any) => (
              <motion.div key={act.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] rounded-3xl p-6 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-white truncate">{act.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(act.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                         </div>
                         {act.language && (
                           <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-black uppercase border border-emerald-500/20">{act.language}</span>
                         )}
                         <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{act.minutesSpent}min</span>
                         </div>
                      </div>
                      {act.description && <p className="text-xs text-gray-600 mt-3 line-clamp-1 italic">{act.description}</p>}
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => deleteMutation.mutate(act.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}

