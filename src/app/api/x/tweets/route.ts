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

  // Combine oauth params with query params for signature
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

async function getUserTweets(userId: string, maxResults: number = 10): Promise<Tweet[]> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const baseUrl = `https://api.x.com/2/users/${userId}/tweets`;
  const queryParams: Record<string, string> = {
    'max_results': maxResults.toString(),
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

async function getAuthenticatedUserId(): Promise<string> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const url = 'https://api.x.com/2/users/me';
  
  const authHeader = generateOAuthHeader(
    'GET',
    url,
    {},
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  return new Promise((resolve, reject) => {
    https.get(
      url,
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
            resolve(parsed.data.id);
          } else {
            reject(new Error(`Failed to get user: ${res.statusCode} - ${data}`));
          }
        });
      }
    ).on('error', reject);
  });
}

export async function GET() {
  try {
    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || 
        !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_TOKEN_SECRET) {
      return NextResponse.json({ error: 'X API credentials not configured' }, { status: 500 });
    }

    // Get the authenticated user's ID first
    const userId = await getAuthenticatedUserId();
    const tweets = await getUserTweets(userId, 5);

    return NextResponse.json({
      success: true,
      tweets: tweets.map(t => ({
        id: t.id,
        text: t.text,
        createdAt: t.created_at,
        metrics: t.public_metrics,
        url: `https://x.com/jkirby_eth/status/${t.id}`,
      })),
    });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}
