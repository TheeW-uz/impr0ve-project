'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GoalForm() {
  const { addGoal } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Daily');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addGoal({
      id: uuidv4(),
      title,
      category: category as any,
      priority: priority as any,
      progress: 0,
      completed: false,
      deadline: deadline?.toISOString(),
      history: [],
    });

    setTitle('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      <AnimatePresence initial={false}>
        {!isExpanded ? (
          <motion.button
            layoutId="form"
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 text-gray-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">Add a new goal...</span>
          </motion.button>
        ) : (
          <motion.div layoutId="form">
            <Card className="border-primary-500/30 bg-primary-500/5 shadow-2xl shadow-primary-500/10">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary-400" />
                      New Goal
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} type="button">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="What do you want to achieve?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg py-6 bg-gray-900/50"
                    autoFocus
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                          <SelectItem value="Lifetime">Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Priority</label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Deadline</label>
                      <Calendar
                        selected={deadline}
                        onSelect={setDeadline}
                        className="rounded-2xl border border-white/10 bg-gray-900/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsExpanded(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="px-8">
                      Create Goal
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
