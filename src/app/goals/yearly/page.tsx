'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarRange, Plus, TrendingUp, CheckCircle2, 
  ChevronLeft, ChevronRight, Target, Star,
  Award, BarChart3, Briefcase, Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function YearlyGoalsPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const yearKey = currentYear.toString();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', 'yearly', yearKey],
    queryFn: () => GoalService.getYearly(yearKey).then(res => res.data.data),
  });

  const handlePrevYear = () => setCurrentYear(y => y - 1);
  const handleNextYear = () => setCurrentYear(y => y + 1);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 lg:pb-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-xl shadow-purple-500/5">
            <CalendarRange className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Yearly Goals</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="text-purple-500/80 font-bold uppercase tracking-widest text-[10px]">Strategic Planning</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-lg font-bold text-white">{yearKey}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <Button variant="ghost" size="icon" onClick={handlePrevYear} className="h-12 w-12 rounded-xl">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="px-6 text-lg font-black text-white">
            {yearKey}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextYear} className="h-12 w-12 rounded-xl">
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Yearly Progress Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/10 rounded-[2.5rem]">
            <CardContent className="p-8">
              <Award className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-2xl font-black text-white">
                {goals.length > 0 ? goals.filter((g:any)=>g.completed).length : 0} Achievements
              </h3>
              <p className="text-sm text-gray-500 font-medium">Completed strategic objectives in {yearKey}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex justify-between items-end mb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <span className="text-4xl font-black text-white">
                  {goals.length > 0 ? Math.round((goals.filter((g:any)=>g.completed).length / goals.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Overall Strategic Completion</p>
              <Progress value={goals.length > 0 ? (goals.filter((g:any)=>g.completed).length / goals.length) * 100 : 0} className="h-2 bg-white/5" />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col gap-4">
          <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] flex-1">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <Zap className="w-10 h-10 text-amber-400 mb-4 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current Focus</p>
              <p className="text-lg font-black text-white">Year of Growth</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strategic Goals List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-white">Major Objectives</h2>
          <AddYearlyGoalButton yearKey={yearKey} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {goals.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <CalendarRange className="w-16 h-16 mx-auto mb-4 opacity-5 text-purple-400" />
              <p className="text-gray-500 font-black text-xl">The year is wide open.</p>
              <p className="text-sm text-gray-600 mt-2">What is your primary mission for {yearKey}?</p>
            </div>
          ) : (
            goals.map((goal: any) => (
              <YearlyGoalCard key={goal.id} goal={goal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function YearlyGoalCard({ goal }: { goal: any }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => GoalService.updateYearly(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals', 'yearly'] }),
  });

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn(
        "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all rounded-[2.5rem] overflow-hidden",
        goal.completed && "border-purple-500/20 bg-purple-500/5"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <button 
              onClick={() => updateMutation.mutate({ id: goal.id, data: { completed: !goal.completed } })}
              className={cn(
                "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0",
                goal.completed ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/30" : "border-white/10 hover:border-purple-500/50"
              )}
            >
              {goal.completed && <CheckCircle2 className="w-6 h-6 text-black font-black" />}
            </button>

            <div className="flex-1">
              <h3 className={cn("text-2xl font-black text-white tracking-tight", goal.completed && "line-through opacity-40")}>
                {goal.title}
              </h3>
              <p className="text-gray-500 mt-1 font-medium">{goal.description || 'Define your strategy...'}</p>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                <span>Annual Completion</span>
                <span className="text-white">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2 bg-white/5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddYearlyGoalButton({ yearKey }: { yearKey: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => GoalService.createYearly(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'yearly'] });
      setIsOpen(false);
    }
  });

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold"
      >
        <Plus className="w-5 h-5 mr-2" /> New Strategic Goal
      </Button>
    );
  }

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <CardContent className="bg-gray-900 border border-purple-500/30 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl">
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
          createMutation.mutate({ title, description, yearKey });
        }} className="space-y-6">
          <div className="text-center space-y-2">
            <CalendarRange className="w-12 h-12 text-purple-400 mx-auto" />
            <h2 className="text-3xl font-black text-white tracking-tighter">Strategic Objective {yearKey}</h2>
          </div>
          <input 
            name="title" autoFocus placeholder="What is the mission?"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <textarea 
            name="description" placeholder="Strategic details, metrics, and success criteria..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-400 placeholder:text-gray-700 focus:ring-2 focus:ring-purple-500 transition-all h-32 resize-none"
          />
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl font-bold h-12 px-8">Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-purple-500/20">
              Set Objective
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
