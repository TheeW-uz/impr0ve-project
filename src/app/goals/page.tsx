'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, TrendingUp, Star, Sun, CalendarDays, CalendarRange, Infinity } from 'lucide-react';
import { DailyGoalsTab } from '@/components/goals/DailyGoalsTab';
import { MonthlyGoalsTab } from '@/components/goals/MonthlyGoalsTab';
import { YearlyGoalsTab } from '@/components/goals/YearlyGoalsTab';
import { LifetimeGoalsTab } from '@/components/goals/LifetimeGoalsTab';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'daily', label: 'Daily', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'monthly', label: 'Monthly', icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'yearly', label: 'Yearly', icon: CalendarRange, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'lifetime', label: 'Lifetime', icon: Infinity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
] as const;

type TabId = typeof tabs[number]['id'];

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('daily');
  const { ensureTodayContainer, ensureMonthContainer, ensureYearContainer, failStaleDailyGoals } = useStore();

  useEffect(() => {
    ensureTodayContainer();
    ensureMonthContainer();
    ensureYearContainer();
    failStaleDailyGoals();
  }, []);

  const activeTabMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <header className="px-1 md:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Goals</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">Your progression system — everything starts at zero.</p>
          </div>
        </div>
      </header>

      {/* Tab Bar - Scrollable on mobile */}
      <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0">
        <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/5 md:border-white/10 w-fit min-w-full md:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[13px] md:text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? `${tab.bg} ${tab.color} border ${tab.border} shadow-lg`
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'daily' && <DailyGoalsTab />}
          {activeTab === 'monthly' && <MonthlyGoalsTab />}
          {activeTab === 'yearly' && <YearlyGoalsTab />}
          {activeTab === 'lifetime' && <LifetimeGoalsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
