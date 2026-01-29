import { Project, Activity } from '@/types';

// ============================================
// PROJECT DATA - Noctis updates this file
// Last updated: 2025-06-25
// ============================================

export const projects: Project[] = [
  {
    id: 'drizzle',
    name: 'Drizzle',
    description: 'Crypto Casino - Platform Transition',
    status: 'active',
    priority: 1,
    progress: 65,
    nextAction: 'Define migration timeline',
    category: 'venture',
    accentColor: 'orange',
    metrics: [
      { label: 'Beta Duration', value: '9 months' },
      { label: 'Platform', value: 'Transitioning' },
    ],
  },
  {
    id: 'timeless-tech',
    name: 'Timeless Tech',
    description: 'AI Scaling Role - Game Aggregator',
    status: 'pending',
    priority: 2,
    progress: 25,
    nextAction: 'Follow up on comp/equity offer',
    category: 'venture',
    accentColor: 'cyan',
    metrics: [
      { label: 'Casinos Served', value: '40+' },
      { label: 'Status', value: 'Awaiting Offer' },
    ],
  },
  {
    id: 'styled-ai',
    name: 'Styled AI',
    description: 'Personal Stylist App',
    status: 'pending',
    priority: 3,
    progress: 10,
    nextAction: 'Status check - team/tech/MVP',
    category: 'venture',
    accentColor: 'purple',
    metrics: [
      { label: 'Stage', value: 'Early' },
    ],
  },
  {
    id: 'ai-company',
    name: 'AI Casino Solutions',
    description: 'New Venture with Borut & Nicola',
    status: 'pending',
    priority: 2,
    progress: 5,
    nextAction: 'Define entity structure',
    category: 'venture',
    accentColor: 'green',
    metrics: [
      { label: 'Partners', value: 'Borut, Nicola' },
      { label: 'Acquirer', value: 'Gabriel' },
    ],
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Sharing AI Knowledge',
    status: 'pending',
    priority: 4,
    progress: 0,
    nextAction: 'Choose platforms & format',
    category: 'content',
    accentColor: 'amber',
  },
  {
    id: 'ai-dinners',
    name: 'AI Dinners',
    description: 'Local Business Minds - Recorded',
    status: 'pending',
    priority: 5,
    progress: 0,
    nextAction: 'Schedule first dinner',
    category: 'content',
    accentColor: 'cyan',
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
    name: 'Baseball Cards',
    description: 'Collection & Market',
    status: 'active',
    priority: 2,
    progress: 100,
    nextAction: 'Check want list',
    category: 'life',
    accentColor: 'orange',
  },
  {
    id: 'warzone',
    name: 'Warzone',
    description: 'Squad up',
    status: 'active',
    priority: 3,
    progress: 100,
    nextAction: 'Drop in',
    category: 'life',
    accentColor: 'purple',
  },
];

// ============================================
// ACTIVITY FEED - Recent updates
// ============================================

export const recentActivity: Activity[] = [
  {
    id: '1',
    timestamp: new Date('2025-06-25T19:50:00'),
    project: 'Command Center',
    action: 'Dashboard v2 deployed with project detail pages',
    type: 'milestone',
  },
  {
    id: '2',
    timestamp: new Date('2025-06-25T19:30:00'),
    project: 'Command Center',
    action: 'Applied Anthropic frontend-design principles',
    type: 'update',
  },
  {
    id: '3',
    timestamp: new Date('2025-06-25T19:00:00'),
    project: 'Command Center',
    action: 'Custom domain hq.kirbyholdings.ltd configured',
    type: 'milestone',
  },
  {
    id: '4',
    timestamp: new Date('2025-06-25T18:30:00'),
    project: 'Drizzle',
    action: 'Full context documented - platform transition',
    type: 'update',
  },
  {
    id: '5',
    timestamp: new Date('2025-06-25T18:00:00'),
    project: 'Timeless Tech',
    action: 'Barcelona meeting notes captured',
    type: 'update',
  },
  {
    id: '6',
    timestamp: new Date('2025-06-25T17:30:00'),
    project: 'Noctis',
    action: 'AI assistant initialized - Day 1 begins',
    type: 'milestone',
  },
];

// ============================================
// QUICK STATS - Dashboard overview
// ============================================

export const quickStats = {
  activeVentures: 4,
  pendingActions: 7,
  priorityFocus: 'Drizzle',
  prioritySubtext: 'Platform transition',
  momentum: 'High',
  momentumSubtext: 'Barcelona momentum',
};

// ============================================
// INBOX - Items to process
// ============================================

export const inboxItems: string[] = [
  // Add items here as they come in
  // Format: "[timestamp] item text"
];
