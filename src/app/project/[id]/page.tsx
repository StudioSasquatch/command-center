'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Rocket, 
  Gamepad2, 
  Shirt, 
  Bot, 
  Video, 
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { projects, lifeProjects } from '@/lib/data';

import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'drizzle': Rocket,
  'timeless-tech': Gamepad2,
  'styled-ai': Shirt,
  'ai-company': Bot,
  'content': Video,
  'ai-dinners': Users,
};

const accentConfig: Record<string, { primary: string; glow: string; gradient: string }> = {
  orange: { primary: '#ff5722', glow: 'rgba(255, 87, 34, 0.15)', gradient: 'from-[#ff5722] to-[#ff9100]' },
  cyan: { primary: '#00e5ff', glow: 'rgba(0, 229, 255, 0.15)', gradient: 'from-[#00e5ff] to-[#2979ff]' },
  purple: { primary: '#bf5af2', glow: 'rgba(191, 90, 242, 0.15)', gradient: 'from-[#bf5af2] to-[#5e5ce6]' },
  green: { primary: '#30d158', glow: 'rgba(48, 209, 88, 0.15)', gradient: 'from-[#30d158] to-[#34c759]' },
  amber: { primary: '#ffd60a', glow: 'rgba(255, 214, 10, 0.15)', gradient: 'from-[#ffd60a] to-[#ffca28]' },
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const allProjects = [...projects, ...lifeProjects];
  const project = allProjects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-white mb-4">Project Not Found</h1>
          <Link href="/" className="text-[#00e5ff] hover:underline">
            Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[project.id] || Rocket;
  const accent = accentConfig[project.accentColor] || accentConfig.orange;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-mono">BACK TO COMMAND CENTER</span>
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div 
              className="p-4 rounded-2xl"
              style={{ 
                backgroundColor: `${accent.primary}15`,
                boxShadow: `0 0 30px ${accent.glow}`,
                color: accent.primary
              }}
            >
              <Icon className="w-10 h-10" strokeWidth={1.5} />
            </div>
            
            <div>
              <h1 className="font-display text-4xl font-bold text-white tracking-wide">
                {project.name.toUpperCase()}
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">{project.description}</p>
            </div>
          </motion.div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-6"
            >
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase mb-6">
                Current Status
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-1">STATUS</div>
                  <div className="flex items-center gap-2">
                    <span className={`status-beacon ${project.status === 'active' ? 'status-active' : 'status-pending'}`} />
                    <span className="font-display text-lg text-white uppercase">{project.status}</span>
                  </div>
                </div>
                
                <div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-1">PRIORITY</div>
                  <div className="font-display text-lg text-white">P{project.priority}</div>
                </div>
                
                {project.category !== 'life' && (
                  <>
                    <div className="col-span-2">
                      <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">PROGRESS</div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 progress-track">
                          <div 
                            className={`progress-fill bg-gradient-to-r ${accent.gradient}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm" style={{ color: accent.primary }}>
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            
            {/* Metrics */}
            {project.metrics && project.metrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6"
              >
                <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase mb-6">
                  Key Metrics
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {project.metrics.map((metric, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-4">
                      <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider uppercase mb-1">
                        {metric.label}
                      </div>
                      <div className="text-xl font-bold" style={{ color: accent.primary }}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Next Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-6"
              style={{ boxShadow: `0 4px 40px ${accent.glow}` }}
            >
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase mb-4">
                Next Action
              </h2>
              <p className="text-lg text-white">{project.nextAction}</p>
            </motion.div>
          </div>
          
          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6"
            >
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-2">
                <button className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all text-left flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-white/70">View Notes</span>
                </button>
                
                <button className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all text-left flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-white/70">Schedule Meeting</span>
                </button>
                
                <button className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all text-left flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-white/70">Ask Noctis</span>
                </button>
                
                <button className="w-full p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all text-left flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-white/70">Open Docs</span>
                </button>
              </div>
            </motion.div>
            
            {/* Noctis Note */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6 border-[#00e5ff]/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🏛️</span>
                <span className="font-display text-sm font-bold text-white">NOCTIS NOTE</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] italic">
                I'm tracking this project and will ping you when action is needed. 
                Update the workspace files anytime — I'll see the changes.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
