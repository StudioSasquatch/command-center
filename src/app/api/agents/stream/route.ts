/**
 * Server-Sent Events endpoint for real-time agent status updates
 *
 * Usage:
 *   const eventSource = new EventSource('/api/agents/stream');
 *   eventSource.onmessage = (event) => {
 *     const state = JSON.parse(event.data);
 *     // Update UI
 *   };
 */

import { getSwarmState, subscribe } from '@/lib/agent-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state immediately
      try {
        const initialState = await getSwarmState();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`)
        );
      } catch (e) {
        console.error('Failed to get initial state:', e);
      }

      // Subscribe to updates
      const unsubscribe = subscribe((state) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(state)}\n\n`)
          );
        } catch {
          // Stream closed
          unsubscribe();
        }
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on close
      // Note: This is triggered when the client disconnects
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
