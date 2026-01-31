import { NextResponse } from 'next/server';
import crypto from 'crypto';
import https from 'https';

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
  queryParams: Record<string, string>,
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

  const allParams = { ...oauthParams, ...queryParams };

  const signature = generateOAuthSignature(
    method,
    url,
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

interface XUserData {
  id: string;
  name: string;
  username: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
}

async function getAuthenticatedUser(): Promise<XUserData> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const baseUrl = 'https://api.x.com/2/users/me';
  const queryParams: Record<string, string> = {
    'user.fields': 'public_metrics,profile_image_url,description',
  };

  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const fullUrl = `${baseUrl}?${queryString}`;

  const authHeader = generateOAuthHeader(
    'GET',
    baseUrl,
    queryParams,
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  return new Promise((resolve, reject) => {
    https.get(
      fullUrl,
      {
        headers: {
          'Authorization': authHeader,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            resolve(parsed.data);
          } else {
            reject(new Error(`X API error: ${res.statusCode} - ${data}`));
          }
        });
      }
    ).on('error', reject);
  });
}

async function getRecentTweets(userId: string): Promise<Tweet[]> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const baseUrl = `https://api.x.com/2/users/${userId}/tweets`;
  const queryParams: Record<string, string> = {
    'max_results': '10',
    'tweet.fields': 'created_at,public_metrics',
    'exclude': 'retweets,replies',
  };

  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const fullUrl = `${baseUrl}?${queryString}`;

  const authHeader = generateOAuthHeader(
    'GET',
    baseUrl,
    queryParams,
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  return new Promise((resolve, reject) => {
    https.get(
      fullUrl,
      {
        headers: {
          'Authorization': authHeader,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            resolve(parsed.data || []);
          } else {
            reject(new Error(`X API error: ${res.statusCode} - ${data}`));
          }
        });
      }
    ).on('error', reject);
  });
}

export async function GET() {
  try {
    // Check for credentials
    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || 
        !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_TOKEN_SECRET) {
      return NextResponse.json({
        error: 'X API credentials not configured',
        isLive: false,
        user: null,
        aggregatedMetrics: null,
      });
    }

    // Get user data with metrics
    const user = await getAuthenticatedUser();
    
    // Get recent tweets to calculate engagement
    let totalImpressions = 0;
    let totalEngagements = 0;
    let tweetCount = 0;

    try {
      const tweets = await getRecentTweets(user.id);
      for (const tweet of tweets) {
        if (tweet.public_metrics) {
          totalImpressions += tweet.public_metrics.impression_count || 0;
          totalEngagements += (
            (tweet.public_metrics.like_count || 0) +
            (tweet.public_metrics.retweet_count || 0) +
            (tweet.public_metrics.reply_count || 0)
          );
          tweetCount++;
        }
      }
    } catch {
      // Tweet metrics might not be available, continue with user data
      console.log('Could not fetch tweet metrics');
    }

    const engagementRate = totalImpressions > 0 
      ? ((totalEngagements / totalImpressions) * 100).toFixed(2)
      : '0';

    return NextResponse.json({
      isLive: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        followers: user.public_metrics?.followers_count || 0,
        following: user.public_metrics?.following_count || 0,
        tweetCount: user.public_metrics?.tweet_count || 0,
      },
      aggregatedMetrics: {
        followers: user.public_metrics?.followers_count || 0,
        recentImpressions: totalImpressions,
        engagementRate: parseFloat(engagementRate),
        tweetsAnalyzed: tweetCount,
      },
    });
  } catch (error) {
    console.error('X Analytics error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch X analytics',
      isLive: false,
      user: null,
      aggregatedMetrics: null,
    });
  }
}

export async function POST() {
  // POST does the same as GET for now
  return GET();
}
