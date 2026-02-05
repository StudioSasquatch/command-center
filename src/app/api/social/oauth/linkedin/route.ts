import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/social/oauth/linkedin`
  : 'http://localhost:3000/api/social/oauth/linkedin';

const TOKENS_PATH = join(process.cwd(), 'data', 'oauth-tokens.json');

function getTokens() {
  if (!existsSync(TOKENS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveTokens(tokens: Record<string, unknown>) {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

// GET - Start OAuth flow or handle callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // OAuth callback with code
  if (code) {
    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID || '',
          client_secret: LINKEDIN_CLIENT_SECRET || ''
        })
      });

      if (!tokenRes.ok) {
        const error = await tokenRes.text();
        return NextResponse.redirect(new URL(`/social?error=linkedin_token_failed&details=${encodeURIComponent(error)}`, request.url));
      }

      const tokenData = await tokenRes.json();
      
      // Save token
      const tokens = getTokens();
      tokens.linkedin = {
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
        obtainedAt: new Date().toISOString()
      };
      saveTokens(tokens);

      return NextResponse.redirect(new URL('/social?success=linkedin', request.url));
    } catch (err) {
      return NextResponse.redirect(new URL(`/social?error=linkedin_exchange_failed`, request.url));
    }
  }

  // OAuth error
  if (error) {
    return NextResponse.redirect(new URL(`/social?error=${error}`, request.url));
  }

  // Start OAuth flow
  if (!LINKEDIN_CLIENT_ID) {
    return NextResponse.json({ error: 'LinkedIn client ID not configured' }, { status: 500 });
  }

  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social'  // Required for posting
  ].join(' ');

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', Math.random().toString(36).slice(2));

  return NextResponse.redirect(authUrl.toString());
}
