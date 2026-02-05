import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { postToLinkedIn, postToFacebook, postToInstagram, PostResult } from '@/lib/social-platforms';
import { addScheduledPost } from '@/lib/scheduled-posts';
import { requireAuth, AuthError } from '@/lib/auth';

interface PostRequest {
  content: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduledFor?: string;
}

// Post to X via bird CLI (using spawn for security - no shell injection possible)
async function postToX(content: string): Promise<PostResult> {
  return new Promise((resolve) => {
    // Validate content length (X limit is 280 chars)
    if (content.length > 280) {
      resolve({ platform: 'twitter', success: false, error: 'Content exceeds 280 characters' });
      return;
    }

    // Use spawn with argument array - no shell interpolation, no injection possible
    const child = spawn('bird', ['post', content], {
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('error', (error) => {
      resolve({ platform: 'twitter', success: false, error: error.message });
    });

    child.on('close', (code) => {
      if (code !== 0 && stderr && !stdout) {
        resolve({ platform: 'twitter', success: false, error: stderr });
        return;
      }

      // Parse tweet ID from output
      const match = stdout.match(/(\d{19})/);
      const tweetId = match ? match[1] : undefined;

      resolve({
        platform: 'twitter',
        success: true,
        postId: tweetId,
        postUrl: tweetId ? `https://x.com/jkirby_eth/status/${tweetId}` : undefined
      });
    });
  });
}

export async function POST(request: NextRequest) {
  // Require authentication for posting
  const authResult = requireAuth(request);
  if (authResult instanceof AuthError) {
    return authResult.toResponse();
  }

  try {
    const body: PostRequest = await request.json();
    const { content, platforms, mediaUrls, scheduledFor } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and at least one platform required' },
        { status: 400 }
      );
    }

    // If scheduled for the future, store it
    if (scheduledFor) {
      const scheduledTime = new Date(scheduledFor);
      if (scheduledTime > new Date()) {
        const post = addScheduledPost({
          content,
          platforms,
          mediaUrls,
          scheduledFor
        });
        return NextResponse.json({ 
          scheduled: true, 
          post,
          message: `Post scheduled for ${scheduledTime.toISOString()}`
        });
      }
    }

    // Post immediately
    const results: PostResult[] = [];

    for (const platform of platforms) {
      switch (platform) {
        case 'twitter':
          results.push(await postToX(content));
          break;
        case 'linkedin':
          results.push(await postToLinkedIn(content));
          break;
        case 'facebook':
          results.push(await postToFacebook(content));
          break;
        case 'instagram':
          if (mediaUrls?.[0]) {
            results.push(await postToInstagram(content, mediaUrls[0]));
          } else {
            results.push({ platform: 'instagram', success: false, error: 'Image required for Instagram' });
          }
          break;
        default:
          results.push({ platform, success: false, error: 'Unknown platform' });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      results,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to post', details: err.message },
      { status: 500 }
    );
  }
}
