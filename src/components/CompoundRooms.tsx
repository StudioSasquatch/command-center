'use client';

import { motion } from 'framer-motion';
import { compoundRooms } from '@/lib/data';
import { ExternalLink } from 'lucide-react';

export function CompoundRooms() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-[#30d158] bg-[#30d158]/10';
      case 'building': return 'text-[#ffd60a] bg-[#ffd60a]/10';
      case 'planned': return 'text-[var(--text-muted)] bg-white/5';
      default: return 'text-[var(--text-muted)] bg-white/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#bf5af2]/10">
            <span className="text-xl">🎲</span>
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-white uppercase">
              The Compound
            </h2>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">Multi-room social gaming platform</p>
          </div>
        </div>
        <a
          href="https://thecompound.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#bf5af2]/10 hover:bg-[#bf5af2]/20 border border-[#bf5af2]/20 transition-all group text-xs font-mono self-start sm:self-auto"
        >
          <span className="text-[#bf5af2]">thecompound.gg</span>
          <ExternalLink className="w-3 h-3 text-[#bf5af2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {compoundRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
            className="relative p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] transition-all group cursor-pointer"
          >
            {/* Status badge */}
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${getStatusColor(room.status)}`}>
              {room.status}
            </div>
            
            {/* Room emoji */}
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
              {room.emoji}
            </div>
            
            {/* Room name */}
            <div className="font-display text-[10px] sm:text-xs font-bold text-white tracking-wide uppercase mb-0.5 sm:mb-1">
              {room.name}
            </div>
            
            {/* Description */}
            <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
              {room.description}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
