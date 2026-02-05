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
  CheckCircle,
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
  status: 'draft' | 'approved' | 'scheduled' | 'posted' | 'failed';
  platform: 'x' | 'linkedin' | 'instagram' | 'facebook';
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
// NEW CONTENT CALENDAR - Generated 2026-02-01
// 37 posts across X, LinkedIn, Instagram, Facebook
// Dark/moody/purple brand aesthetic
// NEW CONTENT CALENDAR - Generated 2026-02-01
// 37 posts across X, LinkedIn, Instagram, Facebook
// Dark/moody/purple brand aesthetic - Graphics by Aurora
const initialPosts: ContentPost[] = [
  {
    id: '1',
    text: "Building in the shadows while others build in the spotlight.",
    scheduledDate: new Date('2026-02-03'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Dark silhouette of a figure working at a computer screen in a dimly lit room, purple glow from multiple monitors, cinematic lighting",
    mediaUrl: '/media/post1-x.png',
    isThread: false,
    selfReply: "The noise fades when you focus on the work."
  },
  {
    id: '2',
    text: "Some conversations happen in coffee shops. Others happen in boardrooms at 2am.",
    scheduledDate: new Date('2026-02-03'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Moody shot of empty boardroom with city lights visible through floor-to-ceiling windows, single laptop open casting purple light, dark aesthetic",
    mediaUrl: '/media/post2-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '3',
    text: "The difference between a startup and a lifestyle business:\n\nOne scales you. The other scales with you.\n\nChoose wisely.",
    scheduledDate: new Date('2026-02-04'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Abstract geometric shapes in dark purple and black, representing growth and scale, minimalist design",
    mediaUrl: '/media/post3-x.png',
    isThread: false,
    selfReply: "Most people optimize for the wrong variable."
  },
  {
    id: '4',
    text: "After recording 100+ episodes of Startups & Suits, one pattern emerges:\n\nThe founders who win don't talk about winning.\nThey talk about building.\n\nThere's a difference between being in the game and being the game.\n\nThe best players you've never heard of are busy creating the future while everyone else is busy talking about it.\n\nWhat are you building that no one knows about yet?",
    scheduledDate: new Date('2026-02-04'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'linkedin',
    mediaNote: "Dark, cinematic shot of a recording studio with professional microphones, warm purple lighting, mysterious atmosphere",
    mediaUrl: '/media/post4-linkedin.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '5',
    text: "Barcelona rooftops hit different when you're debugging code at sunset.",
    scheduledDate: new Date('2026-02-04'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Silhouette of someone with laptop on a Barcelona rooftop terrace at golden hour, purple and orange sky, moody urban landscape",
    mediaUrl: '/media/post5-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '6',
    text: "The view from the room where decisions happen.",
    scheduledDate: new Date('2026-02-05'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Artistic shot from inside looking out through venetian blinds at city skyline, dramatic shadows and purple lighting, film noir aesthetic",
    mediaUrl: '/media/post6-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '7',
    text: "Hot take: The best product launches happen when no one expects them.\n\nSurprise is a feature, not a bug.",
    scheduledDate: new Date('2026-02-05'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Dark abstract design with hidden elements becoming visible, purple and black gradient, mysterious reveal concept",
    mediaUrl: '/media/post7-x.png',
    isThread: false,
    selfReply: "Anticipation > announcement"
  },
  {
    id: '8',
    text: "Three years ago, I was building something that didn't exist.\n\nToday, the market is finally ready for what we've been creating in silence.\n\nTiming isn't everything—it's the only thing.\n\nThe gap between vision and reality is where fortunes are made. Most people see the gap and retreat. A few see it and build bridges.\n\nWhich type are you?",
    scheduledDate: new Date('2026-02-06'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'facebook',
    mediaNote: "Conceptual image of a bridge appearing out of fog, connecting two landscapes, dark moody atmosphere with purple lighting",
    mediaUrl: '/media/post8-facebook.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '9',
    text: "Santa Cruz mornings.\nMiami nights.\nBarcelona afternoons.\nDubai possibilities.\n\nLocation is a tool, not a destination.",
    scheduledDate: new Date('2026-02-06'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Split screen collage showing glimpses of all four cities in moody, cinematic style with purple color grading",
    mediaUrl: '/media/post9-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '10',
    text: "The most dangerous advice: \"Follow your passion.\"\n\nBetter advice: \"Build your obsession.\"\n\nPassion fades. Obsession compounds.",
    scheduledDate: new Date('2026-02-06'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Abstract visualization of compound growth, dark background with purple ascending lines, minimalist and powerful",
    mediaUrl: '/media/post10-x.png',
    isThread: false,
    selfReply: "Obsession is passion with a business plan."
  },
  {
    id: '11',
    text: "Behind every overnight success is a decade of nights like this.",
    scheduledDate: new Date('2026-02-07'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Time-lapse style image showing multiple coffee cups and laptop screens through the night, purple ambient lighting, dedication concept",
    mediaUrl: '/media/post11-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '12',
    text: "What happens when gambling meets technology?\n\nYou get an industry.\n\nWhat happens when an industry meets innovation?\n\nYou get disruption.\n\nWhat happens when disruption meets execution?\n\nYou get February 14th.",
    scheduledDate: new Date('2026-02-07'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Abstract tech-meets-gaming visual with dice transforming into digital pixels, dark purple aesthetic, futuristic",
    mediaUrl: '/media/post12-x.png',
    isThread: true,
    selfReply: undefined
  },
  {
    id: '13',
    text: "From yesterday's Startups & Suits recording:\n\n\"The difference between founders who scale and founders who fail isn't intelligence. It's not even execution.\n\nIt's knowing when to whisper and when to roar.\"\n\nMost founders roar too early. They announce before they build. They celebrate before they ship. They talk before they have something worth talking about.\n\nThe best founders I know whispered for years. Then, when the moment was right, their roar changed everything.\n\nSilence is strategy. Until it's not.",
    scheduledDate: new Date('2026-02-08'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'linkedin',
    mediaNote: "Professional podcast recording setup in dramatic lighting, microphones casting long shadows, purple and black aesthetic",
    mediaUrl: '/media/post13-linkedin.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '14',
    text: "Six days.",
    scheduledDate: new Date('2026-02-08'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Minimalist countdown design with the number 6 in elegant typography, dark background with subtle purple glow",
    mediaUrl: '/media/post14-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '15',
    text: "Unpopular opinion: MVPs are overrated.\n\nBuild something people can't live without, not something they can barely live with.\n\nThe minimum isn't where magic happens.",
    scheduledDate: new Date('2026-02-08'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Comparison visual showing basic vs refined product design, dark aesthetic with purple accents highlighting the difference",
    mediaUrl: '/media/post15-x.png',
    isThread: false,
    selfReply: "Magic happens in the details everyone else skips."
  },
  {
    id: '16',
    text: "Testing something that doesn't exist yet.",
    scheduledDate: new Date('2026-02-09'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Abstract shot of code on multiple screens, hands typing in shadows, mysterious testing environment with purple lighting",
    mediaUrl: '/media/post16-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '17',
    text: "Sunday strategy sessions.\n\nThe work that matters happens when the world isn't watching.",
    scheduledDate: new Date('2026-02-09'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Elegant workspace setup on Sunday evening, minimalist design with warm purple lighting, strategic planning atmosphere",
    mediaUrl: '/media/post17-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '18',
    text: "Every industry has its moment.\n\nMusic had Spotify.\nTransportation had Uber.\nPayments had PayPal.\n\nGaming is having its moment now.\n\nThe question isn't whether the transformation will happen. The question is who will lead it.\n\nThis week, you'll find out who we think should lead it.\n\n(Spoiler: It's not who you think.)",
    scheduledDate: new Date('2026-02-09'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'facebook',
    mediaNote: "Conceptual image showing gaming industry evolution, retro to modern transition, dark theme with purple technological elements",
    mediaUrl: '/media/post18-facebook.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '19',
    text: "Four days until the industry changes.",
    scheduledDate: new Date('2026-02-10'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Countdown visual with number 4, abstract gaming elements morphing in dark purple atmosphere",
    mediaUrl: '/media/post19-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '20',
    text: "Final preparations look like controlled chaos.",
    scheduledDate: new Date('2026-02-10'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Behind-scenes shot of a launch war room, multiple screens, organized chaos, purple ambient lighting, intense preparation",
    mediaUrl: '/media/post20-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '21',
    text: "The crypto space has a gambling problem.\n\nWe built a gambling space with a crypto solution.\n\nPerspective is everything.",
    scheduledDate: new Date('2026-02-11'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Inverse perspective visual, showing the same concept from different angles, dark purple design with tech elements",
    mediaUrl: '/media/post21-x.png',
    isThread: false,
    selfReply: "Sometimes you have to flip the script to see the picture."
  },
  {
    id: '22',
    text: "Three days from now, we launch something that's been three years in the making.\n\nNot because it took three years to build.\nBut because it took three years to understand what should be built.\n\nThe difference between shipping fast and shipping right is the difference between having users and having customers.\n\nWe chose customers.\n\nIn a world obsessed with speed, patience becomes a competitive advantage.\n\nSee you Friday.",
    scheduledDate: new Date('2026-02-11'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'linkedin',
    mediaNote: "Hourglass with gaming elements flowing through it, representing time and patience in development, dark aesthetic",
    mediaUrl: '/media/post22-linkedin.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '23',
    text: "Dubai skyline.\nMiami energy.\nBarcelona soul.\nSanta Cruz clarity.\n\nBuilt everywhere.\nLaunched from anywhere.\n\nFriday.",
    scheduledDate: new Date('2026-02-11'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Artistic collage of all four cities connected by digital lines, representing global development, purple color scheme",
    mediaUrl: '/media/post23-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '24',
    text: "48 hours.",
    scheduledDate: new Date('2026-02-12'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Cinematic close-up of a timer counting down, dramatic lighting with purple glow, anticipation building",
    mediaUrl: '/media/post24-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '25',
    text: "The best launches feel inevitable in hindsight.\n\nThey feel impossible until they happen.\n\nThen they feel inevitable.\n\nTomorrow you'll understand why we waited.",
    scheduledDate: new Date('2026-02-12'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Abstract timeline visualization showing the progression from impossible to inevitable, dark purple design",
    mediaUrl: '/media/post25-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '26',
    text: "24 hours.\n\nThe calm before the storm isn't calm at all.\n\nIt's electric.",
    scheduledDate: new Date('2026-02-13'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Lightning in the distance over a dark city skyline, electric anticipation, purple storm clouds",
    mediaUrl: '/media/post26-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '27',
    text: "Final systems check. Everything looks... perfect.",
    scheduledDate: new Date('2026-02-13'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "High-tech control room with all green status lights, sleek interfaces, purple accent lighting, perfection moment",
    mediaUrl: '/media/post27-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '28',
    text: "Today.\n\nDrizzle.",
    scheduledDate: new Date('2026-02-14'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Bold, cinematic logo reveal for Drizzle, purple and black premium design, launch day energy",
    mediaUrl: '/media/post28-x.png',
    isThread: false,
    selfReply: "The future of gaming starts now."
  },
  {
    id: '29',
    text: "Today we launched Drizzle.\n\nNot just a product. A perspective.\n\nFor three years, we've watched an industry optimize for the wrong metrics. Speed over substance. Growth over experience. Volume over value.\n\nWe built the alternative.\n\nDrizzle isn't just crypto gaming. It's gaming, elevated. It's crypto, refined. It's what happens when you start with the experience and work backward to the technology.\n\nThe industry needed this. We just happened to be in position to build it.\n\nSometimes the best disruption doesn't announce itself. It just arrives.\n\nWelcome to the future.",
    scheduledDate: new Date('2026-02-14'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'linkedin',
    mediaNote: "Product launch image showing Drizzle interface in elegant, premium styling, dark aesthetic with purple accents",
    mediaUrl: '/media/post29-linkedin.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '30',
    text: "Three years of building. One moment of truth. Drizzle is live.",
    scheduledDate: new Date('2026-02-14'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Celebration shot of the team in a darkened room with screens showing Drizzle is live, purple celebratory lighting",
    mediaUrl: '/media/post30-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '31',
    text: "Three years ago, we started building something that didn't exist.\n\nToday, it does.\n\nDrizzle represents more than a product launch. It represents a philosophy: that the best experiences happen when technology disappears into the background.\n\nThe crypto gaming space has been defined by complexity, by friction, by barriers between players and play.\n\nWe eliminated the barriers. What remains is pure experience.\n\nThis is what we've been building in the shadows. This is why we waited.\n\nThe future doesn't announce itself with press releases. It arrives when you're ready.\n\nWe're ready. The question is: are you?\n\nDrizzle is live.",
    scheduledDate: new Date('2026-02-14'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'facebook',
    mediaNote: "Premium product showcase image of Drizzle platform, showcasing sleek interface design, professional photography",
    mediaUrl: '/media/post31-facebook.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '32',
    text: "Day 1 post-launch:\n\nThe real work starts now.\n\nBuilding is one thing. Scaling is everything.",
    scheduledDate: new Date('2026-02-15'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Abstract visualization of scaling systems, showing growth and expansion, purple tech aesthetic",
    mediaUrl: '/media/post32-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '33',
    text: "The view after launch day. Still working. Always building.",
    scheduledDate: new Date('2026-02-15'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Contemplative shot of founder looking out window the day after launch, coffee in hand, purple hour lighting",
    mediaUrl: '/media/post33-instagram.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '34',
    text: "Launching is just the beginning.\n\nEverything before launch is preparation.\nEverything after launch is execution.\n\nGuess which one matters more?",
    scheduledDate: new Date('2026-02-16'),
    scheduledTime: 'AM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Two-panel visual showing preparation vs execution phases, emphasizing the ongoing nature of building",
    mediaUrl: '/media/post34-x.png',
    isThread: false,
    selfReply: "The work that counts happens when everyone's watching."
  },
  {
    id: '35',
    text: "48 hours post-Drizzle launch.\n\nThe messages are overwhelming. The response is beyond what we projected. The momentum is real.\n\nBut here's what nobody talks about in the launch retrospectives:\n\nThe hardest part isn't building something people want.\nIt's scaling something people love.\n\nLaunching creates attention. Building creates retention.\n\nWe've done the first. Now comes the real test.\n\nBuilding at scale, with the world watching, is where legends are made or broken.\n\nStay tuned.",
    scheduledDate: new Date('2026-02-16'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'linkedin',
    mediaNote: "Sophisticated analytics dashboard showing growth metrics, professional setting with purple accent lighting",
    mediaUrl: '/media/post35-linkedin.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '36',
    text: "Week one: Complete.\n\nWeek two: Just getting started.\n\nBuilding never stops.",
    scheduledDate: new Date('2026-02-16'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'x',
    mediaNote: "Elegant timeline visualization showing continuous building cycle, purple and black aesthetic",
    mediaUrl: '/media/post36-x.png',
    isThread: false,
    selfReply: undefined
  },
  {
    id: '37',
    text: "Two weeks ago, we had a secret. Today, we have a movement.",
    scheduledDate: new Date('2026-02-16'),
    scheduledTime: 'PM',
    status: 'draft',
    platform: 'instagram',
    mediaNote: "Before/after style image showing empty workspace transitioning to active community, growth and transformation theme",
    mediaUrl: '/media/post37-instagram.png',
    isThread: false,
    selfReply: undefined
  }
];
// X/Twitter Logo SVG
const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// LinkedIn Logo SVG
const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#0a66c2]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Instagram Logo SVG
const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#e4405f]">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
  </svg>
);

// Facebook Logo SVG
const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#1877f2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Platform logo selector
const PlatformLogo = ({ platform }: { platform: 'x' | 'linkedin' | 'instagram' | 'facebook' }) => {
  switch (platform) {
    case 'linkedin': return <LinkedInLogo />;
    case 'instagram': return <InstagramLogo />;
    case 'facebook': return <FacebookLogo />;
    default: return <XLogo />;
  }
};

export default function ContentCalendar() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date('2026-02-03'), { weekStartsOn: 1 }));
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
    const saved = localStorage.getItem('content-calendar-v5');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPosts(parsed.map((p: ContentPost) => ({
        ...p,
        scheduledDate: new Date(p.scheduledDate)
      })));
    } else {
      setPosts(initialPosts);
      localStorage.setItem('content-calendar-v5', JSON.stringify(initialPosts));
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
    localStorage.setItem('content-calendar-v5', JSON.stringify(newPosts));
    // Sync to server for cron access
    syncPostsToServer(newPosts);
  };

  const syncPostsToServer = async (postsToSync: ContentPost[]) => {
    try {
      await fetch('/api/content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync: true,
          posts: postsToSync.map(p => ({
            ...p,
            scheduledDate: p.scheduledDate instanceof Date ? p.scheduledDate.toISOString() : p.scheduledDate
          }))
        }),
      });
    } catch (err) {
      console.error('Failed to sync posts to server:', err);
    }
  };

  const handleApprove = async (post: ContentPost) => {
    const updated = posts.map(p =>
      p.id === post.id ? { ...p, status: 'approved' as const } : p
    );
    savePosts(updated);
    setSelectedPost({ ...post, status: 'approved' });
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
      let mediaIds: string[] = [];
      
      // If post has media, upload it first
      if (post.mediaUrl) {
        try {
          // Convert relative URL to absolute
          const mediaUrl = post.mediaUrl.startsWith('http') 
            ? post.mediaUrl 
            : `${window.location.origin}${post.mediaUrl}`;
          
          // Fetch the image
          const imgResponse = await fetch(mediaUrl);
          if (!imgResponse.ok) {
            throw new Error(`Failed to fetch image: ${imgResponse.status}`);
          }
          
          const blob = await imgResponse.blob();
          
          // Check file size (X limit is 5MB for images)
          const MAX_SIZE = 5 * 1024 * 1024; // 5MB
          if (blob.size > MAX_SIZE) {
            console.warn(`Image too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). X limit is 5MB. Posting without media.`);
            alert(`Image too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). X limit is 5MB. Post will be sent without image.`);
          } else {
            // Convert to base64
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            
            // Upload to X
            const mediaResponse = await fetch('/api/x/media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                media: base64,
                mimeType: blob.type 
              }),
            });
            const mediaData = await mediaResponse.json();
            if (mediaData.success && mediaData.mediaId) {
              mediaIds.push(mediaData.mediaId);
            } else {
              console.error('Media upload failed:', mediaData.error);
              alert(`Media upload failed: ${mediaData.error}`);
            }
          }
        } catch (mediaErr) {
          console.error('Failed to upload media:', mediaErr);
          alert(`Failed to upload media: ${mediaErr instanceof Error ? mediaErr.message : 'Unknown error'}`);
          // Continue without media rather than failing the whole post
        }
      }
      
      const response = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: post.text,
          mediaIds: mediaIds.length > 0 ? mediaIds : undefined
        }),
      });
      const data = await response.json();
      if (data.success) {
        const updated = posts.map(p => 
          p.id === post.id ? { ...p, status: 'posted' as const } : p
        );
        savePosts(updated);
        setSelectedPost(null);
        setEditingPost(null);
      } else {
        console.error('Post failed:', data.error);
        alert(`Post failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to post:', err);
      alert(`Failed to post: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  const handleReset = (id: string) => {
    const updated = posts.map(p => 
      p.id === id ? { ...p, status: 'scheduled' as const } : p
    );
    savePosts(updated);
    setSelectedPost(updated.find(p => p.id === id) || null);
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
          message: feedbackMessage.trim(),
          postText: feedbackPost.text,
          mediaNote: feedbackPost.mediaNote
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchFeedback();
        setFeedbackPost(null);
        setFeedbackMessage('');

        // Show success notification
        if (data.dispatched) {
          alert(`✅ Feedback saved and dispatched to ${data.dispatched.agent.toUpperCase()} for action!`);
        } else {
          alert('✅ Feedback saved successfully!');
        }
      } else {
        alert('❌ Failed to save feedback. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      alert('❌ Failed to save feedback. Please try again.');
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
                onApprove={handleApprove}
                onReset={() => handleReset(selectedPost.id)}
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
          <PlatformLogo platform={post.platform} />
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
              <PlatformLogo platform={post.platform} />
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
  onApprove,
  onReset,
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
  onApprove: (post: ContentPost) => void;
  onReset: () => void;
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
      {post.status !== 'posted' ? (
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
          {post.status === 'draft' && (
            <button
              onClick={() => onApprove(post)}
              className="px-4 sm:px-5 py-2 rounded-full bg-[#30d158] text-black font-bold text-xs sm:text-sm hover:bg-[#30d158]/90 transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Approve
            </button>
          )}
          {post.status === 'approved' && (
            <span className="px-4 py-2 rounded-full bg-[#30d158]/20 text-[#30d158] text-xs sm:text-sm font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Approved
            </span>
          )}
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
      ) : (
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-[#30d158]">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Posted</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-full border border-[#ff9500]/30 text-[#ff9500] hover:bg-[#ff9500]/10 transition-colors text-xs sm:text-sm font-medium"
          >
            Reset to Draft
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs sm:text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
