/**
 * Social Media Center - Unified Type Definitions
 */

// ============================================================================
// Platform Types
// ============================================================================

export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export interface PlatformAccount {
  platform: SocialPlatform;
  id: string;
  name: string;
  username?: string;
  profileUrl: string;
  profileImageUrl?: string;
  isOrganization?: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  connectedAt: Date;
}

// ============================================================================
// Post Types
// ============================================================================

export interface SocialMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  altText?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number; // for video, in seconds
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface PostContent {
  text: string;
  media?: SocialMedia[];
  link?: string;
  linkPreview?: LinkPreview;
}

export interface PlatformTarget {
  enabled: boolean;
  accountId: string;
  isOrganization?: boolean;
}

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  errorCode?: string;
  publishedAt?: Date;
}

export interface SocialPost {
  id: string;
  status: PostStatus;
  
  // Content
  content: PostContent;
  
  // Platform targeting
  platforms: {
    twitter?: PlatformTarget;
    linkedin?: PlatformTarget;
    facebook?: PlatformTarget;
    instagram?: PlatformTarget;
  };
  
  // Scheduling
  scheduledAt?: Date;
  
  // Results per platform
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

// ============================================================================
// Analytics Types
// ============================================================================

export interface ProfileMetrics {
  followers: number;
  following?: number;
  posts: number;
  profileUrl: string;
  profileImageUrl?: string;
}

export interface EngagementMetrics {
  impressions: number;
  reach?: number;
  engagements: number;
  engagementRate: number;
  clicks?: number;
  shares?: number;
  comments?: number;
  likes?: number;
  saves?: number;
}

export interface PostMetrics {
  impressions: number;
  reach?: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  clicks?: number;
  saves?: number;
  replies?: number;
  retweets?: number;
  quotes?: number;
  bookmarks?: number;
}

export interface PostAnalytics {
  postId: string;
  postUrl?: string;
  platform: SocialPlatform;
  text: string;
  publishedAt: Date;
  metrics: PostMetrics;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month';

export interface SocialAnalytics {
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  
  profile: ProfileMetrics;
  
  engagement: {
    period: AnalyticsPeriod;
    metrics: EngagementMetrics;
  };
  
  recentPosts: PostAnalytics[];
  
  fetchedAt: Date;
}

// ============================================================================
// Aggregated Dashboard Types
// ============================================================================

export interface AggregatedMetrics {
  totalFollowers: number;
  totalImpressions: number;
  totalEngagements: number;
  averageEngagementRate: number;
  platformBreakdown: {
    platform: SocialPlatform;
    followers: number;
    impressions: number;
    engagements: number;
    engagementRate: number;
  }[];
  topPosts: PostAnalytics[];
  fetchedAt: Date;
}

export interface QueueStatus {
  drafts: number;
  scheduled: number;
  publishedToday: number;
  failedToday: number;
  nextScheduled?: {
    post: SocialPost;
    publishAt: Date;
  };
}

// ============================================================================
// API Client Interfaces
// ============================================================================

export interface SocialApiClient {
  isConfigured(): boolean;
  
  // Authentication
  getAuthUrl?(state: string): string;
  exchangeCodeForToken?(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }>;
  refreshAccessToken?(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }>;
  
  // Profile
  getProfile(): Promise<ProfileMetrics & { id: string; name: string }>;
  
  // Posting
  createPost(content: PostContent): Promise<PostResult>;
  deletePost?(postId: string): Promise<boolean>;
  
  // Analytics
  getAnalytics(period?: AnalyticsPeriod): Promise<SocialAnalytics>;
  getPostAnalytics?(postId: string): Promise<PostAnalytics>;
}

// ============================================================================
// Error Types
// ============================================================================

export class SocialApiError extends Error {
  constructor(
    message: string,
    public platform: SocialPlatform,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'SocialApiError';
  }
}

export class RateLimitError extends SocialApiError {
  constructor(
    platform: SocialPlatform,
    public resetAt?: Date,
    public retryAfter?: number
  ) {
    super(`Rate limited on ${platform}`, platform, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends SocialApiError {
  constructor(platform: SocialPlatform, message?: string) {
    super(message || `Authentication failed for ${platform}`, platform, 401, 'AUTH_FAILED');
    this.name = 'AuthenticationError';
  }
}
