/**
 * API Authentication Helper
 *
 * Simple API key authentication for protecting API routes.
 * Set API_SECRET_KEY in environment variables.
 *
 * Usage in API routes:
 *   import { requireAuth, AuthError } from '@/lib/auth';
 *
 *   export async function GET(request: NextRequest) {
 *     const authResult = requireAuth(request);
 *     if (authResult instanceof AuthError) {
 *       return authResult.toResponse();
 *     }
 *     // Authenticated - proceed with request
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

export class AuthError {
  constructor(
    public message: string,
    public status: number = 401
  ) {}

  toResponse(): NextResponse {
    return NextResponse.json(
      { error: this.message },
      { status: this.status }
    );
  }
}

/**
 * Check if a request is authenticated.
 *
 * Checks for API key in:
 * 1. Authorization header (Bearer token)
 * 2. X-API-Key header
 *
 * @param request - The incoming request
 * @returns true if authenticated, AuthError if not
 */
export function requireAuth(request: NextRequest): true | AuthError {
  const apiKey = process.env.API_SECRET_KEY;

  // If no API key is set, allow all requests (development mode)
  if (!apiKey) {
    console.warn('⚠️  API_SECRET_KEY not set - API routes are unprotected!');
    return true;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === apiKey) {
      return true;
    }
  }

  // Check X-API-Key header
  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey === apiKey) {
    return true;
  }

  return new AuthError('Unauthorized - Invalid or missing API key');
}

/**
 * Check if request is from localhost (for dashboard access)
 */
export function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const forwarded = request.headers.get('x-forwarded-for') || '';

  return (
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    forwarded.includes('127.0.0.1') ||
    forwarded.includes('::1')
  );
}

/**
 * Require authentication unless request is from localhost
 */
export function requireAuthOrLocal(request: NextRequest): true | AuthError {
  if (isLocalhost(request)) {
    return true;
  }
  return requireAuth(request);
}
