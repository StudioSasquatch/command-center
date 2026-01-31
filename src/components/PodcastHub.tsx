'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Users,
  Scissors,
  ChevronDown,
  ChevronUp,
  Youtube,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Radio,
  Waves,
} from 'lucide-react';
import {
  episodes,
  guests,
  clips,
  podcastStats,
  type Episode,
  type Guest,
  type Clip,
  type EpisodeStatus,
  type GuestStatus,
  type ClipStatus,
} from '@/lib/podcast-data';

// Status badge colors
const episodeStatusColors: Record<EpisodeStatus, { bg: string; text: string; label: string }> = {
  idea: { bg: 'bg-white/10', text: 'text-white/60', label: 'Idea' },
  scheduled: { bg: 'bg-[#ffd60a]/10', text: 'text-[#ffd60a]', label: 'Scheduled' },
  recorded: { bg: 'bg-[#00e5ff]/10', text: 'text-[#00e5ff]', label: 'Recorded' },
  editing: { bg: 'bg-[#bf5af2]/10', text: 'text-[#bf5af2]', label: 'Editing' },
  published: { bg: 'bg-[#30d158]/10', text: 'text-[#30d158]', label: 'Published' },
};

const guestStatusColors: Record<GuestStatus, { bg: string; text: string; label: string }> = {
  researching: { bg: 'bg-white/10', text: 'text-white/60', label: 'Researching' },
  outreach: { bg: 'bg-[#ffd60a]/10', text: 'text-[#ffd60a]', label: 'Outreach' },
  confirmed: { bg: 'bg-[#00e5ff]/10', text: 'text-[#00e5ff]', label: 'Confirmed' },
  scheduled: { bg: 'bg-[#bf5af2]/10', text: 'text-[#bf5af2]', label: 'Scheduled' },
  completed: { bg: 'bg-[#30d158]/10', text: 'text-[#30d158]', label: 'Completed' },
};

const clipStatusColors: Record<ClipStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-[#ffd60a]/10', text: 'text-[#ffd60a]', label: 'Pending' },
  created: { bg: 'bg-[#00e5ff]/10', text: 'text-[#00e5ff]', label: 'Created' },
  posted: { bg: 'bg-[#30d158]/10', text: 'text-[#30d158]', label: 'Posted' },
};

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  iconColor,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  badge?: string | number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-bold tracking-wider text-white uppercase">
            {title}
          </h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-[var(--text-muted)]">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Episode Card
function EpisodeCard({ episode, index }: { episode: Episode; index: number }) {
  const status = episodeStatusColors[episode.status];
  const formattedDate = episode.date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
          <h4 className="font-display text-sm font-bold text-white mb-1 truncate">
            {episode.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            Guest: <span className="text-[var(--text-secondary)]">{episode.guest}</span>
            {episode.guestCompany && (
              <span className="text-[var(--text-muted)]"> • {episode.guestCompany}</span>
            )}
          </p>
          {episode.topics && (
            <div className="flex flex-wrap gap-1 mt-2">
              {episode.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-full bg-[#bf5af2]/10 text-[10px] text-[#bf5af2] font-mono"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
        {episode.status === 'published' && (
          <div className="flex gap-2">
            {episode.youtubeUrl && (
              <a
                href={episode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#ff0000]/10 hover:bg-[#ff0000]/20 transition-colors"
              >
                <Youtube className="w-4 h-4 text-[#ff0000]" />
              </a>
            )}
            {episode.spotifyUrl && (
              <a
                href={episode.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#1db954]/10 hover:bg-[#1db954]/20 transition-colors"
              >
                <Radio className="w-4 h-4 text-[#1db954]" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Guest Card
function GuestCard({ guest, index }: { guest: Guest; index: number }) {
  const status = guestStatusColors[guest.status];
  const formattedDate = guest.scheduledDate?.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {formattedDate && (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
          </div>
          <h4 className="font-display text-sm font-bold text-white mb-0.5">
            {guest.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            {guest.title} @ <span className="text-[var(--text-secondary)]">{guest.company}</span>
          </p>
          <p className="text-xs text-[#bf5af2] mt-1">
            Topic: {guest.topic}
          </p>
          {guest.notes && (
            <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">
              {guest.notes}
            </p>
          )}
        </div>
        {(guest.twitter || guest.linkedIn) && (
          <div className="flex gap-1">
            {guest.twitter && (
              <a
                href={`https://twitter.com/${guest.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Clip Card
function ClipCard({ clip, index, onGenerate }: { clip: Clip; index: number; onGenerate: () => void }) {
  const status = clipStatusColors[clip.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {clip.duration && (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {clip.duration}
              </span>
            )}
          </div>
          <h4 className="font-display text-sm font-bold text-white mb-0.5">
            {clip.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            From: <span className="text-[var(--text-secondary)]">{clip.episodeTitle}</span>
            {clip.timestamp && <span> @ {clip.timestamp}</span>}
          </p>
        </div>
        {clip.status === 'pending' && (
          <button
            onClick={onGenerate}
            className="px-3 py-1.5 rounded-lg bg-[#bf5af2]/10 hover:bg-[#bf5af2]/20 border border-[#bf5af2]/20 transition-all flex items-center gap-2 group"
          >
            <Sparkles className="w-3 h-3 text-[#bf5af2] group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-mono text-[#bf5af2]">Generate</span>
          </button>
        )}
        {clip.status === 'posted' && clip.url && (
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// Stats Bar
function StatsBar() {
  const stats = [
    { label: 'Episodes', value: podcastStats.totalEpisodes, icon: Mic, color: 'text-[#bf5af2]' },
    { label: 'Published', value: podcastStats.publishedEpisodes, icon: Play, color: 'text-[#30d158]' },
    { label: 'Scheduled', value: podcastStats.scheduledEpisodes, icon: Calendar, color: 'text-[#ffd60a]' },
    { label: 'Clips', value: podcastStats.totalClips, icon: Scissors, color: 'text-[#00e5ff]' },
    { label: 'Guests', value: podcastStats.guestsInPipeline, icon: Users, color: 'text-[#ff5722]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3 sm:p-4"
    >
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`text-center ${index >= 3 ? 'hidden sm:block' : ''}`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
              <span className="font-display text-lg sm:text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-[#bf5af2]/90 backdrop-blur-xl border border-[#bf5af2]/30 shadow-2xl z-50"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-white animate-pulse" />
        <span className="text-sm font-medium text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/60 hover:text-white">
          ×
        </button>
      </div>
    </motion.div>
  );
}

// Main Podcast Hub Component
export function PodcastHub() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateClip = (clipTitle: string) => {
    showToast(`🎬 Generating clip: "${clipTitle}"...`);
  };

  return (
    <div className="space-y-6">
      {/* Header with waveform accent */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-panel p-6 overflow-hidden"
      >
        {/* Waveform background accent */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bf5af2" />
                <stop offset="50%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#bf5af2" />
              </linearGradient>
            </defs>
            {[...Array(60)].map((_, i) => (
              <rect
                key={i}
                x={i * 20 + 2}
                y={50 - Math.sin(i * 0.3) * 30 - Math.random() * 10}
                width="4"
                height={Math.sin(i * 0.3) * 60 + Math.random() * 20 + 10}
                fill="url(#waveGradient)"
                rx="2"
              />
            ))}
          </svg>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#bf5af2]/20 to-[#00e5ff]/20 border border-[#bf5af2]/20">
            <Mic className="w-8 h-8 text-[#bf5af2]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider text-white uppercase">
              Startups & Suits
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              The intersection of AI, entrepreneurship, and iGaming • with Jeremy & Michael
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Waves className="w-5 h-5 text-[#bf5af2] animate-pulse" />
            <span className="text-xs font-mono text-[#bf5af2] uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Episodes Section */}
        <CollapsibleSection
          title="Episodes"
          icon={Play}
          iconColor="bg-[#bf5af2]/10 text-[#bf5af2]"
          badge={episodes.length}
        >
          <div className="space-y-3">
            {episodes.map((episode, index) => (
              <EpisodeCard key={episode.id} episode={episode} index={index} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Guest Pipeline */}
        <CollapsibleSection
          title="Guest Pipeline"
          icon={Users}
          iconColor="bg-[#ff5722]/10 text-[#ff5722]"
          badge={guests.length}
        >
          <div className="space-y-3">
            {guests.map((guest, index) => (
              <GuestCard key={guest.id} guest={guest} index={index} />
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Clips Queue - Full Width */}
      <CollapsibleSection
        title="Clips Queue"
        icon={Scissors}
        iconColor="bg-[#00e5ff]/10 text-[#00e5ff]"
        badge={clips.filter((c) => c.status === 'pending').length + ' pending'}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {clips.map((clip, index) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              index={index}
              onGenerate={() => handleGenerateClip(clip.title)}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Toast */}
      <AnimatePresence>{toast && <Toast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
