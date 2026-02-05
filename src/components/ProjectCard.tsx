'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { 
  Rocket, 
  Gamepad2, 
  Shirt, 
  Bot, 
  Video, 
  Users,
  ChevronRight,
  Home
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'drizzle': Rocket,
  'timeless-tech': Gamepad2,
  'styled-ai': Shirt,
  'ai-company': Bot,
  'content': Video,
  'ai-dinners': Users,
  'fassio-roofing': Home,
};

const accentConfig = {
  orange: {
    primary: '#ff5722',
    glow: 'rgba(255, 87, 34, 0.15)',
    gradient: 'from-[#ff5722] to-[#ff9100]',
    text: 'text-[#ff5722]',
    bg: 'bg-[#ff5722]/10',
    border: 'border-[#ff5722]/20',
  },
  cyan: {
    primary: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.15)',
    gradient: 'from-[#00e5ff] to-[#2979ff]',
    text: 'text-[#00e5ff]',
    bg: 'bg-[#00e5ff]/10',
    border: 'border-[#00e5ff]/20',
  },
  purple: {
    primary: '#bf5af2',
    glow: 'rgba(191, 90, 242, 0.15)',
    gradient: 'from-[#bf5af2] to-[#5e5ce6]',
    text: 'text-[#bf5af2]',
    bg: 'bg-[#bf5af2]/10',
    border: 'border-[#bf5af2]/20',
  },
  green: {
    primary: '#30d158',
    glow: 'rgba(48, 209, 88, 0.15)',
    gradient: 'from-[#30d158] to-[#34c759]',
    text: 'text-[#30d158]',
    bg: 'bg-[#30d158]/10',
    border: 'border-[#30d158]/20',
  },
  amber: {
    primary: '#ffd60a',
    glow: 'rgba(255, 214, 10, 0.15)',
    gradient: 'from-[#ffd60a] to-[#ffca28]',
    text: 'text-[#ffd60a]',
    bg: 'bg-[#ffd60a]/10',
    border: 'border-[#ffd60a]/20',
  },
  blue: {
    primary: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.15)',
    gradient: 'from-[#2563eb] to-[#3b82f6]',
    text: 'text-[#3b82f6]',
    bg: 'bg-[#3b82f6]/10',
    border: 'border-[#3b82f6]/20',
  },
};

const statusConfig = {
  active: { label: 'ACTIVE', beacon: 'status-active' },
  pending: { label: 'PENDING', beacon: 'status-pending' },
  blocked: { label: 'BLOCKED', beacon: 'status-critical' },
  complete: { label: 'COMPLETE', beacon: 'status-active' },
};

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Icon = iconMap[project.id] || Rocket;
  const accent = accentConfig[project.accentColor];
  const status = statusConfig[project.status];

  return (
    <Link href={`/project/${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1, 
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="glass-panel p-6 hover-lift cursor-pointer group relative overflow-hidden h-full"
        style={{ boxShadow: `0 4px 40px ${accent.glow}` }}
      >
      {/* Accent corner */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${accent.primary}, transparent 70%)`
        }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${accent.bg} ${accent.border} border`}>
            <Icon className={`w-6 h-6 ${accent.text}`} strokeWidth={1.5} />
          </div>
          
          {/* Title & Description */}
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide group-hover:tracking-wider transition-all">
              {project.name.toUpperCase()}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">{project.description}</p>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`status-beacon ${status.beacon}`} />
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress */}
      {project.category !== 'life' && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
              PROGRESS
            </span>
            <span className={`font-mono text-sm font-bold ${accent.text}`}>
              {project.progress}%
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ delay: index * 0.1 + 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={`progress-fill bg-gradient-to-r ${accent.gradient}`}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {project.metrics.map((metric, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.03]">
              <div className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider uppercase mb-1">
                {metric.label}
              </div>
              <div className={`text-sm font-semibold ${accent.text}`}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Next Action */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider uppercase mb-1">
              NEXT ACTION
            </div>
            <div className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">
              {project.nextAction}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      </motion.div>
    </Link>
  );
}
