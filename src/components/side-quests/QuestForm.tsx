'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuestForm() {
  const { addQuest } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [totalDays, setTotalDays] = useState('30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalDays) return;

    addQuest({
      id: uuidv4(),
      title,
      totalDays: parseInt(totalDays),
      completedDays: 0,
      completed: false,
    });

    setTitle('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      <AnimatePresence initial={false}>
        {!isExpanded ? (
          <motion.button
            layoutId="quest-form"
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 text-gray-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">Start a new side quest...</span>
          </motion.button>
        ) : (
          <motion.div layoutId="quest-form">
            <Card className="border-indigo-500/30 bg-indigo-500/5">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Swords className="w-5 h-5 text-indigo-400" />
                      New Side Quest
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} type="button">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Quest name (e.g. 30 Days Training Challenge)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-gray-900/50"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Total Days"
                        value={totalDays}
                        onChange={(e) => setTotalDays(e.target.value)}
                        className="bg-gray-900/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                      Start Quest
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
