import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Feedback {
  id: string;
  postId: string;
  message: string;
  timestamp: string;
  resolved?: boolean;
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, message } = body;

    if (!postId || !message) {
      return NextResponse.json({ error: 'postId and message required' }, { status: 400 });
    }

    const feedback = await readFeedback();
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      postId,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    feedback.push(newFeedback);
    await writeFeedback(feedback);

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
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
