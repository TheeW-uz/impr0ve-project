'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Plus, TrendingUp, CheckCircle2, 
  Target, Award, Rocket, Heart,
  Gem, Compass, Map, BookOpen, Quote
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function LifetimeGoalsPage() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', 'lifetime'],
    queryFn: () => GoalService.getLifetime().then(res => res.data.data),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      {/* Visionary Header */}
      <header className="relative py-12 flex flex-col items-center text-center overflow-hidden rounded-[3rem] bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-6 shadow-2xl shadow-emerald-500/10">
          <Star className="w-10 h-10 text-emerald-400 fill-emerald-400/20" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">Lifetime Vision</h1>
        <p className="text-emerald-500/80 font-black uppercase tracking-[0.3em] text-sm mb-8">Engineering Your Destiny</p>
        
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-black text-white">{goals.length}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Grand Visions</p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <p className="text-3xl font-black text-emerald-400">
              {goals.length > 0 ? goals.filter((g:any)=>g.completed).length : 0}
            </p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Legacy Built</p>
          </div>
        </div>

        <div className="mt-12">
          <AddLifetimeGoalButton />
        </div>
      </header>

      {/* Vision Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {goals.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[3rem]">
              <Compass className="w-20 h-20 mx-auto mb-6 opacity-10 text-emerald-400" />
              <h3 className="text-3xl font-black text-white mb-2">The Canvas is Empty</h3>
              <p className="text-gray-500 max-w-md mx-auto font-medium">What is the one thing you want to be remembered for? Define your legacy today.</p>
            </div>
          ) : (
            goals.map((goal: any, index: number) => (
              <LifetimeVisionCard key={goal.id} goal={goal} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Motivation */}
      <footer className="text-center py-20">
        <Quote className="w-12 h-12 text-emerald-500/20 mx-auto mb-6" />
        <p className="text-2xl md:text-3xl font-black italic text-gray-400 max-w-3xl mx-auto leading-tight">
          "The best way to predict the future is to create it."
        </p>
      </footer>
    </div>
  );
}

function LifetimeVisionCard({ goal, index }: { goal: any, index: number }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => GoalService.updateLifetime(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals', 'lifetime'] }),
  });

  const icons = [Rocket, Heart, Gem, Compass, Map, BookOpen];
  const Icon = icons[index % icons.length];

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        "group h-full flex flex-col bg-white/[0.02] border-white/5 hover:border-emerald-500/30 transition-all duration-500 rounded-[3rem] overflow-hidden",
        goal.completed && "border-emerald-500/40 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10"
      )}>
        <CardContent className="p-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-8">
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
              goal.completed ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            )}>
              <Icon className="w-8 h-8" />
            </div>
            
            <button 
              onClick={() => updateMutation.mutate({ id: goal.id, data: { completed: !goal.completed } })}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                goal.completed ? "bg-emerald-500 border-emerald-500" : "border-white/10 hover:border-emerald-500"
              )}
            >
              {goal.completed && <CheckCircle2 className="w-5 h-5 text-black font-black" />}
            </button>
          </div>

          <div className="flex-1">
            <h3 className={cn("text-3xl font-black text-white tracking-tighter leading-[0.9]", goal.completed && "opacity-50")}>
              {goal.title}
            </h3>
            <p className="text-gray-500 mt-4 text-sm font-medium leading-relaxed italic">
              {goal.description || 'Vision not yet fully articulated...'}
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Journey Progress</span>
              <span className="text-sm font-black text-emerald-400">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-3 bg-white/5 rounded-full" />
            
            <div className="mt-6 flex items-center gap-2">
               <div className="flex -space-x-2 overflow-hidden">
                 {goal.milestones?.map((m:any, i:number) => (
                   <div key={i} className={cn("w-6 h-6 rounded-full border-2 border-gray-950 flex items-center justify-center text-[8px] font-bold", m.completed ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-500")}>
                     {i+1}
                   </div>
                 ))}
               </div>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-2">
                 {goal.milestones?.length || 0} Milestones
               </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddLifetimeGoalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => GoalService.createLifetime(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'lifetime'] });
      setIsOpen(false);
    }
  });

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-16 px-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-2xl shadow-emerald-500/20 group transition-all"
      >
        <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
        Manifest New Vision
      </Button>
    );
  }

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <CardContent className="bg-gray-900 border border-emerald-500/30 rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
          createMutation.mutate({ title, description });
        }} className="space-y-8 text-left">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Define Your Vision</h2>
            <p className="text-emerald-500/80 font-bold uppercase tracking-widest text-[10px] mt-2">No small dreams allowed.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Vision Title</label>
              <input 
                name="title" autoFocus placeholder="e.g. Become a World-Class Founder"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-2xl font-black text-white placeholder:text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Manifesto (Description)</label>
              <textarea 
                name="description" placeholder="Why does this matter? What does the end result look like?"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg text-gray-300 placeholder:text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all h-40 resize-none outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl font-black h-14 px-8 text-gray-400 hover:text-white">Relinquish</Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-2xl h-14 px-12 shadow-xl shadow-emerald-500/20">
              Commit to Life
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
