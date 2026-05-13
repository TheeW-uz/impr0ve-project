'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldBan, Scale, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BannedActivitiesTab } from '@/components/banned-activities/BannedActivitiesTab';
import { PunishmentRulesTab } from '@/components/banned-activities/PunishmentRulesTab';

export default function BannedActivitiesPage() {
  const [activeTab, setActiveTab] = useState<'activities' | 'punishments'>('activities');

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <header className="mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldBan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Banned Activities</h1>
              <p className="text-gray-500 text-sm font-medium">Break bad habits and enforce personal discipline.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-bold block mb-0.5">Strict Discipline</span>
                Track activities you want to avoid. Mark when you fail to keep yourself accountable.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-bold block mb-0.5">Automated Consequences</span>
                Setup rules that trigger punishments when you fail your To-Do's or Goals.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-bold block mb-0.5">How it works</span>
                The system checks failed items. If thresholds are met, a punishment is assigned.
              </p>
            </div>
          </motion.div>
        </header>

        {/* Tab Switcher */}
        <div className="mb-8">
          <div className="flex border-b border-white/5">
            {[
              { id: 'activities', label: 'Banned Activities', icon: ShieldBan },
              { id: 'punishments', label: 'Punishment & Rules', icon: Scale },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative",
                  activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? (tab.id === 'activities' ? "text-red-500" : "text-purple-500") : "text-gray-600")} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5",
                      tab.id === 'activities' ? "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]" : "bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'activities' ? <BannedActivitiesTab /> : <PunishmentRulesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
