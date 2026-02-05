// Social Platform Integration Library
// Handles posting to X, LinkedIn, Instagram, Facebook

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PostContent {
  text: string;
  mediaUrls?: string[];
  platforms: string[];
  scheduledFor?: Date;
}

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

const TOKENS_PATH = join(process.cwd(), 'data', 'oauth-tokens.json');

interface StoredTokens {
  linkedin?: {
    accessToken?: string;
    expiresIn?: number;
    obtainedAt?: string;
  };
  meta?: {
    accessToken?: string;
    expiresIn?: number;
    obtainedAt?: string;
    instagramUserId?: string;
    facebookPageId?: string;
  };
}

function getStoredTokens(): StoredTokens {
  if (!existsSync(TOKENS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

// Get LinkedIn token (from stored OAuth or env)
function getLinkedInToken(): string | undefined {
  const tokens = getStoredTokens();
  return tokens.linkedin?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
}

// Get Meta token (from stored OAuth or env)
function getMetaToken(): string | undefined {
  const tokens = getStoredTokens();
  return tokens.meta?.accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
}

// Get Instagram user ID (from stored OAuth)
function getInstagramUserId(): string | undefined {
  const tokens = getStoredTokens();
  return tokens.meta?.instagramUserId;
}

// LinkedIn API
export async function postToLinkedIn(content: string, accessToken?: string): Promise<PostResult> {
  const token = accessToken || getLinkedInToken();
  
  if (!token) {
    return { platform: 'linkedin', success: false, error: 'Not connected - click Connect to authorize' };
  }

  try {
    // Get user profile URN first
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!profileRes.ok) {
      return { platform: 'linkedin', success: false, error: 'Failed to get profile' };
    }
    
    const profile = await profileRes.json();
    const authorUrn = `urn:li:person:${profile.sub}`;

    // Create post
    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    if (!postRes.ok) {
      const error = await postRes.text();
      return { platform: 'linkedin', success: false, error };
    }

    const result = await postRes.json();
    return { 
      platform: 'linkedin', 
      success: true, 
      postId: result.id,
      postUrl: `https://www.linkedin.com/feed/update/${result.id}`
    };
  } catch (error) {
    return { platform: 'linkedin', success: false, error: String(error) };
  }
}

// Facebook API
export async function postToFacebook(content: string, pageId?: string, accessToken?: string): Promise<PostResult> {
  const token = accessToken || getMetaToken();
  
  if (!token) {
    return { platform: 'facebook', success: false, error: 'Not connected - click Connect to authorize' };
  }

  try {
    // Post to user's feed or page
    const endpoint = pageId 
      ? `https://graph.facebook.com/v18.0/${pageId}/feed`
      : 'https://graph.facebook.com/v18.0/me/feed';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        access_token: token
      })
    });

    if (!res.ok) {
      const error = await res.json();
      return { platform: 'facebook', success: false, error: error.error?.message || 'Failed to post' };
    }

    const result = await res.json();
    return { 
      platform: 'facebook', 
      success: true, 
      postId: result.id,
      postUrl: `https://www.facebook.com/${result.id}`
    };
  } catch (error) {
    return { platform: 'facebook', success: false, error: String(error) };
  }
}

// Instagram API (requires business account + media)
export async function postToInstagram(
  content: string, 
  imageUrl: string,
  igUserId?: string,
  accessToken?: string
): Promise<PostResult> {
  const token = accessToken || getMetaToken();
  const userId = igUserId || getInstagramUserId();
  
  if (!token || !userId) {
    return { platform: 'instagram', success: false, error: 'Not connected - click Connect to authorize' };
  }

  if (!imageUrl) {
    return { platform: 'instagram', success: false, error: 'Instagram requires an image' };
  }

  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: content,
          access_token: token
        })
      }
    );

    if (!containerRes.ok) {
      const error = await containerRes.json();
      return { platform: 'instagram', success: false, error: error.error?.message || 'Failed to create media' };
    }

    const container = await containerRes.json();

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: token
        })
      }
    );

    if (!publishRes.ok) {
      const error = await publishRes.json();
      return { platform: 'instagram', success: false, error: error.error?.message || 'Failed to publish' };
    }

    const result = await publishRes.json();
    return { 
      platform: 'instagram', 
      success: true, 
      postId: result.id,
      postUrl: `https://www.instagram.com/p/${result.id}`
    };
  } catch (error) {
    return { platform: 'instagram', success: false, error: String(error) };
  }
}

// X/Twitter - uses bird CLI
export async function postToTwitter(content: string): Promise<PostResult> {
  // This will be handled via the bird CLI on the server
  // For now, return a placeholder
  return { 
    platform: 'twitter', 
    success: false, 
    error: 'Use bird CLI directly for X posts' 
  };
}

// Multi-platform posting
export async function postToAll(content: PostContent): Promise<PostResult[]> {
  const results: PostResult[] = [];

  for (const platform of content.platforms) {
    switch (platform) {
      case 'twitter':
        results.push(await postToTwitter(content.text));
        break;
      case 'linkedin':
        results.push(await postToLinkedIn(content.text));
        break;
      case 'facebook':
        results.push(await postToFacebook(content.text));
        break;
      case 'instagram':
        if (content.mediaUrls?.[0]) {
          results.push(await postToInstagram(content.text, content.mediaUrls[0]));
        } else {
          results.push({ platform: 'instagram', success: false, error: 'Image required' });
        }
        break;
    }
  }

  return results;
}
