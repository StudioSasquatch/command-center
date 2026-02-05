import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface PlatformAnalytics {
  platform: string;
  handle: string;
  followers: number | null;
  following?: number | null;
  posts?: number | null;
  profileUrl: string;
  error?: string;
}

// OAuth 1.0a signature for Twitter
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');
}

function generateOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // Combine OAuth params with query params for signature
  const allParams = { ...oauthParams, ...params };
  
  const signature = generateOAuthSignature(
    method,
    url.split('?')[0], // Base URL without query string
    allParams,
    consumerSecret,
    accessTokenSecret
  );

  oauthParams.oauth_signature = signature;

  const header = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${header}`;
}

async function getTwitterAnalytics(): Promise<PlatformAnalytics> {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return {
      platform: 'twitter',
      handle: '@jkirby_eth',
      followers: null,
      profileUrl: 'https://x.com/jkirby_eth',
      error: 'API credentials not configured',
    };
  }

  try {
    const baseUrl = 'https://api.x.com/2/users/me';
    const params = { 'user.fields': 'public_metrics,username' };
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${baseUrl}?${queryString}`;

    const authHeader = generateOAuthHeader(
      'GET',
      baseUrl,
      params,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    );

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const user = data.data;
    const metrics = user.public_metrics;

    return {
      platform: 'twitter',
      handle: `@${user.username}`,
      followers: metrics?.followers_count ?? null,
      following: metrics?.following_count ?? null,
      posts: metrics?.tweet_count ?? null,
      profileUrl: `https://x.com/${user.username}`,
    };
  } catch (error) {
    console.error('Twitter analytics error:', error);
    return {
      platform: 'twitter',
      handle: '@jkirby_eth',
      followers: null,
      profileUrl: 'https://x.com/jkirby_eth',
      error: error instanceof Error ? error.message : 'Failed to fetch',
    };
  }
}

async function getLinkedInAnalytics(): Promise<PlatformAnalytics> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      platform: 'linkedin',
      handle: 'Jeremy Kirby',
      followers: null,
      profileUrl: 'https://linkedin.com/in/jeremykirby',
      error: 'Not connected',
    };
  }

  try {
    // Get basic profile info using OpenID Connect userinfo endpoint
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error('LinkedIn profile error:', profileRes.status, errText);
      throw new Error(`LinkedIn API: ${profileRes.status}`);
    }

    const profile = await profileRes.json();

    // LinkedIn basic API doesn't expose follower/connection counts
    // That requires Marketing API or Partner Program approval
    // We show "Connected" status with profile info instead
    return {
      platform: 'linkedin',
      handle: profile.name || 'Jeremy Kirby',
      followers: null, // Requires Marketing API
      profileUrl: 'https://linkedin.com/in/jeremykirby',
      // No error - we're connected, just can't get follower count
    };
  } catch (error) {
    console.error('LinkedIn analytics error:', error);
    return {
      platform: 'linkedin',
      handle: 'Jeremy Kirby',
      followers: null,
      profileUrl: 'https://linkedin.com/in/jeremykirby',
      error: error instanceof Error ? error.message : 'Failed to fetch',
    };
  }
}

async function getInstagramAnalytics(): Promise<PlatformAnalytics> {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken) {
    return {
      platform: 'instagram',
      handle: '@jkirby_eth',
      followers: null,
      profileUrl: 'https://instagram.com/jkirby_eth',
      error: 'No access token',
    };
  }
  
  if (!instagramId) {
    return {
      platform: 'instagram',
      handle: '@jkirby_eth',
      followers: null,
      profileUrl: 'https://instagram.com/jkirby_eth',
      error: 'No Instagram User ID',
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${instagramId}?fields=username,followers_count,follows_count,media_count&access_token=${accessToken}`
    );

    const data = await response.json();
    
    if (!response.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${response.status}`;
      return {
        platform: 'instagram',
        handle: '@jkirby_eth',
        followers: null,
        profileUrl: 'https://instagram.com/jkirby_eth',
        error: errMsg,
      };
    }

    return {
      platform: 'instagram',
      handle: data.username ? `@${data.username}` : '@jkirby_eth',
      followers: data.followers_count ?? null,
      following: data.follows_count ?? null,
      posts: data.media_count ?? null,
      profileUrl: `https://instagram.com/${data.username || 'jkirby_eth'}`,
    };
  } catch (error) {
    return {
      platform: 'instagram',
      handle: '@jkirby_eth',
      followers: null,
      profileUrl: 'https://instagram.com/jkirby_eth',
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

async function getFacebookAnalytics(): Promise<PlatformAnalytics> {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken) {
    return {
      platform: 'facebook',
      handle: 'JKirbyETH',
      followers: null,
      profileUrl: 'https://facebook.com/JKirbyETH',
      error: 'No access token',
    };
  }
  
  if (!pageId) {
    return {
      platform: 'facebook',
      handle: 'JKirbyETH',
      followers: null,
      profileUrl: 'https://facebook.com/JKirbyETH',
      error: 'No Page ID configured',
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}?fields=name,followers_count,fan_count&access_token=${accessToken}`
    );

    const data = await response.json();
    
    if (!response.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${response.status}`;
      return {
        platform: 'facebook',
        handle: 'JKirbyETH',
        followers: null,
        profileUrl: 'https://facebook.com/JKirbyETH',
        error: errMsg,
      };
    }

    return {
      platform: 'facebook',
      handle: data.name || 'JKirbyETH',
      followers: data.followers_count ?? data.fan_count ?? null,
      profileUrl: `https://facebook.com/${pageId}`,
    };
  } catch (error) {
    return {
      platform: 'facebook',
      handle: 'JKirbyETH',
      followers: null,
      profileUrl: 'https://facebook.com/JKirbyETH',
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function GET() {
  try {
    // Fetch all platforms in parallel
    const [twitter, linkedin, instagram, facebook] = await Promise.all([
      getTwitterAnalytics(),
      getLinkedInAnalytics(),
      getInstagramAnalytics(),
      getFacebookAnalytics(),
    ]);

    const analytics = { twitter, linkedin, instagram, facebook };

    // Calculate totals (only count non-null values)
    const totalFollowers = [twitter, linkedin, instagram, facebook]
      .reduce((sum, p) => sum + (p.followers || 0), 0);

    return NextResponse.json({
      analytics,
      totals: {
        followers: totalFollowers,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
