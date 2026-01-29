'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, Loader2, Check, Sparkles } from 'lucide-react';

export function InboxCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: input.trim() }),
      });

      if (response.ok) {
        setStatus('success');
        setInput('');
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 1500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] hover:border-[#30d158]/30 transition-all text-left flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-[#30d158]/10 group-hover:bg-[#30d158]/20 transition-colors">
              <Plus className="w-4 h-4 text-[#30d158]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Add to Inbox</div>
              <div className="text-xs text-[var(--text-muted)]">Quick capture</div>
            </div>
          </motion.button>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            onSubmit={handleSubmit}
            className="p-4 rounded-xl bg-[#30d158]/5 border border-[#30d158]/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#30d158]" />
              <span className="text-sm font-semibold text-white">Quick Capture</span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What's on your mind?"
                autoFocus
                disabled={status === 'loading' || status === 'success'}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[#30d158]/50 focus:outline-none text-white placeholder-[var(--text-muted)] text-sm font-mono transition-colors"
              />
              
              <button
                type="submit"
                disabled={!input.trim() || status === 'loading' || status === 'success'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#30d158]/20 hover:bg-[#30d158]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 text-[#30d158] animate-spin" />}
                {status === 'success' && <Check className="w-4 h-4 text-[#30d158]" />}
                {(status === 'idle' || status === 'error') && <Send className="w-4 h-4 text-[#30d158]" />}
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setInput('');
                  setStatus('idle');
                }}
                className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              {status === 'error' && (
                <span className="text-xs text-red-400">Failed to save</span>
              )}
              {status === 'success' && (
                <span className="text-xs text-[#30d158]">Captured!</span>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
