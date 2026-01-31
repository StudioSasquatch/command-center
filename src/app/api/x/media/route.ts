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
  bodyParams: Record<string, string>,
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

  const allParams = { ...oauthParams, ...bodyParams };

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

async function uploadMedia(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const url = 'https://upload.twitter.com/1.1/media/upload.json';
  const method = 'POST';

  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  const bodyParams: Record<string, string> = {
    media_data: cleanBase64,
  };

  // For media upload, we need to include body params in signature
  const authHeader = generateOAuthHeader(
    method,
    url,
    bodyParams,
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  const formBody = Object.entries(bodyParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formBody),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            const parsed = JSON.parse(data);
            resolve(parsed.media_id_string);
          } else {
            reject(new Error(`Media upload error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(formBody);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    const { media, mimeType } = await request.json();

    if (!media) {
      return NextResponse.json({ error: 'Media data is required' }, { status: 400 });
    }

    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || 
        !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_TOKEN_SECRET) {
      return NextResponse.json({ error: 'X API credentials not configured' }, { status: 500 });
    }

    const mediaId = await uploadMedia(media, mimeType || 'image/jpeg');

    return NextResponse.json({
      success: true,
      mediaId,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload media' },
      { status: 500 }
    );
  }
}
