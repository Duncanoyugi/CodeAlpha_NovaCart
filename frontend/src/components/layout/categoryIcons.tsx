import { BatteryCharging, Cable, Headphones, Scissors, Smartphone, Watch, Tag, PlugZap, Sparkles } from 'lucide-react';

export const categoryIcon = (slug: string, className = 'h-5 w-5') => {
  const s = slug.toLowerCase();
  if (s.includes('charger') || s.includes('cable')) return <PlugZap className={className} />;
  if (s.includes('cable')) return <Cable className={className} />;
  if (s.includes('pod') || s.includes('ear') || s.includes('head') || s.includes('audio')) return <Headphones className={className} />;
  if (s.includes('power') || s.includes('bank') || s.includes('batter')) return <BatteryCharging className={className} />;
  if (s.includes('watch')) return <Watch className={className} />;
  if (s.includes('shav') || s.includes('groom')) return <Scissors className={className} />;
  if (s.includes('phone')) return <Smartphone className={className} />;
  if (s.includes('brand')) return <Tag className={className} />;
  return <Sparkles className={className} />;
};
