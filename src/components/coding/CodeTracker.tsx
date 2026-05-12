'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Code, Github, Terminal, Cpu, Globe, Braces, Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function CodeTracker() {
  // Mock data for the heatmap-style tracker
  const days = Array.from({ length: 365 }, (_, i) => Math.floor(Math.random() * 5));

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Coding Streak', value: '12 Days', icon: Flame, color: 'text-orange-500' },
          { label: 'Problems Solved', value: '482', icon: Terminal, color: 'text-green-500' },
          { label: 'Projects', value: '14', icon: Cpu, color: 'text-blue-500' },
          { label: 'New Tech', value: '3', icon: Sparkles, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white/5 border-white/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contribution Heatmap Placeholder */}
      <Card className="bg-white/5 border-white/5 overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Github className="w-5 h-5" />
              Coding Activity
            </CardTitle>
            <span className="text-xs text-gray-500">Last 12 months</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-1">
            {days.map((level, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${
                  level === 0 ? 'bg-white/5' :
                  level === 1 ? 'bg-primary-500/20' :
                  level === 2 ? 'bg-primary-500/40' :
                  level === 3 ? 'bg-primary-500/70' :
                  'bg-primary-500'
                }`}
                title={`Level ${level}`}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 font-bold uppercase">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-white/5" />
              <div className="w-3 h-3 rounded-sm bg-primary-500/20" />
              <div className="w-3 h-3 rounded-sm bg-primary-500/40" />
              <div className="w-3 h-3 rounded-sm bg-primary-500/70" />
              <div className="w-3 h-3 rounded-sm bg-primary-500" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tech to Learn */}
        <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Technologies to Learn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Rust', progress: 35, color: 'bg-orange-500' },
              { name: 'Three.js', progress: 60, color: 'bg-white' },
              { name: 'PostgreSQL', progress: 85, color: 'bg-blue-400' },
            ].map((tech, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-300">{tech.name}</span>
                  <span className="text-gray-500">{tech.progress}%</span>
                </div>
                <Progress value={tech.progress} className={`h-1.5 bg-white/5`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Snippets */}
        <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Braces className="w-5 h-5 text-purple-400" />
              Recent Snippets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Tailwind Glassmorphism Mixin',
              'Next.js 14 Parallel Routes Helper',
              'Zustand Persistence Middleware',
            ].map((snippet, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-900/50 border border-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                {snippet}
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-primary-400 font-bold uppercase tracking-widest">
              View All Snippets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
