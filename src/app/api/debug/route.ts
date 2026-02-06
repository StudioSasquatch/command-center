/**
 * Debug endpoint to test Aurora and check configuration
 */

import { NextResponse } from 'next/server';
import { getSwarmState, updateAgentStatus } from '@/lib/agent-store';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const config = {
    supabaseConfigured: isSupabaseConfigured(),
    hasAiGatewaySecret: !!process.env.VERCEL_AI_GATEWAY_SECRET,
    hasVercelUrl: !!process.env.VERCEL_URL,
    vercelUrl: process.env.VERCEL_URL || 'not set',
    hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
  };

  let swarmState = null;
  try {
    swarmState = await getSwarmState();
  } catch (e) {
    swarmState = { error: e instanceof Error ? e.message : 'Failed to get state' };
  }

  return NextResponse.json({
    status: 'ok',
    config,
    swarmState,
    timestamp: new Date().toISOString(),
  });
}

// Test Aurora status update
export async function POST() {
  try {
    await updateAgentStatus('aurora', {
      status: 'working',
      task: 'Debug test - this should show Aurora as active!',
      progress: 50,
    });

    const state = await getSwarmState();

    return NextResponse.json({
      success: true,
      message: 'Aurora status updated to working',
      auroraState: state.agents.aurora,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
