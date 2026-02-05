import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ContentPost {
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
  publishError?: string;
}

const POSTS_FILE = path.join(process.cwd(), 'data', 'content-posts.json');

async function readPosts(): Promise<ContentPost[]> {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePosts(posts: ContentPost[]): Promise<void> {
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
}

async function updatePostStatus(
  posts: ContentPost[],
  postId: string,
  updates: Partial<ContentPost>
): Promise<ContentPost[]> {
  return posts.map(p => (p.id === postId ? { ...p, ...updates } : p));
}

// Post to X via internal API
async function postToX(post: ContentPost, baseUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    let mediaIds: string[] = [];

    // Upload media if present
    if (post.mediaUrl) {
      try {
        const mediaUrl = post.mediaUrl.startsWith('http')
          ? post.mediaUrl
          : `${baseUrl}${post.mediaUrl}`;

        const imgResponse = await fetch(mediaUrl);
        if (imgResponse.ok) {
          const blob = await imgResponse.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const dataUrl = `data:${blob.type};base64,${base64}`;

          const mediaResponse = await fetch(`${baseUrl}/api/x/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media: dataUrl, mimeType: blob.type }),
          });

          const mediaData = await mediaResponse.json();
          if (mediaData.success && mediaData.mediaId) {
            mediaIds.push(mediaData.mediaId);
          }
        }
      } catch (mediaErr) {
        console.error('Media upload failed:', mediaErr);
        // Continue without media
      }
    }

    // Post the content
    const response = await fetch(`${baseUrl}/api/x/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: post.text,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
      }),
    });

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Cron endpoint - called by Vercel Cron
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret if set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';

    let posts = await readPosts();
    const now = new Date();

    // Find approved posts that are due
    const duePosts = posts.filter(p => {
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

    if (duePosts.length === 0) {
      return NextResponse.json({
        message: 'No posts due for publishing',
        checked: posts.filter(p => p.status === 'approved').length,
        published: 0,
        duration: Date.now() - startTime,
      });
    }

    const results: Array<{ id: string; platform: string; success: boolean; error?: string }> = [];

    for (const post of duePosts) {
      // Mark as publishing
      posts = await updatePostStatus(posts, post.id, { status: 'publishing' });
      await writePosts(posts);

      let result: { success: boolean; error?: string };

      // Route to appropriate platform
      switch (post.platform) {
        case 'x':
          result = await postToX(post, baseUrl);
          break;
        // Add other platforms here
        case 'linkedin':
        case 'facebook':
        case 'instagram':
          result = { success: false, error: `${post.platform} auto-posting not yet implemented` };
          break;
        default:
          result = { success: false, error: `Unknown platform: ${post.platform}` };
      }

      // Update status based on result
      posts = await updatePostStatus(posts, post.id, {
        status: result.success ? 'posted' : 'failed',
        publishError: result.error,
      });

      results.push({
        id: post.id,
        platform: post.platform,
        success: result.success,
        error: result.error,
      });
    }

    await writePosts(posts);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Published ${successful}/${duePosts.length} posts`,
      published: successful,
      failed,
      results,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Auto-publish error:', error);
    return NextResponse.json(
      { error: 'Auto-publish failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Manual trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
