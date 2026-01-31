'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Navigation } from './Navigation';

export function Header() {
  const now = new Date();
  
  return (
    <header className="relative">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[var(--void)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo/Brand - Compact */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--matrix)] shadow-[0_0_12px_var(--matrix-glow)]" />
            <span className="font-display text-sm md:text-base font-bold tracking-wider text-white">
              COMMAND CENTER
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <Navigation />
          
          {/* Right side: Time + Avatar (desktop) / Hamburger (mobile) */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Compact Time - Desktop only */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <span>{format(now, 'MMM d')}</span>
              <span className="text-[var(--text-secondary)]">{format(now, 'HH:mm')}</span>
            </div>
            
            {/* Noctis Avatar - Smaller on mobile */}
            <div className="relative hidden sm:block">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden border border-[var(--plasma)]/30">
                <div className="w-full h-full bg-gradient-to-br from-[var(--surface)] to-[var(--void)] flex items-center justify-center">
                  <span className="text-lg md:text-xl">🏛️</span>
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--matrix)] border-2 border-[var(--void)]" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section - Dramatic and Bold */}
      <div className="relative py-8 md:py-12 px-4 md:px-8 overflow-hidden">
        {/* Animated accent lines */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: 'linear-gradient(90deg, var(--ember), var(--plasma), transparent)' }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
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
                className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-4"
              >
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--matrix)] shadow-[0_0_12px_var(--matrix-glow)]" />
                <span className="text-xs md:text-sm font-mono text-[var(--text-secondary)] tracking-widest uppercase">
                  System Online
                </span>
              </motion.div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2 md:mb-3">
                <span className="bg-gradient-to-r from-white via-white to-[var(--text-secondary)] bg-clip-text text-transparent">
                  COMMAND
                </span>
                <br />
                <span className="bg-gradient-to-r from-[var(--ember)] to-[var(--warning)] bg-clip-text text-transparent">
                  CENTER
                </span>
              </h1>
              
              <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-md">
                Kirby Holdings • Mission Control
              </p>
            </motion.div>

            {/* Center: Time Display - Dramatic (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:flex flex-col items-center glass-panel px-8 py-5"
            >
              <div className="font-display text-4xl xl:text-5xl font-bold tracking-widest text-white mb-1">
                {format(now, 'HH:mm')}
              </div>
              <div className="font-mono text-xs text-[var(--text-muted)] tracking-wider uppercase">
                {format(now, 'EEEE')}
              </div>
              <div className="font-mono text-sm text-[var(--text-secondary)]">
                {format(now, 'MMM d, yyyy')}
              </div>
            </motion.div>

            {/* Right: Noctis Avatar - Full version (hidden on smaller screens) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:flex items-center gap-4"
            >
              <div className="text-right">
                <div className="font-display text-lg font-semibold text-white tracking-wide">
                  NOCTIS
                </div>
                <div className="text-xs text-[var(--plasma)] font-mono flex items-center justify-end gap-2">
                  <span className="status-beacon status-active" />
                  READY
                </div>
              </div>
              <div className="relative">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl overflow-hidden border-2 border-[var(--plasma)]/30 shadow-[0_0_30px_var(--plasma-glow)]">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--surface)] to-[var(--void)] flex items-center justify-center">
                    <span className="text-2xl lg:text-3xl">🏛️</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[var(--matrix)] border-2 border-[var(--void)] shadow-[0_0_10px_var(--matrix-glow)]" />
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
