'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, Trash2, X, Loader2, Check } from 'lucide-react';

interface Draft {
  id: string;
  text: string;
  createdAt: number;
}

export function DraftQueue() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDraft, setNewDraft] = useState('');
  const [postingId, setPostingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Load drafts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tweet-drafts');
    if (saved) {
      setDrafts(JSON.parse(saved));
    }
  }, []);

  // Save drafts to localStorage
  const saveDrafts = (newDrafts: Draft[]) => {
    setDrafts(newDrafts);
    localStorage.setItem('tweet-drafts', JSON.stringify(newDrafts));
  };

  const addDraft = () => {
    if (!newDraft.trim()) return;
    const draft: Draft = {
      id: Date.now().toString(),
      text: newDraft.trim(),
      createdAt: Date.now(),
    };
    saveDrafts([draft, ...drafts]);
    setNewDraft('');
    setIsAdding(false);
  };

  const deleteDraft = (id: string) => {
    saveDrafts(drafts.filter(d => d.id !== id));
  };

  const postDraft = async (draft: Draft) => {
    setPostingId(draft.id);
    try {
      const response = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft.text }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessId(draft.id);
        setTimeout(() => {
          deleteDraft(draft.id);
          setSuccessId(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPostingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#ff9500]/10">
            <FileText className="w-4 h-4 text-[#ff9500]" />
          </div>
          <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
            Draft Queue
          </h2>
          {drafts.length > 0 && (
            <span className="text-xs text-[var(--text-muted)] font-mono">{drafts.length}</span>
          )}
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isAdding ? (
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <Plus className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <textarea
              value={newDraft}
              onChange={(e) => setNewDraft(e.target.value)}
              placeholder="Save a tweet for later..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#ff9500]/50 focus:outline-none text-white placeholder-[var(--text-muted)] text-sm resize-none transition-colors"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${newDraft.length > 280 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                {newDraft.length}/280
              </span>
              <button
                onClick={addDraft}
                disabled={!newDraft.trim() || newDraft.length > 280}
                className="px-4 py-2 rounded-lg bg-[#ff9500]/20 hover:bg-[#ff9500]/30 text-[#ff9500] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Draft
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {drafts.length === 0 ? (
        <div className="text-center py-6 text-[var(--text-muted)] text-sm">
          No drafts yet. Save tweets for later.
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {drafts.map((draft) => (
            <motion.div
              key={draft.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] group"
            >
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-3">
                {draft.text}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {draft.text.length}/280
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => postDraft(draft)}
                    disabled={postingId === draft.id || successId === draft.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/30 text-[#1d9bf0] text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    {postingId === draft.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : successId === draft.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>{successId === draft.id ? 'Posted!' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
