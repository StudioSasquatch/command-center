'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Market {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  category: string;
}

interface Position {
  market: string;
  side: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
}

interface Trade {
  timestamp: string;
  market: string;
  action: 'BUY' | 'SELL';
  side: 'YES' | 'NO';
  amount: number;
  price: number;
}

export default function BettingHub() {
  const [balance, setBalance] = useState(1000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [agentStatus, setAgentStatus] = useState<'stopped' | 'running' | 'paper'>('stopped');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'markets' | 'arbitrage' | 'strategies' | 'backtest'>('dashboard');

  useEffect(() => {
    setMarkets([
      { id: '1', question: 'Will Bitcoin reach $150k in 2026?', yesPrice: 0.32, noPrice: 0.68, volume: '$2.4M', endDate: '2026-12-31', category: 'Crypto' },
      { id: '2', question: 'Lakers win NBA Championship 2025?', yesPrice: 0.08, noPrice: 0.92, volume: '$890K', endDate: '2025-06-30', category: 'Sports' },
      { id: '3', question: 'Fed cuts rates in March 2026?', yesPrice: 0.45, noPrice: 0.55, volume: '$1.2M', endDate: '2026-03-15', category: 'Economics' },
    ]);
  }, []);

  const StatCard = ({ label, value, subtext, color = 'purple' }: { label: string; value: string; subtext?: string; color?: string }) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-purple-400'}`}>
        {value}
      </div>
      {subtext && <div className="text-gray-500 text-xs mt-1">{subtext}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Betting Hub
          </h1>
          <p className="text-gray-400 mt-1">Polymarket Trading Agent</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm ${
            agentStatus === 'running' ? 'bg-green-500/20 text-green-400' :
            agentStatus === 'paper' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {agentStatus === 'running' ? '● Live Trading' : 
             agentStatus === 'paper' ? '● Paper Trading' : 
             '○ Agent Stopped'}
          </div>
          
          <button 
            onClick={() => setAgentStatus(agentStatus === 'stopped' ? 'paper' : 'stopped')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              agentStatus === 'stopped' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {agentStatus === 'stopped' ? 'Start Agent' : 'Stop Agent'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {['dashboard', 'markets', 'arbitrage', 'strategies', 'backtest'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg capitalize transition ${
              activeTab === tab 
                ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Balance" value={`$${balance.toLocaleString()}`} subtext="Available USDC" />
            <StatCard label="Total P&L" value="+$0.00" subtext="All time" color="green" />
            <StatCard label="Open Positions" value={positions.length.toString()} subtext="Active trades" />
            <StatCard label="Win Rate" value="--%" subtext="No trades yet" />
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
            {positions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No open positions. Start the agent to begin trading.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left pb-2">Market</th>
                    <th className="text-left pb-2">Side</th>
                    <th className="text-right pb-2">Shares</th>
                    <th className="text-right pb-2">Avg Price</th>
                    <th className="text-right pb-2">Current</th>
                    <th className="text-right pb-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{p.market}</td>
                      <td className={p.side === 'YES' ? 'text-green-400' : 'text-red-400'}>{p.side}</td>
                      <td className="text-right">{p.shares}</td>
                      <td className="text-right">${p.avgPrice.toFixed(2)}</td>
                      <td className="text-right">${p.currentPrice.toFixed(2)}</td>
                      <td className={`text-right ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
            <div className="text-gray-500 text-center py-8">No trades yet.</div>
          </div>
        </div>
      )}

      {activeTab === 'markets' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Live Markets</h2>
            <input type="text" placeholder="Search markets..." className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm" />
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="text-left pb-2">Market</th>
                <th className="text-left pb-2">Category</th>
                <th className="text-right pb-2">YES</th>
                <th className="text-right pb-2">NO</th>
                <th className="text-right pb-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3">{m.question}</td>
                  <td className="text-gray-400">{m.category}</td>
                  <td className="text-right text-green-400">{(m.yesPrice * 100).toFixed(0)}¢</td>
                  <td className="text-right text-red-400">{(m.noPrice * 100).toFixed(0)}¢</td>
                  <td className="text-right text-gray-400">{m.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'arbitrage' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Arbitrage Scanner</h2>
          <div className="text-gray-500 text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p>Arbitrage scanner coming soon.</p>
            <p className="text-sm mt-2">Will detect cross-market pricing inconsistencies.</p>
          </div>
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">NBA Streak Fade</h3>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">Backtesting</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Bet against teams on big scoring runs. Exploits emotional overreaction.</p>
            <div className="flex gap-4 text-sm">
              <div><span className="text-gray-400">Win Rate:</span> Pending</div>
              <div><span className="text-gray-400">Avg Return:</span> Pending</div>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">News Velocity</h3>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">Planned</span>
            </div>
            <p className="text-gray-400 text-sm">Trade on breaking news before the market prices it in.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Cross-Market Arbitrage</h3>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">Planned</span>
            </div>
            <p className="text-gray-400 text-sm">Exploit pricing inconsistencies between related markets.</p>
          </div>
        </div>
      )}

      {activeTab === 'backtest' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Strategy Backtester</h2>
          <div className="text-gray-500 text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p>Backtesting interface coming soon.</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
