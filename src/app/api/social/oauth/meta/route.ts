import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = 'https://hq.kirbyholdings.ltd/api/social/oauth/meta';

// GET - Start OAuth flow or handle callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // OAuth callback with code
  if (code) {
    try {
      // Step 1: Exchange code for short-lived user token
      const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', META_APP_ID || '');
      tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      tokenUrl.searchParams.set('client_secret', META_APP_SECRET || '');
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        return NextResponse.redirect(new URL(`/social?error=meta_token_failed&details=${encodeURIComponent(errorData.error?.message || 'Unknown error')}`, request.url));
      }

      const tokenData = await tokenRes.json();
      
      // Step 2: Exchange for long-lived user token (60 days)
      const longLivedUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
      longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
      longLivedUrl.searchParams.set('client_id', META_APP_ID || '');
      longLivedUrl.searchParams.set('client_secret', META_APP_SECRET || '');
      longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

      const longLivedRes = await fetch(longLivedUrl.toString());
      const longLivedData = longLivedRes.ok ? await longLivedRes.json() : tokenData;

      const userAccessToken = longLivedData.access_token || tokenData.access_token;

      // Step 3: Get Pages with PERMANENT page access tokens
      // When using a long-lived user token, the page tokens returned are also long-lived
      // and effectively never expire as long as the user's permissions remain valid
      let pageId = '';
      let pageAccessToken = '';
      let pageName = '';
      let instagramUserId = '';
      
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`
      );
      
      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        
        // Log ALL available pages for debugging
        console.log('=== AVAILABLE FACEBOOK PAGES ===');
        pagesData.data?.forEach((p: { id: string; name: string }, i: number) => {
          console.log(`Page ${i + 1}: "${p.name}" (ID: ${p.id})`);
        });
        console.log('================================');
        
        // Find JKirbyETH page specifically, or fall back to first page
        const targetPageName = 'JKirbyETH';
        const targetPage = pagesData.data?.find((p: { name: string }) => p.name === targetPageName) || pagesData.data?.[0];
        
        if (targetPage) {
          pageId = targetPage.id;
          pageName = targetPage.name;
          // This page token is long-lived (effectively permanent) because
          // we used a long-lived user token to request it
          pageAccessToken = targetPage.access_token;
          
          // Step 4: Get Instagram Business Account linked to the page
          const igRes = await fetch(
            `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
          );
          if (igRes.ok) {
            const igData = await igRes.json();
            if (igData.instagram_business_account?.id) {
              instagramUserId = igData.instagram_business_account.id;
            }
          }
        }
      }

      if (!pageAccessToken) {
        return NextResponse.redirect(new URL(`/social?error=no_page_found&details=${encodeURIComponent('No Facebook Page found. Make sure you have a Facebook Page connected to your account.')}`, request.url));
      }

      // Build response with tokens to save
      const baseUrl = new URL(request.url).origin;
      const successUrl = new URL('/social', baseUrl);
      successUrl.searchParams.set('meta_connected', 'true');
      successUrl.searchParams.set('page_name', pageName);
      if (instagramUserId) successUrl.searchParams.set('ig_connected', 'true');
      
      // Store tokens in query params for display (they'll need to be saved to env vars)
      // The page access token is the important one - it's effectively permanent
      successUrl.searchParams.set('show_tokens', 'true');
      
      // Log tokens to Vercel function logs AND return them for Noctis to capture
      console.log('=== META OAUTH SUCCESS ===');
      console.log('Page:', pageName, '(ID:', pageId + ')');
      console.log('Instagram ID:', instagramUserId || 'Not connected');
      console.log('');
      console.log('=== SAVE THESE ENV VARS ===');
      console.log('FACEBOOK_PAGE_ID=' + pageId);
      console.log('FACEBOOK_PAGE_ACCESS_TOKEN=' + pageAccessToken);
      if (instagramUserId) console.log('INSTAGRAM_USER_ID=' + instagramUserId);
      console.log('');
      console.log('NOTE: This page token is PERMANENT (does not expire)');
      console.log('============================');

      // Also return as JSON if requested via Accept header
      if (request.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json({
          success: true,
          pageId,
          pageName,
          pageAccessToken,
          instagramUserId: instagramUserId || null,
          note: 'Page access token is permanent and will not expire',
        });
      }

      return NextResponse.redirect(successUrl.toString());
    } catch (err) {
      console.error('Meta OAuth error:', err);
      return NextResponse.redirect(new URL(`/social?error=meta_exchange_failed`, request.url));
    }
  }

  // OAuth error
  if (error) {
    return NextResponse.redirect(new URL(`/social?error=${error}`, request.url));
  }

  // Start OAuth flow
  if (!META_APP_ID) {
    return NextResponse.json({ error: 'Meta App ID not configured' }, { status: 500 });
  }

  // Request all needed permissions
  // pages_read_engagement: Read page insights and engagement
  // pages_manage_posts: Post to pages
  // instagram_basic: Read Instagram profile
  // instagram_content_publish: Post to Instagram
  // business_management: Access business assets (needed for some IG features)
  const scopes = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement', 
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'business_management'
  ].join(',');

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  authUrl.searchParams.set('client_id', META_APP_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', Math.random().toString(36).slice(2));
  // Request re-authorization to ensure fresh permissions
  authUrl.searchParams.set('auth_type', 'rerequest');

  return NextResponse.redirect(authUrl.toString());
}
