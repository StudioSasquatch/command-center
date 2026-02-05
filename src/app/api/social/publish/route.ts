import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPostsDueNow, updatePost } from '@/lib/scheduled-posts';
import { postToLinkedIn, postToFacebook, postToInstagram, PostResult } from '@/lib/social-platforms';

const execAsync = promisify(exec);

// Post to X via bird CLI
async function postToX(content: string): Promise<PostResult> {
  try {
    const escapedContent = content.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const { stdout, stderr } = await execAsync(`bird post "${escapedContent}"`, {
      timeout: 30000
    });
    
    if (stderr && !stdout) {
      return { platform: 'twitter', success: false, error: stderr };
    }
    
    // Parse tweet ID from output
    const match = stdout.match(/(\d{19})/);
    const tweetId = match ? match[1] : undefined;
    
    return { 
      platform: 'twitter', 
      success: true, 
      postId: tweetId,
      postUrl: tweetId ? `https://x.com/jkirby_eth/status/${tweetId}` : undefined
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { platform: 'twitter', success: false, error: err.message };
  }
}

// Publish scheduled posts that are due
export async function GET(request: NextRequest) {
  try {
    const postsDue = getPostsDueNow();
    
    if (postsDue.length === 0) {
      return NextResponse.json({ 
        message: 'No posts due for publishing',
        published: 0
      });
    }

    const publishResults = [];
    
    for (const post of postsDue) {
      // Update status to publishing
      updatePost(post.id, { status: 'publishing' });
      
      const results: PostResult[] = [];
      
      // Publish to each platform
      for (const platform of post.platforms) {
        switch (platform) {
          case 'twitter':
            results.push(await postToX(post.content));
            break;
          case 'linkedin':
            results.push(await postToLinkedIn(post.content));
            break;
          case 'facebook':
            results.push(await postToFacebook(post.content));
            break;
          case 'instagram':
            if (post.mediaUrls?.[0]) {
              results.push(await postToInstagram(post.content, post.mediaUrls[0]));
            } else {
              results.push({ platform: 'instagram', success: false, error: 'Image required for Instagram' });
            }
            break;
          default:
            results.push({ platform, success: false, error: 'Unknown platform' });
        }
      }

      // Update post status and results
      const allSuccessful = results.every(r => r.success);
      updatePost(post.id, {
        status: allSuccessful ? 'published' : 'failed',
        publishedAt: new Date().toISOString(),
        results
      });

      publishResults.push({
        postId: post.id,
        content: post.content.substring(0, 50) + '...',
        platforms: post.platforms,
        success: allSuccessful,
        results
      });
    }
    
    const successful = publishResults.filter(p => p.success);
    
    return NextResponse.json({
      message: `Published ${successful.length} of ${postsDue.length} due posts`,
      published: successful.length,
      failed: postsDue.length - successful.length,
      results: publishResults
    });
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error publishing scheduled posts:', err);
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts', details: err.message },
      { status: 500 }
    );
  }
}

// Manual trigger via POST (for testing or manual runs)
export async function POST(request: NextRequest) {
  return GET(request);
}