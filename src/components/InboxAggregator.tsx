'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Inbox,
  Mail,
  RefreshCw,
  Circle,
  ChevronDown,
  ChevronUp,
  Check,
  Radio,
  AlertCircle,
  PartyPopper
} from 'lucide-react';

interface GmailEmail {
  id: string;
  from: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  labels: string[];
  isUnread: boolean;
  messageCount: number;
}

interface GmailResponse {
  emails: GmailEmail[];
  fetchedAt: string;
  fromCache?: boolean;
  error?: string;
}

export function InboxAggregator() {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out promotional/update emails for a cleaner view
  const [showAll, setShowAll] = useState(false);

  const importantEmails = emails.filter(email => 
    !email.labels.includes('CATEGORY_PROMOTIONS') &&
    !email.labels.includes('CATEGORY_SOCIAL') &&
    !email.labels.includes('CATEGORY_UPDATES')
  );

  const displayEmails = showAll ? emails : importantEmails;
  const unreadCount = displayEmails.filter(e => e.isUnread).length;

  const fetchEmails = useCallback(async (forceRefresh = false) => {
    try {
      const method = forceRefresh ? 'POST' : 'GET';
      const response = await fetch('/api/inbox/gmail', { method });
      const data: GmailResponse = await response.json();

      if (data.emails) {
        setEmails(data.emails);
        setIsLive(true);
        setLastUpdated(new Date(data.fetchedAt));
        setError(null);
      } else if (data.error) {
        setError(data.error);
        setIsLive(false);
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchEmails(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmails(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const parseDate = (dateStr: string): Date => {
    // Format: "2026-01-31 06:11"
    return new Date(dateStr.replace(' ', 'T') + ':00');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00e5ff]/10">
            <Inbox className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                Gmail Inbox
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
                  Error
                </span>
              )}
            </div>
            {lastUpdated && (
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mt-0.5">
                {isLoading ? 'Loading...' : `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#ff5722] text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-5">
        <button
          onClick={() => setShowAll(false)}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            !showAll 
              ? 'bg-white/10 text-white' 
              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
          }`}
        >
          Important
          {importantEmails.filter(e => e.isUnread).length > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              !showAll ? 'bg-[#ff5722] text-white' : 'bg-white/10 text-white/60'
            }`}>
              {importantEmails.filter(e => e.isUnread).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowAll(true)}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            showAll 
              ? 'bg-white/10 text-white' 
              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
          }`}
        >
          All Mail
          {emails.filter(e => e.isUnread).length > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              showAll ? 'bg-[#ff5722] text-white' : 'bg-white/10 text-white/60'
            }`}>
              {emails.filter(e => e.isUnread).length}
            </span>
          )}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email List */}
      {!isLoading && displayEmails.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {displayEmails.map((email, index) => {
              const isExpanded = expandedId === email.id;

              return (
                <motion.div
                  key={email.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    email.isUnread 
                      ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]' 
                      : 'bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.04]'
                  }`}
                  onClick={() => toggleExpand(email.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-lg bg-[#ff5722]/10 shrink-0">
                      <Mail className="w-4 h-4 text-[#ff5722]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {email.isUnread && (
                          <Circle className="w-2 h-2 fill-[#00e5ff] text-[#00e5ff] shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-white truncate">
                          {email.senderName}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] truncate hidden sm:block">
                          {email.senderEmail !== email.senderName && `<${email.senderEmail}>`}
                        </span>
                      </div>
                      
                      <div className={`text-xs font-medium text-white/80 mb-1 ${isExpanded ? '' : 'truncate'}`}>
                        {email.subject}
                      </div>
                      
                      {/* Labels */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {email.labels.includes('CATEGORY_PROMOTIONS') && (
                          <span className="px-1.5 py-0.5 rounded bg-[#ffd60a]/20 text-[#ffd60a] text-[9px] uppercase">Promo</span>
                        )}
                        {email.labels.includes('CATEGORY_UPDATES') && (
                          <span className="px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] text-[9px] uppercase">Update</span>
                        )}
                        {email.labels.includes('CATEGORY_SOCIAL') && (
                          <span className="px-1.5 py-0.5 rounded bg-[#bf5af2]/20 text-[#bf5af2] text-[9px] uppercase">Social</span>
                        )}
                        {email.messageCount > 1 && (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px]">
                            {email.messageCount} messages
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          {formatDistanceToNow(parseDate(email.date), { addSuffix: true })}
                        </span>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state - Inbox Zero! */}
      {!isLoading && displayEmails.length === 0 && !error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PartyPopper className="w-12 h-12 text-[#ffd60a] mx-auto mb-4" />
          </motion.div>
          <p className="text-lg font-display text-white mb-1">Inbox Zero!</p>
          <p className="text-sm text-[var(--text-muted)]">
            {showAll ? "No emails in the last 3 days" : "No important emails right now"}
          </p>
        </motion.div>
      )}

      {/* Error state */}
      {!isLoading && error && emails.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-[#ff453a] mx-auto mb-3" />
          <p className="text-sm text-[#ff453a] mb-1">Failed to load emails</p>
          <p className="text-xs text-[var(--text-muted)] mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Footer */}
      {displayEmails.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between"
        >
          <span className="text-xs text-[var(--text-muted)]">
            {displayEmails.length} email{displayEmails.length !== 1 ? 's' : ''} • {unreadCount} unread
          </span>
          <a 
            href="https://mail.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] hover:text-[#00e5ff] transition-colors uppercase tracking-wider"
          >
            Open Gmail →
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
