'use client';

import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Q1_BUDGET, getBudgetByCategory, getBudgetHealth, getRemainingBudget } from '@/lib/budget-data';

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  // Simplified - just show the number without animation to avoid layout issues
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

function ProgressBar({ 
  spent, 
  total, 
  showLabels = true,
  height = 'h-3',
  animate = true 
}: { 
  spent: number; 
  total: number; 
  showLabels?: boolean;
  height?: string;
  animate?: boolean;
}) {
  const percentage = Math.min((spent / total) * 100, 100);
  const isOver = spent > total;
  const isWarning = percentage >= 75 && !isOver;
  
  const getColor = () => {
    if (isOver) return 'bg-[#ff453a]';
    if (isWarning) return 'bg-[#ffd60a]';
    return 'bg-[#30d158]';
  };

  const getGlow = () => {
    if (isOver) return 'shadow-[0_0_20px_rgba(255,69,58,0.4)]';
    if (isWarning) return 'shadow-[0_0_20px_rgba(255,214,10,0.3)]';
    return 'shadow-[0_0_20px_rgba(48,209,88,0.3)]';
  };

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">
            ${spent.toLocaleString()} spent
          </span>
          <span className="text-[var(--text-muted)]">
            ${total.toLocaleString()} total
          </span>
        </div>
      )}
      <div className={`${height} rounded-full bg-white/[0.05] overflow-hidden relative`}>
        <motion.div
          className={`h-full rounded-full ${getColor()} ${getGlow()}`}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
        {isOver && (
          <motion.div
            className="absolute inset-0 bg-[#ff453a]/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}

function CategoryBreakdown() {
  const categories = getBudgetByCategory();
  
  const categoryColors: Record<string, string> = {
    'Influencer Marketing': '#ff5722',
    'Paid Ads': '#1d9bf0',
    'Content Production': '#ffd60a',
    'Community Incentives': '#30d158',
    'Tools & Software': '#bf5af2',
    'Contingency': '#64748b',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <PieChart className="w-4 h-4 text-[var(--text-muted)]" />
        <span>By Category</span>
      </div>
      
      <div className="space-y-3">
        {Object.entries(categories).map(([name, data], idx) => {
          const percentage = (data.spent / data.allocated) * 100;
          const isOver = data.spent > data.allocated;
          const isWarning = percentage >= 75 && !isOver;
          
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryColors[name] || '#888' }}
                  />
                  <span className="text-xs text-[var(--text-secondary)] truncate max-w-[140px]">
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white">
                    ${data.spent.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    / ${data.allocated.toLocaleString()}
                  </span>
                  {isOver && <AlertTriangle className="w-3 h-3 text-[#ff453a]" />}
                  {isWarning && <Clock className="w-3 h-3 text-[#ffd60a]" />}
                  {!isOver && !isWarning && data.spent > 0 && (
                    <CheckCircle2 className="w-3 h-3 text-[#30d158]" />
                  )}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: isOver 
                      ? '#ff453a' 
                      : isWarning 
                        ? '#ffd60a' 
                        : categoryColors[name] || '#888' 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 + idx * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function BudgetTracker() {
  const { total, allocated, spent } = Q1_BUDGET;
  const remaining = getRemainingBudget();
  const health = getBudgetHealth();
  const spentPercentage = Math.round((spent / total) * 100);
  
  const healthColors = {
    healthy: { bg: 'bg-[#30d158]/10', text: 'text-[#30d158]', border: 'border-[#30d158]/20' },
    warning: { bg: 'bg-[#ffd60a]/10', text: 'text-[#ffd60a]', border: 'border-[#ffd60a]/20' },
    over: { bg: 'bg-[#ff453a]/10', text: 'text-[#ff453a]', border: 'border-[#ff453a]/20' },
  };

  const healthLabels = {
    healthy: 'On Track',
    warning: 'Watch Spending',
    over: 'Over Budget',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#30d158]/10">
            <DollarSign className="w-5 h-5 text-[#30d158]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase">
              Q1 Budget
            </h2>
            <div className="text-xs text-[var(--text-muted)]">
              Drizzle Marketing • Jan-Mar 2026
            </div>
          </div>
        </div>
        
        {/* Health Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className={`px-3 py-1.5 rounded-full ${healthColors[health].bg} border ${healthColors[health].border} flex items-center gap-2`}
        >
          {health === 'healthy' && <TrendingUp className={`w-3.5 h-3.5 ${healthColors[health].text}`} />}
          {health === 'warning' && <Clock className={`w-3.5 h-3.5 ${healthColors[health].text}`} />}
          {health === 'over' && <AlertTriangle className={`w-3.5 h-3.5 ${healthColors[health].text}`} />}
          <span className={`text-xs font-semibold ${healthColors[health].text}`}>
            {healthLabels[health]}
          </span>
        </motion.div>
      </div>

      {/* Big Numbers */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Total Budget
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-white">
            ${total.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Spent
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-[#ff5722]">
            ${spent.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {spentPercentage}%
          </div>
        </div>
        
        <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Remaining
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-[#30d158]">
            ${remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-8">
        <ProgressBar spent={spent} total={total} height="h-4" />
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdown />

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-[var(--text-muted)]"
      >
        <span>
          Allocated: ${allocated.toLocaleString()} / ${total.toLocaleString()}
        </span>
        <span>
          Unallocated: ${(total - allocated).toLocaleString()}
        </span>
      </motion.div>
    </motion.div>
  );
}
