'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CodingService } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Terminal, Flame, Plus, X, Trash2, Code,
  Github, Clock, Zap, BarChart3, Calendar, Cpu, Activity,
  Trophy, BookOpen, Layers, Edit2, Loader2, Save,
  Search, RefreshCw, LogOut, ExternalLink, Award, ArrowUpRight,
  TrendingUp, Play, Pause, ChevronRight, CheckCircle2, AlertCircle, Sparkles, BookMarked
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/language-context';

// Technologies list for dropdown
const PRELOADED_TECHS = [
  // Languages
  { name: 'Python', category: 'Languages', difficulty: 'Easy', icon: Code },
  { name: 'JavaScript', category: 'Languages', difficulty: 'Easy', icon: Code },
  { name: 'TypeScript', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'Rust', category: 'Languages', difficulty: 'Hard', icon: Code },
  { name: 'Go', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'Java', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'C++', category: 'Languages', difficulty: 'Hard', icon: Code },
  { name: 'C#', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'Swift', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'Kotlin', category: 'Languages', difficulty: 'Medium', icon: Code },
  { name: 'PHP', category: 'Languages', difficulty: 'Easy', icon: Code },
  // Frontend
  { name: 'HTML', category: 'Frontend', difficulty: 'Easy', icon: Layers },
  { name: 'CSS', category: 'Frontend', difficulty: 'Easy', icon: Layers },
  { name: 'React', category: 'Frontend', difficulty: 'Medium', icon: Layers },
  { name: 'Next.js', category: 'Frontend', difficulty: 'Medium', icon: Layers },
  { name: 'Vue', category: 'Frontend', difficulty: 'Easy', icon: Layers },
  { name: 'Angular', category: 'Frontend', difficulty: 'Hard', icon: Layers },
  { name: 'Svelte', category: 'Frontend', difficulty: 'Easy', icon: Layers },
  { name: 'Tailwind', category: 'Frontend', difficulty: 'Easy', icon: Layers },
  // Backend
  { name: 'Node.js', category: 'Backend', difficulty: 'Medium', icon: Cpu },
  { name: 'Express', category: 'Backend', difficulty: 'Easy', icon: Cpu },
  { name: 'Django', category: 'Backend', difficulty: 'Medium', icon: Cpu },
  { name: 'Flask', category: 'Backend', difficulty: 'Easy', icon: Cpu },
  { name: 'Spring Boot', category: 'Backend', difficulty: 'Hard', icon: Cpu },
  // Mobile
  { name: 'Flutter', category: 'Mobile', difficulty: 'Medium', icon: BookOpen },
  { name: 'React Native', category: 'Mobile', difficulty: 'Medium', icon: BookOpen },
  { name: 'SwiftUI', category: 'Mobile', difficulty: 'Medium', icon: BookOpen },
  // Databases
  { name: 'PostgreSQL', category: 'Databases', difficulty: 'Medium', icon: Layers },
  { name: 'MySQL', category: 'Databases', difficulty: 'Easy', icon: Layers },
  { name: 'MongoDB', category: 'Databases', difficulty: 'Easy', icon: Layers },
  { name: 'Redis', category: 'Databases', difficulty: 'Medium', icon: Layers },
  // AI / ML
  { name: 'PyTorch', category: 'AI/ML', difficulty: 'Hard', icon: Sparkles },
  { name: 'TensorFlow', category: 'AI/ML', difficulty: 'Hard', icon: Sparkles },
  { name: 'LangChain', category: 'AI/ML', difficulty: 'Medium', icon: Sparkles },
  // Game Dev
  { name: 'Unity', category: 'Game Dev', difficulty: 'Medium', icon: Trophy },
  { name: 'Unreal Engine', category: 'Game Dev', difficulty: 'Hard', icon: Trophy },
  // Cybersecurity
  { name: 'Ethical Hacking', category: 'Cybersecurity', difficulty: 'Hard', icon: Terminal },
  { name: 'Linux', category: 'Cybersecurity', difficulty: 'Medium', icon: Terminal },
];

const SKILL_LEVELS = ['Beginner', 'Junior', 'Intermediate', 'Advanced', 'Professional', 'Expert'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];

function ContributionGraph({ contributions }: { contributions: any[] }) {
  const today = new Date();
  const days: { key: string; date: Date; intensity: number; minutes: number; count: number }[] = [];

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
    'bg-white/5 border border-white/5',
    'bg-emerald-950/40 border border-emerald-900/30 text-emerald-300',
    'bg-emerald-900/60 border border-emerald-800/40 text-emerald-200',
    'bg-emerald-700/60 border border-emerald-600/40 text-emerald-100',
    'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] text-black border border-emerald-400',
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
    <div className="p-4 bg-black/40 border border-white/5 rounded-[2rem] backdrop-blur-md">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 pt-1">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1.5 shrink-0">
            {wk.map((day, di) =>
              day.key ? (
                <div
                  key={day.key}
                  title={day.count > 0
                    ? `${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.minutes}m logged, ${day.count} sessions`
                    : day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  className={cn(
                    'w-[12px] h-[12px] rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-emerald-400 cursor-default duration-150',
                    levelColors[day.intensity]
                  )}
                />
              ) : (
                <div key={di} className="w-[12px] h-[12px]" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
        <div className="flex gap-3">
          <span>Total Activity Days: {contributions.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-600">Less</span>
          {levelColors.map((c, i) => (
            <div key={i} className={cn('w-[10px] h-[10px] rounded-sm', c.split(' ')[0])} />
          ))}
          <span className="text-[10px] uppercase tracking-widest text-gray-600">More</span>
        </div>
      </div>
    </div>
  );
}

// GitHub Connect Modal
function GithubConnectModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectMutation = useMutation({
    mutationFn: (data: any) => CodingService.connectGithub(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['github-profile'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      toast.success(`Connected to @${res.data.data.account.username}! +100 XP Awarded`);
      onClose();
    },
    onError: (e: any) => {
      const errMsg = e.response?.data?.error || 'Failed to connect. Make sure username is valid.';
      toast.error(errMsg);
      setIsConnecting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsConnecting(true);
    connectMutation.mutate({ username, accessToken });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
        <Card className="border-emerald-500/20 bg-gray-950/90 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                  <Github className="w-6 h-6 text-emerald-400" /> Link GitHub Account
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                  Connect profile to sync commits dynamically
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/5" onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">GitHub Username</label>
                <div className="relative">
                  <Input
                    placeholder="e.g. octocat"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 pl-10 bg-white/5 border-white/10 rounded-xl font-bold text-white focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <Github className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Personal Access Token <span className="text-gray-600">(Optional)</span>
                </label>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-mono text-xs focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[9px] text-gray-500 leading-normal ml-2">
                  Providing an access token is highly recommended to prevent GitHub API rate limits. Tokens are stored securely.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isConnecting}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black shadow-xl shadow-emerald-500/20"
                >
                  {isConnecting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Connect GitHub'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Goal Creation Modal
function GoalModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [targetLevel, setTargetLevel] = useState('Intermediate');
  const [hours, setHours] = useState(100);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const goalMutation = useMutation({
    mutationFn: (data: any) => CodingService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('AI Syllabus Roadmap generated successfully! +50 XP Awarded');
      onClose();
    },
    onError: () => {
      toast.error('Failed to generate learning roadmap');
    }
  });

  const filteredTechs = PRELOADED_TECHS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) {
      toast.error('Please choose a technology first');
      return;
    }
    goalMutation.mutate({
      technology: selectedTech,
      currentLevel,
      targetLevel,
      estimatedStudyHours: hours,
      dailyMinutes,
      difficulty,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl my-8">
        <Card className="border-emerald-500/20 bg-gray-950 rounded-[3rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8 md:p-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-emerald-400" /> AI Roadmap Builder
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                  Specify target parameters to map custom engineering syllabus
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/5" onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Technology Search & Selection */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Choose Technology / Stack</label>
                <div className="relative">
                  <Input
                    placeholder="Search e.g. React, Rust, PyTorch..."
                    value={selectedTech || searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedTech('');
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="h-12 pl-10 pr-10 bg-white/5 border-white/10 rounded-xl font-bold text-white"
                    required
                  />
                  <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                  {selectedTech && (
                    <button
                      type="button"
                      onClick={() => { setSelectedTech(''); setSearchQuery(''); }}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {isDropdownOpen && !selectedTech && (
                  <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl p-2 shadow-2xl no-scrollbar">
                    {filteredTechs.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        No preloaded match found. Hit enter to create dynamic course for <span className="text-emerald-400 font-bold">"{searchQuery}"</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {filteredTechs.map((tech) => (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => {
                              setSelectedTech(tech.name);
                              setSearchQuery('');
                              setDifficulty(tech.difficulty);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-left text-sm transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Code className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-white">{tech.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider text-gray-500">{tech.category}</span>
                              <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase",
                                tech.difficulty === 'Hard' ? "bg-red-500/10 text-red-400" :
                                tech.difficulty === 'Medium' ? "bg-blue-500/10 text-blue-400" :
                                "bg-emerald-500/10 text-emerald-400"
                              )}>{tech.difficulty}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTech(searchQuery);
                          setSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full mt-2 p-3 text-center text-xs border-t border-white/5 text-emerald-400 font-bold hover:bg-emerald-500/5 transition-all rounded-b-xl"
                      >
                        Generate custom Roadmap for "{searchQuery}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Grid configs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Starting Skill Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full h-12 bg-white/5 border-white/10 rounded-xl text-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                  >
                    {SKILL_LEVELS.map(lvl => <option key={lvl} value={lvl} className="bg-gray-950 text-white">{lvl}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Target Skill Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full h-12 bg-white/5 border-white/10 rounded-xl text-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                  >
                    {SKILL_LEVELS.slice(SKILL_LEVELS.indexOf(currentLevel) + 1).map(lvl => (
                      <option key={lvl} value={lvl} className="bg-gray-950 text-white">{lvl}</option>
                    ))}
                    {SKILL_LEVELS.slice(SKILL_LEVELS.indexOf(currentLevel) + 1).length === 0 && (
                      <option value={currentLevel} className="bg-gray-950 text-white">{currentLevel} (Mastery)</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Total Budget Hours</label>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Math.max(10, parseInt(e.target.value) || 0))}
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Daily Study Minutes</label>
                  <Input
                    type="number"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Math.max(15, parseInt(e.target.value) || 0))}
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center font-mono"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Syllabus Complexity</label>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                    {DIFFICULTY_LEVELS.map(d => (
                      <button
                        key={d} type="button"
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                          difficulty === d ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-white"
                        )}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-black text-gray-500 hover:text-white">Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={goalMutation.isPending}
                  className="h-12 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                  {goalMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate AI Syllabus
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Learning Dashboard Panel
function LearningDashboard({ goal, onClose }: { goal: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [expandedPhaseId, setExpandedPhaseId] = useState<string>(goal.roadmap?.phases[0]?.id || '');
  const [isToggling, setIsToggling] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const toggleTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; completed: boolean }) => 
      CodingService.toggleTask(goal.id, data.taskId, data.completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-goals'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Task updated successfully');
      setIsToggling(false);
    }
  });

  const logHistoryMutation = useMutation({
    mutationFn: (data: { minutes: number; notes?: string }) => 
      CodingService.logGoalTime(goal.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-goals'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['coding-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success(`Logged ${studyMinutes}m study session. +${studyMinutes} XP Awarded!`);
      setNotes('');
      setIsLogging(false);
    }
  });

  const adaptMutation = useMutation({
    mutationFn: () => CodingService.adaptRoadmap(goal.id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['coding-goals'] });
      toast.success(`Adapted! Pace analyzed: ${res.data.data.detectedPace}. Generated custom recommendation.`);
      setIsAdapting(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => CodingService.deleteGoal(goal.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-goals'] });
      toast.success('Goal roadmap deleted');
      onClose();
    }
  });

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    setIsToggling(true);
    toggleTaskMutation.mutate({ taskId, completed: !currentCompleted });
  };

  const handleLogStudy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    logHistoryMutation.mutate({ minutes: studyMinutes, notes });
  };

  const handleAdaptRoadmap = () => {
    setIsAdapting(true);
    adaptMutation.mutate();
  };

  // Calculations
  const allTasks = goal.roadmap?.phases?.flatMap((p: any) => p.tasks) || [];
  const completedTasks = allTasks.filter((t: any) => t.completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const totalMinutesStudied = goal.progressHistory?.reduce((sum: number, h: any) => sum + h.minutes, 0) || 0;
  const latestRec = goal.roadmap?.aiRecommendations?.[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/70 backdrop-blur-sm p-0 md:p-4">
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl h-full md:h-[95vh] bg-gray-950 border-l border-white/10 md:rounded-[3rem] overflow-y-auto flex flex-col no-scrollbar shadow-2xl"
      >
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/40 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                {goal.technology}
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                  {goal.status}
                </span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">
                Syllabus progress: {progressPercent}% complete ({completedTasks}/{allTasks.length} tasks)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full hover:bg-red-500/10 text-red-500/50 hover:text-red-500" 
              onClick={() => { if(confirm('Are you sure you want to delete this custom roadmap?')) deleteMutation.mutate(); }}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/5" onClick={onClose}>
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
          {/* Progress Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Level Progress', value: `${progressPercent}%`, desc: `${completedTasks}/${allTasks.length} Completed`, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Time Invested', value: totalMinutesStudied >= 60 ? `${Math.floor(totalMinutesStudied/60)}h ${totalMinutesStudied%60}m` : `${totalMinutesStudied}m`, desc: 'Logged on Roadmap', icon: Clock, color: 'text-blue-400' },
              { label: 'XP Points Earned', value: `${goal.xpEarned} XP`, desc: 'Calculated dynamically', icon: Award, color: 'text-yellow-400' },
              { label: 'Target Track', value: goal.targetLevel, desc: `Started at ${goal.currentLevel}`, icon: Sparkles, color: 'text-purple-400' },
            ].map((card) => (
              <Card key={card.label} className="bg-white/[0.01] border-white/5 p-5 rounded-2xl hover:bg-white/[0.02] transition-all">
                <div className="flex justify-between items-start">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
                  <card.icon className={cn('w-4 h-4', card.color)} />
                </div>
                <p className="text-2xl font-black text-white mt-2 tracking-tight">{card.value}</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 tracking-wider">{card.desc}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Interactive Roadmap Syllabus */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-400" /> Syllabus Curriculums
              </h3>

              <div className="space-y-4">
                {goal.roadmap?.phases?.map((phase: any) => {
                  const isExpanded = expandedPhaseId === phase.id;
                  const phaseCompletedTasks = phase.tasks.filter((t: any) => t.completed).length;
                  const phasePercent = phase.tasks.length > 0 ? Math.round((phaseCompletedTasks / phase.tasks.length) * 100) : 0;

                  return (
                    <div 
                      key={phase.id} 
                      className={cn(
                        "border rounded-[2rem] overflow-hidden transition-all duration-300",
                        isExpanded ? "border-emerald-500/20 bg-emerald-950/[0.03]" : "border-white/5 bg-white/[0.01]"
                      )}
                    >
                      <button
                        onClick={() => setExpandedPhaseId(isExpanded ? '' : phase.id)}
                        className="w-full p-6 text-left flex justify-between items-center hover:bg-white/[0.01]"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="font-black text-white text-md flex items-center gap-2">
                            {phase.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-700 shrink-0" />}
                            {phase.title}
                          </h4>
                          <p className="text-xs text-gray-500 max-w-md line-clamp-1">{phase.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{phasePercent}% Complete</span>
                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-0.5 tracking-wider">{phaseCompletedTasks}/{phase.tasks.length} Tasks</p>
                          </div>
                          <ChevronRight className={cn("w-5 h-5 text-gray-500 transition-transform", isExpanded && "rotate-90")} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-white/5 overflow-hidden">
                            <div className="p-6 space-y-3.5 bg-black/20">
                              {phase.tasks.map((task: any) => (
                                <div 
                                  key={task.id} 
                                  className={cn(
                                    "flex items-start gap-4 p-4 rounded-2xl transition-all border",
                                    task.completed ? "bg-emerald-950/10 border-emerald-950 text-gray-400" : "bg-white/[0.01] border-white/5 hover:border-white/10"
                                  )}
                                >
                                  <button
                                    onClick={() => handleToggleTask(task.id, task.completed)}
                                    disabled={isToggling}
                                    className="mt-0.5 text-gray-600 hover:text-emerald-400 transition-colors shrink-0"
                                  >
                                    {task.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-700 hover:border-emerald-500" />
                                    )}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={cn("font-bold text-sm", task.completed ? "line-through text-gray-600" : "text-white")}>{task.title}</span>
                                      {task.isProject && (
                                        <span className="text-[8px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">
                                          Capstone Project
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-normal">{task.description}</p>
                                    
                                    {task.resource && !task.resource.includes('Google') && (
                                      <a 
                                        href={task.resource} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-1 mt-2.5 text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest group"
                                      >
                                        Resource Link <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: AI Assistant & Actions */}
            <div className="space-y-6">
              {/* AI learning Assistant Recommendations */}
              <Card className="bg-emerald-500/[0.02] border-emerald-500/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute right-6 top-6 animate-pulse">
                  <Sparkles className="w-5 h-5 text-emerald-400/60" />
                </div>
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg font-black text-white flex items-center gap-2">
                    AI learning Coach
                  </CardTitle>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80">Adaptive Recommendations</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {latestRec ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">Current Objective</span>
                        <h5 className="font-bold text-white text-sm mt-1">{latestRec.topic}</h5>
                        <p className="text-xs text-gray-500 mt-1">{latestRec.reason}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block ml-1">Practice Exercise</span>
                        <p className="text-xs text-gray-400 bg-black/40 p-4 rounded-xl border border-white/5 leading-normal">{latestRec.exercise}</p>
                      </div>

                      {latestRec.projectIdea && (
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block ml-1">Practice Project</span>
                          <p className="text-xs text-yellow-400/80 bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 leading-normal font-medium italic">"{latestRec.projectIdea}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] pt-2 text-gray-500 uppercase tracking-widest font-black border-t border-white/5">
                        <span>Pace Detected: {latestRec.detectedPace}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-600 font-bold uppercase tracking-widest">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                      Initializing assistant...
                    </div>
                  )}

                  <Button
                    onClick={handleAdaptRoadmap}
                    disabled={isAdapting}
                    className="w-full h-11 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 font-black text-xs transition-all uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
                  >
                    {isAdapting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <Sparkles className="w-4 h-4" /> Recalculate Adaptations
                      </>
                    )}
                  </Button>
                  <p className="text-[8px] text-gray-600 font-bold text-center uppercase tracking-wider">
                    Analyzing study velocities and adapting curriculum
                  </p>
                </CardContent>
              </Card>

              {/* Log Study Minutes */}
              <Card className="bg-white/[0.01] border-white/5 rounded-[2.5rem] p-6 space-y-4">
                <h4 className="font-black text-white text-md flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Log Study Session
                </h4>

                <form onSubmit={handleLogStudy} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Study Duration (Minutes)</label>
                    <Input
                      type="number"
                      value={studyMinutes}
                      onChange={(e) => setStudyMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                      className="h-10 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Internal notes / concepts learned</label>
                    <Textarea
                      placeholder="e.g. Mastered nested maps, completed task #3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[70px] bg-white/5 border-white/10 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLogging}
                    className="w-full h-11 bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 hover:border-emerald-500/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    {isLogging ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log study minutes'}
                  </Button>
                </form>
              </Card>

              {/* Study history logs */}
              <Card className="bg-white/[0.01] border-white/5 rounded-[2.5rem] p-6 space-y-4">
                <h4 className="font-black text-white text-md flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Goal Study History
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                  {goal.progressHistory?.length === 0 ? (
                    <p className="text-[10px] text-gray-600 font-bold uppercase text-center py-6 tracking-widest">No logs recorded yet</p>
                  ) : (
                    goal.progressHistory?.map((h: any) => (
                      <div key={h.id} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-white">{h.minutes}m Studied</span>
                          <span className="text-gray-500">{new Date(h.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {h.notes && <p className="text-[10px] text-gray-500 mt-1 italic line-clamp-1">"{h.notes}"</p>}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CodingPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [modalSession, setModalSession] = useState<any>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGithubConnect, setShowGithubConnect] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  // Queries
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

  const { data: githubProfile, isLoading: isLoadingGithub } = useQuery({
    queryKey: ['github-profile'],
    queryFn: () => CodingService.getGithubProfile().then(res => res.data.data),
  });

  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['coding-goals'],
    queryFn: () => CodingService.getGoals().then(res => res.data.data),
  });

  // Mutations
  const syncGithubMutation = useMutation({
    mutationFn: () => CodingService.syncGithub(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['github-profile'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      toast.success(res.data.data.message || 'GitHub Synced Successfully!');
      setIsSyncingGithub(false);
    },
    onError: () => {
      toast.error('Sync failed. Please check token/connection.');
      setIsSyncingGithub(false);
    }
  });

  const disconnectGithubMutation = useMutation({
    mutationFn: () => CodingService.disconnectGithub(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-profile'] });
      queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
      toast.success('GitHub account disconnected');
    }
  });

  const handleSyncGithub = () => {
    setIsSyncingGithub(true);
    syncGithubMutation.mutate();
  };

  const handleDisconnectGithub = () => {
    if (confirm('Are you sure you want to disconnect your GitHub profile?')) {
      disconnectGithubMutation.mutate();
    }
  };

  // Skill progression XP Calculations (e.g. 1000 XP per Level)
  const currentXP = stats?.totalMinutes ? stats.totalMinutes : 0;
  const currentLevelVal = Math.max(1, Math.floor(currentXP / 1000) + 1);
  const nextLvlXpNeeded = currentLevelVal * 1000;
  const prevLvlXp = (currentLevelVal - 1) * 1000;
  const progressPercent = Math.min(100, Math.round(((currentXP - prevLvlXp) / 1000) * 100));

  // Tech stack distribution calculations
  const langMap: Record<string, number> = {};
  sessions.forEach((s: any) => {
    if (s.language) langMap[s.language] = (langMap[s.language] || 0) + s.durationMinutes;
  });
  const totalMinutes = Object.values(langMap).reduce((a, b) => a + b, 0);
  const topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 lg:pb-12 px-4 md:px-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 pt-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 rotate-3">
            <Terminal className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t('coding.title')}</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-500/80 font-black uppercase tracking-[0.2em] text-[9px]">{t('profile.progression')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{sessions.length} {t('coding.total_sessions')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowGoalModal(true)}
            className="h-14 px-8 rounded-full border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-black text-sm shadow-xl transition-all group flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" /> 
            {t('coding.new_goal')}
          </Button>

          <Button
            onClick={() => {
              setModalSession(null);
              setShowSessionModal(true);
            }}
            className="h-14 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-sm shadow-2xl shadow-emerald-500/20 group transition-all"
          >
            <Plus className="w-5 h-5 mr-1.5 group-hover:rotate-90 transition-transform duration-300" /> 
            {t('coding.log_session')}
          </Button>
        </div>
      </header>

      {/* Grid: Main stats and level progress systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Progression widget */}
        <Card className="bg-white/[0.01] border-white/5 md:col-span-2 rounded-[2.5rem] overflow-hidden p-6 md:p-8 space-y-6 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{t('profile.progression')}</span>
              <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                {t('coding.level_label')} {currentLevelVal}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4" />
              {currentLevelVal >= 10 ? t('profile.rank_architect') : currentLevelVal >= 5 ? t('profile.rank_staff') : currentLevelVal >= 3 ? t('profile.rank_builder') : t('profile.rank_beginner')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-500">{currentXP} {t('common.xp')}</span>
              <span className="text-emerald-400">{nextLvlXpNeeded - currentXP} {t('profile.to_next_level')}</span>
            </div>
            <div className="h-3.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                style={{ width: `${progressPercent}%` }} 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-center">
            <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{t('coding.total_minutes')}</span>
              <p className="text-xl font-black text-white mt-1">{stats?.totalMinutes || 0}m</p>
            </div>
            <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{t('coding.current_streak')}</span>
              <p className="text-xl font-black text-orange-400 mt-1 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" /> {stats?.currentStreak || 0} {t('common.days')}
              </p>
            </div>
            <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{t('profile.longest_streak')}</span>
              <p className="text-xl font-black text-yellow-400 mt-1 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" /> {stats?.longestStreak || 0} {t('common.days')}
              </p>
            </div>
          </div>
        </Card>

        {/* GitHub Account Linking card */}
        <Card className="bg-white/[0.01] border-white/5 rounded-[2.5rem] overflow-hidden p-6 backdrop-blur-md flex flex-col justify-between">
          {isLoadingGithub ? (
            <div className="h-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : githubProfile?.linked ? (
            <div className="space-y-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img 
                      src={githubProfile.account.avatarUrl || 'https://github.com/identicons/octocat.png'} 
                      alt={githubProfile.account.username} 
                      className="w-12 h-12 rounded-2xl border border-white/10"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-white text-md truncate">@{githubProfile.account.username}</h4>
                      <a 
                        href={githubProfile.account.profileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 mt-0.5 hover:text-emerald-300"
                      >
                        GitHub Profile <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleSyncGithub} 
                      disabled={isSyncingGithub} 
                      title="Sync Commits"
                      className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      <RefreshCw className={cn("w-4 h-4", isSyncingGithub && "animate-spin")} />
                    </button>
                    <button 
                      onClick={handleDisconnectGithub} 
                      title="Disconnect"
                      className="h-8 w-8 rounded-full hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 text-center bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block">Repos</span>
                    <span className="font-bold text-white text-sm">{githubProfile.account.publicRepos}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block">Followers</span>
                    <span className="font-bold text-white text-sm">{githubProfile.account.followers}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block">Following</span>
                    <span className="font-bold text-white text-sm">{githubProfile.account.following}</span>
                  </div>
                </div>
              </div>

              {/* Mini Repo items */}
              {githubProfile.repos?.length > 0 && (
                <div className="space-y-2 mt-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block ml-1">Recent Repositories</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {githubProfile.repos.slice(0, 4).map((repo: any) => (
                      <a 
                        key={repo.name} 
                        href={repo.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-black/20 hover:bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/20 text-left block min-w-0 transition-all"
                      >
                        <h5 className="font-bold text-white text-xs truncate">{repo.name}</h5>
                        <div className="flex justify-between items-center mt-1 text-[8px] font-bold text-gray-500">
                          <span>{repo.language}</span>
                          <span className="flex items-center gap-0.5 text-yellow-500">★ {repo.stars}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 h-full flex flex-col justify-center items-center space-y-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500">
                <Github className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-white text-lg">{t('coding.no_sessions')}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider max-w-[200px] mx-auto leading-normal">
                  {t('coding.no_sessions_desc')}
                </p>
              </div>
              <Button 
                onClick={() => setShowGithubConnect(true)}
                className="w-full h-11 bg-white/5 hover:bg-emerald-500 border border-white/10 hover:border-emerald-500/20 hover:text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                {t('coding.connect_github')}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Section: Custom AI roadmap Goals */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-white tracking-tighter px-2 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-emerald-400" /> {t('coding.new_goal')}
        </h2>

        {isLoadingGoals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-44 bg-white/5 animate-pulse rounded-[2.5rem]" />
            <div className="h-44 bg-white/5 animate-pulse rounded-[2.5rem]" />
          </div>
        ) : goals.length === 0 ? (
          <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem] space-y-4">
            <Layers className="w-12 h-12 text-gray-800 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-500">{t('coding.no_goals')}</h3>
              <p className="text-xs text-gray-600 max-w-[300px] mx-auto leading-normal font-bold uppercase tracking-wider">
                {t('coding.no_goals_desc')}
              </p>
            </div>
            <Button onClick={() => setShowGoalModal(true)} variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-6">
              {t('coding.new_goal')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal: any) => {
              const allTasks = goal.roadmap?.phases?.flatMap((p: any) => p.tasks) || [];
              const completedTasks = allTasks.filter((t: any) => t.completed).length;
              const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
              const latestRec = goal.roadmap?.aiRecommendations?.[0];

              return (
                <motion.div key={goal.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-white/[0.01] border-white/5 hover:bg-white/[0.02] rounded-[2.5rem] p-6 hover:border-emerald-500/20 transition-all cursor-pointer group" onClick={() => setSelectedGoal(goal)}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:rotate-6 transition-transform">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            {goal.technology}
                            <span className="text-[8px] font-black uppercase tracking-wider bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                              {goal.difficulty}
                            </span>
                          </h4>
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">{goal.category} • Started {goal.currentLevel}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="space-y-2 mt-5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-gray-500">{progressPercent}% Syllabus Completed</span>
                        <span className="text-emerald-400">{completedTasks}/{allTasks.length} Tasks</span>
                      </div>
                      <Progress value={progressPercent} className="h-2 bg-white/5 [&>div]:bg-emerald-500 rounded-full" />
                    </div>

                    {latestRec && (
                      <div className="mt-5 p-3 rounded-2xl bg-black/40 border border-white/5 flex gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Next Recommended Topic</span>
                          <p className="text-xs font-bold text-white truncate mt-0.5">{latestRec.topic}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: heatmaps contribution graph */}
      <Card className="bg-white/[0.01] border-white/5 rounded-[3rem] overflow-hidden p-6 md:p-8 backdrop-blur-md">
        <div className="flex justify-between items-center flex-wrap gap-4 pb-4">
          <div>
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <Github className="w-6 h-6 text-emerald-400" /> Commits & Activity matrix
            </CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
              Synchronized technical heatmap mapping developer progress
            </p>
          </div>
          {githubProfile?.linked && (
            <Button 
              onClick={handleSyncGithub} 
              disabled={isSyncingGithub} 
              className="h-10 px-4 rounded-xl border border-white/10 hover:border-emerald-500/20 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncingGithub && "animate-spin")} />
              Sync Heatmap
            </Button>
          )}
        </div>

        <CardContent className="p-0 pt-4">
          {isLoadingContributions ? (
            <div className="h-36 bg-white/5 animate-pulse rounded-[2rem]" />
          ) : (
            <ContributionGraph contributions={contributions} />
          )}
        </CardContent>
      </Card>

      {/* Section: session history log */}
      <div className="space-y-6">
         <h2 className="text-3xl font-black text-white tracking-tighter px-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-500 animate-pulse" /> Sprint Logs
         </h2>
         {isLoadingSessions ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="h-28 bg-white/5 animate-pulse rounded-3xl" />
             <div className="h-28 bg-white/5 animate-pulse rounded-3xl" />
           </div>
         ) : sessions.length === 0 ? (
           <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
              <Layers className="w-12 h-12 text-gray-800 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-500">Zero Technical Records</h3>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-0.5">Start logging study minutes or sprints to record milestones</p>
              <Button onClick={() => { setModalSession(null); setShowSessionModal(true); }} variant="outline" className="mt-4 border-white/10 hover:bg-white/5 rounded-full px-6">
                 Log First Sprint
              </Button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session: any) => (
                <motion.div key={session.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10 rounded-3xl p-6 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-md font-black text-white truncate max-w-[200px] md:max-w-xs">{session.title}</h4>
                          <span className={cn(
                            "text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0",
                            session.difficulty === 'Expert' ? "bg-red-500/10 text-red-400" :
                            session.difficulty === 'Hard' ? "bg-orange-500/10 text-orange-400" :
                            session.difficulty === 'Medium' ? "bg-blue-500/10 text-blue-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          )}>
                            {session.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 mt-2 flex-wrap text-gray-500">
                           <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-[9px] font-black uppercase tracking-wider">{new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                           </div>
                           {session.projectName && (
                             <div className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 truncate max-w-[100px]">{session.projectName}</span>
                             </div>
                           )}
                           <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-[9px] font-black uppercase tracking-wider">{session.durationMinutes}m duration</span>
                           </div>
                        </div>
                        {session.notes && <p className="text-xs text-gray-600 mt-3 line-clamp-1 italic font-medium">"{session.notes}"</p>}
                      </div>
                      
                      {/* Delete sprint buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 rounded-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          onClick={async () => {
                            if (confirm('Delete this coding sprint session?')) {
                              await CodingService.deleteSession(session.id);
                              queryClient.invalidateQueries({ queryKey: ['coding-sessions'] });
                              queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
                              queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
                              queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
                              toast.success('Sprint session deleted');
                            }
                          }}
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

      {/* Modals and panels triggers */}
      <AnimatePresence>
        {showGithubConnect && <GithubConnectModal onClose={() => setShowGithubConnect(false)} />}
        {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} />}
        {selectedGoal && (
          <LearningDashboard 
            goal={goals.find((g: any) => g.id === selectedGoal.id) || selectedGoal} 
            onClose={() => setSelectedGoal(null)} 
          />
        )}
      </AnimatePresence>

      {/* Compatibility Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
            <Card className="border-emerald-500/20 bg-gray-950 rounded-[2.5rem] p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" /> Log Coding Sprint
                </h3>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setShowSessionModal(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  projectName: (form.elements.namedItem('projectName') as HTMLInputElement).value || 'General',
                  language: (form.elements.namedItem('language') as HTMLSelectElement).value,
                  durationMinutes: parseInt((form.elements.namedItem('duration') as HTMLInputElement).value) || 0,
                  difficulty: (form.elements.namedItem('difficulty') as HTMLSelectElement).value,
                  notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
                };
                
                try {
                  await CodingService.createSession(data);
                  queryClient.invalidateQueries({ queryKey: ['coding-sessions'] });
                  queryClient.invalidateQueries({ queryKey: ['coding-stats'] });
                  queryClient.invalidateQueries({ queryKey: ['coding-contributions'] });
                  queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
                  toast.success('Sprint session logged successfully!');
                  setShowSessionModal(false);
                } catch {
                  toast.error('Failed to log sprint');
                }
              }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500">Session Title</label>
                  <Input name="title" placeholder="e.g. Mastered nested structures" className="h-10 bg-white/5 rounded-xl text-xs text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500">Project Name</label>
                    <Input name="projectName" placeholder="e.g. core-engine" className="h-10 bg-white/5 rounded-xl text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500">Language</label>
                    <select name="language" className="w-full h-10 bg-white/5 border border-white/10 rounded-xl text-xs text-white px-2">
                      {PRELOADED_TECHS.map(t => <option key={t.name} value={t.name} className="bg-gray-900">{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500">Duration (Minutes)</label>
                    <Input name="duration" type="number" defaultValue="60" className="h-10 bg-white/5 rounded-xl text-xs text-white text-center font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500">Difficulty</label>
                    <select name="difficulty" defaultValue="Medium" className="w-full h-10 bg-white/5 border border-white/10 rounded-xl text-xs text-white px-2">
                      <option value="Easy" className="bg-gray-900">Easy</option>
                      <option value="Medium" className="bg-gray-900">Medium</option>
                      <option value="Hard" className="bg-gray-900">Hard</option>
                      <option value="Expert" className="bg-gray-900">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500">Internal Notes</label>
                  <Textarea name="notes" placeholder="Abstract blocks, benchmarks, notes..." className="min-h-[60px] bg-white/5 rounded-xl text-xs text-white resize-none" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowSessionModal(false)} className="h-10 text-xs">Cancel</Button>
                  <Button type="submit" className="h-10 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl px-6">Log Sprint</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
