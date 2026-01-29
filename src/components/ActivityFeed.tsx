'use client';

import { motion } from 'framer-motion';
import { Activity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Flag
} from 'lucide-react';

const typeConfig = {
  update: { 
    icon: Zap, 
    color: 'text-[#00e5ff]', 
    bg: 'bg-[#00e5ff]/10',
    glow: '0 0 12px rgba(0, 229, 255, 0.3)' 
  },
  decision: { 
    icon: CheckCircle2, 
    color: 'text-[#30d158]', 
    bg: 'bg-[#30d158]/10',
    glow: '0 0 12px rgba(48, 209, 88, 0.3)' 
  },
  milestone: { 
    icon: Flag, 
    color: 'text-[#bf5af2]', 
    bg: 'bg-[#bf5af2]/10',
    glow: '0 0 12px rgba(191, 90, 242, 0.3)' 
  },
  alert: { 
    icon: AlertTriangle, 
    color: 'text-[#ffd60a]', 
    bg: 'bg-[#ffd60a]/10',
    glow: '0 0 12px rgba(255, 214, 10, 0.3)' 
  },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#00e5ff]/10">
          <Zap className="w-4 h-4 text-[#00e5ff]" />
        </div>
        <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
          Activity Feed
        </h2>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-colors cursor-pointer group"
            >
              <div 
                className={`p-2 rounded-lg ${config.bg}`}
                style={{ boxShadow: config.glow }}
              >
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                    {activity.project}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {activity.action}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* View all link */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full mt-4 py-3 text-center text-xs font-mono text-[var(--text-muted)] hover:text-[#00e5ff] transition-colors uppercase tracking-wider"
      >
        View All Activity →
      </motion.button>
    </motion.div>
  );
}
