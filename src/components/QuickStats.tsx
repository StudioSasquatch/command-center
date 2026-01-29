'use client';

import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  Target,
  TrendingUp
} from 'lucide-react';
import { quickStats } from '@/lib/data';

const stats = [
  {
    label: 'ACTIVE VENTURES',
    value: String(quickStats.activeVentures),
    subtext: '+1 this week',
    icon: Briefcase,
    accent: 'ember',
  },
  {
    label: 'PENDING ACTIONS',
    value: String(quickStats.pendingActions),
    subtext: 'Needs attention',
    icon: Clock,
    accent: 'warning',
  },
  {
    label: 'PRIORITY TARGET',
    value: quickStats.priorityFocus.toUpperCase(),
    subtext: quickStats.prioritySubtext,
    icon: Target,
    accent: 'plasma',
  },
  {
    label: 'MOMENTUM',
    value: quickStats.momentum.toUpperCase(),
    subtext: quickStats.momentumSubtext,
    icon: TrendingUp,
    accent: 'matrix',
  },
];

const accentStyles: Record<string, { text: string; bg: string; glow: string }> = {
  ember: { 
    text: 'text-[#ff5722]', 
    bg: 'bg-[#ff5722]/10', 
    glow: 'shadow-[0_0_20px_rgba(255,87,34,0.2)]' 
  },
  plasma: { 
    text: 'text-[#00e5ff]', 
    bg: 'bg-[#00e5ff]/10', 
    glow: 'shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
  },
  warning: { 
    text: 'text-[#ffd60a]', 
    bg: 'bg-[#ffd60a]/10', 
    glow: 'shadow-[0_0_20px_rgba(255,214,10,0.2)]' 
  },
  matrix: { 
    text: 'text-[#30d158]', 
    bg: 'bg-[#30d158]/10', 
    glow: 'shadow-[0_0_20px_rgba(48,209,88,0.2)]' 
  },
};

export function QuickStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const styles = accentStyles[stat.accent];
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
            className={`glass-panel p-5 hover-lift cursor-pointer group`}
          >
            {/* Icon badge */}
            <div className={`inline-flex p-2.5 rounded-xl ${styles.bg} ${styles.glow} mb-4`}>
              <Icon className={`w-5 h-5 ${styles.text}`} strokeWidth={2} />
            </div>
            
            {/* Label */}
            <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-[0.2em] mb-2">
              {stat.label}
            </div>
            
            {/* Value - Big and Bold */}
            <div className={`font-display text-2xl md:text-3xl font-bold ${styles.text} tracking-wide mb-1`}>
              {stat.value}
            </div>
            
            {/* Subtext */}
            <div className="text-xs text-[var(--text-secondary)]">
              {stat.subtext}
            </div>
            
            {/* Bottom accent line */}
            <motion.div 
              className={`absolute bottom-0 left-0 right-0 h-[2px] ${styles.bg.replace('/10', '')}`}
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
