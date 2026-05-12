'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Map, Trash2, Plus } from 'lucide-react';
import { RoadmapItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function RoadmapTimeline({ items }: { items: RoadmapItem[] }) {
  const { deleteRoadmapItem, updateRoadmapItem } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-gray-900 text-primary-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </div>

          {/* Card */}
          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-glass backdrop-blur-md border-white/5 hover:border-primary-500/30 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); deleteRoadmapItem(item.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">{item.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No date set'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 text-[10px] uppercase font-bold"
                onClick={() => updateRoadmapItem(item.id, { completed: !item.completed })}
              >
                {item.completed ? 'Completed' : 'Mark Done'}
              </Button>
            </div>

            {item.milestones && item.milestones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                {item.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className={cn("w-1.5 h-1.5 rounded-full", m.completed ? "bg-primary-500" : "bg-white/10")} />
                    <span>{m.title}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
