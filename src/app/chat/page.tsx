'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Chat } from '@/components/Chat';

export default function ChatPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Dramatic background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" />
              </Link>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-[#00e5ff]/10">
                  <Sparkles className="w-5 h-5 text-[#00e5ff]" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold tracking-wider text-white uppercase">
                    Chat with Noctis
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono tracking-wider">
                    AI ASSISTANT • DIRECT LINE
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#30d158]/10 border border-[#30d158]/20"
            >
              <span className="status-beacon status-active" style={{ width: 8, height: 8 }} />
              <span className="text-sm font-mono text-[#30d158]">READY</span>
            </motion.div>
          </div>
        </div>

        {/* Dramatic divider */}
        <div className="divider-glow" />
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 glass-panel overflow-hidden"
          style={{
            minHeight: 'calc(100vh - 200px)',
            boxShadow: '0 8px 40px rgba(0, 229, 255, 0.08)',
          }}
        >
          <Chat variant="full" />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              KIRBY HOLDINGS • NOCTIS INTERFACE v1.0
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              ENCRYPTED CHANNEL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
