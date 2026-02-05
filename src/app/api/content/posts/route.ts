import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export interface ContentPost {
  id: string;
  text: string;
  scheduledDate: string;
  scheduledTime: 'AM' | 'PM';
  status: 'draft' | 'approved' | 'scheduled' | 'publishing' | 'posted' | 'failed';
  platform: 'x' | 'linkedin' | 'instagram' | 'facebook';
  mediaUrl?: string;
  mediaNote?: string;
  isThread?: boolean;
  selfReply?: string;
  edited?: boolean;
  approvedAt?: string;
  publishedAt?: string;
  feedback?: string[];  // Agent notes/feedback
  publishError?: string;
}

const POSTS_FILE = path.join(process.cwd(), 'data', 'content-posts.json');

async function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readPosts(): Promise<ContentPost[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePosts(posts: ContentPost[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// GET - Retrieve all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dueNow = searchParams.get('dueNow');

    let posts = await readPosts();

    // Filter by status
    if (status) {
      posts = posts.filter(p => p.status === status);
    }

    // Get posts due for publishing (approved + time has passed)
    if (dueNow === 'true') {
      const now = new Date();
      posts = posts.filter(p => {
        if (p.status !== 'approved') return false;
        const scheduledDate = new Date(p.scheduledDate);
        // Set time based on AM/PM
        if (p.scheduledTime === 'AM') {
          scheduledDate.setHours(8, 0, 0, 0);
        } else {
          scheduledDate.setHours(17, 0, 0, 0);
        }
        return scheduledDate <= now;
      });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Failed to read posts:', error);
    return NextResponse.json({ error: 'Failed to read posts' }, { status: 500 });
  }
}

// POST - Create or sync posts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sync all posts (from client localStorage)
    if (body.sync && Array.isArray(body.posts)) {
      await writePosts(body.posts);
      return NextResponse.json({ success: true, synced: body.posts.length });
    }

    // Create single post
    const posts = await readPosts();
    const newPost: ContentPost = {
      ...body,
      id: body.id || `post-${Date.now()}`,
      status: body.status || 'draft',
    };
    posts.push(newPost);
    await writePosts(posts);

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Failed to save post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}

// PATCH - Update post (approve, publish status, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const posts = await readPosts();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update the post
    posts[index] = { ...posts[index], ...updates };

    // If approving, add timestamp
    if (updates.status === 'approved' && !posts[index].approvedAt) {
      posts[index].approvedAt = new Date().toISOString();
    }

    // If publishing, add timestamp
    if (updates.status === 'posted' && !posts[index].publishedAt) {
      posts[index].publishedAt = new Date().toISOString();
    }

    await writePosts(posts);

    return NextResponse.json({ success: true, post: posts[index] });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE - Remove a post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const posts = await readPosts();
    const filtered = posts.filter(p => p.id !== id);
    await writePosts(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
