'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { motion } from 'framer-motion';
import {
  Flame, TrendingUp, CheckCircle,
  Sun, CalendarDays, CalendarRange, Loader2, AlertCircle, BarChart3, Infinity, Code, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MotivationalWidget } from '@/components/dashboard/MotivationalWidget';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const { data: summaryData, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => DashboardService.getSummary().then(res => res.data.data.summary),
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => DashboardService.getStats().then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !summaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
        <h2 className="text-xl font-black text-white">{t('common.error')}</h2>
        <p className="text-gray-500 max-w-md">{t('common.error_generic')}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-white/10 hover:bg-white/5">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const { todo, goals, coding, banned, punishments, productivityScore } = summaryData;

  const totalGoalsEver = todo.total + goals.monthly.total + goals.yearly.total + goals.lifetime.total;
  const totalDoneEver = todo.completed + goals.monthly.completed + goals.yearly.completed + goals.lifetime.completed;
  const totalFailedEver = todo.failed;

  const weeklyBars = statsData || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-10 lg:pb-0">
      {/* Header */}
      <header className="px-1 md:px-0">
        <div className="flex items-center gap-3 md:gap-4 mb-1">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold uppercase text-xs md:text-sm">
            {user?.username?.substring(0, 2)}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight truncate">
            {t('auth.login.title')}, {user?.username}
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
              ? t('dashboard.start_logging')
              : `${totalDoneEver} completed · ${totalFailedEver} failed`}
          </span>
        </p>
      </header>

      {/* Top stats grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('nav.todo'),
            value: todo.today.total === 0 ? '—' : `${todo.today.completed}/${todo.today.total}`,
            sub: todo.today.total > 0 ? `${Math.round((todo.today.completed / todo.today.total) * 100)}% done` : t('dashboard.no_data'),
            icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10',
            href: '/todo',
          },
          {
            label: t('profile.coding_streak'),
            value: coding.currentStreak === 0 ? `0 ${t('common.days')}` : `${coding.currentStreak} ${t('common.days')}`,
            sub: coding.longestStreak > 0 ? `${t('profile.longest_streak')}: ${coding.longestStreak} ${t('common.days')}` : t('profile.no_progression'),
            icon: Flame, color: coding.currentStreak > 0 ? 'text-orange-400' : 'text-gray-500', bg: 'bg-orange-500/10',
            href: '/coding',
          },
          {
            label: t('profile.recovery_index'),
            value: `${productivityScore}%`,
            sub: t('profile.identity'),
            icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10',
            href: '/todo',
          },
          {
            label: t('profile.relapses'),
            value: totalDoneEver,
            sub: `${totalGoalsEver} tracked`,
            icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10',
            href: '/goals/monthly',
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
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                {t('profile.analytics')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              {weeklyBars.length === 0 || weeklyBars.every((b: any) => !b.hasGoals) ? (
                <div className="h-32 md:h-40 flex flex-col items-center justify-center text-gray-600">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs md:text-sm">{t('profile.analytics_empty')}</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 md:gap-2 h-32 md:h-40">
                  {weeklyBars.map((bar: any, i: number) => (
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 text-center">{t('dashboard.today')}</p>
            <div className="scale-75 md:scale-100 origin-center">
              <ProgressRing percent={todo.today.total > 0 ? Math.round((todo.today.completed / todo.today.total) * 100) : 0} size={140} label="" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mt-1 md:mt-3">
              {todo.today.total > 0 ? Math.round((todo.today.completed / todo.today.total) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {todo.today.total === 0 ? t('profile.no_progression') : `${todo.today.completed}/${todo.today.total} completed`}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Goal summary by scope */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
          <Card className="bg-white/5 border-white/5">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold">{t('profile.tab_analytics')}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              {[
                { label: t('nav.todo'), done: todo.completed, total: todo.total, rate: todo.total > 0 ? Math.round((todo.completed/todo.total)*100) : 0, color: 'bg-amber-500', icon: Sun, href: '/todo' },
                { label: t('nav.monthly_goals'), done: goals.monthly.completed, total: goals.monthly.total, rate: goals.monthly.progress, color: 'bg-blue-500', icon: CalendarDays, href: '/goals/monthly' },
                { label: t('nav.yearly_goals'), done: goals.yearly.completed, total: goals.yearly.total, rate: goals.yearly.progress, color: 'bg-purple-500', icon: CalendarRange, href: '/goals/yearly' },
                { label: t('nav.lifetime_goals'), done: goals.lifetime.completed, total: goals.lifetime.total, rate: goals.lifetime.avgProgress, color: 'bg-emerald-500', icon: Infinity, href: '/goals/lifetime' },
              ].map(({ label, done, total, rate, color, icon: Icon, href }) => (
                <Link key={label} href={href} className="block group/item">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-white transition-colors" />
                        <span className="text-sm font-medium text-gray-300 group-hover/item:text-white transition-colors">{label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        {total > 0 ? (
                          <>
                            <span className="text-green-400">{done} completed</span>
                            <span className="text-gray-500">{total} total</span>
                          </>
                        ) : (
                          <span className="text-gray-600">—</span>
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
                </Link>
              ))}

            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
          <MotivationalWidget />

          {/* Activity pulse */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/5">
              <CardContent className="p-5">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-emerald-500/10">
                     <Code className="w-4 h-4 text-emerald-400" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('nav.coding')}</span>
                 </div>
                 <p className="text-xl font-black text-white">{coding.totalHours}h</p>
                 <p className="text-[10px] text-gray-500 mt-1">{t('profile.xp_total')}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/5">
              <CardContent className="p-5">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-red-500/10">
                     <XCircle className="w-4 h-4 text-red-400" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('nav.banned_activities')}</span>
                 </div>
                 <p className="text-xl font-black text-white">{banned.brokenCount}</p>
                 <p className="text-[10px] text-gray-500 mt-1">{t('banned.times_broken')}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
