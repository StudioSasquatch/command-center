'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  X,
  MoreVertical
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Position {
  symbol: string;
  description: string;
  quantity: number;
  avgPrice: number;
  mark: number;
  pnl: number;
  pnlPercent: number;
  dte?: number;
  type: 'stock' | 'option';
}

interface TradingPositionsProps {
  isConnected: boolean;
}

// Demo positions for when not connected
const demoPositions: Position[] = [
  {
    symbol: 'NVDA 2/13 $182.5C',
    description: 'NVIDIA Call',
    quantity: 1,
    avgPrice: 2.16,
    mark: 2.40,
    pnl: 24,
    pnlPercent: 11.11,
    dte: 9,
    type: 'option'
  },
  {
    symbol: 'SPY 2/27 $697C',
    description: 'S&P 500 Call',
    quantity: 1,
    avgPrice: 5.92,
    mark: 6.63,
    pnl: 71,
    pnlPercent: 11.99,
    dte: 23,
    type: 'option'
  },
  {
    symbol: 'TSLA 2/13 $422.5C',
    description: 'Tesla Call',
    quantity: 1,
    avgPrice: 6.04,
    mark: 6.55,
    pnl: 51,
    pnlPercent: 8.44,
    dte: 9,
    type: 'option'
  },
  {
    symbol: 'META 2/20 $645P',
    description: 'Meta Put',
    quantity: 1,
    avgPrice: 9.15,
    mark: 8.30,
    pnl: -85,
    pnlPercent: -9.29,
    dte: 16,
    type: 'option'
  }
];

export function TradingPositions({ isConnected }: TradingPositionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchPositions();
    } else {
      setPositions(demoPositions);
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/trading/positions');
      const data = await res.json();
      setPositions(data.positions || []);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closePosition = async (symbol: string) => {
    if (!isConnected) return;
    
    if (confirm(`Close position: ${symbol}?`)) {
      try {
        await fetch('/api/trading/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'close', symbol })
        });
        fetchPositions();
      } catch (error) {
        console.error('Failed to close position:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-dark p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00e676]" />
          Positions
        </h2>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {positions.length} OPEN
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No open positions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map((position, index) => (
            <motion.div
              key={position.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* P&L Indicator */}
                <div className={`w-1 h-12 rounded-full ${
                  position.pnl >= 0 ? 'bg-[#00e676]' : 'bg-[#ff5252]'
                }`} />
                
                {/* Symbol & Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {position.symbol}
                    </span>
                    {position.dte !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        {position.dte}D
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>Qty: {position.quantity}</span>
                    <span>Avg: ${position.avgPrice.toFixed(2)}</span>
                    <span>Mark: ${position.mark.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* P&L & Actions */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`font-mono font-bold ${
                    position.pnl >= 0 ? 'text-[#00e676]' : 'text-[#ff5252]'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </div>
                  <div className={`text-xs font-mono ${
                    position.pnlPercent >= 0 ? 'text-[#00e676]' : 'text-[#ff5252]'
                  }`}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => closePosition(position.symbol)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                  title="Close Position"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Take Profit / Stop Loss Summary */}
      {positions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Exit Rules</span>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="text-[#00e676]">TP: +15%</span>
              <span className="text-[#ff5252]">SL: -10%</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
