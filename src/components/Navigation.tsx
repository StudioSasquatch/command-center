'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Calendar,
  Mic,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Share2,
  TrendingUp,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
    color: '#00e5ff',
    description: 'Command center overview',
  },
  {
    href: '/social',
    label: 'Social Hub',
    icon: Share2,
    color: '#ff5722',
    description: 'Multi-platform posting',
  },
  {
    href: '/content',
    label: 'Content Calendar',
    icon: Calendar,
    color: '#1d9bf0',
    description: 'X posts & scheduling',
  },
  {
    href: '/podcast',
    label: 'Podcast Hub',
    icon: Mic,
    color: '#bf5af2',
    description: 'Startups & Suits',
  },
  {
    href: '/betting',
    label: 'Betting Hub',
    icon: TrendingUp,
    color: '#a855f7',
    description: 'Polymarket trading',
  },
  {
    href: '/trading',
    label: 'Trading Agent',
    icon: TrendingUp,
    color: '#06b6d4',
    description: 'Robinhood stocks',
  },
  {
    href: '/swarm',
    label: 'Agent Swarm',
    icon: Sparkles,
    color: '#a78bfa',
    description: 'Your AI workforce',
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: MessageCircle,
    color: '#30d158',
    description: 'AI Assistant',
    comingSoon: true,
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Wait for client-side mount before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation - Horizontal in Header */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isDisabled = item.comingSoon;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="relative px-4 py-2 rounded-lg text-[var(--text-muted)] cursor-not-allowed flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-muted)]">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? item.color : undefined }}
              />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Slide-out Menu - Rendered via Portal to avoid stacking context issues */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
                style={{ touchAction: 'none' }}
              />

              {/* Slide-out Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0f] border-l border-white/10 z-[101] md:hidden overflow-y-auto"
                style={{ backgroundColor: 'var(--void, #0a0a0f)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00e5ff]" />
                    <span className="font-display text-sm font-bold tracking-wider text-white uppercase">
                      Navigation
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Nav Items */}
                <div className="p-4 space-y-2 pb-24">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isDisabled = item.comingSoon;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {isDisabled ? (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] opacity-50 cursor-not-allowed">
                            <div
                              className="p-3 rounded-lg"
                              style={{ backgroundColor: `${item.color}15` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-bold text-white">
                                  {item.label}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                                  Coming Soon
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                              isActive
                                ? 'bg-white/10 border border-white/20'
                                : 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05]'
                            }`}
                            style={{
                              borderColor: isActive ? `${item.color}40` : undefined,
                            }}
                          >
                            <div
                              className="p-3 rounded-lg"
                              style={{ backgroundColor: `${item.color}15` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1">
                              <span className="font-display text-sm font-bold text-white block">
                                {item.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.description}
                              </span>
                            </div>
                            {isActive ? (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0a0a0f]" style={{ backgroundColor: 'var(--void, #0a0a0f)' }}>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-[10px] text-gray-500 tracking-wider">
                      KIRBY HOLDINGS • v2.0
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
