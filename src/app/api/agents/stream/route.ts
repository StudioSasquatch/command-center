/**
 * Server-Sent Events endpoint for real-time agent status updates
 *
 * Polls Supabase for updates since serverless doesn't support
 * persistent in-memory subscriptions across invocations.
 *
 * Usage:
 *   const eventSource = new EventSource('/api/agents/stream');
 *   eventSource.onmessage = (event) => {
 *     const state = JSON.parse(event.data);
 *     // Update UI
 *   };
 */

import { getSwarmState } from '@/lib/agent-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60 seconds for Vercel

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();
  let lastVersion = 0;
  let isActive = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state immediately
      try {
        const initialState = await getSwarmState();
        lastVersion = initialState.version;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`)
        );
      } catch (e) {
        console.error('Failed to get initial state:', e);
      }

      // Poll for updates every 2 seconds
      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const state = await getSwarmState();

          // Only send if state has changed
          if (state.version !== lastVersion) {
            lastVersion = state.version;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(state)}\n\n`)
            );
          }
        } catch (e) {
          console.error('Poll error:', e);
        }
      }, 2000);

      // Send heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        if (!isActive) {
          clearInterval(heartbeat);
          return;
        }

        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          isActive = false;
          clearInterval(heartbeat);
          clearInterval(pollInterval);
        }
      }, 15000);

      // Auto-close after 55 seconds (before Vercel's 60s limit)
      setTimeout(() => {
        isActive = false;
        clearInterval(pollInterval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }, 55000);
    },

    cancel() {
      isActive = false;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
