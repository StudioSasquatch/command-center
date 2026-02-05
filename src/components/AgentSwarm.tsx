'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

interface AgentState {
  status: AgentStatus;
  task: string | null;
  progress?: number;
  lastUpdate: string;
  error?: string;
}

interface SwarmState {
  agents: Record<string, AgentState>;
  lastUpdated: string;
  version: number;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  gradient: string;
  glowColor: string;
  status: AgentStatus;
  task: string | null;
  progress?: number;
}

const agentDefinitions: Omit<Agent, 'status' | 'task' | 'progress'>[] = [
  {
    id: 'noctis',
    name: 'NOCTIS',
    role: 'Orchestrator',
    avatar: '/avatars/noctis.jpg',
    gradient: 'from-purple-600 via-purple-500 to-indigo-500',
    glowColor: 'rgba(147, 51, 234, 0.6)',
  },
  {
    id: 'trader',
    name: 'TRADER',
    role: 'Trading',
    avatar: '/avatars/trader.png',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-400',
    glowColor: 'rgba(6, 182, 212, 0.6)',
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

const defaultState: SwarmState = {
  agents: Object.fromEntries(
    agentDefinitions.map(a => [
      a.id,
      { status: a.id === 'noctis' ? 'working' : 'idle', task: null, lastUpdate: new Date().toISOString() },
    ])
  ),
  lastUpdated: new Date().toISOString(),
  version: 0,
};

function StatusBadge({ status, glowColor }: { status: AgentStatus; glowColor: string }) {
  if (status === 'complete') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#30d158]/30 backdrop-blur-sm">
        <CheckCircle2 className="w-3 h-3 text-[#30d158]" strokeWidth={3} />
        <span className="font-mono text-[10px] text-[#30d158] tracking-wider uppercase">Done</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/30 backdrop-blur-sm">
        <AlertCircle className="w-3 h-3 text-red-400" strokeWidth={3} />
        <span className="font-mono text-[10px] text-red-400 tracking-wider uppercase">Error</span>
      </div>
    );
  }

  if (status === 'idle') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/30 backdrop-blur-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="font-mono text-[10px] text-gray-300 tracking-wider uppercase">Standby</span>
      </div>
    );
  }

  // Working status
  return (
    <motion.div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full backdrop-blur-sm"
      style={{ backgroundColor: glowColor.replace('0.6', '0.4') }}
      animate={{
        boxShadow: [
          `0 0 10px ${glowColor}`,
          `0 0 20px ${glowColor}`,
          `0 0 10px ${glowColor}`,
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-white"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="font-mono text-[10px] text-white tracking-wider uppercase">Active</span>
    </motion.div>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const isWorking = agent.status === 'working';
  const [showTask, setShowTask] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setShowTask(true)}
      onMouseLeave={() => setShowTask(false)}
    >
      {/* Glow effect for working agents */}
      {isWorking && (
        <motion.div
          className="absolute -inset-1 rounded-2xl blur-lg -z-10"
          style={{ backgroundColor: agent.glowColor }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div
        className={`relative aspect-[3/4] rounded-xl overflow-hidden border transition-all duration-300 ${
          isWorking ? 'border-white/30' : 'border-white/10 hover:border-white/20'
        }`}
        style={{
          boxShadow: isWorking
            ? `0 8px 40px ${agent.glowColor.replace('0.6', '0.3')}`
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Full bleed image - high quality */}
        <Image
          src={agent.avatar}
          alt={agent.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
          quality={90}
          priority={index < 3}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

        {/* Animated border for working status */}
        {isWorking && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${agent.glowColor.replace('0.6', '0.6')}, transparent)`,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          {/* Status badge - top right */}
          <div className="absolute top-2 right-2">
            <StatusBadge status={agent.status} glowColor={agent.glowColor} />
          </div>

          {/* Task tooltip on hover */}
          <AnimatePresence>
            {showTask && agent.task && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-10 left-2 right-2 p-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/10"
              >
                <p className="font-mono text-[10px] text-white/80 line-clamp-3">
                  {agent.task}
                </p>
                {agent.progress !== undefined && agent.progress > 0 && (
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${agent.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name & Role */}
          <div>
            <h3 className="font-display text-base md:text-lg font-bold text-white tracking-wider drop-shadow-lg">
              {agent.name}
            </h3>
            <p className="font-mono text-[10px] md:text-xs text-gray-300 tracking-wide uppercase">
              {agent.role}
            </p>
          </div>

          {/* Progress bar (if working with progress) */}
          {isWorking && agent.progress !== undefined && agent.progress > 0 && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${agent.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Colored accent line */}
          {(!isWorking || agent.progress === undefined) && (
            <motion.div
              className={`h-0.5 mt-2 rounded-full bg-gradient-to-r ${agent.gradient}`}
              initial={{ width: '30%' }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Working pulse effect on image */}
        {isWorking && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${agent.glowColor.replace('0.6', '0.2')}, transparent 70%)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

export function AgentSwarm() {
  const [swarmState, setSwarmState] = useState<SwarmState>(defaultState);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = () => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new SSE connection
      const eventSource = new EventSource('/api/agents/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (mounted) {
          setConnected(true);
          console.log('🔗 Connected to agent swarm');
        }
      };

      eventSource.onmessage = (event) => {
        if (mounted) {
          try {
            const state = JSON.parse(event.data) as SwarmState;
            setSwarmState(state);
          } catch (e) {
            console.error('Failed to parse swarm state:', e);
          }
        }
      };

      eventSource.onerror = () => {
        if (mounted) {
          setConnected(false);
          eventSource.close();

          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mounted) {
              console.log('🔄 Reconnecting to agent swarm...');
              connect();
            }
          }, 5000);
        }
      };
    };

    // Initial connection
    connect();

    // Fallback: fetch initial state via REST
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (mounted && data.agents) {
          setSwarmState(data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Build agent list from state
  const agents: Agent[] = agentDefinitions.map(def => {
    const state = swarmState.agents[def.id];
    return {
      ...def,
      status: state?.status || 'idle',
      task: state?.task || null,
      progress: state?.progress,
    };
  });

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

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          {connected ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
          <span className={`font-mono text-[10px] tracking-wider ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        <div className="flex-1 h-px ml-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#bf5af2]/30 via-transparent to-transparent" />
          <motion.div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-[#bf5af2]/60 to-transparent"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </section>
  );
}
