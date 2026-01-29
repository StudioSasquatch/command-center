'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function Header() {
  const now = new Date();
  
  return (
    <header className="relative">
      {/* Hero Section - Dramatic and Bold */}
      <div className="relative py-12 px-8 overflow-hidden">
        {/* Animated accent lines */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: 'linear-gradient(90deg, var(--ember), var(--plasma), transparent)' }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-8">
            {/* Left: Branding - Big and Bold */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-3 h-3 rounded-full bg-[var(--matrix)] shadow-[0_0_12px_var(--matrix-glow)]" />
                <span className="text-sm font-mono text-[var(--text-secondary)] tracking-widest uppercase">
                  System Online
                </span>
              </motion.div>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3">
                <span className="bg-gradient-to-r from-white via-white to-[var(--text-secondary)] bg-clip-text text-transparent">
                  COMMAND
                </span>
                <br />
                <span className="bg-gradient-to-r from-[var(--ember)] to-[var(--warning)] bg-clip-text text-transparent">
                  CENTER
                </span>
              </h1>
              
              <p className="text-[var(--text-secondary)] text-lg max-w-md">
                Kirby Holdings • Mission Control
              </p>
            </motion.div>

            {/* Center: Time Display - Dramatic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:flex flex-col items-center glass-panel px-10 py-6"
            >
              <div className="font-display text-5xl font-bold tracking-widest text-white mb-1">
                {format(now, 'HH:mm')}
              </div>
              <div className="font-mono text-xs text-[var(--text-muted)] tracking-wider uppercase">
                {format(now, 'EEEE')}
              </div>
              <div className="font-mono text-sm text-[var(--text-secondary)]">
                {format(now, 'MMM d, yyyy')}
              </div>
            </motion.div>

            {/* Right: Noctis Avatar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="text-right hidden sm:block">
                <div className="font-display text-lg font-semibold text-white tracking-wide">
                  NOCTIS
                </div>
                <div className="text-xs text-[var(--plasma)] font-mono flex items-center justify-end gap-2">
                  <span className="status-beacon status-active" />
                  READY
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--plasma)]/30 shadow-[0_0_30px_var(--plasma-glow)]">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--surface)] to-[var(--void)] flex items-center justify-center">
                    <span className="text-3xl">🏛️</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--matrix)] border-2 border-[var(--void)] shadow-[0_0_10px_var(--matrix-glow)]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dramatic divider */}
      <div className="divider-glow" />
    </header>
  );
}
