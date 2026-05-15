'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CodingService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Terminal, Flame, Plus, X, Trash2, Code,
  Github, Clock, Zap, BarChart3, Calendar, Cpu, Activity,
  Trophy, BookOpen, Layers, Edit2, Loader2, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'CSS', 'HTML', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];

function ContributionGraph({ contributions }: { contributions: any[] }) {
  const today = new Date();
  const days: { key: string; date: Date; intensity: number; minutes: number; count: number }[] = [];

  // Generate 1 year of days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const contribution = contributions.find((c) => c.dateKey === key);
    
    days.push({
      key,
      date: d,
      intensity: contribution?.intensity || 0,
      minutes: contribution?.totalMinutes || 0,
      count: contribution?.count || 0,
    });
  }

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
  
  for (let i = 0; i < firstDay; i++) week.push({ key: '', date: new Date(), intensity: 0, minutes: 0, count: 0 });
  
  days.forEach((d) => {
    week.push(d);
    if (week.length === 7) { 
      weeks.push(week); 
      week = []; 
    }
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
                  title={day.count > 0
                    ? `${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.minutes}min, ${day.count} sessions`
                    : day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className={cn(
                    'w-[11px] h-[11px] rounded-sm transition-all hover:ring-1 hover:ring-emerald-400 cursor-default',
                    levelColors[day.intensity]
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

function SessionModal({ session, onClose }: { session?: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: session?.title || '',
    projectName: session?.projectName || '',
    language: session?.language || 'Other',
    durationMinutes: session?.durationMinutes || 60,
    problemsSolved: session?.problemsSolved || 0,
    difficulty: session?.difficulty || 'Medium',
    notes: session?.notes || '',
    completed: session?.completed ?? true,
    sessionDate: session?.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: (data: any) => session 
      ? CodingService.updateSession(session.id, data) 
      : CodingService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success(session ? 'Session updated' : 'Session logged');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save session');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl"
      >
        <Card className="border-emerald-500/20 bg-gray-950 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-emerald-400" /> 
                    {session ? 'Edit Session' : 'New Coding Sprint'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    {session ? 'Adjust your technical record' : 'Initialize technical data capture'}
                  </p>
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/5" onClick={onClose}>
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Session Title</label>
                  <Input
                    placeholder="e.g. Architecting Data Pipeline"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Project Name</label>
                  <Input
                    placeholder="e.g. Impr0ve SaaS"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Session Date</label>
                  <Input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Duration (Minutes)</label>
                  <Input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Problems Solved</label>
                  <Input
                    type="number"
                    value={formData.problemsSolved}
                    onChange={(e) => setFormData({ ...formData, problemsSolved: parseInt(e.target.value) || 0 })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Technology</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full h-12 bg-white/5 border-white/10 rounded-xl text-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Difficulty</label>
                  <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d} type="button"
                        onClick={() => setFormData({ ...formData, difficulty: d })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                          formData.difficulty === d ? "bg-emerald-500 text-black shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                      >{d}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Internal Notes</label>
                  <Textarea
                    placeholder="Abstractions, challenges, or next steps..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[100px] bg-white/5 border-white/10 rounded-xl text-sm text-gray-300 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-black text-gray-500 hover:text-white">Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="h-12 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black shadow-xl shadow-emerald-500/20"
                >
                  {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (session ? 'Save Changes' : 'Log Sprint')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CodingPage() {
  const queryClient = useQueryClient();
  const [modalSession, setModalSession] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['coding-sessions'],
    queryFn: () => CodingService.getSessions().then(res => res.data.data),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['coding-stats'],
    queryFn: () => CodingService.getStats().then(res => res.data.data),
  });

  const { data: contributions = [], isLoading: isLoadingContributions } = useQuery({
    queryKey: ['coding-contributions'],
    queryFn: () => CodingService.getContributions().then(res => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CodingService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Session deleted');
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions.filter((s:any) => s.sessionDate.split('T')[0] === today).reduce((a:any, s:any) => a + s.durationMinutes, 0);

  const langMap: Record<string, number> = {};
  sessions.forEach((s:any) => {
    if (s.language) langMap[s.language] = (langMap[s.language] || 0) + s.durationMinutes;
  });
  const totalMinutes = Object.values(langMap).reduce((a, b) => a + b, 0);
  const topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleEdit = (session: any) => {
    setModalSession(session);
    setShowModal(true);
  };

  const handleCreate = () => {
    setModalSession(null);
    setShowModal(true);
  };

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
              <span className="text-sm font-medium">{sessions.length} Committed Sessions</span>
            </p>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          className="h-16 px-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-2xl shadow-emerald-500/20 group transition-all"
        >
          <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
          Log Session
        </Button>
      </header>

      {showModal && <SessionModal session={modalSession} onClose={() => setShowModal(false)} />}

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Technical Streak', value: stats?.currentStreak === 0 ? '0 Days' : `${stats?.currentStreak} Days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Longest Sprint', value: stats?.longestStreak === 0 ? '0 Days' : `${stats?.longestStreak} Days`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Today Pulse', value: `${todayMinutes}m`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Invested', value: stats?.totalMinutes >= 60 ? `${Math.floor(stats?.totalMinutes/60)}h` : `${stats?.totalMinutes || 0}m`, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Real-time technical heatmap</p>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            {isLoadingContributions ? (
               <div className="h-40 bg-white/5 animate-pulse rounded-2xl" />
            ) : (
               <ContributionGraph contributions={contributions} />
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
                      <span className="text-emerald-500">{Math.round((mins / (totalMinutes || 1)) * 100)}%</span>
                    </div>
                    <Progress value={(mins / (totalMinutes || 1)) * 100} className="h-2 bg-white/5 [&>div]:bg-emerald-500" />
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
         {sessions.length === 0 ? (
           <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
              <Layers className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500">Zero Technical Records</h3>
              <p className="text-sm text-gray-600 mt-1">Start a session to initialize history</p>
              <Button onClick={handleCreate} variant="outline" className="mt-6 border-white/10 hover:bg-white/5">
                 Initialize First Session
              </Button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session: any) => (
                <motion.div key={session.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] rounded-3xl p-6 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-white truncate">{session.title}</h4>
                          <span className={cn(
                            "text-[8px] px-2 py-0.5 rounded-full font-black uppercase",
                            session.difficulty === 'Expert' ? "bg-red-500 text-black" :
                            session.difficulty === 'Hard' ? "bg-orange-500 text-black" :
                            session.difficulty === 'Medium' ? "bg-blue-500 text-black" :
                            "bg-emerald-500 text-black"
                          )}>
                            {session.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                           </div>
                           {session.projectName && (
                             <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{session.projectName}</span>
                             </div>
                           )}
                           <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{session.durationMinutes}min</span>
                           </div>
                        </div>
                        {session.notes && <p className="text-xs text-gray-600 mt-3 line-clamp-2 italic">{session.notes}</p>}
                        
                        {session.problemsSolved > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">{session.problemsSolved} Problems Solved</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="icon"
                          className="h-9 w-9 rounded-full text-blue-400/50 hover:text-blue-400 hover:bg-blue-400/10"
                          onClick={() => handleEdit(session)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-9 w-9 rounded-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => deleteMutation.mutate(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}
