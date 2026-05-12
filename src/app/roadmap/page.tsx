'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plus, Target, Flag, Calendar, Trash2, Rocket, Zap, ChevronRight, Compass } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoadmapService } from '@/lib/services';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const queryClient = useQueryClient();

  const { data: roadmap = [], isLoading } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => RoadmapService.getAll().then(res => res.data.data),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 rotate-3">
            <Compass className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Strategic Roadmap</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-emerald-500/80 font-black uppercase tracking-[0.2em] text-[10px]">Macro Vision</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-sm font-medium">{roadmap.length} Milestone Nodes</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <AddRoadmapNodeButton />
        </div>
      </header>

      {/* Progress Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-8">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-white">
                {roadmap.length > 0 ? Math.round((roadmap.filter((r:any)=>r.completed).length / roadmap.length) * 100) : 0}%
              </span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Overall Completion</p>
        </Card>
      </div>

      {/* Timeline Content */}
      <div className="relative pt-12">
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-48 bg-white/5 animate-pulse rounded-[3rem]" />
            ))}
          </div>
        ) : roadmap.length > 0 ? (
          <RoadmapTimeline items={roadmap} />
        ) : (
          <div className="py-48 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem]">
            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-8">
              <Map className="w-10 h-10 text-gray-800" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2">The Path is Unwritten</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">Map out your grand strategy and visualize every major milestone on your journey.</p>
            <div className="mt-12">
               <AddRoadmapNodeButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddRoadmapNodeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => RoadmapService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      setIsOpen(false);
    }
  });

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-16 px-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-2xl shadow-emerald-500/20 group transition-all"
      >
        <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" /> 
        Architect New Node
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
          const dueDate = (form.elements.namedItem('dueDate') as HTMLInputElement).value;
          createMutation.mutate({ title, description, dueDate });
        }} className="space-y-8 text-left">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Construct Milestone</h2>
            <p className="text-emerald-500/80 font-bold uppercase tracking-widest text-[10px] mt-2">Design the next phase of your evolution.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Node Title</label>
              <input 
                name="title" autoFocus placeholder="e.g. Launch Beta Version"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-2xl font-black text-white placeholder:text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Phase Strategy (Description)</label>
              <textarea 
                name="description" placeholder="What are the core objectives of this phase?"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg text-gray-300 placeholder:text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all h-40 resize-none outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Target Completion Date</label>
              <input 
                name="dueDate" type="date"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xl font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl font-black h-14 px-8 text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-2xl h-14 px-12 shadow-xl shadow-emerald-500/20">
              Deploy Node
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
