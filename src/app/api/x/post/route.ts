import { NextResponse } from 'next/server';
import crypto from 'crypto';
import https from 'https';

// X API OAuth 1.0a signature generation
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

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
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

async function postTweet(text: string, mediaIds?: string[]): Promise<{ id: string; text: string }> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const url = 'https://api.x.com/2/tweets';
  const method = 'POST';

  const authHeader = generateOAuthHeader(
    method,
    url,
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  // Build tweet payload
  const payload: { text: string; media?: { media_ids: string[] } } = { text };
  if (mediaIds && mediaIds.length > 0) {
    payload.media = { media_ids: mediaIds };
  }

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            const parsed = JSON.parse(data);
            resolve(parsed.data);
          } else {
            reject(new Error(`X API error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    const { text, mediaIds } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 280) {
      return NextResponse.json({ error: 'Tweet exceeds 280 characters' }, { status: 400 });
    }

    // Check for required env vars
    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || 
        !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_TOKEN_SECRET) {
      return NextResponse.json({ error: 'X API credentials not configured' }, { status: 500 });
    }

    const result = await postTweet(text, mediaIds);

    return NextResponse.json({
      success: true,
      tweet: {
        id: result.id,
        text: result.text,
        url: `https://x.com/jkirby_eth/status/${result.id}`,
      },
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post tweet' },
      { status: 500 }
    );
  }
}
