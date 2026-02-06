/**
 * Agent Status Store
 *
 * Persistent storage for agent statuses using Supabase.
 * Falls back to in-memory for development without Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase';

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
function createDefaultState(): SwarmState {
  return {
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
}

// In-memory cache (used for quick reads and as fallback)
let memoryCache: SwarmState | null = null;

/**
 * Get current swarm state
 */
export async function getSwarmState(): Promise<SwarmState> {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('agent_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Build state from database rows
        const agents: Record<string, AgentState> = {};
        let latestUpdate = '';

        for (const row of data) {
          agents[row.agent_id] = {
            status: row.status || 'idle',
            task: row.task,
            progress: row.progress,
            lastUpdate: row.updated_at,
            error: row.error,
          };
          if (!latestUpdate || row.updated_at > latestUpdate) {
            latestUpdate = row.updated_at;
          }
        }

        // Fill in missing default agents
        for (const agentId of SWARM_AGENTS) {
          if (!agents[agentId]) {
            agents[agentId] = {
              status: agentId === 'noctis' ? 'working' : 'idle',
              task: agentId === 'noctis' ? 'Orchestrating swarm' : null,
              lastUpdate: new Date().toISOString(),
            };
          }
        }

        const state: SwarmState = {
          agents,
          lastUpdated: latestUpdate || new Date().toISOString(),
          version: data.length,
        };

        memoryCache = state;
        return state;
      }
    } catch (e) {
      console.error('Supabase read error:', e);
    }
  }

  // Return memory cache or default
  if (memoryCache) {
    return memoryCache;
  }

  memoryCache = createDefaultState();
  return memoryCache;
}

/**
 * Update a single agent's status
 */
export async function updateAgentStatus(
  agentId: string,
  update: Partial<AgentState>
): Promise<SwarmState> {
  const normalizedId = agentId.toLowerCase();
  const now = new Date().toISOString();

  // Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('agent_status')
        .upsert({
          agent_id: normalizedId,
          status: update.status,
          task: update.task,
          progress: update.progress,
          error: update.error,
          updated_at: now,
        }, {
          onConflict: 'agent_id',
        });

      if (error) {
        console.error('Supabase upsert error:', error);
      }
    } catch (e) {
      console.error('Failed to update Supabase:', e);
    }
  }

  // Update memory cache
  const state = memoryCache || createDefaultState();

  if (!state.agents[normalizedId]) {
    state.agents[normalizedId] = {
      status: 'idle',
      task: null,
      lastUpdate: now,
    };
  }

  state.agents[normalizedId] = {
    ...state.agents[normalizedId],
    ...update,
    lastUpdate: now,
  };

  state.lastUpdated = now;
  state.version = (state.version || 0) + 1;
  memoryCache = state;

  return state;
}

/**
 * Update multiple agents at once
 */
export async function updateMultipleAgents(
  updates: Record<string, Partial<AgentState>>
): Promise<SwarmState> {
  const now = new Date().toISOString();

  // Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const rows = Object.entries(updates).map(([agentId, update]) => ({
        agent_id: agentId.toLowerCase(),
        status: update.status,
        task: update.task,
        progress: update.progress,
        error: update.error,
        updated_at: now,
      }));

      const { error } = await supabase
        .from('agent_status')
        .upsert(rows, { onConflict: 'agent_id' });

      if (error) {
        console.error('Supabase batch upsert error:', error);
      }
    } catch (e) {
      console.error('Failed to batch update Supabase:', e);
    }
  }

  // Update memory cache
  const state = memoryCache || createDefaultState();

  for (const [agentId, update] of Object.entries(updates)) {
    const normalizedId = agentId.toLowerCase();

    if (!state.agents[normalizedId]) {
      state.agents[normalizedId] = {
        status: 'idle',
        task: null,
        lastUpdate: now,
      };
    }

    state.agents[normalizedId] = {
      ...state.agents[normalizedId],
      ...update,
      lastUpdate: now,
    };
  }

  state.lastUpdated = now;
  state.version = (state.version || 0) + 1;
  memoryCache = state;

  return state;
}

/**
 * Reset all agents to idle (except Noctis)
 */
export async function resetSwarm(): Promise<SwarmState> {
  const now = new Date().toISOString();

  // Reset in Supabase
  if (isSupabaseConfigured()) {
    try {
      const rows = SWARM_AGENTS.map(agentId => ({
        agent_id: agentId,
        status: agentId === 'noctis' ? 'working' : 'idle',
        task: agentId === 'noctis' ? 'Orchestrating swarm' : null,
        progress: null,
        error: null,
        updated_at: now,
      }));

      await supabase
        .from('agent_status')
        .upsert(rows, { onConflict: 'agent_id' });
    } catch (e) {
      console.error('Failed to reset swarm in Supabase:', e);
    }
  }

  memoryCache = createDefaultState();
  return memoryCache;
}

/**
 * Add a new agent to the swarm
 */
export async function addAgent(
  agentId: string,
  initialState?: Partial<AgentState>
): Promise<SwarmState> {
  return updateAgentStatus(agentId, {
    status: 'idle',
    task: null,
    ...initialState,
  });
}

/**
 * Get subscriber count (for monitoring) - no longer used with Supabase
 */
export function getSubscriberCount(): number {
  return 0;
}

// Legacy subscribe function - kept for compatibility but no-op
export function subscribe(): () => void {
  return () => {};
}
