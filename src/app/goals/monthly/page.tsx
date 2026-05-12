'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, TrendingUp, CheckCircle2, 
  Circle, ChevronLeft, ChevronRight, Target,
  Flag, Clock, ListTodo, AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function MonthlyGoalsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthKey = format(currentDate, 'yyyy-MM');
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', 'monthly', monthKey],
    queryFn: () => GoalService.getMonthly(monthKey).then(res => res.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => GoalService.updateMonthly(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals', 'monthly'] }),
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Calendar className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Monthly Goals</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="text-blue-500/80 font-bold uppercase tracking-widest text-[10px]">Medium-Term Planning</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-sm font-medium">{format(currentDate, 'MMMM yyyy')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="px-4 text-sm font-bold text-white min-w-[120px] text-center">
            {format(currentDate, 'MMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">
                {goals.length > 0 ? Math.round((goals.filter((g:any)=>g.completed).length / goals.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monthly Progress</p>
            <Progress value={goals.length > 0 ? (goals.filter((g:any)=>g.completed).length / goals.length) * 100 : 0} className="h-1.5 mt-3 bg-white/5" />
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {goals.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-10 text-blue-400" />
              <p className="text-gray-500 font-bold">No goals set for this month</p>
              <p className="text-xs text-gray-600 mt-1">Start planning your {format(currentDate, 'MMMM')} objectives</p>
              <div className="mt-6">
                <AddMonthlyGoalButton monthKey={monthKey} />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {goals.map((goal: any) => (
                  <MonthlyGoalCard key={goal.id} goal={goal} />
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <AddMonthlyGoalButton monthKey={monthKey} />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MonthlyGoalCard({ goal }: { goal: any }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => GoalService.updateMonthly(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals', 'monthly'] }),
  });

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className={cn(
        "group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-[2rem] overflow-hidden",
        goal.completed && "border-green-500/20 bg-green-500/5"
      )}>
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <button 
              onClick={() => updateMutation.mutate({ id: goal.id, data: { completed: !goal.completed } })}
              className={cn(
                "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                goal.completed ? "bg-green-500 border-green-500" : "border-white/10 group-hover:border-blue-500/50"
              )}
            >
              {goal.completed && <CheckCircle2 className="w-4 h-4 text-black font-black" />}
            </button>
            <div className="flex-1">
              <h3 className={cn("text-lg font-bold text-white leading-tight", goal.completed && "line-through opacity-50")}>
                {goal.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1.5">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-1.5 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddMonthlyGoalButton({ monthKey }: { monthKey: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => GoalService.createMonthly(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'monthly'] });
      setIsOpen(false);
    }
  });

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-14 px-8 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-5 h-5 mr-2" /> Add Monthly Goal
      </Button>
    );
  }

  return (
    <Card className="border-blue-500/30 bg-blue-500/5 rounded-3xl w-full max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
          createMutation.mutate({ title, description, monthKey });
        }} className="space-y-4">
          <input 
            name="title" autoFocus placeholder="Goal Title"
            className="w-full bg-transparent border-none text-xl font-bold text-white placeholder:text-white/20 focus:ring-0"
          />
          <textarea 
            name="description" placeholder="Description & details..."
            className="w-full bg-transparent border-none text-sm text-gray-400 placeholder:text-white/10 focus:ring-0 resize-none h-20"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl px-6">
              Create Goal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
