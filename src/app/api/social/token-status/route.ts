import { NextResponse } from 'next/server';

interface TokenStatus {
  platform: string;
  status: 'valid' | 'expired' | 'missing' | 'unknown';
  message: string;
  expiresAt?: string;
}

async function checkMetaToken(): Promise<TokenStatus> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  
  if (!token) {
    return {
      platform: 'meta',
      status: 'missing',
      message: 'No token configured',
    };
  }

  try {
    // Debug token to check validity and expiration
    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
    );
    
    if (!debugRes.ok) {
      return {
        platform: 'meta',
        status: 'expired',
        message: 'Token validation failed',
      };
    }

    const debugData = await debugRes.json();
    const tokenData = debugData.data;

    if (!tokenData.is_valid) {
      return {
        platform: 'meta',
        status: 'expired',
        message: tokenData.error?.message || 'Token is invalid',
      };
    }

    // Check if token expires
    if (tokenData.expires_at === 0) {
      return {
        platform: 'meta',
        status: 'valid',
        message: 'Token is permanent (never expires)',
      };
    }

    const expiresAt = new Date(tokenData.expires_at * 1000);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        platform: 'meta',
        status: 'expired',
        message: 'Token has expired',
        expiresAt: expiresAt.toISOString(),
      };
    }

    if (daysUntilExpiry < 7) {
      return {
        platform: 'meta',
        status: 'valid',
        message: `Token expires in ${daysUntilExpiry} days - refresh soon`,
        expiresAt: expiresAt.toISOString(),
      };
    }

    return {
      platform: 'meta',
      status: 'valid',
      message: `Token valid for ${daysUntilExpiry} days`,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    return {
      platform: 'meta',
      status: 'unknown',
      message: error instanceof Error ? error.message : 'Check failed',
    };
  }
}

async function checkTwitterToken(): Promise<TokenStatus> {
  const token = process.env.X_ACCESS_TOKEN;
  
  if (!token) {
    return {
      platform: 'twitter',
      status: 'missing',
      message: 'No token configured',
    };
  }

  // Twitter OAuth 1.0a tokens don't expire
  return {
    platform: 'twitter',
    status: 'valid',
    message: 'OAuth 1.0a tokens are permanent',
  };
}

async function checkLinkedInToken(): Promise<TokenStatus> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  
  if (!token) {
    return {
      platform: 'linkedin',
      status: 'missing',
      message: 'No token configured',
    };
  }

  // LinkedIn tokens expire in 60 days, but we can't easily check expiry
  // Would need to store the obtained_at timestamp
  return {
    platform: 'linkedin',
    status: 'valid',
    message: 'Token configured (expires in ~60 days)',
  };
}

export async function GET() {
  const [meta, twitter, linkedin] = await Promise.all([
    checkMetaToken(),
    checkTwitterToken(),
    checkLinkedInToken(),
  ]);

  const allValid = [meta, twitter, linkedin].every(t => t.status === 'valid');
  const anyExpired = [meta, twitter, linkedin].some(t => t.status === 'expired');

  return NextResponse.json({
    tokens: { meta, twitter, linkedin },
    summary: {
      allValid,
      anyExpired,
      needsAttention: anyExpired || [meta, twitter, linkedin].some(t => t.status === 'missing'),
    },
    checkedAt: new Date().toISOString(),
  });
}
