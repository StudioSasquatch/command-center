import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Agent status - stored in memory for this serverless instance
// Updates can happen via POST but won't persist across cold starts
// For persistent updates: modify public/agent-status.json and redeploy

interface AgentStatusData {
  agents: {
    [key: string]: {
      status: 'idle' | 'working' | 'complete';
      task: string | null;
    };
  };
  lastUpdated: string | null;
}

const DEFAULT_STATUS: AgentStatusData = {
  agents: {
    noctis: { status: 'working', task: null },
    aurora: { status: 'idle', task: null },
    sage: { status: 'idle', task: null },
    ada: { status: 'idle', task: null },
    nova: { status: 'idle', task: null },
  },
  lastUpdated: null,
};

// In-memory store (resets on cold start)
let memoryStore: AgentStatusData | null = null;

async function getStatus(): Promise<AgentStatusData> {
  // Return memory store if populated
  if (memoryStore) {
    return memoryStore;
  }
  
  // Try to read from static file
  try {
    const filePath = path.join(process.cwd(), 'public', 'agent-status.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data) as AgentStatusData;
    parsed.agents.noctis.status = 'working'; // Noctis always active
    memoryStore = parsed;
    return parsed;
  } catch {
    memoryStore = { ...DEFAULT_STATUS };
    return memoryStore;
  }
}

// GET - Fetch current agent status
export async function GET() {
  try {
    const status = await getStatus();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to read agent status:', error);
    return NextResponse.json(DEFAULT_STATUS);
  }
}

// POST - Update agent status (in-memory, resets on cold start)
// For persistent updates, modify public/agent-status.json and redeploy
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentStatus = await getStatus();
    
    // Single agent update
    if (body.agent && body.status) {
      const agentName = body.agent.toLowerCase();
      if (currentStatus.agents[agentName]) {
        currentStatus.agents[agentName] = {
          status: body.status,
          task: body.task || null,
        };
      }
    }
    
    // Bulk update
    if (body.agents) {
      for (const [name, data] of Object.entries(body.agents)) {
        const agentName = name.toLowerCase();
        if (currentStatus.agents[agentName]) {
          currentStatus.agents[agentName] = data as { status: 'idle' | 'working' | 'complete'; task: string | null };
        }
      }
    }
    
    // Update memory store
    currentStatus.agents.noctis.status = 'working'; // Noctis always active
    currentStatus.lastUpdated = new Date().toISOString();
    memoryStore = currentStatus;
    
    return NextResponse.json({ success: true, ...currentStatus });
  } catch (error) {
    console.error('Failed to update agent status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

// PUT - Reset all agents to idle (except Noctis)
export async function PUT() {
  const resetStatus: AgentStatusData = {
    agents: {
      noctis: { status: 'working', task: null },
      aurora: { status: 'idle', task: null },
      sage: { status: 'idle', task: null },
      ada: { status: 'idle', task: null },
      nova: { status: 'idle', task: null },
    },
    lastUpdated: new Date().toISOString(),
  };
  memoryStore = resetStatus;
  return NextResponse.json({ success: true, ...resetStatus });
}
