'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Heart, Film, Users, Dumbbell, Zap, GraduationCap, PartyPopper, Plane, Tag } from 'lucide-react';
import { TodoItem } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Movies: Film,
  'Social Activities': Users,
  'Physical Activities': Dumbbell,
  Productivity: Zap,
  Learning: GraduationCap,
  Fun: PartyPopper,
  Travel: Plane,
  Default: Tag
};

export function ActivityCard({ activity }: { activity: TodoItem }) {
  const { deleteTodo, updateTodo } = useStore();
  const Icon = iconMap[activity.category] || iconMap.Default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={cn(
        "group relative border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300",
        activity.completed && "opacity-60"
      )}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            activity.completed ? "bg-gray-800 text-gray-500" : "bg-primary-500/10 text-primary-400 group-hover:scale-110"
          )}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-bold text-white truncate transition-all",
              activity.completed && "line-through text-gray-500"
            )}>
              {activity.title}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {activity.category}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", activity.favorite ? "text-pink-500" : "text-gray-500")}
              onClick={() => updateTodo(activity.id, { favorite: !activity.favorite })}
            >
              <Heart className={cn("w-4 h-4", activity.favorite && "fill-current")} />
            </Button>
            <Button
              variant={activity.completed ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                activity.completed ? "bg-green-500 hover:bg-green-600" : "border-white/10"
              )}
              onClick={() => updateTodo(activity.id, { completed: !activity.completed })}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteTodo(activity.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
