'use client';

import { motion } from 'framer-motion';
import { 
  Linkedin, 
  Instagram, 
  Facebook,
  Eye,
  Type
} from 'lucide-react';
import { XIcon } from '@/components/icons/XIcon';

export function PlatformPreviews() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#1d9bf0]/10">
          <Eye className="w-5 h-5 text-[#1d9bf0]" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Post Preview</h3>
          <p className="text-xs text-[var(--text-muted)]">How your post will appear</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="space-y-4">
        {/* X Preview placeholder */}
        <div className="bg-white/5 rounded-xl p-6 border border-dashed border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <XIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-[var(--text-muted)]">X</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Type className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                Start typing in the composer to see preview
              </p>
            </div>
          </div>
        </div>

        {/* LinkedIn Preview placeholder */}
        <div className="bg-white/5 rounded-xl p-6 border border-dashed border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Linkedin className="w-4 h-4 text-[#0a66c2]" />
            <span className="text-xs font-medium text-[var(--text-muted)]">LinkedIn</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Type className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                LinkedIn preview will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Instagram Preview placeholder */}
        <div className="bg-white/5 rounded-xl p-6 border border-dashed border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Instagram className="w-4 h-4 text-[#e4405f]" />
            <span className="text-xs font-medium text-[var(--text-muted)]">Instagram</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Instagram className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                Requires image attachment
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Preview placeholder */}
        <div className="bg-white/5 rounded-xl p-6 border border-dashed border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Facebook className="w-4 h-4 text-[#1877f2]" />
            <span className="text-xs font-medium text-[var(--text-muted)]">Facebook</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Type className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                Facebook preview will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-[var(--text-muted)] text-center">
          💡 Live previews coming soon — for now, compose and post directly
        </p>
      </div>
    </motion.div>
  );
}
