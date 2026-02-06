'use client';

import { motion } from 'framer-motion';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface FlowSignal {
  id: string;
  symbol: string;
  strike: number;
  expiry: string;
  side: 'call' | 'put';
  premium: number;
  contracts: number;
  price: number;
  tag?: string;
  timestamp: string;
  dte: number;
}

interface StrategyConfig {
  minPremium: number;
  minDTE: number;
  maxDTE: number;
  maxCostPerContract: number;
  liquidTickers: string[];
  display: {
    minPremium: string;
    dteRange: string;
    maxCost: string;
  };
}

// Demo signals
const demoSignals: FlowSignal[] = [
  {
    id: '1',
    symbol: 'NVDA',
    strike: 182.5,
    expiry: '2026-02-13',
    side: 'call',
    premium: 1470000,
    contracts: 6673,
    price: 2.21,
    tag: 'BIGMO',
    timestamp: '09:21',
    dte: 9
  },
  {
    id: '2',
    symbol: 'META',
    strike: 645,
    expiry: '2026-02-20',
    side: 'put',
    premium: 1420000,
    contracts: 1552,
    price: 9.15,
    tag: 'BIGMO',
    timestamp: '10:16',
    dte: 16
  },
  {
    id: '3',
    symbol: 'QQQ',
    strike: 590,
    expiry: '2026-02-20',
    side: 'put',
    premium: 1220000,
    contracts: 1370,
    price: 8.90,
    tag: 'BIGMO',
    timestamp: '09:38',
    dte: 16
  },
  {
    id: '4',
    symbol: 'SPY',
    strike: 600,
    expiry: '2026-12-18',
    side: 'put',
    premium: 2100000,
    contracts: 3500,
    price: 6.00,
    tag: 'LOTERM',
    timestamp: '10:57',
    dte: 318
  }
];

export function OptionsFlow() {
  const [signals, setSignals] = useState<FlowSignal[]>(demoSignals);
  const [strategy, setStrategy] = useState<StrategyConfig | null>(null);

  useEffect(() => {
    fetchStrategy();
  }, []);

  const fetchStrategy = async () => {
    try {
      const res = await fetch('/api/trading/strategy');
      const data = await res.json();
      setStrategy(data);
    } catch (error) {
      console.error('Failed to fetch strategy:', error);
    }
  };

  const formatPremium = (premium: number) => {
    if (premium >= 1000000) {
      return `$${(premium / 1000000).toFixed(2)}M`;
    }
    return `$${(premium / 1000).toFixed(0)}K`;
  };

  const isActionable = (signal: FlowSignal) => {
    // Check if signal meets our criteria from strategy config
    const minDTE = strategy?.minDTE || 7;
    const maxDTE = strategy?.maxDTE || 35;
    const maxCost = strategy?.maxCostPerContract || 500;
    const tickers = strategy?.liquidTickers || ['SPY', 'QQQ', 'NVDA', 'TSLA', 'AAPL', 'AMD', 'META', 'MSFT', 'GOOGL', 'AMZN'];

    const meetsExpiry = signal.dte >= minDTE && signal.dte <= maxDTE;
    const meetsCost = signal.price * 100 <= maxCost;
    const meetsTicker = tickers.includes(signal.symbol);

    return meetsExpiry && meetsCost && meetsTicker;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-dark p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#bf5af2]" />
          Options Flow
        </h2>
        <a 
          href="https://investorcentralclub.com/stax"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <span>Open Stax</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Criteria Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <span className="text-[var(--text-muted)]">Filters:</span>
        <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">{strategy?.display.minPremium || '≥$150K'} Premium</span>
        <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">{strategy?.display.dteRange || '7-35 days'}</span>
        <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">{strategy?.display.maxCost || '≤$500/contract'}</span>
        <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">Liquid Tickers</span>
      </div>

      {/* Signals Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Time</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Symbol</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Strike</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">DTE</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Premium</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Cost</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Tag</th>
              <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal, index) => {
              const actionable = isActionable(signal);
              return (
                <motion.tr
                  key={signal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-white/5 ${actionable ? 'hover:bg-white/5' : 'opacity-50'}`}
                >
                  <td className="py-3 text-sm font-mono text-[var(--text-muted)]">
                    {signal.timestamp}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white font-bold">{signal.symbol}</span>
                      {signal.side === 'call' ? (
                        <TrendingUp className="w-3 h-3 text-[#00e676]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#ff5252]" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-sm font-mono text-white">
                    ${signal.strike} {signal.side.charAt(0).toUpperCase()}
                  </td>
                  <td className="py-3">
                    <span className={`text-sm font-mono ${
                      signal.dte >= (strategy?.minDTE || 7) && signal.dte <= (strategy?.maxDTE || 35)
                        ? 'text-[#00e676]'
                        : 'text-[var(--text-muted)]'
                    }`}>
                      {signal.dte}D
                    </span>
                  </td>
                  <td className="py-3 text-sm font-mono text-[#ffab00] font-bold">
                    {formatPremium(signal.premium)}
                  </td>
                  <td className="py-3">
                    <span className={`text-sm font-mono ${
                      signal.price * 100 <= (strategy?.maxCostPerContract || 500) ? 'text-[#00e676]' : 'text-[#ff5252]'
                    }`}>
                      ${(signal.price * 100).toFixed(0)}
                    </span>
                  </td>
                  <td className="py-3">
                    {signal.tag && (
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        signal.tag === 'BIGMO' 
                          ? 'bg-[#bf5af2]/20 text-[#bf5af2]' 
                          : signal.tag === 'LOTERM'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-white/10 text-white/70'
                      }`}>
                        {signal.tag}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {actionable ? (
                      <button className="flex items-center gap-1 px-2 py-1 rounded bg-[#00e676]/20 text-[#00e676] text-xs font-mono hover:bg-[#00e676]/30 transition-colors">
                        <Zap className="w-3 h-3" />
                        TRADE
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        {signal.dte > (strategy?.maxDTE || 35) ? 'TOO FAR' : signal.price * 100 > (strategy?.maxCostPerContract || 500) ? 'TOO $$$' : '—'}
                      </span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Showing demo data • Connect to Stax for live flow</span>
        <span className="font-mono">Last scan: Just now</span>
      </div>
    </motion.div>
  );
}
