/**
 * X/Twitter API Client
 * OAuth 1.0a User Context authentication
 * Uses X API v2 for user data and v1.1 for media
 */

import crypto from 'crypto';
import https from 'https';

// ============================================================================
// OAuth 1.0a Helpers
// ============================================================================

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
  extraParams: Record<string, string>,
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

  const allParams = { ...oauthParams, ...extraParams };

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

// ============================================================================
// Types
// ============================================================================

export interface XUserProfile {
  id: string;
  username: string;
  name: string;
  description?: string;
  profileImageUrl?: string;
  publicMetrics: {
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    listedCount: number;
  };
  verified?: boolean;
  createdAt?: string;
}

export interface XTweet {
  id: string;
  text: string;
  createdAt: string;
  publicMetrics?: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    impressionCount: number;
    quoteCount: number;
    bookmarkCount: number;
  };
}

export interface XAnalyticsData {
  user: XUserProfile;
  recentTweets: XTweet[];
  aggregatedMetrics: {
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    totalImpressions: number;
    avgEngagementRate: number;
  };
  fetchedAt: string;
}

export interface XApiConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

// ============================================================================
// API Client Class
// ============================================================================

export class XApiClient {
  private config: XApiConfig;

  constructor(config?: Partial<XApiConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.X_API_KEY || '',
      apiSecret: config?.apiSecret || process.env.X_API_SECRET || '',
      accessToken: config?.accessToken || process.env.X_ACCESS_TOKEN || '',
      accessTokenSecret: config?.accessTokenSecret || process.env.X_ACCESS_TOKEN_SECRET || '',
    };
  }

  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.accessToken &&
      this.config.accessTokenSecret
    );
  }

  private makeRequest<T>(
    method: string,
    baseUrl: string,
    queryParams: Record<string, string> = {}
  ): Promise<T> {
    const queryString = Object.entries(queryParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const authHeader = generateOAuthHeader(
      method,
      baseUrl,
      queryParams,
      this.config.apiKey,
      this.config.apiSecret,
      this.config.accessToken,
      this.config.accessTokenSecret
    );

    return new Promise((resolve, reject) => {
      const request = method === 'GET' ? https.get : https.request;
      
      const req = https.request(
        fullUrl,
        {
          method,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            // Check for rate limiting
            const remaining = res.headers['x-rate-limit-remaining'];
            const reset = res.headers['x-rate-limit-reset'];
            
            if (res.statusCode === 429) {
              const resetTime = reset ? new Date(parseInt(reset as string) * 1000) : null;
              reject(new Error(`Rate limited. Resets at: ${resetTime?.toISOString()}`));
              return;
            }

            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch {
                reject(new Error(`Failed to parse response: ${data}`));
              }
            } else {
              reject(new Error(`X API error ${res.statusCode}: ${data}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Get the authenticated user's profile with metrics
   */
  async getMe(): Promise<XUserProfile> {
    const response = await this.makeRequest<{
      data: {
        id: string;
        username: string;
        name: string;
        description?: string;
        profile_image_url?: string;
        public_metrics: {
          followers_count: number;
          following_count: number;
          tweet_count: number;
          listed_count: number;
        };
        verified?: boolean;
        created_at?: string;
      };
    }>('GET', 'https://api.x.com/2/users/me', {
      'user.fields': 'description,profile_image_url,public_metrics,verified,created_at',
    });

    const user = response.data;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      description: user.description,
      profileImageUrl: user.profile_image_url,
      publicMetrics: {
        followersCount: user.public_metrics.followers_count,
        followingCount: user.public_metrics.following_count,
        tweetCount: user.public_metrics.tweet_count,
        listedCount: user.public_metrics.listed_count,
      },
      verified: user.verified,
      createdAt: user.created_at,
    };
  }

  /**
   * Get recent tweets for a user with engagement metrics
   */
  async getUserTweets(userId: string, maxResults: number = 10): Promise<XTweet[]> {
    const response = await this.makeRequest<{
      data?: Array<{
        id: string;
        text: string;
        created_at: string;
        public_metrics?: {
          like_count: number;
          retweet_count: number;
          reply_count: number;
          impression_count: number;
          quote_count: number;
          bookmark_count: number;
        };
      }>;
    }>('GET', `https://api.x.com/2/users/${userId}/tweets`, {
      'max_results': maxResults.toString(),
      'tweet.fields': 'created_at,public_metrics',
      'exclude': 'retweets,replies',
    });

    return (response.data || []).map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      publicMetrics: tweet.public_metrics ? {
        likeCount: tweet.public_metrics.like_count,
        retweetCount: tweet.public_metrics.retweet_count,
        replyCount: tweet.public_metrics.reply_count,
        impressionCount: tweet.public_metrics.impression_count,
        quoteCount: tweet.public_metrics.quote_count,
        bookmarkCount: tweet.public_metrics.bookmark_count,
      } : undefined,
    }));
  }

  /**
   * Get full analytics data (user profile + recent engagement)
   */
  async getAnalytics(tweetCount: number = 10): Promise<XAnalyticsData> {
    // Get user profile
    const user = await this.getMe();

    // Get recent tweets
    const recentTweets = await this.getUserTweets(user.id, tweetCount);

    // Aggregate metrics
    const aggregatedMetrics = recentTweets.reduce(
      (acc, tweet) => {
        if (tweet.publicMetrics) {
          acc.totalLikes += tweet.publicMetrics.likeCount;
          acc.totalRetweets += tweet.publicMetrics.retweetCount;
          acc.totalReplies += tweet.publicMetrics.replyCount;
          acc.totalImpressions += tweet.publicMetrics.impressionCount;
        }
        return acc;
      },
      {
        totalLikes: 0,
        totalRetweets: 0,
        totalReplies: 0,
        totalImpressions: 0,
        avgEngagementRate: 0,
      }
    );

    // Calculate average engagement rate
    if (aggregatedMetrics.totalImpressions > 0) {
      const totalEngagements =
        aggregatedMetrics.totalLikes +
        aggregatedMetrics.totalRetweets +
        aggregatedMetrics.totalReplies;
      aggregatedMetrics.avgEngagementRate =
        (totalEngagements / aggregatedMetrics.totalImpressions) * 100;
    }

    return {
      user,
      recentTweets,
      aggregatedMetrics,
      fetchedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Singleton instance
// ============================================================================

let clientInstance: XApiClient | null = null;

export function getXApiClient(): XApiClient {
  if (!clientInstance) {
    clientInstance = new XApiClient();
  }
  return clientInstance;
}

export default XApiClient;
