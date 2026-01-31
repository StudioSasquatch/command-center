// ============================================
// PODCAST DATA - Startups & Suits
// ============================================

export type EpisodeStatus = 'idea' | 'scheduled' | 'recorded' | 'editing' | 'published';
export type GuestStatus = 'researching' | 'outreach' | 'confirmed' | 'scheduled' | 'completed';
export type ClipStatus = 'pending' | 'created' | 'posted';

export interface Episode {
  id: string;
  title: string;
  guest: string;
  guestCompany?: string;
  date: Date;
  status: EpisodeStatus;
  description?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  topics?: string[];
}

export interface Guest {
  id: string;
  name: string;
  company: string;
  title: string;
  topic: string;
  status: GuestStatus;
  scheduledDate?: Date;
  linkedIn?: string;
  twitter?: string;
  notes?: string;
}

export interface Clip {
  id: string;
  episodeId: string;
  episodeTitle: string;
  title: string;
  timestamp?: string;
  duration?: string;
  status: ClipStatus;
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter';
  url?: string;
}

// ============================================
// EPISODES
// ============================================

export const episodes: Episode[] = [
  {
    id: 'ep-001',
    title: 'Building the Future of iGaming',
    guest: 'Michael Jin',
    guestCompany: 'Jin Ventures',
    date: new Date('2026-02-20'),
    status: 'scheduled',
    description: 'Pilot episode - discussing the intersection of AI and online gaming',
    topics: ['AI in iGaming', 'Startup Journey', 'Crypto Casinos'],
  },
  {
    id: 'ep-002',
    title: 'From Corporate to Crypto',
    guest: 'TBD',
    date: new Date('2026-02-27'),
    status: 'idea',
    description: 'Career transitions and building in Web3',
    topics: ['Career Pivots', 'Web3', 'Entrepreneurship'],
  },
  {
    id: 'ep-003',
    title: 'The AI Revolution in Business',
    guest: 'TBD',
    date: new Date('2026-03-06'),
    status: 'idea',
    description: 'How AI is transforming traditional industries',
    topics: ['AI Tools', 'Business Automation', 'Future of Work'],
  },
];

// ============================================
// GUEST PIPELINE
// ============================================

export const guests: Guest[] = [
  {
    id: 'guest-001',
    name: 'Michael Jin',
    company: 'Jin Ventures',
    title: 'Co-founder',
    topic: 'Building the Future of iGaming',
    status: 'confirmed',
    scheduledDate: new Date('2026-02-20'),
    twitter: '@michaeljin',
    notes: 'Co-host for the podcast',
  },
  {
    id: 'guest-002',
    name: 'Borut Tomazin',
    company: 'Timeless Tech',
    title: 'CEO',
    topic: 'AI Solutions for iGaming',
    status: 'researching',
    notes: 'Pending response on Timeless partnership',
  },
  {
    id: 'guest-003',
    name: 'Gabriel Rodriguez',
    company: 'Gaming Consultant',
    title: 'Advisor',
    topic: 'Scaling iGaming Operations',
    status: 'outreach',
    notes: 'Intro through Timeless Tech connection',
  },
  {
    id: 'guest-004',
    name: 'TBD - AI Founder',
    company: 'AI Startup',
    title: 'Founder',
    topic: 'AI Tools for Entrepreneurs',
    status: 'researching',
    notes: 'Looking for compelling AI founder story',
  },
];

// ============================================
// CLIPS QUEUE
// ============================================

export const clips: Clip[] = [
  {
    id: 'clip-001',
    episodeId: 'ep-001',
    episodeTitle: 'Building the Future of iGaming',
    title: 'Why AI is Changing Online Casinos',
    timestamp: '12:34',
    duration: '60s',
    status: 'pending',
  },
  {
    id: 'clip-002',
    episodeId: 'ep-001',
    episodeTitle: 'Building the Future of iGaming',
    title: 'The Biggest Mistake New Founders Make',
    timestamp: '28:15',
    duration: '45s',
    status: 'pending',
  },
  {
    id: 'clip-003',
    episodeId: 'ep-001',
    episodeTitle: 'Building the Future of iGaming',
    title: 'Crypto vs Traditional Banking for Gaming',
    timestamp: '41:22',
    duration: '90s',
    status: 'pending',
  },
];

// ============================================
// PODCAST STATS
// ============================================

export const podcastStats = {
  totalEpisodes: episodes.length,
  publishedEpisodes: episodes.filter(e => e.status === 'published').length,
  scheduledEpisodes: episodes.filter(e => e.status === 'scheduled').length,
  totalClips: clips.length,
  postedClips: clips.filter(c => c.status === 'posted').length,
  guestsInPipeline: guests.filter(g => g.status !== 'completed').length,
  confirmedGuests: guests.filter(g => g.status === 'confirmed' || g.status === 'scheduled').length,
};
