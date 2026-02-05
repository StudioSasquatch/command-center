# Social Media Center - Command Center Integration

**Status:** Planning & Initial Development  
**Last Updated:** 2026-02-01

## Overview

Unified social media management for the Command Center, supporting:
- **X/Twitter** (existing - `twitter-api.ts`)
- **LinkedIn** (new)
- **Facebook Pages** (new) 
- **Instagram Business** (new)

---

## 1. Platform API Requirements

### 1.1 LinkedIn Marketing API

**Documentation:** https://learn.microsoft.com/en-us/linkedin/marketing/

#### App Registration
1. Go to https://www.linkedin.com/developers/apps
2. Create new app with your Company Page
3. Request Marketing API product access (requires approval)
4. Add OAuth 2.0 redirect URLs

#### Required OAuth Scopes
| Scope | Purpose |
|-------|---------|
| `w_member_social` | Post on behalf of authenticated member |
| `w_organization_social` | Post on behalf of Company Pages |
| `r_organization_social` | Read org posts, comments, likes |
| `r_organization_admin` | Read org analytics and reporting |
| `rw_organization_admin` | Full org page management |
| `r_basicprofile` | Read member basic profile |

#### Key Endpoints
```
POST /rest/posts                    # Create post
GET  /rest/posts/{id}               # Get post details
GET  /rest/organizations/{id}       # Get org info
GET  /rest/networkSizes/{org-urn}   # Follower count
GET  /rest/organizationalEntityShareStatistics  # Post analytics
```

#### Headers Required
```
Authorization: Bearer {access_token}
LinkedIn-Version: 202601
X-Restli-Protocol-Version: 2.0.0
Content-Type: application/json
```

#### Rate Limits
- 100 requests/day for posting (per app)
- Standard REST API limits apply for reads

---

### 1.2 Meta Graph API (Facebook + Instagram)

**Documentation:** https://developers.facebook.com/docs/graph-api/

#### App Registration
1. Go to https://developers.facebook.com/apps/
2. Create Business type app
3. Add Facebook Login product
4. Add Instagram Graph API product
5. Complete Business Verification (required for production)
6. Submit for App Review for extended permissions

#### Required Permissions (Facebook)
| Permission | Purpose |
|------------|---------|
| `pages_show_list` | List pages user manages |
| `pages_read_engagement` | Read page engagement metrics |
| `pages_manage_posts` | Create and manage posts |
| `pages_read_user_content` | Read user posts on page |
| `pages_manage_engagement` | Respond to comments |
| `read_insights` | Access page insights/analytics |
| `business_management` | Business Manager integration |

#### Required Permissions (Instagram)
| Permission | Purpose |
|------------|---------|
| `instagram_basic` | Read profile info |
| `instagram_content_publish` | Publish content |
| `instagram_manage_insights` | Read analytics |
| `instagram_manage_comments` | Manage comments |

#### Key Endpoints (Facebook Pages)
```
GET  /me/accounts                    # List managed pages
GET  /{page-id}                      # Page info
POST /{page-id}/feed                 # Create post
GET  /{page-id}/insights             # Page analytics
GET  /{post-id}/insights             # Post analytics
```

#### Key Endpoints (Instagram)
```
GET  /{ig-user-id}                   # Profile info
GET  /{ig-user-id}/media             # List media
POST /{ig-user-id}/media             # Create media container
POST /{ig-user-id}/media_publish     # Publish media
GET  /{ig-user-id}/insights          # Account insights
GET  /{media-id}/insights            # Media insights
```

#### Rate Limits
- 200 calls/user/hour (standard)
- 4800 calls/user/day
- Posting: varies by account health

---

## 2. Data Models

### 2.1 Unified Post Queue

```typescript
interface SocialPost {
  id: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  
  // Content
  content: {
    text: string;
    media?: SocialMedia[];
    link?: string;
    linkPreview?: {
      title: string;
      description: string;
      image: string;
    };
  };
  
  // Targeting
  platforms: {
    twitter?: { enabled: boolean; accountId: string };
    linkedin?: { enabled: boolean; authorUrn: string; isOrg: boolean };
    facebook?: { enabled: boolean; pageId: string };
    instagram?: { enabled: boolean; accountId: string };
  };
  
  // Scheduling
  scheduledAt?: Date;
  publishedAt?: Date;
  
  // Results
  results?: {
    twitter?: PostResult;
    linkedin?: PostResult;
    facebook?: PostResult;
    instagram?: PostResult;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

interface SocialMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  altText?: string;
  thumbnailUrl?: string;
}

interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: Date;
}
```

### 2.2 Unified Analytics Model

```typescript
interface SocialAnalytics {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  accountId: string;
  accountName: string;
  
  // Profile Metrics
  profile: {
    followers: number;
    following?: number;
    posts: number;
    profileUrl: string;
  };
  
  // Engagement Metrics (aggregated)
  engagement: {
    period: 'day' | 'week' | 'month';
    impressions: number;
    reach: number;
    engagements: number;
    engagementRate: number;
    clicks?: number;
    shares?: number;
    comments?: number;
    likes?: number;
  };
  
  // Recent Posts
  recentPosts: PostAnalytics[];
  
  fetchedAt: Date;
}

interface PostAnalytics {
  postId: string;
  platform: string;
  text: string;
  publishedAt: Date;
  metrics: {
    impressions: number;
    reach?: number;
    engagements: number;
    likes: number;
    comments: number;
    shares: number;
    clicks?: number;
    saves?: number;
  };
}
```

---

## 3. Metrics Dashboard

### Key Metrics to Display

#### Per Platform
- **Followers** (current + growth trend)
- **Impressions** (total views)
- **Engagement Rate** (engagements / impressions)
- **Top Posts** (by engagement)
- **Posting Frequency**

#### Aggregated
- **Total Reach** across platforms
- **Combined Engagement**
- **Best Performing Platform**
- **Posting Queue Status**
- **Scheduled Posts Calendar**

### Platform-Specific Metrics

| Platform | Available Metrics |
|----------|-------------------|
| **Twitter/X** | Impressions, Likes, Retweets, Replies, Quote Tweets, Bookmarks, Profile Clicks |
| **LinkedIn** | Impressions, Clicks, Reactions, Comments, Shares, Engagement Rate, Follower Demographics |
| **Facebook** | Reach, Impressions, Engagement, Reactions, Comments, Shares, Page Views, Follower Growth |
| **Instagram** | Reach, Impressions, Engagement, Likes, Comments, Saves, Shares, Profile Visits, Website Clicks |

---

## 4. Component Structure

```
/src/lib/social/
├── types.ts                 # Shared TypeScript interfaces
├── index.ts                 # Unified API exports
│
├── linkedin/
│   ├── client.ts            # LinkedIn API client
│   ├── auth.ts              # OAuth 2.0 flow
│   └── types.ts             # LinkedIn-specific types
│
├── meta/
│   ├── client.ts            # Meta Graph API client (FB + IG)
│   ├── auth.ts              # OAuth flow
│   ├── facebook.ts          # Facebook-specific methods
│   ├── instagram.ts         # Instagram-specific methods
│   └── types.ts             # Meta-specific types
│
└── unified/
    ├── posting.ts           # Unified posting queue
    ├── analytics.ts         # Aggregated analytics
    └── scheduler.ts         # Post scheduling logic

/src/app/api/social/
├── linkedin/
│   ├── auth/route.ts        # OAuth callback
│   ├── post/route.ts        # Create post
│   └── analytics/route.ts   # Get analytics
│
├── meta/
│   ├── auth/route.ts        # OAuth callback
│   ├── post/route.ts        # Create post (FB/IG)
│   └── analytics/route.ts   # Get analytics
│
└── queue/
    ├── route.ts             # Queue management
    └── publish/route.ts     # Publish scheduled posts

/src/components/social/
├── SocialMediaCenter.tsx    # Main dashboard widget
├── PostComposer.tsx         # Multi-platform post creator
├── AnalyticsGrid.tsx        # Metrics display
├── PlatformCard.tsx         # Per-platform stats
└── PostQueue.tsx            # Scheduled posts view
```

---

## 5. OAuth Setup Guide

### LinkedIn OAuth 2.0

1. **Create App**: LinkedIn Developer Portal → Create App
2. **Configure OAuth 2.0**:
   - Redirect URL: `https://hq.kirbyholdings.ltd/api/social/linkedin/auth`
   - Select scopes needed
3. **Environment Variables**:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   LINKEDIN_REDIRECT_URI=https://hq.kirbyholdings.ltd/api/social/linkedin/auth
   ```
4. **Authorization URL**:
   ```
   https://www.linkedin.com/oauth/v2/authorization
     ?response_type=code
     &client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URI}
     &scope=w_member_social%20r_basicprofile%20w_organization_social
     &state={RANDOM_STATE}
   ```

### Meta OAuth

1. **Create App**: Meta Developer Portal → Create App (Business)
2. **Add Products**: Facebook Login, Instagram Graph API
3. **Configure OAuth**:
   - Valid OAuth Redirect URIs: `https://hq.kirbyholdings.ltd/api/social/meta/auth`
   - App Domains: `kirbyholdings.ltd`
4. **Environment Variables**:
   ```
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   META_REDIRECT_URI=https://hq.kirbyholdings.ltd/api/social/meta/auth
   ```
5. **Authorization URL**:
   ```
   https://www.facebook.com/v19.0/dialog/oauth
     ?client_id={APP_ID}
     &redirect_uri={REDIRECT_URI}
     &scope=pages_show_list,pages_manage_posts,read_insights,instagram_basic,instagram_content_publish,instagram_manage_insights
     &state={RANDOM_STATE}
   ```

---

## 6. Implementation Phases

### Phase 1: Core Infrastructure ✓ In Progress
- [x] Plan document
- [x] Type definitions
- [x] LinkedIn client skeleton
- [x] Meta client skeleton
- [ ] Unified types

### Phase 2: OAuth & Authentication
- [ ] LinkedIn OAuth flow
- [ ] Meta OAuth flow
- [ ] Token storage & refresh
- [ ] Account connection UI

### Phase 3: Posting
- [ ] LinkedIn posting
- [ ] Facebook posting
- [ ] Instagram posting (image/video)
- [ ] Unified post queue
- [ ] Post composer component

### Phase 4: Analytics
- [ ] LinkedIn analytics fetch
- [ ] Facebook Page insights
- [ ] Instagram insights
- [ ] Aggregated dashboard

### Phase 5: Scheduling
- [ ] Post scheduler
- [ ] Cron job for publishing
- [ ] Calendar view
- [ ] Queue management

---

## 7. Environment Variables Required

```env
# Existing
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=

# Meta (Facebook + Instagram)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=

# Token Storage (encrypted)
SOCIAL_TOKEN_ENCRYPTION_KEY=
```

---

## 8. Notes & Considerations

### Rate Limiting Strategy
- Implement exponential backoff
- Cache analytics (refresh every 15 min)
- Queue posts with staggered publishing

### Token Management
- Store refresh tokens securely (encrypted in DB or env)
- Implement automatic token refresh
- Handle token expiration gracefully

### Content Adaptation
- Twitter: 280 chars, auto-shorten links
- LinkedIn: 3000 chars, rich formatting
- Facebook: 63,206 chars, link previews
- Instagram: 2200 chars, requires media

### Media Handling
- Resize/compress images per platform requirements
- Video duration limits vary by platform
- Store media in Vercel Blob or similar

---

## 9. Next Steps

1. **Immediate**: Complete API client files
2. **This Week**: Set up OAuth flows
3. **Next**: Build post composer UI
4. **Then**: Analytics dashboard widgets
