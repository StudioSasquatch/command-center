import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Feedback {
  id: string;
  post_id: string;
  message: string;
  created_at: string;
  resolved?: boolean;
  dispatched_to?: string;
  post_text?: string;
  media_note?: string;
}

// In-memory fallback for when Supabase is not available
let memoryFeedback: Feedback[] = [];

// Detect if feedback is about images/graphics
function isImageFeedback(message: string): boolean {
  const imageKeywords = ['image', 'picture', 'photo', 'graphic', 'visual', 'thumbnail', 'media', 'artwork', 'design'];
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(kw => lowerMessage.includes(kw));
}

// Dispatch task to agent - calls the actual agent execution endpoint
async function dispatchToAgent(
  agent: string,
  task: string,
  context?: { postId?: string; postText?: string; mediaNote?: string }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    console.log(`📤 Dispatching to ${agent} at ${baseUrl}`);

    // For Aurora, call her execution endpoint directly
    if (agent === 'aurora') {
      const auroraUrl = `${baseUrl}/api/agents/aurora`;
      console.log(`🌸 Calling Aurora at: ${auroraUrl}`);

      // Fire and forget - don't await so the feedback API returns quickly
      fetch(auroraUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: context?.postId,
          feedback: task,
          originalPrompt: context?.mediaNote,
          postText: context?.postText,
        }),
      })
        .then(res => console.log(`🌸 Aurora response status: ${res.status}`))
        .catch(err => console.error('🌸 Aurora execution error:', err));
    } else {
      // For other agents, just update their status (placeholder)
      await fetch(`${baseUrl}/api/agents?dispatch=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, task }),
      });
    }
  } catch (err) {
    console.error('Failed to dispatch to agent:', err);
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('content_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to frontend format
      const feedback = (data || []).map(f => ({
        id: f.id,
        postId: f.post_id,
        message: f.message,
        timestamp: f.created_at,
        resolved: f.resolved,
        dispatchedTo: f.dispatched_to,
        postText: f.post_text,
        mediaNote: f.media_note,
      }));

      return NextResponse.json({ feedback });
    }

    // Fallback to in-memory
    return NextResponse.json({ feedback: memoryFeedback });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to read feedback' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, message, postText, mediaNote } = body;

    if (!postId || !message) {
      return NextResponse.json({ error: 'postId and message required' }, { status: 400 });
    }

    // Determine which agent to dispatch to
    let dispatchedTo: string | undefined;
    const isImage = isImageFeedback(message);
    console.log(`📝 Feedback received - isImageFeedback: ${isImage}, message: "${message.substring(0, 50)}..."`);

    if (isImage) {
      dispatchedTo = 'aurora';
      console.log('🌸 Dispatching to Aurora for image feedback');
      // Dispatch to Aurora with full context for image regeneration
      await dispatchToAgent('aurora', message, {
        postId,
        postText,
        mediaNote,
      });
    }

    const newFeedback = {
      id: `fb-${Date.now()}`,
      post_id: postId,
      message,
      resolved: false,
      dispatched_to: dispatchedTo,
      post_text: postText,
      media_note: mediaNote,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('content_feedback')
        .insert(newFeedback)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        feedback: data,
        dispatched: dispatchedTo ? { agent: dispatchedTo, message: `Task dispatched to ${dispatchedTo}` } : null
      });
    }

    // Fallback to in-memory
    memoryFeedback.push({ ...newFeedback, created_at: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      feedback: newFeedback,
      dispatched: dispatchedTo ? { agent: dispatchedTo, message: `Task dispatched to ${dispatchedTo}` } : null
    });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { feedbackId, resolved } = body;

    if (!feedbackId) {
      return NextResponse.json({ error: 'feedbackId required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('content_feedback')
        .update({ resolved: resolved ?? true })
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, feedback: data });
    }

    // Fallback to in-memory
    const index = memoryFeedback.findIndex(f => f.id === feedbackId);
    if (index !== -1) {
      memoryFeedback[index].resolved = resolved ?? true;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('id');

    if (!feedbackId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('content_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Fallback to in-memory
    memoryFeedback = memoryFeedback.filter(f => f.id !== feedbackId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
