'use client';

import { useStore } from '@/lib/store';
import { QuestForm } from '@/components/side-quests/QuestForm';
import { QuestCard } from '@/components/side-quests/QuestCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';

export default function SideQuestsPage() {
  const { quests } = useStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Swords className="w-10 h-10 text-indigo-500" />
          Side Quests
        </h1>
        <p className="text-gray-400 mt-1">Gamified challenges to level up your life.</p>
      </header>

      <QuestForm />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {quests.length > 0 ? (
            quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl"
            >
              <Swords className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No active side quests.</p>
              <p className="text-sm">Start a challenge to earn some XP!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
