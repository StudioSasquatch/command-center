'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Edit2,
  Trash2,
  Play,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  createdAt: string;
}

const platformIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  twitter: '#1d9bf0',
  linkedin: '#0a66c2',
  instagram: '#e4405f',
  facebook: '#1877f2',
};

function formatScheduledTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return 'past due';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `in ${hours}h`;
  }
  const minutes = Math.floor(diff / (1000 * 60));
  return `in ${minutes}m`;
}

export function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/social/scheduled');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handlePostNow = async (post: ScheduledPost) => {
    setActionLoading(post.id);
    try {
      // Delete the scheduled post and post immediately
      await fetch(`/api/social/scheduled?id=${post.id}`, { method: 'DELETE' });
      await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.content,
          platforms: post.platforms
        })
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to post:', error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (postId: string) => {
    setActionLoading(postId);
    try {
      await fetch(`/api/social/scheduled?id=${postId}`, { method: 'DELETE' });
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setActionLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00e5ff]/10">
            <Clock className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Scheduled</h3>
            <p className="text-xs text-[var(--text-muted)]">{posts.length} posts in queue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setIsLoading(true); fetchPosts(); }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs font-medium text-white">View Calendar</span>
          </button>
        </div>
      </div>

      {isLoading && posts.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
          <p className="text-[var(--text-muted)] text-sm">No scheduled posts</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Create a post and schedule it for later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
            >
              {/* Time indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#00e5ff]" />
                  <span className="text-xs font-mono text-[#00e5ff]">
                    {formatScheduledTime(post.scheduledFor)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {post.platforms.map(platform => {
                    const Icon = platformIcons[platform];
                    if (!Icon) return null;
                    return (
                      <div 
                        key={platform}
                        className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        <Icon 
                          className="w-3 h-3" 
                          style={{ color: platformColors[platform] }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <p className={`text-sm text-white/80 ${
                expandedPost === post.id ? '' : 'line-clamp-2'
              }`}>
                {post.content}
              </p>

              {/* Actions (visible on expand) */}
              {expandedPost === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => handlePostNow(post)}
                    disabled={actionLoading === post.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] text-xs transition-colors disabled:opacity-50"
                  >
                    {actionLoading === post.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Post Now
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition-colors">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={actionLoading === post.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors disabled:opacity-50"
                  >
                    {actionLoading === post.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
