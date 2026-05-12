'use client';

import { useStore } from '@/lib/store';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { Button } from '@/components/ui/button';
import { Map, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function RoadmapPage() {
  const { roadmap, addRoadmapItem } = useStore();

  const handleAdd = () => {
    addRoadmapItem({
      id: uuidv4(),
      title: 'New Milestone',
      description: 'Describe the path to success...',
      completed: false,
      milestones: [],
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Map className="w-10 h-10 text-emerald-500" />
            Roadmap
          </h1>
          <p className="text-gray-400 mt-1">Visualize your long‑term strategy.</p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl">
          <Plus className="w-5 h-5 mr-2" />
          Add Node
        </Button>
      </header>

      {roadmap.length > 0 ? (
        <RoadmapTimeline items={roadmap} />
      ) : (
        <div className="py-40 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
          <Map className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Your roadmap is empty.</p>
          <p className="text-sm">Start mapping out your future steps.</p>
        </div>
      )}
    </div>
  );
}
