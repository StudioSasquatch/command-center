'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Search,
  Users,
  Briefcase,
  Mic,
  Smartphone,
  Bot,
  Building2
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  notes?: string;
  status?: 'active' | 'part-time' | 'advisor';
}

interface Venture {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  members: TeamMember[];
}

const ventures: Venture[] = [
  {
    id: 'drizzle',
    name: 'Drizzle Casino',
    icon: <span className="text-lg">🎰</span>,
    color: '#ff5722',
    members: [
      { name: 'Dan Gunsberg', role: 'CEO', notes: 'Majority owner', status: 'active' },
      { name: 'Jeremy Kirby', role: 'CMO / Co-founder', notes: 'Marketing, content, strategy', status: 'active' },
      { name: 'Nicola', role: 'Co-founder', notes: 'Timeless Tech founder', status: 'active' },
      { name: 'Borut', role: 'Co-founder', notes: 'Based in Europe', status: 'active' },
      { name: 'Austin', role: 'AI & Data Expert', notes: 'Nike FT, part-time contributor', status: 'part-time' },
      { name: 'Nika', role: 'Head of Casino Ops', status: 'active' },
      { name: 'Beka', role: 'Head of CRM', status: 'active' },
      { name: 'George', role: 'Head of Product', status: 'active' },
      { name: 'Sandro', role: 'Head of Tech', status: 'active' },
      { name: 'Randy', role: 'Graphic Designer', status: 'active' },
    ],
  },
  {
    id: 'timeless',
    name: 'Timeless Tech',
    icon: <Building2 className="w-5 h-5" />,
    color: '#00e5ff',
    members: [
      { name: 'Nicola', role: 'Co-founder/Owner', status: 'active' },
      { name: 'Borut', role: 'Co-founder/Owner', status: 'active' },
      { name: 'Jeremy Kirby', role: 'AI Consultant', notes: 'Equity TBD', status: 'part-time' },
    ],
  },
  {
    id: 'ai-casino',
    name: 'AI Casino Solutions',
    icon: <Bot className="w-5 h-5" />,
    color: '#bf5af2',
    members: [
      { name: 'Jeremy Kirby', role: 'Co-founder', status: 'active' },
      { name: 'Nicola', role: 'Partner', notes: 'Timeless connections', status: 'active' },
      { name: 'Borut', role: 'Partner', notes: 'Timeless connections', status: 'active' },
      { name: 'Gabriel', role: 'Investor/Acquirer', notes: 'Interlock connection', status: 'advisor' },
    ],
  },
  {
    id: 'podcast',
    name: 'Startups & Suits',
    icon: <Mic className="w-5 h-5" />,
    color: '#ffd60a',
    members: [
      { name: 'Jeremy Kirby', role: 'Host', notes: 'Startup perspective', status: 'active' },
      { name: 'Michael Jin', role: 'Co-host', notes: 'Corporate perspective', status: 'active' },
    ],
  },
  {
    id: 'styled',
    name: 'Styled AI',
    icon: <Smartphone className="w-5 h-5" />,
    color: '#30d158',
    members: [
      { name: 'Jeremy Kirby', role: 'Founder', notes: 'iOS app, vibe coded', status: 'active' },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StatusIndicator({ status }: { status?: TeamMember['status'] }) {
  const colors = {
    active: 'bg-[#30d158]',
    'part-time': 'bg-[#ffd60a]',
    advisor: 'bg-[#bf5af2]',
  };

  if (!status) return null;

  return (
    <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
  );
}

function MemberCard({ member, color }: { member: TeamMember; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] transition-all group"
    >
      {/* Avatar */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ 
          backgroundColor: `${color}20`,
          border: `1px solid ${color}40`,
        }}
      >
        {getInitials(member.name)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {member.name}
          </span>
          <StatusIndicator status={member.status} />
        </div>
        <div className="text-xs text-[var(--text-muted)] truncate">
          {member.role}
        </div>
      </div>
      
      {/* Notes tooltip on hover */}
      {member.notes && (
        <div className="hidden group-hover:block absolute right-full mr-2 px-2 py-1 text-xs bg-[var(--surface)] border border-white/10 rounded text-[var(--text-secondary)] whitespace-nowrap z-10">
          {member.notes}
        </div>
      )}
    </motion.div>
  );
}

function VentureSection({ venture, isExpanded, onToggle, searchQuery }: { 
  venture: Venture; 
  isExpanded: boolean; 
  onToggle: () => void;
  searchQuery: string;
}) {
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return venture.members;
    const query = searchQuery.toLowerCase();
    return venture.members.filter(
      m => m.name.toLowerCase().includes(query) || 
           m.role.toLowerCase().includes(query)
    );
  }, [venture.members, searchQuery]);

  if (searchQuery && filteredMembers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.05] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
        style={{ borderLeft: `3px solid ${venture.color}` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${venture.color}15` }}
          >
            <div style={{ color: venture.color }}>
              {venture.icon}
            </div>
          </div>
          <div className="text-left">
            <div className="font-display text-sm font-bold text-white tracking-wide">
              {venture.name}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        </motion.div>
      </button>
      
      {/* Members */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 grid gap-2">
              {filteredMembers.map((member, idx) => (
                <MemberCard key={`${member.name}-${idx}`} member={member} color={venture.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TeamDirectory() {
  const [expandedVentures, setExpandedVentures] = useState<Set<string>>(new Set(['drizzle']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleVenture = (id: string) => {
    setExpandedVentures(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalMembers = ventures.reduce((sum, v) => sum + v.members.length, 0);
  const uniqueMembers = new Set(ventures.flatMap(v => v.members.map(m => m.name))).size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00e5ff]/10">
            <Users className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase">
              Team Directory
            </h2>
            <div className="text-xs text-[var(--text-muted)]">
              {uniqueMembers} people across {ventures.length} ventures
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#30d158]" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ffd60a]" />
            <span>Part-time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#bf5af2]" />
            <span>Advisor</span>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#00e5ff]/30 transition-colors"
        />
      </div>
      
      {/* Venture Sections */}
      <div className="space-y-3">
        {ventures.map((venture) => (
          <VentureSection
            key={venture.id}
            venture={venture}
            isExpanded={expandedVentures.has(venture.id) || searchQuery.length > 0}
            onToggle={() => toggleVenture(venture.id)}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </motion.div>
  );
}
