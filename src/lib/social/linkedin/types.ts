/**
 * LinkedIn API Type Definitions
 * Based on LinkedIn Marketing API v202601
 */

// ============================================================================
// URN Types
// ============================================================================

export type PersonUrn = `urn:li:person:${string}`;
export type OrganizationUrn = `urn:li:organization:${string}`;
export type PostUrn = `urn:li:share:${string}` | `urn:li:ugcPost:${string}`;
export type ImageUrn = `urn:li:digitalmediaAsset:${string}` | `urn:li:image:${string}`;
export type VideoUrn = `urn:li:video:${string}`;

export type AuthorUrn = PersonUrn | OrganizationUrn;

// ============================================================================
// Profile Types
// ============================================================================

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  headline?: string;
  vanityName?: string;
}

export interface LinkedInOrganization {
  id: number;
  urn: OrganizationUrn;
  name: string;
  localizedName: string;
  vanityName: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  organizationType: string;
  description?: string;
  website?: string;
  staffCountRange?: string;
  industries?: string[];
  locations?: LinkedInLocation[];
}

export interface LinkedInLocation {
  country: string;
  city?: string;
  postalCode?: string;
  line1?: string;
  line2?: string;
}

// ============================================================================
// Post Types
// ============================================================================

export type FeedDistribution = 'NONE' | 'MAIN_FEED';
export type PostVisibility = 'CONNECTIONS' | 'PUBLIC' | 'LOGGED_IN' | 'CONTAINER';
export type LifecycleState = 'DRAFT' | 'PUBLISHED' | 'PUBLISH_REQUESTED' | 'PUBLISH_FAILED';
export type ContentType = 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'MULTI_IMAGE' | 'POLL' | 'CAROUSEL';

export interface LinkedInPostRequest {
  author: AuthorUrn;
  commentary: string;
  visibility: PostVisibility;
  distribution: {
    feedDistribution: FeedDistribution;
    targetEntities?: unknown[]; // For targeted posts
    thirdPartyDistributionChannels?: string[];
  };
  lifecycleState: LifecycleState;
  content?: {
    article?: {
      source: string;
      title?: string;
      description?: string;
      thumbnail?: string;
    };
    media?: {
      id: ImageUrn | VideoUrn;
      title?: string;
      altText?: string;
    };
    multiImage?: {
      images: Array<{
        id: ImageUrn;
        altText?: string;
      }>;
    };
  };
  contentLandingPage?: string;
  contentCallToActionLabel?: ContentCallToAction;
}

export type ContentCallToAction = 
  | 'APPLY' 
  | 'DOWNLOAD' 
  | 'VIEW_QUOTE' 
  | 'LEARN_MORE' 
  | 'SIGN_UP' 
  | 'SUBSCRIBE' 
  | 'REGISTER' 
  | 'JOIN' 
  | 'ATTEND' 
  | 'REQUEST_DEMO' 
  | 'SEE_MORE'
  | 'BUY_NOW'
  | 'SHOP_NOW';

export interface LinkedInPost {
  id: PostUrn;
  author: AuthorUrn;
  commentary: string;
  visibility: PostVisibility;
  lifecycleState: LifecycleState;
  createdAt: number; // epoch ms
  lastModifiedAt: number;
  content?: {
    article?: { source: string };
    media?: { id: string };
  };
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface LinkedInShareStatistics {
  totalShareStatistics: {
    shareCount: number;
    uniqueImpressionsCount: number;
    clickCount: number;
    engagement: number;
    likeCount: number;
    impressionCount: number;
    commentCount: number;
  };
}

export interface LinkedInOrganizationStatistics {
  followerGains?: {
    organicFollowerCount: number;
    paidFollowerCount: number;
  };
  pageStatistics?: {
    views: {
      allPageViews: {
        pageViews: number;
        uniquePageViews: number;
      };
    };
  };
}

export interface LinkedInFollowerCount {
  firstDegreeSize: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LinkedInApiResponse<T> {
  elements?: T[];
  paging?: {
    count: number;
    start: number;
    total?: number;
  };
}

export interface LinkedInCreatePostResponse {
  id: PostUrn;
  // The response varies based on lifecycle state
}

export interface LinkedInOrganizationAcl {
  organization: OrganizationUrn;
  role: 'ADMINISTRATOR' | 'DIRECT_SPONSORED_CONTENT_POSTER' | 'CONTENT_ADMIN' | 'ANALYST' | 'CURATOR';
  state: 'APPROVED' | 'PENDING';
}

// ============================================================================
// OAuth Types
// ============================================================================

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: 'Bearer';
}

export interface LinkedInErrorResponse {
  error: string;
  error_description?: string;
  message?: string;
  status?: number;
}

// ============================================================================
// Media Upload Types
// ============================================================================

export interface LinkedInRegisterUploadRequest {
  registerUploadRequest: {
    owner: AuthorUrn;
    recipes: string[];
    serviceRelationships: Array<{
      identifier: string;
      relationshipType: string;
    }>;
  };
}

export interface LinkedInRegisterUploadResponse {
  value: {
    asset: string;
    mediaArtifact: string;
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string;
        headers: Record<string, string>;
      };
    };
  };
}
