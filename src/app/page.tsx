'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { QuickStats } from '@/components/QuickStats';
import { ProjectCard } from '@/components/ProjectCard';
import { TweetComposer } from '@/components/TweetComposer';
import { DraftQueue } from '@/components/DraftQueue';
import { projects } from '@/lib/data';
import { 
  Rocket, 
  Sparkles,
  Megaphone,
  Calendar,
  ArrowRight,
  Mic,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { AgentSwarm } from '@/components/AgentSwarm';
import { LaunchCountdown } from '@/components/LaunchCountdown';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default function Dashboard() {
  const ventures = projects.filter(p => p.category === 'venture');

  return (
    <div className="min-h-screen relative">
      {/* Dramatic background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {/* Launch Countdown */}
        <section>
          <LaunchCountdown />
        </section>

        {/* Quick Stats */}
        <section>
          <QuickStats />
        </section>

        {/* Agent Swarm */}
        <AgentSwarm />

        {/* Ventures */}
        <section>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#ff5722]/10">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff5722]" />
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
              Ventures
            </h2>
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
              {ventures.length} ACTIVE
            </span>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {ventures.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </section>

        {/* Content Hub */}
        <section>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#1d9bf0]/10">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d9bf0]" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                Content Hub
              </h2>
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider hidden sm:inline">
                @JKIRBY_ETH
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <Link 
                href="/podcast"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#bf5af2]/10 hover:bg-[#bf5af2]/20 border border-[#bf5af2]/20 transition-all group flex-shrink-0"
              >
                <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-[#bf5af2]" />
                <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">Podcast</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/content"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group flex-shrink-0"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#1d9bf0]" />
                <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">Calendar</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
            <TweetComposer />
            <DraftQueue />
          </div>
        </section>

        {/* Analytics Dashboard */}
        <section>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#00e5ff]/10">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00e5ff]" />
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
              Analytics
            </h2>
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider hidden sm:inline">
              PERFORMANCE METRICS
            </span>
          </motion.div>
          
          <AnalyticsDashboard />
        </section>
      </main>

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 sm:mt-16 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
                KIRBY HOLDINGS • BUILT BY NOCTIS
              </span>
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
              v2.0 • JAN 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
