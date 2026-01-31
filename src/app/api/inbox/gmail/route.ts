import { NextResponse } from 'next/server';

// Gmail API is not available on Vercel - return empty state
export async function GET() {
  return NextResponse.json({
    emails: [],
    fetchedAt: new Date().toISOString(),
    error: 'Gmail integration not available in production',
    fromCache: false,
  });
}

export async function POST() {
  return NextResponse.json({
    emails: [],
    fetchedAt: new Date().toISOString(),
    error: 'Gmail integration not available in production',
    fromCache: false,
  });
}
