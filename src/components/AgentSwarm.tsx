'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';

type AgentStatus = 'idle' | 'working' | 'complete';

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  gradient: string;
  glowColor: string;
  status: AgentStatus;
}

interface AgentStatusResponse {
  agents: {
    [key: string]: {
      status: AgentStatus;
      task: string | null;
    };
  };
  lastUpdated: string | null;
}

const agentDefinitions: Omit<Agent, 'status'>[] = [
  {
    id: 'noctis',
    name: 'NOCTIS',
    role: 'Orchestrator',
    avatar: '/avatars/noctis.jpg',
    gradient: 'from-purple-600 via-purple-500 to-indigo-500',
    glowColor: 'rgba(147, 51, 234, 0.6)',
  },
  {
    id: 'aurora',
    name: 'AURORA',
    role: 'Creative',
    avatar: '/avatars/aurora.jpg',
    gradient: 'from-pink-500 via-fuchsia-500 to-purple-500',
    glowColor: 'rgba(236, 72, 153, 0.6)',
  },
  {
    id: 'sage',
    name: 'SAGE',
    role: 'Knowledge',
    avatar: '/avatars/sage.jpg',
    gradient: 'from-blue-500 via-cyan-500 to-teal-400',
    glowColor: 'rgba(59, 130, 246, 0.6)',
  },
  {
    id: 'ada',
    name: 'ADA',
    role: 'Development',
    avatar: '/avatars/ada.jpg',
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
    glowColor: 'rgba(249, 115, 22, 0.6)',
  },
  {
    id: 'nova',
    name: 'NOVA',
    role: 'Research',
    avatar: '/avatars/nova.jpg',
    gradient: 'from-emerald-500 via-green-500 to-lime-400',
    glowColor: 'rgba(34, 197, 94, 0.6)',
  },
];

const defaultStatuses: { [key: string]: AgentStatus } = {
  noctis: 'working',
  aurora: 'idle',
  sage: 'idle',
  ada: 'idle',
  nova: 'idle',
};

function StatusBadge({ status, glowColor }: { status: AgentStatus; glowColor: string }) {
  if (status === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#30d158]/20 border border-[#30d158]/30"
      >
        <CheckCircle2 className="w-3 h-3 text-[#30d158]" strokeWidth={3} />
        <span className="font-mono text-[10px] text-[#30d158] tracking-wider uppercase">Done</span>
      </motion.div>
    );
  }

  if (status === 'idle') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
        <div className="w-2 h-2 rounded-full bg-gray-500/50" />
        <span className="font-mono text-[10px] text-gray-500 tracking-wider uppercase">Standby</span>
      </div>
    );
  }

  // Working status - animated
  return (
    <motion.div 
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: glowColor.replace('0.6', '0.15'),
        borderColor: glowColor.replace('0.6', '0.3'),
      }}
      animate={{
        borderColor: [
          glowColor.replace('0.6', '0.3'),
          glowColor.replace('0.6', '0.6'),
          glowColor.replace('0.6', '0.3'),
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: glowColor.replace('0.6', '1') }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.span 
        className="font-mono text-[10px] tracking-wider uppercase"
        style={{ color: glowColor.replace('0.6', '1') }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        Active
      </motion.span>
    </motion.div>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const isWorking = agent.status === 'working';
  const isComplete = agent.status === 'complete';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative group"
    >
      <div 
        className={`glass-panel overflow-hidden cursor-pointer relative transition-all duration-300 ${
          isWorking ? 'border-white/20' : ''
        }`}
        style={{
          boxShadow: isWorking 
            ? `0 8px 40px ${agent.glowColor.replace('0.6', '0.25')}`
            : undefined,
        }}
      >
        {/* Avatar Section - Hero area taking ~60% of card */}
        <div className="relative pt-4 pb-2 px-4">
          {/* Pulsing glow behind avatar when working */}
          {isWorking && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 rounded-full blur-2xl -z-10"
              style={{ backgroundColor: agent.glowColor }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          
          {/* Avatar with gradient ring */}
          <motion.div
            className="relative mx-auto"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${agent.gradient} p-[3px] mx-auto relative`}
              animate={isWorking ? {
                boxShadow: [
                  `0 0 25px ${agent.glowColor}`,
                  `0 0 50px ${agent.glowColor}`,
                  `0 0 25px ${agent.glowColor}`,
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Animated ring for working status */}
              {isWorking && (
                <motion.div
                  className="absolute inset-[-2px] rounded-full pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${agent.glowColor.replace('0.6', '0.8')}, transparent)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
              
              {/* Complete checkmark badge on avatar */}
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 z-10"
                >
                  <div className="w-7 h-7 rounded-full bg-[#30d158] flex items-center justify-center shadow-[0_0_16px_rgba(48,209,88,0.6)] border-2 border-black">
                    <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Info Section - Name, Role, Status */}
        <div className="px-3 pb-4 pt-2 text-center">
          {/* Name */}
          <div className="font-display text-sm md:text-base font-bold text-white tracking-wider mb-0.5">
            {agent.name}
          </div>
          
          {/* Role */}
          <div className="font-mono text-[10px] md:text-xs text-[var(--text-muted)] tracking-wide uppercase mb-3">
            {agent.role}
          </div>
          
          {/* Status Badge */}
          <div className="flex justify-center">
            <StatusBadge status={agent.status} glowColor={agent.glowColor} />
          </div>
        </div>
        
        {/* Bottom accent line that animates on working */}
        {isWorking && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${agent.glowColor.replace('0.6', '1')}, transparent)` 
            }}
            animate={{
              width: ['0%', '100%', '0%'],
              left: ['0%', '0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

export function AgentSwarm() {
  const [agentStatuses, setAgentStatuses] = useState<{ [key: string]: AgentStatus }>(defaultStatuses);
  
  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/agents', { cache: 'no-store' });
      if (response.ok) {
        const data: AgentStatusResponse = await response.json();
        const newStatuses: { [key: string]: AgentStatus } = {};
        for (const [id, info] of Object.entries(data.agents)) {
          newStatuses[id] = info.status;
        }
        // Ensure Noctis is always working
        newStatuses.noctis = 'working';
        setAgentStatuses(newStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch agent statuses:', error);
    }
  }, []);
  
  useEffect(() => {
    // Initial fetch
    fetchStatuses();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchStatuses, 10000);
    
    return () => clearInterval(interval);
  }, [fetchStatuses]);
  
  const agents: Agent[] = agentDefinitions.map(def => ({
    ...def,
    status: agentStatuses[def.id] || 'idle',
  }));
  
  const activeCount = agents.filter(a => a.status === 'working').length;
  
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-2 rounded-lg bg-[#bf5af2]/10">
          <span className="text-lg">🤖</span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-wider text-white uppercase">
          Agent Swarm
        </h2>
        <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
          {activeCount} ACTIVE
        </span>
        
        {/* Animated connection line */}
        <div className="flex-1 h-px ml-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#bf5af2]/30 via-transparent to-transparent" />
          <motion.div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-[#bf5af2]/60 to-transparent"
            animate={{
              x: ['-100%', '500%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </motion.div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5">
        {agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </section>
  );
}
