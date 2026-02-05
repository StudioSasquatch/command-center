'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Palette, 
  FileEdit, 
  BarChart3, 
  Bot, 
  Mail,
  MessageSquare,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Toast {
  id: string;
  message: string;
}

export function QuickActionsBar() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const actions = [
    { 
      icon: MessageSquare, 
      label: 'Chat with Noctis', 
      emoji: '💬',
      color: '#00e5ff',
      href: '/chat'
    },
    { 
      icon: TrendingUp, 
      label: 'Trader Hub', 
      emoji: '📈',
      color: '#00e676',
      href: '/trading'
    },
    { 
      icon: Palette, 
      label: 'Generate Graphic', 
      emoji: '🎨',
      color: '#bf5af2',
      onClick: () => showToast('🎨 Generate Graphic - Coming soon!')
    },
    { 
      icon: FileEdit, 
      label: 'Draft Tweet', 
      emoji: '📝',
      color: '#1d9bf0',
      href: '/content'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      emoji: '📊',
      color: '#30d158',
      onClick: () => showToast('📊 Analytics - Coming soon!')
    },
    { 
      icon: Bot, 
      label: 'Spawn Agent', 
      emoji: '🤖',
      color: '#ff9100',
      onClick: () => showToast('🤖 Spawn Agent - Coming soon!')
    },
  ];

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[60] space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="glass-panel px-5 py-3 flex items-center gap-3 shadow-2xl"
              style={{ 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Zap className="w-4 h-4 text-[#ffd60a]" />
              <span className="text-sm text-white font-medium">{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, type: 'spring', bounce: 0.3 }}
        className="fixed bottom-4 sm:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50"
      >
        <div 
          className="flex items-center justify-around sm:justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl overflow-x-auto scrollbar-none"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 229, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            const ButtonContent = (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="group relative flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 min-w-[56px] sm:min-w-0"
                style={{
                  background: 'transparent',
                }}
              >
                {/* Hover glow */}
                <div 
                  className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${action.color}20, transparent 70%)`,
                  }}
                />
                
                {/* Icon container */}
                <div 
                  className="relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${action.color}15`,
                    boxShadow: `0 0 0 1px ${action.color}30`,
                  }}
                >
                  <Icon 
                    className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"
                    style={{ color: action.color }}
                  />
                  
                  {/* Emoji overlay on hover - hidden on mobile */}
                  <motion.span 
                    className="absolute -top-1 -right-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
                    initial={false}
                  >
                    {action.emoji}
                  </motion.span>
                </div>
                
                {/* Label */}
                <span className="text-[8px] sm:text-[10px] font-mono text-[var(--text-muted)] group-hover:text-white tracking-wider uppercase transition-colors whitespace-nowrap">
                  {action.label.split(' ')[0]}
                </span>
              </motion.button>
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}>
                  {ButtonContent}
                </Link>
              );
            }

            return ButtonContent;
          })}
        </div>
      </motion.div>
    </>
  );
}
