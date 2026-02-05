/**
 * Agent Swarm API
 *
 * Endpoints:
 * - GET  /api/agents          - Get current swarm state
 * - POST /api/agents          - Update agent status
 * - PUT  /api/agents          - Reset all agents to idle
 * - POST /api/agents?dispatch - Dispatch task to agent (orchestrator)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSwarmState,
  updateAgentStatus,
  updateMultipleAgents,
  resetSwarm,
  addAgent,
  AgentStatus,
} from '@/lib/agent-store';
import { requireAuth, AuthError } from '@/lib/auth';

// GET - Fetch current swarm state
export async function GET() {
  try {
    const state = await getSwarmState();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to get swarm state:', error);
    return NextResponse.json(
      { error: 'Failed to get swarm state' },
      { status: 500 }
    );
  }
}

// POST - Update agent status or dispatch task
export async function POST(request: NextRequest) {
  // Check for dispatch mode (requires auth)
  const isDispatch = request.nextUrl.searchParams.get('dispatch') === 'true';

  if (isDispatch) {
    const authResult = requireAuth(request);
    if (authResult instanceof AuthError) {
      return authResult.toResponse();
    }
  }

  try {
    const body = await request.json();

    // Dispatch task to agent
    if (isDispatch && body.agent && body.task) {
      // This would trigger the actual agent execution
      // For now, just update status to 'working'
      const state = await updateAgentStatus(body.agent, {
        status: 'working',
        task: body.task,
        progress: 0,
      });

      return NextResponse.json({
        success: true,
        dispatched: true,
        agent: body.agent,
        task: body.task,
        state,
      });
    }

    // Single agent update: { agent: "trader", status: "working", task: "..." }
    if (body.agent && body.status) {
      const state = await updateAgentStatus(body.agent, {
        status: body.status as AgentStatus,
        task: body.task || null,
        progress: body.progress,
        error: body.error,
      });

      return NextResponse.json({ success: true, ...state });
    }

    // Bulk update: { agents: { trader: { status: "working" }, ... } }
    if (body.agents && typeof body.agents === 'object') {
      const state = await updateMultipleAgents(body.agents);
      return NextResponse.json({ success: true, ...state });
    }

    // Add new agent: { newAgent: "custom-agent" }
    if (body.newAgent) {
      const state = await addAgent(body.newAgent, body.initialState);
      return NextResponse.json({ success: true, ...state });
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to update agent status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

// PUT - Reset all agents to idle
export async function PUT() {
  try {
    const state = await resetSwarm();
    return NextResponse.json({ success: true, ...state });
  } catch (error) {
    console.error('Failed to reset swarm:', error);
    return NextResponse.json(
      { error: 'Failed to reset swarm' },
      { status: 500 }
    );
  }
}
