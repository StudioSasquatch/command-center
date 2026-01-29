'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { QuickStats } from '@/components/QuickStats';
import { ProjectCard } from '@/components/ProjectCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { projects, lifeProjects, recentActivity } from '@/lib/data';
import { 
  Rocket, 
  Video, 
  Heart,
  MessageSquare,
  Sparkles,
  Terminal
} from 'lucide-react';
import { InboxCapture } from '@/components/InboxCapture';

export default function Dashboard() {
  const ventures = projects.filter(p => p.category === 'venture');
  const content = projects.filter(p => p.category === 'content');

  return (
    <div className="min-h-screen relative">
      {/* Dramatic background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Quick Stats */}
        <section>
          <QuickStats />
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Ventures & Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Ventures */}
            <section>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 rounded-lg bg-[#ff5722]/10">
                  <Rocket className="w-5 h-5 text-[#ff5722]" />
                </div>
                <h2 className="font-display text-xl font-bold tracking-wider text-white uppercase">
                  Ventures
                </h2>
                <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                  {ventures.length} ACTIVE
                </span>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-5">
                {ventures.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </section>

            {/* Content & Community */}
            <section>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 rounded-lg bg-[#ffd60a]/10">
                  <Video className="w-5 h-5 text-[#ffd60a]" />
                </div>
                <h2 className="font-display text-xl font-bold tracking-wider text-white uppercase">
                  Content & Community
                </h2>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-5">
                {content.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index + ventures.length} />
                ))}
              </div>
            </section>

            {/* Life */}
            <section>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 rounded-lg bg-[#30d158]/10">
                  <Heart className="w-5 h-5 text-[#30d158]" />
                </div>
                <h2 className="font-display text-xl font-bold tracking-wider text-white uppercase">
                  Life
                </h2>
                <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                  PROTECTED TIME
                </span>
              </motion.div>
              
              <div className="grid grid-cols-3 gap-4">
                {lifeProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className="glass-panel p-5 text-center hover-lift cursor-pointer group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {project.id === 'golf' && '⛳'}
                      {project.id === 'cards' && '⚾'}
                      {project.id === 'warzone' && '🎮'}
                    </div>
                    <div className="font-display text-sm font-bold text-white tracking-wide uppercase mb-1">
                      {project.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {project.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <ActivityFeed activities={recentActivity} />

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#bf5af2]/10">
                  <Terminal className="w-4 h-4 text-[#bf5af2]" />
                </div>
                <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                  Quick Actions
                </h2>
              </div>
              
              <div className="space-y-2">
                <button className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all text-left flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-[#00e5ff]/10 group-hover:bg-[#00e5ff]/20 transition-colors">
                    <MessageSquare className="w-4 h-4 text-[#00e5ff]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Message Noctis</div>
                    <div className="text-xs text-[var(--text-muted)]">Open chat</div>
                  </div>
                </button>
                
                <InboxCapture />
              </div>
            </motion.div>

            {/* Noctis Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="glass-panel p-6 relative overflow-hidden"
              style={{ boxShadow: '0 4px 40px rgba(0, 229, 255, 0.1)' }}
            >
              {/* Accent glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-20"
                style={{
                  background: 'radial-gradient(circle at top right, #00e5ff, transparent 70%)'
                }}
              />
              
              <div className="flex items-center gap-4 mb-5 relative">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#00e5ff]/20 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--surface)] to-[var(--void)] flex items-center justify-center">
                    <span className="text-2xl">🏛️</span>
                  </div>
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-white tracking-wide">
                    NOCTIS AURELIUS
                  </div>
                  <div className="text-xs text-[#00e5ff] font-mono tracking-wider">
                    AI ASSISTANT
                  </div>
                </div>
              </div>
              
              <blockquote className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-5 pl-4 border-l-2 border-[#00e5ff]/30">
                "The impediment to action advances action. What stands in the way becomes the way."
              </blockquote>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="status-beacon status-active" />
                  <span className="text-xs text-[#30d158] font-mono">
                    READY TO ASSIST
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                KIRBY HOLDINGS COMMAND CENTER • BUILT BY NOCTIS
              </span>
            </div>
            <div className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              DAY 1 • JUNE 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
