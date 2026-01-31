'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Repeat2, MessageCircle, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  url: string;
  metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
}

export function RecentTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/x/tweets');
      const data = await response.json();
      if (data.success) {
        setTweets(data.tweets);
      } else {
        setError(data.error || 'Failed to load tweets');
      }
    } catch {
      setError('Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const formatMetric = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#1d9bf0]/10">
            <svg className="w-4 h-4 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
            Recent Posts
          </h2>
        </div>
        <button
          onClick={fetchTweets}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
          <p className="mb-2">Unable to load tweets</p>
          <p className="text-xs opacity-60">X API read access may require credits</p>
        </div>
      ) : loading && tweets.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/5 rounded w-full mb-2" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <motion.a
              key={tweet.id}
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="block p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all group"
            >
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-3">
                {tweet.text}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  {tweet.metrics && (
                    <>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatMetric(tweet.metrics.like_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="w-3 h-3" />
                        {formatMetric(tweet.metrics.retweet_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatMetric(tweet.metrics.reply_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatMetric(tweet.metrics.impression_count)}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>{formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
