'use client';

import { useStore, computeCodingStreak, todayKey, thisMonthKey, thisYearKey } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { motion } from 'framer-motion';
import {
  Target, Flame, TrendingUp, CheckCircle, XCircle,
  Zap, BarChart3, Calendar, Infinity, Code, Award,
  Sun, CalendarDays, CalendarRange
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MotivationalWidget } from '@/components/dashboard/MotivationalWidget';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function DashboardPage() {
  const {
    dailyGoals, monthlyGoals, yearlyGoals, lifetimeGoals,
    codingActivities,
  } = useStore();

  // ── Real computed stats ────────────────────────────────────────────────────
  const today = todayKey();
  const todayGoals = dailyGoals.filter((g) => g.dateKey === today);
  const todayDone = todayGoals.filter((g) => g.completed).length;
  const todayTotal = todayGoals.length;
  const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const allDailyDone = dailyGoals.filter((g) => g.completed).length;
  const allDailyFailed = dailyGoals.filter((g) => g.failed).length;
  const allDailyTotal = dailyGoals.length;
  const overallDailyRate = allDailyTotal > 0 ? Math.round((allDailyDone / allDailyTotal) * 100) : 0;

  const thisMonth = thisMonthKey();
  const monthGoals = monthlyGoals.filter((g) => g.monthKey === thisMonth);
  const monthDone = monthGoals.filter((g) => g.completed).length;
  const monthTotal = monthGoals.length;
  const monthRate = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;

  const thisYear = thisYearKey();
  const yearGoals = yearlyGoals.filter((g) => g.yearKey === thisYear);
  const yearDone = yearGoals.filter((g) => g.completed).length;
  const yearTotal = yearGoals.length;
  const yearRate = yearTotal > 0 ? Math.round((yearDone / yearTotal) * 100) : 0;

  const lifetimeDone = lifetimeGoals.filter((g) => g.completed).length;
  const lifetimeAvgProgress = lifetimeGoals.length > 0
    ? Math.round(lifetimeGoals.reduce((a, g) => a + g.progress, 0) / lifetimeGoals.length)
    : 0;

  const { current: codingStreak, longest: longestCodingStreak } = computeCodingStreak(codingActivities);
  const todayCodingMinutes = codingActivities.filter((a) => a.dateKey === today).reduce((a, c) => a + c.minutesSpent, 0);

  // Consistency: days with at least 1 completed daily goal / total days with any daily goals
  const dayKeys = Array.from(new Set(dailyGoals.map((g) => g.dateKey)));
  const daysWithCompletion = dayKeys.filter((dk) => dailyGoals.some((g) => g.dateKey === dk && g.completed)).length;
  const consistencyRate = dayKeys.length > 0 ? Math.round((daysWithCompletion / dayKeys.length) * 100) : 0;

  // Mini weekly performance (last 7 days)
  const weeklyBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayGoals = dailyGoals.filter((g) => g.dateKey === key);
    const done = dayGoals.filter((g) => g.completed).length;
    const total = dayGoals.length;
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
      hasGoals: total > 0,
    };
  });

  const totalGoalsEver = allDailyTotal + monthlyGoals.length + yearlyGoals.length + lifetimeGoals.length;
  const totalDoneEver = allDailyDone + monthlyGoals.filter((g) => g.completed).length
    + yearlyGoals.filter((g) => g.completed).length + lifetimeDone;
  const totalFailedEver = allDailyFailed + monthlyGoals.filter((g) => g.failed).length
    + yearlyGoals.filter((g) => g.failed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-10 lg:pb-0">
      {/* Header */}
      <header className="px-1 md:px-0">
        <div className="flex items-center gap-3 md:gap-4 mb-1">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold uppercase text-xs md:text-sm">
            {useAuth.getState().user?.username.substring(0, 2)}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight truncate">
            Welcome back, {useAuth.getState().user?.username}
          </h1>
        </div>
        <p className="text-gray-400 mt-1 text-[11px] md:text-sm md:pl-14">
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="sm:hidden">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {' — '}
          <span className="text-gray-300">
            {totalGoalsEver === 0
              ? 'Your journey starts now. Everything begins at zero.'
              : `${totalDoneEver} goals completed · ${totalFailedEver} failed`}
          </span>
        </p>
      </header>

      {/* Top stats grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Goals",
            value: todayTotal === 0 ? '—' : `${todayDone}/${todayTotal}`,
            sub: todayTotal > 0 ? `${todayRate}% done` : 'No goals yet',
            icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10',
            href: '/goals',
          },
          {
            label: 'Coding Streak',
            value: codingStreak === 0 ? '0 days' : `${codingStreak} days`,
            sub: longestCodingStreak > 0 ? `Best: ${longestCodingStreak} days` : 'Log sessions',
            icon: Flame, color: codingStreak > 0 ? 'text-orange-400' : 'text-gray-500', bg: 'bg-orange-500/10',
            href: '/coding',
          },
          {
            label: 'Consistency',
            value: `${consistencyRate}%`,
            sub: `${daysWithCompletion}/${dayKeys.length} active`,
            icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10',
            href: '/goals',
          },
          {
            label: 'Total Progress',
            value: totalDoneEver,
            sub: `${totalGoalsEver} goals ever`,
            icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10',
            href: '/goals',
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="show">
            <Link href={stat.href}>
              <Card className="bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all cursor-pointer group h-full">
                <CardContent className="p-4 md:p-5 flex flex-row xs:flex-col items-center xs:items-start gap-4 xs:gap-0">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center xs:mb-3 flex-shrink-0', stat.bg)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                    <p className={cn('text-xl md:text-2xl font-black mt-1 truncate', stat.color)}>{stat.value}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 truncate">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Chart */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="bg-white/5 border-white/5 h-full overflow-hidden">
            <CardHeader className="p-5 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-400" />
                Completion Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              {weeklyBars.every((b) => !b.hasGoals) ? (
                <div className="h-32 md:h-40 flex flex-col items-center justify-center text-gray-600">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs md:text-sm">Add daily goals to see trends</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 md:gap-2 h-32 md:h-40">
                  {weeklyBars.map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500">
                        {bar.hasGoals ? `${bar.rate}%` : ''}
                      </span>
                      <div className="w-full relative flex items-end bg-white/[0.02] rounded-lg" style={{ height: '100px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: bar.hasGoals ? `${Math.max(bar.rate, 4)}%` : '0px' }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className={cn(
                            'w-full rounded-t-lg transition-all',
                            bar.rate === 100 ? 'bg-green-500' :
                            bar.rate >= 50 ? 'bg-amber-500' :
                            'bg-red-500/70'
                          )}
                          style={{ position: 'absolute', bottom: 0 }}
                        />
                      </div>
                      <span className="text-[9px] md:text-[10px] text-gray-600 truncate w-full text-center">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's progress ring */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
          <Card className="bg-white/5 border-white/5 flex flex-col items-center justify-center p-6 h-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 text-center">Today's Completion</p>
            <div className="scale-75 md:scale-100 origin-center">
              <ProgressRing percent={todayRate} size={140} label="" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mt-1 md:mt-3">{todayRate}%</p>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {todayTotal === 0 ? 'No goals yet' : `${todayDone}/${todayTotal} completed`}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Goal summary by scope */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
          <Card className="bg-white/5 border-white/5">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold">Goal Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              {[
                { label: 'Daily', done: allDailyDone, failed: allDailyFailed, total: allDailyTotal, rate: overallDailyRate, color: 'bg-amber-500', icon: Sun },
                { label: 'Monthly', done: monthDone, failed: monthlyGoals.filter(g=>g.failed).length, total: monthTotal, rate: monthRate, color: 'bg-blue-500', icon: CalendarDays },
                { label: 'Yearly', done: yearDone, failed: yearlyGoals.filter(g=>g.failed).length, total: yearTotal, rate: yearRate, color: 'bg-purple-500', icon: CalendarRange },
                { label: 'Lifetime', done: lifetimeDone, failed: 0, total: lifetimeGoals.length, rate: lifetimeAvgProgress, color: 'bg-emerald-500', icon: Infinity },
              ].map(({ label, done, failed, total, rate, color, icon: Icon }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {total > 0 ? (
                        <>
                          <span className="text-green-400">{done} done</span>
                          {failed > 0 && <span className="text-red-400">{failed} failed</span>}
                          <span className="text-gray-500">{total} total</span>
                        </>
                      ) : (
                        <span className="text-gray-600">No goals</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
          <MotivationalWidget />

          {/* Coding today */}
          <Card className="bg-white/5 border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Code className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Coding Today</p>
                <p className="text-xl font-black text-white">
                  {todayCodingMinutes > 0
                    ? `${todayCodingMinutes >= 60 ? `${Math.floor(todayCodingMinutes / 60)}h ${todayCodingMinutes % 60}m` : `${todayCodingMinutes}min`}`
                    : 'No sessions yet'}
                </p>
              </div>
              <Link href="/coding">
                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                  Log →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
