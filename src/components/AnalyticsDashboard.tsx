'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  RefreshCw,
  Twitter,
  Radio,
  AlertCircle,
  Link2,
  Minus
} from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: typeof Users;
  accent: string;
  sparkline?: number[];
  isLive?: boolean;
  isUnavailable?: boolean;
}

interface XAnalyticsResponse {
  user: {
    id: string;
    username: string;
    name: string;
    publicMetrics: {
      followersCount: number;
      followingCount: number;
      tweetCount: number;
      listedCount: number;
    };
  };
  aggregatedMetrics: {
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    totalImpressions: number;
    avgEngagementRate: number;
  };
  isLive: boolean;
  fromCache?: boolean;
  error?: string;
}

// Format numbers nicely (12400 -> "12.4K")
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

// Initial metrics - X data (live) + Compound (coming soon)
const createInitialMetrics = (): Metric[] => [
  {
    id: 'x-followers',
    label: 'X Followers',
    value: '—',
    change: 0,
    changeLabel: 'Connecting...',
    icon: Twitter,
    accent: '#1d9bf0',
    isLive: false,
  },
  {
    id: 'x-engagement',
    label: 'Engagement Rate',
    value: '—',
    change: 0,
    changeLabel: 'Connecting...',
    icon: TrendingUp,
    accent: '#30d158',
    isLive: false,
  },
  {
    id: 'total-reach',
    label: 'Recent Impressions',
    value: '—',
    change: 0,
    changeLabel: 'Connecting...',
    icon: Users,
    accent: '#ffd60a',
    isLive: false,
  },
  {
    id: 'compound-visitors',
    label: 'Compound Visitors',
    value: '—',
    change: 0,
    changeLabel: 'Coming soon',
    icon: Globe,
    accent: '#ff5722',
    isUnavailable: true,
  },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 16;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="24" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * 60}
        cy={20 - ((data[data.length - 1] - min) / range) * 16}
        r="3"
        fill={color}
      />
    </svg>
  );
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>(createInitialMetrics());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchXAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      const method = forceRefresh ? 'POST' : 'GET';
      const response = await fetch('/api/analytics/twitter', { method });
      const data: XAnalyticsResponse = await response.json();

      if (data.isLive && data.user) {
        // Update X-specific metrics with real data
        setMetrics(prev => prev.map(metric => {
          if (metric.id === 'x-followers') {
            return {
              ...metric,
              value: formatNumber(data.user.publicMetrics.followersCount),
              change: data.user.publicMetrics.followersCount,
              changeLabel: `${formatNumber(data.user.publicMetrics.tweetCount)} tweets`,
              isLive: true,
            };
          }
          if (metric.id === 'x-engagement') {
            const rate = data.aggregatedMetrics.avgEngagementRate;
            return {
              ...metric,
              value: `${rate.toFixed(2)}%`,
              change: rate,
              changeLabel: `${formatNumber(data.aggregatedMetrics.totalLikes)} likes recently`,
              isLive: true,
            };
          }
          if (metric.id === 'total-reach') {
            return {
              ...metric,
              value: formatNumber(data.aggregatedMetrics.totalImpressions),
              change: data.aggregatedMetrics.totalImpressions,
              changeLabel: `${formatNumber(data.aggregatedMetrics.totalRetweets)} retweets`,
              isLive: true,
            };
          }
          return metric;
        }));
        setIsLive(true);
        setError(null);
      } else if (data.error) {
        setError(data.error);
        setIsLive(false);
        // Mark X metrics as unavailable on error
        setMetrics(prev => prev.map(metric => {
          if (metric.id === 'x-followers' || metric.id === 'x-engagement' || metric.id === 'total-reach') {
            return {
              ...metric,
              value: '—',
              changeLabel: 'API not configured',
              isLive: false,
              isUnavailable: true,
            };
          }
          return metric;
        }));
      }
    } catch (err) {
      console.error('Failed to fetch X analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setIsLive(false);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchXAnalytics();
    
    // Refresh every 15 minutes
    const interval = setInterval(() => fetchXAnalytics(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchXAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchXAnalytics(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const liveMetricsCount = metrics.filter(m => m.isLive).length;
  const unavailableMetricsCount = metrics.filter(m => m.isUnavailable).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#bf5af2]/10">
            <BarChart3 className="w-5 h-5 text-[#bf5af2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                Analytics Overview
              </h2>
              {isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30d158]/20 text-[#30d158] text-[9px] font-mono uppercase tracking-wider">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Live
                </span>
              )}
              {error && !isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff453a]/20 text-[#ff453a] text-[9px] font-mono uppercase tracking-wider">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Limited
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mt-0.5">
              {isLoading ? 'Connecting to data sources...' : `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`}
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          disabled={isRefreshing}
          title="Force refresh data"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-3" />
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-6 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.change >= 0;
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className={`p-3 sm:p-4 rounded-xl border transition-all group relative ${
                  metric.isUnavailable 
                    ? 'bg-white/[0.02] border-white/[0.03] opacity-60' 
                    : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05]'
                }`}
              >
                {/* Live indicator for X metrics */}
                {metric.isLive && (
                  <div className="absolute top-2 right-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] block animate-pulse" />
                  </div>
                )}
                
                {/* Unavailable indicator */}
                {metric.isUnavailable && (
                  <div className="absolute top-2 right-2">
                    <Link2 className="w-3 h-3 text-[var(--text-muted)]" />
                  </div>
                )}
                
                {/* Top row: Icon + Sparkline */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div 
                    className="p-1.5 sm:p-2 rounded-lg"
                    style={{ backgroundColor: metric.isUnavailable ? 'rgba(255,255,255,0.05)' : `${metric.accent}15` }}
                  >
                    <Icon 
                      className="w-3 h-3 sm:w-4 sm:h-4" 
                      style={{ color: metric.isUnavailable ? 'var(--text-muted)' : metric.accent }}
                    />
                  </div>
                  {metric.sparkline && !metric.isUnavailable && (
                    <div className="hidden sm:block">
                      <MiniSparkline data={metric.sparkline} color={metric.accent} />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="font-mono text-[9px] sm:text-[10px] text-[var(--text-muted)] tracking-wider mb-0.5 sm:mb-1 uppercase truncate">
                  {metric.label}
                </div>

                {/* Value */}
                <div 
                  className="font-display text-lg sm:text-2xl font-bold tracking-wide mb-1 sm:mb-2"
                  style={{ color: metric.isUnavailable ? 'var(--text-muted)' : metric.accent }}
                >
                  {metric.value}
                </div>

                {/* Change indicator or status */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {metric.isUnavailable ? (
                    <>
                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--text-muted)]" />
                      <span className="text-[10px] sm:text-xs text-[var(--text-muted)] truncate">
                        {metric.changeLabel}
                      </span>
                    </>
                  ) : metric.isLive ? (
                    <>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#30d158]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff453a]" />
                      )}
                      <span className={`text-[10px] sm:text-xs font-medium truncate ${isPositive ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                        {metric.changeLabel}
                      </span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--text-muted)] animate-pulse" />
                      <span className="text-[10px] sm:text-xs text-[var(--text-muted)] truncate">
                        {metric.changeLabel}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Radio className="w-2 h-2 text-[#30d158] animate-pulse" />
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">
              {liveMetricsCount} live
            </span>
          </div>
          {unavailableMetricsCount > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link2 className="w-2 h-2 text-[var(--text-muted)]" />
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">
                {unavailableMetricsCount} not connected
              </span>
            </div>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Twitter className="w-2 h-2 text-[#1d9bf0]" />
              <span className="text-[10px] sm:text-xs text-[#1d9bf0]">X API Active</span>
            </div>
          )}
        </div>
        <button className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] hover:text-[#bf5af2] transition-colors uppercase tracking-wider">
          Connect More →
        </button>
      </motion.div>
    </motion.div>
  );
}
