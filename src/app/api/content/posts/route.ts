import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  feedback?: string[];
  publishError?: string;
}

// In-memory fallback for when Supabase is not available
let memoryPosts: ContentPost[] = [];

// Map from frontend camelCase to database snake_case
function toDbFormat(post: ContentPost) {
  return {
    id: post.id,
    text: post.text,
    scheduled_date: post.scheduledDate,
    scheduled_time: post.scheduledTime,
    status: post.status,
    platform: post.platform,
    media_url: post.mediaUrl,
    media_note: post.mediaNote,
    is_thread: post.isThread,
    self_reply: post.selfReply,
    edited: post.edited,
    approved_at: post.approvedAt,
    published_at: post.publishedAt,
    publish_error: post.publishError,
  };
}

// Map from database snake_case to frontend camelCase
function fromDbFormat(row: Record<string, unknown>): ContentPost {
  return {
    id: row.id as string,
    text: row.text as string,
    scheduledDate: row.scheduled_date as string,
    scheduledTime: row.scheduled_time as 'AM' | 'PM',
    status: row.status as ContentPost['status'],
    platform: row.platform as ContentPost['platform'],
    mediaUrl: row.media_url as string | undefined,
    mediaNote: row.media_note as string | undefined,
    isThread: row.is_thread as boolean | undefined,
    selfReply: row.self_reply as string | undefined,
    edited: row.edited as boolean | undefined,
    approvedAt: row.approved_at as string | undefined,
    publishedAt: row.published_at as string | undefined,
    publishError: row.publish_error as string | undefined,
  };
}

// GET - Retrieve all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dueNow = searchParams.get('dueNow');

    if (isSupabaseConfigured()) {
      let query = supabase.from('content_posts').select('*');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });
      if (error) throw error;

      let posts = (data || []).map(fromDbFormat);

      // Filter due posts if requested
      if (dueNow === 'true') {
        const now = new Date();
        posts = posts.filter(p => {
          if (p.status !== 'approved') return false;
          const scheduledDate = new Date(p.scheduledDate);
          if (p.scheduledTime === 'AM') {
            scheduledDate.setHours(8, 0, 0, 0);
          } else {
            scheduledDate.setHours(17, 0, 0, 0);
          }
          return scheduledDate <= now;
        });
      }

      return NextResponse.json({ posts });
    }

    // Fallback to in-memory
    let posts = [...memoryPosts];
    if (status) {
      posts = posts.filter(p => p.status === status);
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
      if (isSupabaseConfigured()) {
        // Upsert all posts
        const dbPosts = body.posts.map(toDbFormat);
        const { error } = await supabase
          .from('content_posts')
          .upsert(dbPosts, { onConflict: 'id' });

        if (error) throw error;
        return NextResponse.json({ success: true, synced: body.posts.length });
      }

      // Fallback to in-memory
      memoryPosts = body.posts;
      return NextResponse.json({ success: true, synced: body.posts.length });
    }

    // Create single post
    const newPost: ContentPost = {
      ...body,
      id: body.id || `post-${Date.now()}`,
      status: body.status || 'draft',
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('content_posts')
        .insert(toDbFormat(newPost))
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, post: fromDbFormat(data) });
    }

    // Fallback to in-memory
    memoryPosts.push(newPost);
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

    // Add timestamps for status changes
    if (updates.status === 'approved') {
      updates.approvedAt = new Date().toISOString();
    }
    if (updates.status === 'posted') {
      updates.publishedAt = new Date().toISOString();
    }

    if (isSupabaseConfigured()) {
      // Convert to DB format
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.approvedAt) dbUpdates.approved_at = updates.approvedAt;
      if (updates.publishedAt) dbUpdates.published_at = updates.publishedAt;
      if (updates.publishError) dbUpdates.publish_error = updates.publishError;
      if (updates.text) dbUpdates.text = updates.text;
      if (updates.edited !== undefined) dbUpdates.edited = updates.edited;

      const { data, error } = await supabase
        .from('content_posts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, post: fromDbFormat(data) });
    }

    // Fallback to in-memory
    const index = memoryPosts.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    memoryPosts[index] = { ...memoryPosts[index], ...updates };
    return NextResponse.json({ success: true, post: memoryPosts[index] });
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

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Fallback to in-memory
    memoryPosts = memoryPosts.filter(p => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
