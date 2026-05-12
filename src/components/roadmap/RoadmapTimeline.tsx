'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoadmapService } from '@/lib/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Map, Trash2, Plus, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function RoadmapTimeline({ items }: { items: any[] }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => RoadmapService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => RoadmapService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap'] }),
  });

  return (
    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      {items.map((item, index) => {
        const isCompleted = item.completed;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            {/* Dot */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
              isCompleted 
                ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                : "bg-gray-900 border-white/10 text-gray-500 group-hover:border-emerald-500/50"
            )}>
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Star className="w-5 h-5" />}
            </div>

            {/* Card */}
            <Card className={cn(
              "w-[calc(100%-4.5rem)] md:w-[calc(50%-3rem)] bg-white/[0.02] border-white/5 hover:border-emerald-500/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden group/card",
              isCompleted && "bg-emerald-500/5 border-emerald-500/20"
            )}>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={cn("text-2xl font-black text-white tracking-tight", isCompleted && "opacity-50 line-through")}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Phase {index + 1}</span>
                       <div className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                         <Calendar className="w-3 h-3" /> {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Continuous'}
                       </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-500/10"
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{item.description}</p>
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost"
                    onClick={() => updateMutation.mutate({ id: item.id, data: { completed: !isCompleted } })}
                    className={cn(
                      "flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                      isCompleted 
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {isCompleted ? 'Node Accomplished' : 'Execute Phase'}
                  </Button>
                </div>

                {item.milestones && item.milestones.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                    {item.milestones.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3 group/m">
                        <div className={cn("w-2 h-2 rounded-full transition-all", m.completed ? "bg-emerald-500" : "bg-white/10")} />
                        <span className={cn("text-xs font-medium transition-colors", m.completed ? "text-emerald-400" : "text-gray-500 group-hover/m:text-gray-300")}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

