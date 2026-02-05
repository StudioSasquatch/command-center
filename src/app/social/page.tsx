'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { 
  UnifiedComposer, 
  PlatformPreviews, 
  ScheduledPosts, 
  SocialAnalytics 
} from '@/components/SocialHub';
import { 
  Share2, 
  Sparkles,
  Linkedin,
  Instagram,
  Facebook,
  CheckCircle2,
  AlertCircle,
  Settings,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { XIcon } from '@/components/icons/XIcon';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PlatformStatus {
  connected: boolean;
  expiresAt?: string;
}

interface AccountStatus {
  twitter: PlatformStatus;
  linkedin: PlatformStatus;
  facebook: PlatformStatus;
  instagram: PlatformStatus;
}

function SocialHubContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success) {
      setMessage({ type: 'success', text: `Successfully connected ${success}!` });
    } else if (error) {
      setMessage({ type: 'error', text: `Failed to connect: ${error}` });
    }

    // Fetch connection status
    fetch('/api/social/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const handleConnect = (platform: string) => {
    if (platform === 'linkedin') {
      window.location.href = '/api/social/oauth/linkedin';
    } else if (platform === 'facebook' || platform === 'instagram') {
      window.location.href = '/api/social/oauth/meta';
    }
  };

  const accounts = [
    { 
      platform: 'twitter', 
      name: 'X', 
      icon: XIcon, 
      color: '#ffffff', 
      handle: '@jkirby_eth',
      needsOAuth: false
    },
    { 
      platform: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: '#0a66c2', 
      handle: 'Jeremy Kirby',
      needsOAuth: true
    },
    { 
      platform: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: '#e4405f', 
      handle: '@jkirby_eth',
      needsOAuth: true
    },
    { 
      platform: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      color: '#1877f2', 
      handle: 'JKirbyETH',
      needsOAuth: true
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Dramatic background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ff5722]/20 to-[#ff9800]/20 border border-[#ff5722]/20">
                <Share2 className="w-6 h-6 text-[#ff5722]" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Social Media Hub
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  Compose, schedule, and analyze across all platforms
                </p>
              </div>
            </div>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm"
            >
              ← Back to Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Status Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-[#00e676]/10 border-[#00e676]/20 text-[#00e676]' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Connected Accounts Status */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Connected Accounts
              </span>
              {loading ? (
                <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accounts.map(account => {
                    const Icon = account.icon;
                    const isConnected = status?.[account.platform as keyof AccountStatus]?.connected ?? false;
                    return (
                      <div
                        key={account.platform}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                          isConnected 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-white/5 border-dashed border-white/10 opacity-70'
                        }`}
                      >
                        <Icon className="w-4 h-4" style={{ color: account.color }} />
                        <span className="text-xs text-white">
                          {isConnected ? account.handle : 'Not connected'}
                        </span>
                        {isConnected ? (
                          <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
                        ) : account.needsOAuth ? (
                          <button
                            onClick={() => handleConnect(account.platform)}
                            className="flex items-center gap-1 text-[10px] text-[#1d9bf0] hover:underline"
                          >
                            Connect <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
                <Settings className="w-3 h-3" />
                Manage
              </button>
            </div>
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Composer & Schedule */}
          <div className="space-y-6">
            <UnifiedComposer />
            <ScheduledPosts />
          </div>

          {/* Right Column - Preview & Analytics */}
          <div className="space-y-6">
            <PlatformPreviews />
            <SocialAnalytics />
          </div>
        </div>

        {/* Quick Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-[#ff9800]" />
            <h3 className="font-display text-lg font-bold text-white">Pro Tips</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white font-medium mb-1">🕐 Best Times to Post</p>
              <p className="text-xs text-[var(--text-muted)]">
                X: 9am & 5pm PST • LinkedIn: 7am-8am PST • Instagram: 11am-1pm PST
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white font-medium mb-1">✨ AI Enhancement</p>
              <p className="text-xs text-[var(--text-muted)]">
                Use "AI Enhance" to optimize your post for each platform's algorithm
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white font-medium mb-1">📊 Engagement Hack</p>
              <p className="text-xs text-[var(--text-muted)]">
                Posts with questions get 2x more engagement. Ask your audience something!
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 sm:mt-16 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
                KIRBY HOLDINGS • SOCIAL HUB
              </span>
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] tracking-wider">
              POWERED BY NOCTIS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SocialHub() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
      </div>
    }>
      <SocialHubContent />
    </Suspense>
  );
}
