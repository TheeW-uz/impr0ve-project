'use client';

import { useStore } from '@/lib/store';
import { ActivityForm } from '@/components/todo/ActivityForm';
import { ActivityCard } from '@/components/todo/ActivityCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bolt, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TodoPage() {
  const { todos } = useStore();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(todos.map(t => t.category)))];
  const filteredTodos = todos.filter(t => filter === 'All' || t.category === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Bolt className="w-10 h-10 text-yellow-500" />
            Stuff To Do
          </h1>
          <p className="text-gray-400 mt-1">Categorized activities for a balanced life.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={cn("rounded-full px-4 shrink-0", filter !== cat && "text-gray-400")}
            >
              {cat}
            </Button>
          ))}
        </div>
      </header>

      <ActivityForm />

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <ActivityCard key={todo.id} activity={todo} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl"
            >
              <Bolt className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Your list is clean.</p>
              <p className="text-sm">Enjoy your free time or add something new!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
