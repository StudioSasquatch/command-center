/**
 * Agent Status Store
 *
 * Persistent storage for agent statuses with multiple backend support:
 * - Vercel KV (production, requires @vercel/kv package)
 * - File-based (local development fallback)
 * - In-memory (last resort fallback)
 *
 * Also handles real-time subscribers for SSE updates.
 */

import { promises as fs } from 'fs';
import path from 'path';

// Types
export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

export interface AgentState {
  status: AgentStatus;
  task: string | null;
  progress?: number; // 0-100
  lastUpdate: string;
  error?: string;
}

export interface SwarmState {
  agents: Record<string, AgentState>;
  lastUpdated: string;
  version: number;
}

// Default agents in the swarm
export const SWARM_AGENTS = [
  'noctis',   // Orchestrator
  'trader',   // Trading
  'aurora',   // Creative
  'sage',     // Knowledge
  'ada',      // Development
  'nova',     // Research
] as const;

// Default state
const DEFAULT_STATE: SwarmState = {
  agents: Object.fromEntries(
    SWARM_AGENTS.map(id => [
      id,
      {
        status: id === 'noctis' ? 'working' : 'idle',
        task: id === 'noctis' ? 'Orchestrating swarm' : null,
        lastUpdate: new Date().toISOString(),
      },
    ])
  ),
  lastUpdated: new Date().toISOString(),
  version: 1,
};

// File path for local storage
const STATUS_FILE = path.join(process.cwd(), 'data', 'agent-status.json');

// In-memory cache
let memoryCache: SwarmState | null = null;
let cacheVersion = 0;

// SSE subscribers for real-time updates
type Subscriber = (state: SwarmState) => void;
const subscribers = new Set<Subscriber>();

/**
 * Subscribe to real-time status updates
 */
export function subscribe(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Notify all subscribers of state change
 */
function notifySubscribers(state: SwarmState) {
  subscribers.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.error('Subscriber error:', e);
    }
  });
}

/**
 * Try to use Vercel KV if available
 */
async function tryVercelKV(): Promise<{ get: (key: string) => Promise<SwarmState | null>, set: (key: string, value: SwarmState) => Promise<void> } | null> {
  try {
    // Dynamic import to avoid errors if not installed
    const { kv } = await import('@vercel/kv');
    return {
      get: async (key: string) => await kv.get<SwarmState>(key),
      set: async (key: string, value: SwarmState) => { await kv.set(key, value); }
    };
  } catch {
    return null;
  }
}

/**
 * Get current swarm state
 */
export async function getSwarmState(): Promise<SwarmState> {
  // Return cache if fresh (within 1 second)
  if (memoryCache && cacheVersion > 0) {
    return memoryCache;
  }

  // Try Vercel KV first
  const kv = await tryVercelKV();
  if (kv) {
    const state = await kv.get('swarm-state');
    if (state) {
      memoryCache = state;
      cacheVersion++;
      return state;
    }
  }

  // Try file-based storage
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf-8');
    const state = JSON.parse(data) as SwarmState;
    memoryCache = state;
    cacheVersion++;
    return state;
  } catch {
    // File doesn't exist or is invalid
  }

  // Return default state
  memoryCache = { ...DEFAULT_STATE, lastUpdated: new Date().toISOString() };
  return memoryCache;
}

/**
 * Save swarm state
 */
async function saveSwarmState(state: SwarmState): Promise<void> {
  state.lastUpdated = new Date().toISOString();
  state.version = (state.version || 0) + 1;

  memoryCache = state;
  cacheVersion++;

  // Try Vercel KV first
  const kv = await tryVercelKV();
  if (kv) {
    await kv.set('swarm-state', state);
    notifySubscribers(state);
    return;
  }

  // Fall back to file storage
  try {
    const dir = path.dirname(STATUS_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(STATUS_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save state to file:', e);
  }

  notifySubscribers(state);
}

/**
 * Update a single agent's status
 */
export async function updateAgentStatus(
  agentId: string,
  update: Partial<AgentState>
): Promise<SwarmState> {
  const state = await getSwarmState();

  const normalizedId = agentId.toLowerCase();

  // Create agent if doesn't exist
  if (!state.agents[normalizedId]) {
    state.agents[normalizedId] = {
      status: 'idle',
      task: null,
      lastUpdate: new Date().toISOString(),
    };
  }

  // Update agent state
  state.agents[normalizedId] = {
    ...state.agents[normalizedId],
    ...update,
    lastUpdate: new Date().toISOString(),
  };

  // Noctis is always working (orchestrator)
  if (normalizedId !== 'noctis') {
    state.agents.noctis.status = 'working';
  }

  await saveSwarmState(state);
  return state;
}

/**
 * Update multiple agents at once
 */
export async function updateMultipleAgents(
  updates: Record<string, Partial<AgentState>>
): Promise<SwarmState> {
  const state = await getSwarmState();

  for (const [agentId, update] of Object.entries(updates)) {
    const normalizedId = agentId.toLowerCase();

    if (!state.agents[normalizedId]) {
      state.agents[normalizedId] = {
        status: 'idle',
        task: null,
        lastUpdate: new Date().toISOString(),
      };
    }

    state.agents[normalizedId] = {
      ...state.agents[normalizedId],
      ...update,
      lastUpdate: new Date().toISOString(),
    };
  }

  // Noctis always working
  state.agents.noctis.status = 'working';

  await saveSwarmState(state);
  return state;
}

/**
 * Reset all agents to idle (except Noctis)
 */
export async function resetSwarm(): Promise<SwarmState> {
  const state = await getSwarmState();

  for (const agentId of Object.keys(state.agents)) {
    if (agentId !== 'noctis') {
      state.agents[agentId] = {
        status: 'idle',
        task: null,
        lastUpdate: new Date().toISOString(),
      };
    }
  }

  await saveSwarmState(state);
  return state;
}

/**
 * Add a new agent to the swarm
 */
export async function addAgent(
  agentId: string,
  initialState?: Partial<AgentState>
): Promise<SwarmState> {
  const state = await getSwarmState();
  const normalizedId = agentId.toLowerCase();

  state.agents[normalizedId] = {
    status: 'idle',
    task: null,
    lastUpdate: new Date().toISOString(),
    ...initialState,
  };

  await saveSwarmState(state);
  return state;
}

/**
 * Get subscriber count (for monitoring)
 */
export function getSubscriberCount(): number {
  return subscribers.size;
}
