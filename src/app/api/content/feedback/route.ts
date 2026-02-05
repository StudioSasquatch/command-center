import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Feedback {
  id: string;
  postId: string;
  message: string;
  timestamp: string;
  resolved?: boolean;
  dispatchedTo?: string;  // Which agent was notified
  postText?: string;      // Context for the agent
  mediaNote?: string;     // Image description if relevant
}

const FEEDBACK_FILE = path.join(process.cwd(), 'public', 'content-feedback.json');

async function readFeedback(): Promise<Feedback[]> {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeFeedback(feedback: Feedback[]): Promise<void> {
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedback, null, 2));
}

export async function GET() {
  try {
    const feedback = await readFeedback();
    return NextResponse.json({ feedback });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read feedback' }, { status: 500 });
  }
}

// Detect if feedback is about images/graphics
function isImageFeedback(message: string): boolean {
  const imageKeywords = ['image', 'picture', 'photo', 'graphic', 'visual', 'thumbnail', 'media', 'artwork', 'design'];
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(kw => lowerMessage.includes(kw));
}

// Dispatch task to agent swarm
async function dispatchToAgent(agent: string, task: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    await fetch(`${baseUrl}/api/agents?dispatch=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, task }),
    });
  } catch (err) {
    console.error('Failed to dispatch to agent:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, message, postText, mediaNote } = body;

    if (!postId || !message) {
      return NextResponse.json({ error: 'postId and message required' }, { status: 400 });
    }

    const feedback = await readFeedback();

    // Determine which agent to dispatch to
    let dispatchedTo: string | undefined;
    if (isImageFeedback(message)) {
      dispatchedTo = 'aurora';
      // Dispatch to Aurora for image feedback
      const task = `Content feedback for post ${postId}: "${message}"${mediaNote ? ` | Original image brief: ${mediaNote}` : ''}${postText ? ` | Post text: ${postText.substring(0, 100)}...` : ''}`;
      await dispatchToAgent('aurora', task);
    }

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      postId,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
      dispatchedTo,
      postText,
      mediaNote,
    };

    feedback.push(newFeedback);
    await writeFeedback(feedback);

    return NextResponse.json({
      success: true,
      feedback: newFeedback,
      dispatched: dispatchedTo ? { agent: dispatchedTo, message: `Task dispatched to ${dispatchedTo}` } : null
    });
  } catch (error) {
    console.error('Feedback error:', error);
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

    const feedback = await readFeedback();
    const index = feedback.findIndex(f => f.id === feedbackId);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    feedback[index].resolved = resolved ?? true;
    await writeFeedback(feedback);

    return NextResponse.json({ success: true, feedback: feedback[index] });
  } catch (error) {
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

    const feedback = await readFeedback();
    const filtered = feedback.filter(f => f.id !== feedbackId);
    await writeFeedback(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
