'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Plus,
  CheckCircle2, Circle, XCircle, ArrowRight,
  TrendingUp, Clock, AlertCircle, CalendarRange, Target, Flame
} from 'lucide-react';

import { useDailyGoals, useCreateDailyGoal, useUpdateDailyGoal } from '@/lib/hooks';
import { GoalService, DashboardService } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast, isFuture, startOfDay } from 'date-fns';
import { DailyGoalCard } from '@/components/goals/DailyGoalCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';

export default function ToDoPage() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    GoalService.failStale().catch(console.error);
  }, []);

  const monthKey = format(currentDate, 'yyyy-MM');
  const { data: goals = [], isLoading } = useDailyGoals({ monthKey });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => DashboardService.getSummary().then(res => res.data.data.summary),
  });

  // Generate days for the current month
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group goals by dateKey for the calendar view
  const goalsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    goals.forEach((g: any) => {
      if (!map[g.dateKey]) map[g.dateKey] = [];
      map[g.dateKey].push(g);
    });
    return map;
  }, [goals]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleCurrentMonth = () => setCurrentDate(new Date());

  const activeDateGoals = selectedDateKey ? goalsByDate[selectedDateKey] || [] : [];
  const activeDate = selectedDateKey ? new Date(selectedDateKey) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8">
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/5">
            <Target className="w-7 h-7 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t('todoList.title')}</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="text-primary-500/80 font-bold uppercase tracking-widest text-[10px]">{t('todoList.subtitle')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-sm font-medium">{format(currentDate, 'MMMM yyyy')}</span>
            </p>
          </div>
        </div>


        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl hover:bg-white/10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleCurrentMonth}
            className="px-4 h-10 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/10"
          >
            {t('todoList.today')}
          </Button>
          <div className="h-6 w-px bg-white/10 mx-1" />

          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all",
            (summary?.todo?.streak || 0) > 0
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/5"
              : "bg-white/5 border-white/5 text-gray-600"
          )}>
            <Flame className={cn("w-4 h-4", (summary?.todo?.streak || 0) > 0 && "fill-orange-400/20")} />
            <span className="text-xs font-black uppercase tracking-widest">
              {summaryLoading ? '...' : `${summary?.todo?.streak || 0} ${t('todoList.day_streak')}`}
            </span>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl hover:bg-white/10">
            <ChevronRight className="w-5 h-5" />
          </Button>

        </div>
      </header>

      {/* Monthly Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
        <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('todoList.monthly_completion')}</p>
              <p className="text-xl font-black text-white">
                {goals.length > 0 ? Math.round((goals.filter((g:any) => g.completed).length / goals.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('todoList.total_goals')}</p>
              <p className="text-xl font-black text-white">{goals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('todoList.pending')}</p>
              <p className="text-xl font-black text-white">{goals.filter((g:any) => !g.completed && !g.failed).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {[t('todoList.sun'), t('todoList.mon'), t('todoList.tue'), t('todoList.wed'), t('todoList.thu'), t('todoList.fri'), t('todoList.sat')].map(d => (
              <div key={d} className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                {d}
              </div>
            ))}
            
            {/* Pad the start of the month */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square opacity-0" />
            ))}

            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayGoals = goalsByDate[dateKey] || [];
              const isSelected = selectedDateKey === dateKey;
              const isTodayDate = isToday(day);
              const isPastDate = isPast(day) && !isTodayDate;
              const isFutureDate = isFuture(day);

              const completedCount = dayGoals.filter(g => g.completed).length;
              const totalCount = dayGoals.length;
              const rate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <motion.button
                  key={dateKey}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={cn(
                    'aspect-square relative rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center transition-all group overflow-hidden',
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10' 
                      : isTodayDate
                        ? 'bg-white/5 border-amber-500/30 ring-1 ring-amber-500/10'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                  )}
                >
                  <span className={cn(
                    'text-sm md:text-lg font-black transition-colors z-10',
                    isSelected ? 'text-amber-400' : isTodayDate ? 'text-amber-200' : 'text-gray-400 group-hover:text-white'
                  )}>
                    {format(day, 'd')}
                  </span>

                  {/* Tiny progress bar at bottom of cell */}
                  {totalCount > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/5 rounded-full overflow-hidden z-10">
                      <div 
                        className={cn('h-full rounded-full transition-all duration-500', rate === 100 ? 'bg-green-500' : 'bg-amber-500')}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  )}

                  {/* Status Indicator */}
                  {totalCount > 0 && rate === 100 && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-500/50" />
                    </div>
                  )}
                  
                  {isPastDate && totalCount > 0 && rate < 100 && (
                    <div className="absolute top-2 right-2">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500/50" />
                    </div>
                  )}

                  {/* Decoration for Today */}
                  {isTodayDate && !isSelected && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="w-full lg:w-[400px] shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDateKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {selectedDateKey ? (
                <>
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {isToday(new Date(selectedDateKey)) ? t('todoList.todays_goals') : format(new Date(selectedDateKey), 'EEEE, MMM do')}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                        {activeDateGoals.length} {activeDateGoals.length === 1 ? t('todoList.goal') : t('todoList.goals')} {t('todoList.scheduled')}
                      </p>
                    </div>
                    {isFuture(new Date(selectedDateKey)) && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {t('todoList.upcoming')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {activeDateGoals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-medium">{t('todoList.no_goals')}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{t('todoList.ready_to_plan')}</p>
                      </div>
                    ) : (
                      activeDateGoals.map(goal => (
                        <DailyGoalCard key={goal.id} goal={goal} />
                      ))
                    )}

                    <AddGoalShortcut dateKey={selectedDateKey} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                  <CalendarRange className="w-12 h-12 mb-4 opacity-10" />
                  <p className="font-medium">{t('todoList.select_date')}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AddGoalShortcut({ dateKey }: { dateKey: string }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [priority, setPriority] = useState('MEDIUM');
  const [time, setTime] = useState('30');
  const createMutation = useCreateDailyGoal();

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="w-full h-14 rounded-2xl border border-dashed border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400 group transition-all"
      >
        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        {t('todoList.add_goal')}
      </Button>
    );
  }


  return (
    <Card className="border-amber-500/20 bg-amber-500/5 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/5">
      <CardContent className="p-5">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          if (!title) return;
          await createMutation.mutateAsync({
            dateKey,
            title,
            priority,
            timeEstimateMinutes: parseInt(time) || 30,
          });
          setIsOpen(false);
        }} className="space-y-5">
          <input
            name="title"
            autoFocus
            placeholder={t('todoList.whats_goal')}
            className="w-full bg-transparent border-none text-white placeholder:text-gray-600 focus:ring-0 font-bold text-lg outline-none"
          />

          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('todoList.priority')}</span>
              <div className="grid grid-cols-4 gap-2">
                {[{val: 'LOW', label: t('todoList.low')}, {val: 'MEDIUM', label: t('todoList.medium')}, {val: 'HIGH', label: t('todoList.high')}, {val: 'CRITICAL', label: t('todoList.critical')}].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPriority(p.val)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black transition-all border",
                      priority === p.val
                        ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20"
                        : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">{t('todoList.est_time')}</span>
              </div>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent border-none text-white font-black text-sm focus:ring-0 w-16 text-right ml-auto outline-none"
              />
              <span className="text-[11px] font-bold text-gray-600 uppercase">{t('todoList.minutes')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsOpen(false)} className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider">{t('todoList.cancel')}</Button>
            <Button size="sm" type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl h-10 px-6 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20">
              {t('todoList.save_goal')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

