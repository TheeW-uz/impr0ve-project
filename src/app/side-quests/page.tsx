'use client';
import { useQuery } from '@tanstack/react-query';
import { QuestService } from '@/lib/services';
import { QuestForm } from '@/components/side-quests/QuestForm';
import { QuestCard } from '@/components/side-quests/QuestCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Zap, Trophy, Shield } from 'lucide-react';

export default function SideQuestsPage() {
  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['side-quests'],
    queryFn: () => QuestService.getAll().then(res => res.data.data),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 -rotate-3">
            <Swords className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Side Quests</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-indigo-500/80 font-black uppercase tracking-[0.2em] text-[10px]">Epic Challenges</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-sm font-medium">{quests.length} Active Missions</span>
            </p>
          </div>
        </div>
      </header>

      {/* Global Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
             <Trophy className="w-6 h-6" />
           </div>
           <div>
             <p className="text-2xl font-black text-white">{quests.filter((q:any)=>q.completed).length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quests Won</p>
           </div>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
             <Shield className="w-6 h-6" />
           </div>
           <div>
             <p className="text-2xl font-black text-white">{quests.length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Rank</p>
           </div>
        </Card>
      </div>

      <QuestForm />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white/5 animate-pulse rounded-[2.5rem]" />
            ))
          ) : quests.length > 0 ? (
            quests.map((quest: any) => (
              <QuestCard key={quest.id} quest={quest} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-40 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-[4rem]"
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-gray-800" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">The Hero Rests</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium text-center">No challenges are currently active. Forge a new quest to begin your next level-up journey.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { Card } from '@/components/ui/card';

