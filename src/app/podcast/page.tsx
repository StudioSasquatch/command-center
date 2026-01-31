'use client';

import { Header } from '@/components/Header';
import { PodcastHub } from '@/components/PodcastHub';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PodcastPage() {
  return (
    <div className="min-h-screen relative">
      {/* Dramatic background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          Back to Dashboard
        </Link>

        {/* Podcast Hub */}
        <PodcastHub />
      </main>

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 sm:mt-16 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
                KIRBY HOLDINGS • PODCAST HUB
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
