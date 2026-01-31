'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { 
  Calendar,
  Send,
  Trash2,
  Plus,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
  AlertCircle,
  Pencil,
  MessageSquare,
  Save,
  XCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface ContentPost {
  id: string;
  text: string;
  scheduledDate: Date;
  scheduledTime: 'AM' | 'PM';
  status: 'draft' | 'scheduled' | 'posted';
  platform: 'x' | 'linkedin' | 'threads';
  mediaUrl?: string;
  mediaNote?: string;
  isThread?: boolean;
  selfReply?: string;
  edited?: boolean;
}

interface Feedback {
  id: string;
  postId: string;
  message: string;
  timestamp: string;
  resolved?: boolean;
}

// OPTIMIZED for X Algorithm - every post has hook + image + CTA
const initialPosts: ContentPost[] = [
  // FRIDAY JAN 31
  {
    id: '1',
    text: "Startup vs small business — most people don't know the difference.\n\nSmall business = lifestyle. Pays the bills, grows slow, that's fine.\n\nStartup = rocket ship or crater. 10x in 18 months or you're dead.\n\nNothing wrong with either. But know which game you're playing.\n\nWhich one are you building? 👇",
    scheduledDate: new Date('2026-01-31'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post1-startup-vs-business.png',
    selfReply: "The fastest way to know: Are you taking VC money? If yes, you're on the rocket ship. No pressure. 🚀"
  },
  {
    id: '2',
    text: "14 days until we launch.\n\nTwo years of building. Pivots. Sleepless nights. Fights with co-founders. Moments where I almost quit.\n\nThe nerves never go away. You just get better at channeling them into fuel.\n\nAnyone else in launch mode right now? How you holding up?",
    scheduledDate: new Date('2026-01-31'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post2-14-days.png',
    selfReply: "The secret nobody tells you: launch day is just the beginning. The real work starts after."
  },
  // SATURDAY FEB 1
  {
    id: '3',
    text: "Saturday morning thought:\n\nThe best founders I know aren't the smartest in the room.\n\nThey're the ones who kept showing up when everyone else quit.\n\nTalent opens doors.\nPersistence walks through them.\n\nWhat's one thing you almost quit but didn't? 👇",
    scheduledDate: new Date('2026-02-01'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post3-persistence.png',
    selfReply: "For me it was my first startup. Failed after 18 months. Almost went back to corporate. Glad I didn't."
  },
  {
    id: '4',
    text: "\"Crypto is the wild west with no rules.\"\n\nLol. Building a crypto casino taught me more about compliance than my entire corporate career.\n\n• KYC verification\n• AML monitoring  \n• Gaming licenses\n• Banking relationships\n• Geo-restrictions\n• Transaction limits\n\nThe regulations are intense. Most people have no idea.\n\nWhat's something in your industry that's way more regulated than people think?",
    scheduledDate: new Date('2026-02-01'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    isThread: true,
    mediaUrl: '/media/post4-crypto-compliance.png',
    selfReply: "Thread: Let me break down what it actually takes to launch a legal crypto casino 🧵"
  },
  // SUNDAY FEB 2
  {
    id: '5',
    text: "Tool that changed how I work:\n\nClawdbot — AI assistant that lives in Telegram and controls my entire computer.\n\nIt reads my emails. Checks my calendar. Writes code. Deploys sites. All from chat.\n\nBuilt by @anthropic.\n\nWhat's one tool you use daily that most people haven't heard of? 👇",
    scheduledDate: new Date('2026-02-02'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post5-clawdbot.png',
    selfReply: "Link to check it out: [REPLY WITH LINK - keeps it out of main post for algo]"
  },
  {
    id: '6',
    text: "My Sunday prep routine (takes 30 min, saves 10+ hours):\n\n1. Review calendar for the week\n2. Identify THE ONE thing that moves the needle\n3. Block 3 deep work sessions (no meetings)\n4. Delete or delegate everything else\n\nMost people are busy.\nFew are productive.\n\nWhat's your Sunday prep look like?",
    scheduledDate: new Date('2026-02-02'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post6-sunday-prep.png',
    selfReply: "The game changer: blocking time BEFORE the week starts. Once Monday hits, your calendar is under attack."
  },
  // MONDAY FEB 3
  {
    id: '7',
    text: "Hot take:\n\n90% of \"AI companies\" are just ChatGPT wrappers with a $50M valuation.\n\nReal AI companies:\n• Build proprietary models\n• Have data moats\n• Own their infrastructure\n\nEverything else is a feature, not a company.\n\nAgree or disagree? 👇",
    scheduledDate: new Date('2026-02-03'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post7-ai-wrapper.png',
    selfReply: "The test: Could OpenAI ship your product as a feature tomorrow and kill you? If yes, you're a wrapper."
  },
  {
    id: '8',
    text: "The last 10% takes 90% of the time.\n\nWe're in that final 10% right now.\n\n• Every edge case\n• Every error state\n• Every \"what if\"\n• Every loading screen\n• Every empty state\n\n11 days to launch. Shipping soon.\n\nFounders in the final stretch — how you feeling?",
    scheduledDate: new Date('2026-02-03'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post8-11-days.png',
    selfReply: "The trap: thinking you need to be \"ready.\" You'll never feel ready. Ship it."
  },
  // TUESDAY FEB 4
  {
    id: '9',
    text: "How I learn anything fast:\n\n1. Pick a project that REQUIRES the skill\n2. Start before you're ready\n3. Figure it out as you go\n4. Google everything shamelessly\n5. Ship something ugly, then iterate\n\nI knew nothing about iGaming 2 years ago.\n\nNow I'm launching a casino.\n\nBooks are for reference. Building is for learning.\n\nWhat skill did you learn by doing? 👇",
    scheduledDate: new Date('2026-02-04'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    isThread: true,
    mediaUrl: '/media/post9-learn-by-building.png',
    selfReply: "The uncomfortable truth: Most courses and tutorials are procrastination disguised as productivity."
  },
  {
    id: '10',
    text: "\"How do you get so much done?\"\n\nBoring answer: I eliminated everything that doesn't matter.\n\n❌ No news\n❌ No notifications  \n❌ No meetings without agendas\n❌ No Slack/email before noon\n❌ No \"quick calls\"\n\nProtect your time like it's worth $10,000/hour.\n\nBecause it might be.\n\nWhat's one thing you eliminated that changed everything?",
    scheduledDate: new Date('2026-02-04'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post10-10k-hour.png',
    selfReply: "The hardest one for me: saying no to \"coffee chats.\" Had to learn that my time has value."
  },
  // WEDNESDAY FEB 5
  {
    id: '11',
    text: "Shoutout to the people grinding behind the scenes.\n\nThe late nights.\nThe \"one more thing\" that becomes five more things.\nThe Slack messages at 2am.\nThe bugs found at the worst possible time.\n\nLaunch week is coming. You know who you are.\n\nTag someone grinding right now 👇",
    scheduledDate: new Date('2026-02-05'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post11-built-different.png',
    selfReply: "To my team reading this: I see you. Thank you. We're almost there. 🫡"
  },
  {
    id: '12',
    text: "Startup lesson that cost me 6 months:\n\nHire fast, fire faster.\n\nA bad hire doesn't just waste money.\nThey waste momentum.\nThey kill culture.\nThey make good people leave.\n\nA great hire pays for themselves in 6 weeks.\n\nDon't let loyalty to a person sink the ship.\n\nHardest firing decision you had to make? (No names needed)",
    scheduledDate: new Date('2026-02-05'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    isThread: true,
    mediaUrl: '/media/post12-hire-fire.png',
    selfReply: "The sign I ignored: when you're relieved they called in sick. If you feel that, you already know."
  },
  // THURSDAY FEB 6
  {
    id: '13',
    text: "Hot take: Golf is the best networking tool in business.\n\n4 hours.\nNo phones.\nNo distractions.\nJust real conversation.\n\nMore deals get done on the course than in boardrooms.\n\nGolfers — what's the best business relationship you built on the course?",
    scheduledDate: new Date('2026-02-06'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: '📸 YOUR PHOTO: On the golf course',
    selfReply: "Not a golfer? Doesn't matter. Find YOUR version of this. Something that forces real conversation without screens."
  },
  {
    id: '14',
    text: "One week.\n\n7 days until we flip the switch.\n\nTwo years of building.\nThousands of hours.\nCountless pivots.\nMoments of doubt.\n\nNext Friday, it goes live.\n\nDrop a 🚀 if you're building something too.",
    scheduledDate: new Date('2026-02-06'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaUrl: '/media/post14-7-days.png',
    selfReply: "I'll be documenting the entire launch week. Follow along if you want to see behind the scenes of a crypto casino launch."
  },
];

// X/Twitter Logo SVG
const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ContentCalendar() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date('2026-01-31'), { weekStartsOn: 5 }));
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  const [feedbackPost, setFeedbackPost] = useState<ContentPost | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  useEffect(() => {
    // Load posts
    const saved = localStorage.getItem('content-calendar-v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPosts(parsed.map((p: ContentPost) => ({
        ...p,
        scheduledDate: new Date(p.scheduledDate)
      })));
    } else {
      setPosts(initialPosts);
      localStorage.setItem('content-calendar-v4', JSON.stringify(initialPosts));
    }

    // Load feedback
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/content/feedback');
      const data = await res.json();
      setAllFeedback(data.feedback || []);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    }
  };

  const savePosts = (newPosts: ContentPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('content-calendar-v4', JSON.stringify(newPosts));
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getPostsForDay = (date: Date, time: 'AM' | 'PM') => {
    return posts.filter(p => 
      isSameDay(p.scheduledDate, date) && p.scheduledTime === time
    );
  };

  const getFeedbackForPost = (postId: string) => {
    return allFeedback.filter(f => f.postId === postId && !f.resolved);
  };

  const handlePost = async (post: ContentPost) => {
    setPosting(post.id);
    try {
      const response = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.text }),
      });
      const data = await response.json();
      if (data.success) {
        const updated = posts.map(p => 
          p.id === post.id ? { ...p, status: 'posted' as const } : p
        );
        savePosts(updated);
        setSelectedPost(null);
        setEditingPost(null);
      }
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(null);
    }
  };

  const handleDelete = (id: string) => {
    savePosts(posts.filter(p => p.id !== id));
    setSelectedPost(null);
    setEditingPost(null);
    setDeleteConfirm(null);
  };

  const handleSaveEdit = (updatedPost: ContentPost) => {
    const newPosts = posts.map(p => 
      p.id === updatedPost.id ? { ...updatedPost, edited: true } : p
    );
    savePosts(newPosts);
    setEditingPost(null);
    setSelectedPost(updatedPost);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackPost || !feedbackMessage.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/content/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: feedbackPost.id,
          message: feedbackMessage.trim()
        })
      });
      
      if (res.ok) {
        await fetchFeedback();
        setFeedbackPost(null);
        setFeedbackMessage('');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleResolveFeedback = async (feedbackId: string) => {
    try {
      await fetch('/api/content/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, resolved: true })
      });
      await fetchFeedback();
    } catch (err) {
      console.error('Failed to resolve feedback:', err);
    }
  };

  const postsNeedingMedia = posts.filter(p => p.mediaNote && !p.mediaUrl);

  // Mobile day navigation
  const goToPrevDay = () => setMobileDayIndex(i => Math.max(0, i - 1));
  const goToNextDay = () => setMobileDayIndex(i => Math.min(6, i + 1));
  const currentMobileDay = days[mobileDayIndex];

  return (
    <div className="min-h-screen relative">
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 rounded-xl bg-white/10">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-2xl font-bold text-white tracking-wide">
                Content Calendar
              </h1>
              <p className="text-[10px] sm:text-sm text-[var(--text-muted)]">
                {posts.filter(p => p.status === 'draft').length} drafts • {posts.filter(p => p.status === 'posted').length} posted
              </p>
            </div>
          </div>
          
          {/* Week Navigation - Desktop */}
          <div className="hidden sm:flex items-center justify-center gap-2">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
            <span className="text-sm text-white font-medium px-3 whitespace-nowrap">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Media Needed Alert */}
        {postsNeedingMedia.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-[#ff9500]/10 border border-[#ff9500]/20 flex items-start gap-2 sm:gap-3"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff9500] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs sm:text-sm font-medium text-[#ff9500]">{postsNeedingMedia.length} posts need images</div>
              <div className="text-[10px] sm:text-xs text-[#ff9500]/70 mt-0.5 sm:mt-1">
                Images get 2x reach boost
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Day Navigation */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-2">
            <button
              onClick={goToPrevDay}
              disabled={mobileDayIndex === 0}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center flex-1">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {format(currentMobileDay, 'EEEE')}
              </div>
              <div className="text-lg font-bold text-white">
                {format(currentMobileDay, 'MMM d')}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {mobileDayIndex + 1} of 7
              </div>
            </div>
            
            <button
              onClick={goToNextDay}
              disabled={mobileDayIndex === 6}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Week dots indicator */}
          <div className="flex justify-center gap-1.5 mt-2">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setMobileDayIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === mobileDayIndex 
                    ? 'bg-[#1d9bf0] w-4' 
                    : isSameDay(day, new Date())
                    ? 'bg-[#1d9bf0]/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          
          {/* Week navigation on mobile */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <button
              onClick={() => { setWeekStart(addDays(weekStart, -7)); setMobileDayIndex(0); }}
              className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
            >
              ← Prev Week
            </button>
            <span className="text-xs text-[var(--text-muted)]">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
            </span>
            <button
              onClick={() => { setWeekStart(addDays(weekStart, 7)); setMobileDayIndex(0); }}
              className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Next Week →
            </button>
          </div>
        </div>

        {/* Mobile Calendar - Single Day View */}
        <div className="sm:hidden space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMobileDay.toISOString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* AM Slot */}
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)] px-1 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Clock className="w-3.5 h-3.5" /> 8 AM Post
                </div>
                {getPostsForDay(currentMobileDay, 'AM').map(post => (
                  <TweetCardMobile
                    key={post.id}
                    post={post}
                    feedbackCount={getFeedbackForPost(post.id).length}
                    onClick={() => setSelectedPost(post)}
                    onEdit={() => setEditingPost(post)}
                    onFeedback={() => setFeedbackPost(post)}
                    onDelete={() => setDeleteConfirm(post.id)}
                  />
                ))}
                {getPostsForDay(currentMobileDay, 'AM').length === 0 && (
                  <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </div>

              {/* PM Slot */}
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)] px-1 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                  <Clock className="w-3.5 h-3.5" /> 5 PM Post
                </div>
                {getPostsForDay(currentMobileDay, 'PM').map(post => (
                  <TweetCardMobile
                    key={post.id}
                    post={post}
                    feedbackCount={getFeedbackForPost(post.id).length}
                    onClick={() => setSelectedPost(post)}
                    onEdit={() => setEditingPost(post)}
                    onFeedback={() => setFeedbackPost(post)}
                    onDelete={() => setDeleteConfirm(post.id)}
                  />
                ))}
                {getPostsForDay(currentMobileDay, 'PM').length === 0 && (
                  <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Calendar Grid - 7 columns */}
        <div className="hidden sm:grid grid-cols-7 gap-3">
          {days.map((day, index) => (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              {/* Day Header */}
              <div className={`text-center p-3 rounded-xl ${
                isSameDay(day, new Date()) 
                  ? 'bg-[#1d9bf0]/20 border border-[#1d9bf0]/30' 
                  : 'bg-white/5'
              }`}>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-bold text-white">
                  {format(day, 'd')}
                </div>
              </div>

              {/* AM Slot */}
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] px-2 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> 8 AM
                </div>
                {getPostsForDay(day, 'AM').map(post => (
                  <TweetCard 
                    key={post.id} 
                    post={post}
                    feedbackCount={getFeedbackForPost(post.id).length}
                    onClick={() => setSelectedPost(post)}
                    onEdit={() => setEditingPost(post)}
                    onFeedback={() => setFeedbackPost(post)}
                    onDelete={() => setDeleteConfirm(post.id)}
                  />
                ))}
                {getPostsForDay(day, 'AM').length === 0 && (
                  <div className="h-32 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>

              {/* PM Slot */}
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] px-2 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> 5 PM
                </div>
                {getPostsForDay(day, 'PM').map(post => (
                  <TweetCard 
                    key={post.id} 
                    post={post}
                    feedbackCount={getFeedbackForPost(post.id).length}
                    onClick={() => setSelectedPost(post)}
                    onEdit={() => setEditingPost(post)}
                    onFeedback={() => setFeedbackPost(post)}
                    onDelete={() => setDeleteConfirm(post.id)}
                  />
                ))}
                {getPostsForDay(day, 'PM').length === 0 && (
                  <div className="h-32 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-8 glass-panel p-3 sm:p-6"
        >
          {/* Mobile: 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">{posts.length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Total</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-[var(--text-muted)]">{posts.filter(p => p.status === 'draft').length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Drafts</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-[#30d158]">{posts.filter(p => p.status === 'posted').length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Posted</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-[#ff9500]">{postsNeedingMedia.length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Need Image</div>
            </div>
          </div>
          
          {/* Desktop: 6 columns */}
          <div className="hidden sm:grid grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{posts.length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--text-muted)]">{posts.filter(p => p.status === 'draft').length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#bf5af2]">{posts.filter(p => p.isThread).length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Threads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff9500]">{postsNeedingMedia.length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Need Image</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1d9bf0]">{allFeedback.filter(f => !f.resolved).length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#30d158]">{posts.filter(p => p.status === 'posted').length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Posted</div>
            </div>
          </div>
        </motion.div>

        {/* Algo Tips - Hidden on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="hidden sm:block mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">X Algorithm Optimizations Applied</div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#30d158]" />
              <span className="text-[var(--text-secondary)]">Hook first line</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#30d158]" />
              <span className="text-[var(--text-secondary)]">CTA question</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#30d158]" />
              <span className="text-[var(--text-secondary)]">Self-reply planned</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#30d158]" />
              <span className="text-[var(--text-secondary)]">No links in body</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Tweet Preview Modal - Full screen on mobile */}
      <AnimatePresence>
        {selectedPost && !editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 sm:bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-xl sm:my-8 max-h-[95vh] sm:max-h-none overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <TweetPreview 
                post={selectedPost}
                feedback={getFeedbackForPost(selectedPost.id)}
                onPost={handlePost}
                onDelete={handleDelete}
                onEdit={() => setEditingPost(selectedPost)}
                onFeedback={() => setFeedbackPost(selectedPost)}
                onResolveFeedback={handleResolveFeedback}
                posting={posting === selectedPost.id}
                onClose={() => setSelectedPost(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal - Full screen on mobile */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 sm:bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
            onClick={() => setEditingPost(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-xl sm:my-8 max-h-[95vh] sm:max-h-none overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <EditModal 
                post={editingPost}
                onSave={handleSaveEdit}
                onCancel={() => setEditingPost(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal - Full screen on mobile */}
      <AnimatePresence>
        {feedbackPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 sm:bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => { setFeedbackPost(null); setFeedbackMessage(''); }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-black sm:rounded-2xl rounded-t-2xl border-t sm:border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[#1d9bf0]/20 text-[#1d9bf0]">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white">Add Feedback</span>
                  </div>
                  <button 
                    onClick={() => { setFeedbackPost(null); setFeedbackMessage(''); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">
                    Re: "{feedbackPost.text.slice(0, 80)}..."
                  </p>
                  <textarea
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    placeholder="Add your feedback..."
                    className="w-full h-28 sm:h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#1d9bf0]/50"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
                  <button
                    onClick={() => { setFeedbackPost(null); setFeedbackMessage(''); }}
                    className="px-4 py-2.5 rounded-full border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackMessage.trim() || submittingFeedback}
                    className="px-4 py-2.5 rounded-full bg-[#1d9bf0] text-white font-medium text-sm hover:bg-[#1d9bf0]/90 transition-colors disabled:opacity-50"
                  >
                    {submittingFeedback ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 sm:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-black rounded-2xl border border-white/10 overflow-hidden p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Delete Post?</h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5 sm:mb-6">
                  This cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2.5 rounded-full border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2.5 rounded-full bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile Tweet Card - Full width, touch-friendly
function TweetCardMobile({
  post,
  feedbackCount,
  onClick,
  onEdit,
  onFeedback,
  onDelete
}: {
  post: ContentPost;
  feedbackCount: number;
  onClick: () => void;
  onEdit: () => void;
  onFeedback: () => void;
  onDelete: () => void;
}) {
  const needsImage = post.mediaNote && !post.mediaUrl;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl p-4 bg-black border ${
        post.status === 'posted'
          ? 'opacity-50 border-white/10'
          : needsImage
          ? 'border-[#ff9500]/30'
          : 'border-white/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            JK
          </div>
          <div>
            <div className="text-xs font-medium text-white">@jkirby_eth</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {post.isThread && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#bf5af2]/20 text-[#bf5af2]">🧵</span>
              )}
              {post.edited && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-muted)]">edited</span>
              )}
              {feedbackCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1d9bf0]/20 text-[#1d9bf0] flex items-center gap-0.5">
                  <MessageSquare className="w-2.5 h-2.5" />
                  {feedbackCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-white">
          <XLogo />
        </div>
      </div>

      {/* Tweet Text */}
      <div onClick={onClick}>
        <p className="text-[13px] text-[var(--text-secondary)] whitespace-pre-line leading-relaxed line-clamp-5">
          {post.text}
        </p>

        {/* Media */}
        {post.mediaUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={post.mediaUrl} alt="" className="w-full h-24 object-cover" />
          </div>
        )}
        {needsImage && (
          <div className="mt-3 rounded-lg bg-[#ff9500]/10 border border-[#ff9500]/20 p-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#ff9500]" />
            <span className="text-[11px] text-[#ff9500] truncate">{post.mediaNote?.replace('Need: ', '')}</span>
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-1 rounded ${
          post.status === 'posted'
            ? 'bg-[#30d158]/20 text-[#30d158]'
            : 'bg-white/10 text-[var(--text-muted)]'
        }`}>
          {post.status}
        </span>
        
        {post.status !== 'posted' && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-4 h-4 text-[#1d9bf0]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onFeedback(); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#bf5af2]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Desktop Tweet Card (compact) - Same as before with hover actions
function TweetCard({ 
  post, 
  feedbackCount,
  onClick, 
  onEdit, 
  onFeedback,
  onDelete 
}: { 
  post: ContentPost;
  feedbackCount: number;
  onClick: () => void;
  onEdit: () => void;
  onFeedback: () => void;
  onDelete: () => void;
}) {
  const needsImage = post.mediaNote && !post.mediaUrl;
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`relative rounded-xl p-3 bg-black border cursor-pointer transition-all ${
        post.status === 'posted' 
          ? 'opacity-50 border-white/10' 
          : needsImage 
          ? 'border-[#ff9500]/30 hover:border-[#ff9500]/50' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showActions && post.status !== 'posted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex items-center gap-1 z-10"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg bg-black/80 border border-white/10 hover:border-[#1d9bf0]/50 hover:bg-[#1d9bf0]/10 transition-all"
              title="Edit"
            >
              <Pencil className="w-3 h-3 text-[#1d9bf0]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onFeedback(); }}
              className="p-1.5 rounded-lg bg-black/80 border border-white/10 hover:border-[#bf5af2]/50 hover:bg-[#bf5af2]/10 transition-all"
              title="Add Feedback"
            >
              <MessageSquare className="w-3 h-3 text-[#bf5af2]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-black/80 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click area */}
      <div onClick={onClick}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
              JK
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">@jkirby_eth</div>
          </div>
          <div className="flex items-center gap-1">
            {feedbackCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1d9bf0]/20 text-[#1d9bf0] flex items-center gap-0.5">
                <MessageSquare className="w-2.5 h-2.5" />
                {feedbackCount}
              </span>
            )}
            {post.edited && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-muted)]">edited</span>
            )}
            {post.isThread && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#bf5af2]/20 text-[#bf5af2]">🧵</span>
            )}
            <div className="text-white">
              <XLogo />
            </div>
          </div>
        </div>

        {/* Tweet Text Preview */}
        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-4 whitespace-pre-line leading-relaxed">
          {post.text}
        </p>

        {/* Media Status */}
        {post.mediaUrl && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img src={post.mediaUrl} alt="" className="w-full h-16 object-cover" />
          </div>
        )}
        {needsImage && (
          <div className="mt-2 rounded-lg bg-[#ff9500]/10 border border-[#ff9500]/20 p-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3 text-[#ff9500]" />
            <span className="text-[9px] text-[#ff9500] truncate">{post.mediaNote?.replace('Need: ', '')}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${
            post.status === 'posted' 
              ? 'bg-[#30d158]/20 text-[#30d158]' 
              : 'bg-white/10 text-[var(--text-muted)]'
          }`}>
            {post.status}
          </span>
          {post.selfReply && (
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> +reply
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Edit Modal - Full screen on mobile
function EditModal({ 
  post, 
  onSave,
  onCancel
}: { 
  post: ContentPost;
  onSave: (post: ContentPost) => void;
  onCancel: () => void;
}) {
  const [editedPost, setEditedPost] = useState<ContentPost>({ ...post });

  return (
    <div className="bg-black sm:rounded-2xl rounded-t-2xl border-t sm:border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[#1d9bf0]/20 text-[#1d9bf0]">
            <Pencil className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-white">Edit Post</span>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Edit Form */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Main Text */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Post Text
          </label>
          <textarea
            value={editedPost.text}
            onChange={e => setEditedPost({ ...editedPost, text: e.target.value })}
            className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#1d9bf0]/50"
          />
          <div className="text-right mt-1">
            <span className={`text-xs ${editedPost.text.length > 280 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
              {editedPost.text.length}/280
            </span>
          </div>
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Time Slot
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setEditedPost({ ...editedPost, scheduledTime: 'AM' })}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                editedPost.scheduledTime === 'AM'
                  ? 'bg-[#1d9bf0]/20 border-[#1d9bf0] text-[#1d9bf0]'
                  : 'border-white/10 text-[var(--text-muted)] hover:border-white/20'
              }`}
            >
              ☀️ 8 AM
            </button>
            <button
              onClick={() => setEditedPost({ ...editedPost, scheduledTime: 'PM' })}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                editedPost.scheduledTime === 'PM'
                  ? 'bg-[#1d9bf0]/20 border-[#1d9bf0] text-[#1d9bf0]'
                  : 'border-white/10 text-[var(--text-muted)] hover:border-white/20'
              }`}
            >
              🌙 5 PM
            </button>
          </div>
        </div>

        {/* Self Reply */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Self Reply (Optional)
          </label>
          <textarea
            value={editedPost.selfReply || ''}
            onChange={e => setEditedPost({ ...editedPost, selfReply: e.target.value || undefined })}
            placeholder="Add a reply to boost engagement..."
            className="w-full h-20 sm:h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#1d9bf0]/50"
          />
        </div>

        {/* Media Note */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Media Note
          </label>
          <input
            type="text"
            value={editedPost.mediaNote || ''}
            onChange={e => setEditedPost({ ...editedPost, mediaNote: e.target.value || undefined })}
            placeholder="e.g., 📸 YOUR PHOTO: Description..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#1d9bf0]/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/[0.02]">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-full border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedPost)}
          className="px-5 py-2.5 rounded-full bg-[#1d9bf0] text-white font-bold text-sm hover:bg-[#1d9bf0]/90 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}

// Full Tweet Preview (Modal) - Optimized for mobile
function TweetPreview({ 
  post, 
  feedback,
  onPost, 
  onDelete,
  onEdit,
  onFeedback,
  onResolveFeedback,
  posting,
  onClose
}: { 
  post: ContentPost;
  feedback: Feedback[];
  onPost: (post: ContentPost) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onFeedback: () => void;
  onResolveFeedback: (id: string) => void;
  posting: boolean;
  onClose: () => void;
}) {
  return (
    <div className="bg-black sm:rounded-2xl rounded-t-2xl border-t sm:border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 rounded bg-white/10 text-white">
            <XLogo />
          </div>
          <span className="text-sm font-medium text-white">Preview</span>
          {post.isThread && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bf5af2]/20 text-[#bf5af2]">Thread</span>
          )}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Tweet Content */}
      <div className="p-3 sm:p-4 max-h-[50vh] sm:max-h-none overflow-y-auto">
        <div className="flex gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm sm:text-lg font-bold text-white flex-shrink-0">
            JK
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-white text-sm sm:text-base">Jeremy Kirby</span>
              <span className="text-[var(--text-muted)] text-xs sm:text-sm">@jkirby_eth</span>
              <span className="text-[var(--text-muted)] text-xs">·</span>
              <span className="text-[var(--text-muted)] text-xs">
                {format(post.scheduledDate, 'MMM d')} {post.scheduledTime === 'AM' ? '8am' : '5pm'}
              </span>
            </div>
            
            <p className="mt-2 sm:mt-3 text-[13px] sm:text-[15px] text-white whitespace-pre-line leading-relaxed">
              {post.text}
            </p>

            {/* Media */}
            {post.mediaUrl && (
              <div className="mt-3 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
                <img src={post.mediaUrl} alt="" className="w-full" />
              </div>
            )}
            {post.mediaNote && !post.mediaUrl && (
              <div className="mt-3 rounded-xl sm:rounded-2xl bg-[#ff9500]/10 border border-[#ff9500]/30 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-[#ff9500] mb-1 sm:mb-2">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm">Image Needed</span>
                </div>
                <p className="text-xs sm:text-sm text-[#ff9500]/80">{post.mediaNote}</p>
              </div>
            )}

            {/* Engagement Row */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5 text-[var(--text-muted)]">
              <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors p-1">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 hover:text-[#00ba7c] transition-colors p-1">
                <Repeat2 className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 hover:text-[#f91880] transition-colors p-1">
                <Heart className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors p-1">
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Self Reply Preview */}
        {post.selfReply && (
          <div className="mt-3 sm:mt-4 ml-5 sm:ml-6 pl-4 sm:pl-6 border-l-2 border-white/10">
            <div className="flex gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0">
                JK
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="font-bold text-white">Jeremy Kirby</span>
                  <span className="text-[var(--text-muted)]">@jkirby_eth</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">{post.selfReply}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      {feedback.length > 0 && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#1d9bf0]/5 border border-[#1d9bf0]/20">
            <div className="flex items-center gap-2 text-[#1d9bf0] text-xs font-medium mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback ({feedback.length})
            </div>
            <div className="space-y-2">
              {feedback.map(fb => (
                <div key={fb.id} className="flex items-start justify-between gap-2 text-xs">
                  <p className="text-[var(--text-secondary)] flex-1">{fb.message}</p>
                  <button
                    onClick={() => onResolveFeedback(fb.id)}
                    className="text-[#30d158] hover:underline flex-shrink-0 py-1"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {post.status !== 'posted' && (
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-2 sm:py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs sm:text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 sm:py-2 rounded-full border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onFeedback}
            className="hidden sm:flex px-3 py-2 rounded-full border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-colors text-sm font-medium items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Feedback
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onPost(post)}
            disabled={posting}
            className="px-4 sm:px-6 py-2 sm:py-2 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
          >
            {posting ? (
              <>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span className="hidden sm:inline">Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Post
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
