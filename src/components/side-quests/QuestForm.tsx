'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, Plus, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';


export function QuestForm() {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [totalDays, setTotalDays] = useState('30');

  const createMutation = useMutation({
    mutationFn: (data: any) => QuestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['side-quests'] });
      setTitle('');
      setIsExpanded(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalDays) return;
    createMutation.mutate({
      title,
      totalDays: parseInt(totalDays),
    });
  };

  return (
    <div className="mb-12">
      <AnimatePresence initial={false}>
        {!isExpanded ? (
          <motion.button
            layoutId="quest-form"
            onClick={() => setIsExpanded(true)}
            className="w-full h-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-4 text-gray-500 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-black text-sm uppercase tracking-[0.2em]">Initiate New Side Quest</span>
          </motion.button>
        ) : (
          <motion.div layoutId="quest-form">
            <Card className="border-indigo-500/30 bg-indigo-500/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/10">
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                       <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                         <Flame className="w-8 h-8 text-indigo-400" />
                         Quest Blueprint
                       </h3>
                       <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Define your challenge parameters</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} type="button" className="rounded-full h-12 w-12 hover:bg-white/5">
                      <X className="w-6 h-6 text-gray-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Quest Title</label>
                       <Input
                         placeholder="e.g. 100 Days of Code Mastery"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                         autoFocus
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Total Duration</label>
                       <div className="relative">
                          <Input
                            type="number"
                            placeholder="Days"
                            value={totalDays}
                            onChange={(e) => setTotalDays(e.target.value)}
                            className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white pr-14 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Days</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} type="button" className="h-14 px-8 rounded-2xl font-black text-gray-500 hover:text-white">
                      Relinquish
                    </Button>
                    <Button type="submit" className="h-14 px-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black shadow-xl shadow-indigo-500/20">
                      Commit to Quest
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

