import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatsCard({ title, value, icon: Icon }: Props) {
  return (
    <Card className="bg-white/5 border-white/5 backdrop-blur-md shadow-xl hover:shadow-primary-500/10 transition-all hover:scale-[1.02] duration-300">
      <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
        <div className="p-2 rounded-xl bg-primary-500/10">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <p className="text-3xl font-black text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
