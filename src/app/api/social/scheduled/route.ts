import { NextRequest, NextResponse } from 'next/server';
import { 
  getScheduledPosts, 
  getAllPosts, 
  addScheduledPost, 
  updatePost, 
  deletePost 
} from '@/lib/scheduled-posts';

// GET - List scheduled posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  
  const posts = all ? getAllPosts() : getScheduledPosts();
  
  return NextResponse.json({ 
    posts,
    count: posts.length
  });
}

// POST - Create a scheduled post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platforms, mediaUrls, scheduledFor } = body;

    if (!content || !platforms || !scheduledFor) {
      return NextResponse.json(
        { error: 'Content, platforms, and scheduledFor are required' },
        { status: 400 }
      );
    }

    const post = addScheduledPost({
      content,
      platforms,
      mediaUrls,
      scheduledFor
    });

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to schedule post', details: err.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a scheduled post
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const post = updatePost(id, updates);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to update post', details: err.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a scheduled post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const success = deletePost(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to delete post', details: err.message },
      { status: 500 }
    );
  }
}
