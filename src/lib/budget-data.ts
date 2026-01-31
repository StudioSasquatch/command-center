// Q1 2026 Marketing Budget - Drizzle Casino Launch

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  spent: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface Budget {
  total: number;
  allocated: number;
  spent: number;
  items: BudgetItem[];
}

export const BUDGET_ITEMS: BudgetItem[] = [
  // Influencer Marketing - $15,000
  {
    id: 'inf-001',
    category: 'Influencer Marketing',
    description: 'Crypto Twitter KOLs (5-10 mid-tier)',
    amount: 8000,
    spent: 2500,
    status: 'in-progress',
  },
  {
    id: 'inf-002',
    category: 'Influencer Marketing',
    description: 'Gambling/Casino streamers (Kick/Twitch)',
    amount: 5000,
    spent: 0,
    status: 'planned',
  },
  {
    id: 'inf-003',
    category: 'Influencer Marketing',
    description: 'Telegram channel promotions',
    amount: 2000,
    spent: 800,
    status: 'in-progress',
  },

  // Paid Ads - $12,000
  {
    id: 'ads-001',
    category: 'Paid Ads',
    description: 'X (Twitter) promoted posts & spaces',
    amount: 6000,
    spent: 1200,
    status: 'in-progress',
  },
  {
    id: 'ads-002',
    category: 'Paid Ads',
    description: 'TikTok creator fund partnerships',
    amount: 4000,
    spent: 0,
    status: 'planned',
  },
  {
    id: 'ads-003',
    category: 'Paid Ads',
    description: 'Crypto ad networks (Coinzilla, A-Ads)',
    amount: 2000,
    spent: 500,
    status: 'in-progress',
  },

  // Content Production - $8,000
  {
    id: 'con-001',
    category: 'Content Production',
    description: 'Launch video & trailer production',
    amount: 3000,
    spent: 3000,
    status: 'completed',
  },
  {
    id: 'con-002',
    category: 'Content Production',
    description: 'Meme/clip creation (freelancers)',
    amount: 2500,
    spent: 750,
    status: 'in-progress',
  },
  {
    id: 'con-003',
    category: 'Content Production',
    description: 'Podcast production & editing',
    amount: 1500,
    spent: 400,
    status: 'in-progress',
  },
  {
    id: 'con-004',
    category: 'Content Production',
    description: 'Graphic design assets',
    amount: 1000,
    spent: 600,
    status: 'in-progress',
  },

  // Community Incentives - $8,000
  {
    id: 'com-001',
    category: 'Community Incentives',
    description: 'Launch week giveaways (crypto prizes)',
    amount: 4000,
    spent: 0,
    status: 'planned',
  },
  {
    id: 'com-002',
    category: 'Community Incentives',
    description: 'Referral program rewards',
    amount: 2500,
    spent: 0,
    status: 'planned',
  },
  {
    id: 'com-003',
    category: 'Community Incentives',
    description: 'Discord/Telegram mod incentives',
    amount: 1500,
    spent: 500,
    status: 'in-progress',
  },

  // Tools & Software - $4,000
  {
    id: 'tool-001',
    category: 'Tools & Software',
    description: 'Social management (Typefully, Buffer)',
    amount: 1200,
    spent: 400,
    status: 'in-progress',
  },
  {
    id: 'tool-002',
    category: 'Tools & Software',
    description: 'Analytics (Dune, Nansen lite)',
    amount: 1500,
    spent: 500,
    status: 'in-progress',
  },
  {
    id: 'tool-003',
    category: 'Tools & Software',
    description: 'Design tools (Figma, Canva Pro)',
    amount: 800,
    spent: 200,
    status: 'in-progress',
  },
  {
    id: 'tool-004',
    category: 'Tools & Software',
    description: 'Email/CRM (Loops, Notion)',
    amount: 500,
    spent: 150,
    status: 'in-progress',
  },

  // Contingency - $3,000
  {
    id: 'cont-001',
    category: 'Contingency',
    description: 'Emergency/opportunity fund',
    amount: 3000,
    spent: 0,
    status: 'planned',
  },
];

// Calculate totals
const allocated = BUDGET_ITEMS.reduce((sum, item) => sum + item.amount, 0);
const spent = BUDGET_ITEMS.reduce((sum, item) => sum + item.spent, 0);

export const Q1_BUDGET: Budget = {
  total: 50000,
  allocated,
  spent,
  items: BUDGET_ITEMS,
};

// Helper functions
export function getBudgetByCategory(): Record<string, { allocated: number; spent: number; items: BudgetItem[] }> {
  const categories: Record<string, { allocated: number; spent: number; items: BudgetItem[] }> = {};
  
  BUDGET_ITEMS.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = { allocated: 0, spent: 0, items: [] };
    }
    categories[item.category].allocated += item.amount;
    categories[item.category].spent += item.spent;
    categories[item.category].items.push(item);
  });
  
  return categories;
}

export function getBudgetHealth(): 'healthy' | 'warning' | 'over' {
  const spendRate = Q1_BUDGET.spent / Q1_BUDGET.allocated;
  // Assuming we're ~1 month into Q1 (33% through)
  const expectedRate = 0.33;
  
  if (spendRate > 0.5) return 'over';
  if (spendRate > expectedRate + 0.1) return 'warning';
  return 'healthy';
}

export function getRemainingBudget(): number {
  return Q1_BUDGET.total - Q1_BUDGET.spent;
}

export function getUnallocated(): number {
  return Q1_BUDGET.total - Q1_BUDGET.allocated;
}
