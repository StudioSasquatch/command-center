'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Clock } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/Header';

type AgentStatus = 'active' | 'idle' | 'working';

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  gradient: string;
  glowColor: string;
  status: AgentStatus;
  model: string;
  tasksCompleted: number;
  currentTask?: string;
}

const agents: Agent[] = [
  {
    id: 'noctis',
    name: 'Noctis',
    role: 'Orchestrator',
    avatar: '/avatars/noctis.jpg',
    gradient: 'from-purple-600 to-indigo-500',
    glowColor: 'rgba(147, 51, 234, 0.6)',
    status: 'active',
    model: 'claude-opus-4.5',
    tasksCompleted: 0,
    currentTask: 'Coordinating swarm'
  },
  {
    id: 'trader',
    name: 'Trader',
    role: 'Stock Execution',
    avatar: '/avatars/trader.png',
    gradient: 'from-cyan-500 to-emerald-400',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    status: 'idle',
    model: 'claude-sonnet-4.5',
    tasksCompleted: 0,
    currentTask: 'Scheduled: 6:35 AM'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    role: 'Graphics & Design',
    avatar: '/avatars/aurora.jpg',
    gradient: 'from-pink-500 to-purple-500',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    status: 'idle',
    model: 'claude-sonnet-4.5',
    tasksCompleted: 1
  },
  {
    id: 'sage',
    name: 'Sage',
    role: 'Content & Writing',
    avatar: '/avatars/sage.jpg',
    gradient: 'from-blue-500 to-teal-400',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    status: 'idle',
    model: 'claude-sonnet-4.5',
    tasksCompleted: 0
  },
  {
    id: 'ada',
    name: 'Ada',
    role: 'Development',
    avatar: '/avatars/ada.jpg',
    gradient: 'from-orange-500 to-yellow-400',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    status: 'idle',
    model: 'claude-sonnet-4.5',
    tasksCompleted: 0
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Research & Intel',
    avatar: '/avatars/nova.jpg',
    gradient: 'from-emerald-500 to-lime-400',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    status: 'idle',
    model: 'claude-sonnet-4.5',
    tasksCompleted: 0
  }
];

const scheduledJobs = [
  { time: '6:35 AM', agent: 'Trader', task: 'Morning market scan', days: 'Mon-Fri' },
  { time: '7:30 AM', agent: 'Noctis', task: 'Morning briefing', days: 'Daily' },
  { time: '9:00 AM', agent: 'Noctis', task: 'Twitter post (AM)', days: 'Daily' },
  { time: '12:50 PM', agent: 'Trader', task: 'Exit check', days: 'Mon-Fri' },
  { time: '5:00 PM', agent: 'Noctis', task: 'Twitter post (PM)', days: 'Daily' },
  { time: '2:00 AM', agent: 'Noctis', task: 'Nightly build', days: 'Daily' },
];

function StatusBadge({ status, glowColor }: { status: AgentStatus; glowColor: string }) {
  if (status === 'active' || status === 'working') {
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

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/30 backdrop-blur-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      <span className="font-mono text-[10px] text-gray-300 tracking-wider uppercase">Standby</span>
    </div>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const isActive = agent.status === 'active' || agent.status === 'working';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group cursor-pointer"
    >
      {isActive && (
        <motion.div
          className="absolute -inset-1 rounded-2xl blur-lg -z-10"
          style={{ backgroundColor: agent.glowColor }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div 
        className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
          isActive ? 'border-white/30' : 'border-white/10 hover:border-white/20'
        }`}
        style={{
          boxShadow: isActive 
            ? `0 8px 40px ${agent.glowColor.replace('0.6', '0.3')}`
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Image section */}
        <div className="relative aspect-[4/3]">
          <Image
            src={agent.avatar}
            alt={agent.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={agent.status} glowColor={agent.glowColor} />
          </div>
          
          {/* Name overlay on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-display text-xl font-bold text-white tracking-wider drop-shadow-lg">
              {agent.name}
            </h3>
            <p className="font-mono text-xs text-gray-300 tracking-wide">
              {agent.role}
            </p>
          </div>
        </div>
        
        {/* Info section */}
        <div className="p-4 bg-gray-900/80 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Model</span>
            <span className="text-gray-300 font-mono text-xs">{agent.model}</span>
          </div>
          
          {agent.currentTask && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-gray-300 text-xs truncate max-w-[150px]">{agent.currentTask}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tasks done</span>
            <span className="text-gray-300">{agent.tasksCompleted}</span>
          </div>
          
          {/* Accent line */}
          <div className={`h-0.5 rounded-full bg-gradient-to-r ${agent.gradient}`} />
        </div>
      </div>
    </motion.div>
  );
}

export default function SwarmPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Agent Swarm
          </h1>
          <p className="text-gray-400 mt-1">Your AI workforce</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Agents</div>
            <div className="text-2xl font-bold text-cyan-400">{agents.length}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Active Now</div>
            <div className="text-2xl font-bold text-green-400">
              {agents.filter(a => a.status === 'active' || a.status === 'working').length}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Scheduled Jobs</div>
            <div className="text-2xl font-bold text-purple-400">{scheduledJobs.length}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Tasks Today</div>
            <div className="text-2xl font-bold text-yellow-400">1</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Agents
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Schedule
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="space-y-3">
                  {scheduledJobs.map((job, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
                      <div className="w-20 text-xs text-gray-400 font-mono">{job.time}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{job.task}</div>
                        <div className="text-xs text-gray-500">{job.agent} • {job.days}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button className="w-full bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-left hover:border-cyan-500/50 transition">
                  <div className="text-sm font-medium">Spawn New Task</div>
                  <div className="text-xs text-gray-500">Assign work to an agent</div>
                </button>
                <button className="w-full bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-left hover:border-cyan-500/50 transition">
                  <div className="text-sm font-medium">View All Sessions</div>
                  <div className="text-xs text-gray-500">Monitor active work</div>
                </button>
                <button className="w-full bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-left hover:border-cyan-500/50 transition">
                  <div className="text-sm font-medium">Agent Logs</div>
                  <div className="text-xs text-gray-500">Review past activity</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
