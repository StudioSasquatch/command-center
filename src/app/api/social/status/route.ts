import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TOKENS_PATH = join(process.cwd(), 'data', 'oauth-tokens.json');

interface TokenInfo {
  connected: boolean;
  expiresAt?: string;
  instagramUserId?: string;
  facebookPageId?: string;
}

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

function getTokens(): StoredTokens {
  if (!existsSync(TOKENS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export async function GET() {
  const tokens = getTokens();
  
  // Check both file storage and environment variables
  const linkedinToken = tokens.linkedin?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
  const metaToken = tokens.meta?.accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
  
  const status: Record<string, TokenInfo> = {
    twitter: {
      connected: true, // bird CLI handles this
    },
    linkedin: {
      connected: !!linkedinToken,
      expiresAt: tokens.linkedin?.obtainedAt 
        ? new Date(new Date(tokens.linkedin.obtainedAt).getTime() + (tokens.linkedin.expiresIn || 0) * 1000).toISOString()
        : undefined
    },
    facebook: {
      connected: !!metaToken,
      expiresAt: tokens.meta?.obtainedAt 
        ? new Date(new Date(tokens.meta.obtainedAt).getTime() + (tokens.meta.expiresIn || 0) * 1000).toISOString()
        : undefined
    },
    instagram: {
      connected: !!(tokens.meta?.instagramUserId || process.env.INSTAGRAM_USER_ID),
      instagramUserId: tokens.meta?.instagramUserId,
      facebookPageId: tokens.meta?.facebookPageId
    }
  };

  return NextResponse.json({ 
    status,
    lastUpdated: new Date().toISOString()
  });
}
