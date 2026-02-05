'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Linkedin,
  Instagram,
  Facebook,
  ExternalLink,
  Users,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { XIcon } from '@/components/icons/XIcon';

interface PlatformAnalytics {
  platform: string;
  handle: string;
  followers: number | null;
  following?: number | null;
  posts?: number | null;
  profileUrl: string;
  error?: string;
}

interface AnalyticsData {
  analytics: {
    twitter: PlatformAnalytics;
    linkedin: PlatformAnalytics;
    instagram: PlatformAnalytics;
    facebook: PlatformAnalytics;
  };
  totals: {
    followers: number;
  };
  lastUpdated: string;
}

const platformIcons: Record<string, React.ElementType> = {
  twitter: XIcon,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  twitter: '#ffffff',
  linkedin: '#0a66c2',
  instagram: '#e4405f',
  facebook: '#1877f2',
};

const platformNames: Record<string, string> = {
  twitter: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

function formatNumber(num: number | null): string {
  if (num === null) return '—';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export function SocialAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const platforms = data ? [
    data.analytics.twitter,
    data.analytics.linkedin,
    data.analytics.instagram,
    data.analytics.facebook,
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#bf5af2]/10">
            <BarChart3 className="w-5 h-5 text-[#bf5af2]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Analytics</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {data?.lastUpdated ? `Updated ${new Date(data.lastUpdated).toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchAnalytics}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Total Followers */}
      {data && (
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Total Followers</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {formatNumber(data.totals.followers)}
          </p>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-8 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {platforms.map((platform, index) => {
            const Icon = platformIcons[platform.platform];
            const color = platformColors[platform.platform];
            const name = platformNames[platform.platform];
            
            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{name}</span>
                      <p className="text-xs text-[var(--text-muted)]">{platform.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {platform.followers !== null ? (
                      <>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatNumber(platform.followers)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">followers</p>
                      </>
                    ) : !platform.error ? (
                      <>
                        <p className="text-sm font-medium text-[#00e676]">Connected</p>
                        <p className="text-xs text-[var(--text-muted)]">API limited</p>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">—</p>
                    )}
                  </div>
                </div>
                
                {/* Additional stats if available */}
                {(platform.following !== undefined || platform.posts !== undefined) && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                    {platform.following !== undefined && platform.following !== null && (
                      <div className="text-xs text-[var(--text-muted)]">
                        <span className="text-white font-mono">{formatNumber(platform.following)}</span> following
                      </div>
                    )}
                    {platform.posts !== undefined && platform.posts !== null && (
                      <div className="text-xs text-[var(--text-muted)]">
                        <span className="text-white font-mono">{formatNumber(platform.posts)}</span> posts
                      </div>
                    )}
                    <a 
                      href={platform.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Profile
                    </a>
                  </div>
                )}
                
                {platform.error && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-yellow-500">{platform.error.length > 50 ? platform.error.slice(0, 50) + '...' : platform.error}</p>
                    {(platform.platform === 'instagram' || platform.platform === 'facebook') && (
                      <a 
                        href="/api/social/oauth/meta"
                        className="text-xs px-2 py-1 rounded bg-[#1877f2] text-white hover:bg-[#1877f2]/80 transition-colors"
                      >
                        Reconnect
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
