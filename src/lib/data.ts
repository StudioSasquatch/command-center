import { Project, Activity } from '@/types';

// ============================================
// PROJECT DATA - Noctis updates this file
// Last updated: 2026-01-30 @ Ada
// ============================================

export const projects: Project[] = [
  {
    id: 'drizzle',
    name: 'Drizzle',
    description: 'Crypto Casino & Sportsbook - V2 Launch',
    status: 'active',
    priority: 1,
    progress: 75,
    nextAction: 'Create game thumbnails + promo assets',
    category: 'venture',
    accentColor: 'orange',
    metrics: [
      { label: 'Launch', value: 'Feb 15' },
      { label: 'Days Left', value: '17' },
      { label: 'Q1 Budget', value: '$50K' },
    ],
  },
  {
    id: 'the-compound',
    name: '🎲 The Compound',
    description: 'Multi-room social gaming platform',
    status: 'active',
    priority: 1,
    progress: 40,
    nextAction: 'Build out room experiences',
    category: 'venture',
    accentColor: 'purple',
    metrics: [
      { label: 'Rooms', value: '6' },
      { label: 'URL', value: 'thecompound.gg' },
      { label: 'Status', value: 'In Dev' },
    ],
  },
  {
    id: 'timeless-tech',
    name: 'Timeless Tech',
    description: 'AI Solutions for iGaming - Partnership',
    status: 'blocked',
    priority: 2,
    progress: 25,
    nextAction: 'Awaiting response from Borut & Nicola',
    category: 'venture',
    accentColor: 'cyan',
    metrics: [
      { label: 'Casinos', value: '40+' },
      { label: 'Status', value: 'Post-Barcelona' },
    ],
  },
  {
    id: 'styled-ai',
    name: 'Styled AI',
    description: 'AI Personal Stylist iOS App',
    status: 'active',
    priority: 3,
    progress: 70,
    nextAction: 'QA + improvements → App Store submission',
    category: 'venture',
    accentColor: 'purple',
    metrics: [
      { label: 'Stage', value: 'QA' },
      { label: 'Landing', value: 'getstyled.app' },
    ],
  },
  {
    id: 'ai-casino-solutions',
    name: 'AI Casino Solutions',
    description: 'Future Spinoff with Gabriel',
    status: 'pending',
    priority: 4,
    progress: 5,
    nextAction: 'Blocked by Timeless Tech progress',
    category: 'venture',
    accentColor: 'green',
    metrics: [
      { label: 'Partners', value: 'Borut, Nicola, Gabriel' },
      { label: 'Dependency', value: 'Timeless Tech' },
    ],
  },
  {
    id: 'publishhub',
    name: '📝 PublishHub',
    description: 'SEO content network for Drizzle',
    status: 'active',
    priority: 2,
    progress: 80,
    nextAction: 'Create content strategy + publish articles',
    category: 'venture',
    accentColor: 'blue',
    metrics: [
      { label: 'URL', value: 'publishhub.io' },
      { label: 'Purpose', value: 'SEO Capture' },
      { label: 'Parent', value: 'Drizzle' },
    ],
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Personal Brand + Startups & Suits Pod',
    status: 'active',
    priority: 4,
    progress: 30,
    nextAction: 'Build LinkedIn presence',
    category: 'content',
    accentColor: 'amber',
    metrics: [
      { label: 'Podcast', value: 'Startups & Suits' },
      { label: 'Co-host', value: 'Michael Jin' },
    ],
  },
  {
    id: 'ai-dinners',
    name: 'AI Dinners',
    description: 'Local Business AI Roundtable - Recorded',
    status: 'pending',
    priority: 5,
    progress: 10,
    nextAction: 'Plan format + invite list + venue',
    category: 'content',
    accentColor: 'cyan',
    metrics: [
      { label: 'Format', value: '5-10 guests' },
      { label: 'Location', value: 'Santa Cruz area' },
    ],
  },
  {
    id: 'fassio-roofing',
    name: '🏠 Fassio Roofing',
    description: 'Website rebuild for Mike Fassio - Santa Cruz',
    status: 'active',
    priority: 6,
    progress: 90,
    nextAction: 'Get Mike\'s phone # + license # + real photos',
    category: 'client',
    accentColor: 'blue',
    metrics: [
      { label: 'Live', value: 'fassio-roofing.vercel.app' },
      { label: 'Client', value: 'Mike Fassio' },
      { label: 'Type', value: 'Pro Bono' },
    ],
  },
];

export const lifeProjects: Project[] = [
  {
    id: 'golf',
    name: 'Golf',
    description: 'Protected time - non-negotiable',
    status: 'active',
    priority: 1,
    progress: 100,
    nextAction: 'Book next tee time',
    category: 'life',
    accentColor: 'green',
  },
  {
    id: 'cards',
    name: 'Sports Cards NFTs',
    description: 'Baseball & Basketball via Gotcha Machine',
    status: 'active',
    priority: 2,
    progress: 100,
    nextAction: 'Check market',
    category: 'life',
    accentColor: 'orange',
  },
  {
    id: 'warzone',
    name: 'Warzone',
    description: 'Potential streaming content',
    status: 'active',
    priority: 3,
    progress: 100,
    nextAction: 'Drop in',
    category: 'life',
    accentColor: 'purple',
  },
];

// ============================================
// THE COMPOUND - Room Details
// ============================================

export interface CompoundRoom {
  id: string;
  name: string;
  emoji: string;
  description: string;
  features: string[];
  status: 'live' | 'building' | 'planned';
}

export const compoundRooms: CompoundRoom[] = [
  {
    id: 'gaming-hall',
    name: 'Gaming Hall',
    emoji: '🎰',
    description: 'Casino games, poker, live dealer',
    features: ['Slots', 'Table Games', 'Poker', 'Live Dealer'],
    status: 'building',
  },
  {
    id: 'sports-bar',
    name: 'Sports Bar',
    emoji: '🏈',
    description: 'Fantasy leagues, pick\'em contests',
    features: ['Fantasy Leagues', 'Pick\'em', 'Live Odds', 'Watch Parties'],
    status: 'building',
  },
  {
    id: 'batting-cage',
    name: 'Batting Cage',
    emoji: '⚾',
    description: 'Card box breaks, pack wars, memorabilia',
    features: ['Box Breaks', 'Pack Wars', 'Trading', 'Memorabilia'],
    status: 'building',
  },
  {
    id: 'gamers-den',
    name: 'Gamers Den',
    emoji: '🎮',
    description: 'Tournaments, brackets, streaming',
    features: ['Tournaments', 'Brackets', 'Streaming', 'Leaderboards'],
    status: 'planned',
  },
  {
    id: 'golf-grotto',
    name: 'Golf Grotto',
    emoji: '⛳',
    description: 'Golf leagues, sim challenges',
    features: ['Golf Leagues', 'Sim Challenges', 'Handicaps', 'Courses'],
    status: 'planned',
  },
  {
    id: 'locker-room',
    name: 'Locker Room',
    emoji: '🏆',
    description: 'Profile, inventory, wallet',
    features: ['Profile', 'Inventory', 'Wallet', 'Achievements'],
    status: 'building',
  },
];

// ============================================
// ACTIVITY FEED - Recent updates
// ============================================

export const recentActivity: Activity[] = [
  {
    id: 'fassio-1',
    timestamp: new Date('2026-01-31T14:55:00'),
    project: 'Fassio Roofing',
    action: 'Website LIVE at fassio-roofing.vercel.app - full rebuild done',
    type: 'milestone',
  },
  {
    id: 'compound-1',
    timestamp: new Date('2026-01-30T10:00:00'),
    project: 'The Compound',
    action: 'Project added to Command Center - 6 rooms defined',
    type: 'milestone',
  },
  {
    id: '0',
    timestamp: new Date('2026-01-29T22:15:00'),
    project: 'Drizzle',
    action: 'All strategic docs reviewed - launch brief compiled',
    type: 'milestone',
  },
  {
    id: '1',
    timestamp: new Date('2026-01-29T22:00:00'),
    project: 'Drizzle',
    action: 'Google Drive access established - 8 key docs downloaded',
    type: 'update',
  },
  {
    id: '2',
    timestamp: new Date('2026-01-29T21:30:00'),
    project: 'Styled AI',
    action: 'Landing page reviewed at getstyled.app - looks solid',
    type: 'update',
  },
  {
    id: '3',
    timestamp: new Date('2026-01-29T21:00:00'),
    project: 'All Projects',
    action: 'Full project briefing from Jeremy via Telegram voice notes',
    type: 'milestone',
  },
  {
    id: '4',
    timestamp: new Date('2026-01-29T21:00:00'),
    project: 'Noctis',
    action: 'Telegram channel connected and paired',
    type: 'milestone',
  },
  {
    id: '5',
    timestamp: new Date('2026-01-29T20:30:00'),
    project: 'Command Center',
    action: 'Google Calendar + Gmail + Drive auth configured',
    type: 'update',
  },
  {
    id: '6',
    timestamp: new Date('2026-01-29T19:00:00'),
    project: 'Command Center',
    action: 'Dashboard live at hq.kirbyholdings.ltd',
    type: 'milestone',
  },
  {
    id: '7',
    timestamp: new Date('2026-01-29T17:30:00'),
    project: 'Noctis',
    action: 'Identity established - Noctis Aurelius activated',
    type: 'milestone',
  },
];

// ============================================
// QUICK STATS - Dashboard overview
// ============================================

export const quickStats = {
  activeVentures: 7,
  pendingActions: 12,
  priorityFocus: 'Drizzle V2 + The Compound',
  prioritySubtext: 'Gaming empire building',
  momentum: 'High',
  momentumSubtext: 'Full context captured',
};

// ============================================
// INBOX - Items to process
// ============================================

export const inboxItems: string[] = [
  '[URGENT] Drizzle thumbnail specs needed from Jeremy',
  '[BLOCKED] Styled AI repos need GitHub access',
  '[WAITING] Timeless Tech - Borut & Nicola response',
];

// ============================================
// CALENDAR - Upcoming events
// Noctis syncs from Google Calendar via gog CLI
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  type: 'meeting' | 'personal' | 'deadline' | 'golf';
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Super Bowl LX',
    start: new Date('2026-02-09T15:30:00'),
    end: new Date('2026-02-09T20:00:00'),
    location: 'Allegiant Stadium, Las Vegas',
    type: 'deadline', // marketing opportunity
  },
  {
    id: '2',
    title: '🚀 DRIZZLE V2 LAUNCH',
    start: new Date('2026-02-15T00:00:00'),
    end: new Date('2026-02-15T23:59:59'),
    type: 'deadline',
  },
];
