'use client';

import { motion } from 'framer-motion';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

interface QuickTradeProps {
  isConnected: boolean;
}

export function QuickTrade({ isConnected }: QuickTradeProps) {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'call' | 'put'>('call');
  const [strike, setStrike] = useState('');
  const [expiry, setExpiry] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Connect to tastytrade to place orders');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          symbol,
          side,
          strike: parseFloat(strike),
          expiry,
          quantity: parseInt(quantity),
          limitPrice: limitPrice ? parseFloat(limitPrice) : undefined
        })
      });

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Order submitted: ${data.orderId}`);
        // Reset form
        setSymbol('');
        setStrike('');
        setExpiry('');
        setLimitPrice('');
      }
    } catch (err) {
      setError('Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedCost = limitPrice && quantity 
    ? (parseFloat(limitPrice) * parseInt(quantity) * 100).toFixed(2)
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-dark p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#ffab00]" />
        <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase">
          Quick Trade
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symbol */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="NVDA"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00e676]/50"
            required
          />
        </div>

        {/* Side */}
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
            Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('call')}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                side === 'call'
                  ? 'bg-[#00e676]/20 border-[#00e676]/50 text-[#00e676]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-sm">CALL</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('put')}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                side === 'put'
                  ? 'bg-[#ff5252]/20 border-[#ff5252]/50 text-[#ff5252]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span className="font-mono text-sm">PUT</span>
            </button>
          </div>
        </div>

        {/* Strike & Expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
              Strike
            </label>
            <input
              type="number"
              value={strike}
              onChange={(e) => setStrike(e.target.value)}
              placeholder="182.50"
              step="0.5"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00e676]/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
              Expiry
            </label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#00e676]/50"
              required
            />
          </div>
        </div>

        {/* Quantity & Limit Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
              Qty
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#00e676]/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1 font-mono uppercase">
              Limit $
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="2.50"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00e676]/50"
            />
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-[var(--text-muted)] font-mono">Est. Cost</span>
          <span className="font-mono font-bold text-white flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {estimatedCost}
          </span>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] text-sm">
            <Zap className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className={`w-full py-3 rounded-lg font-display font-bold tracking-wider uppercase transition-all ${
            isConnected
              ? 'bg-[#00e676] text-black hover:bg-[#00e676]/90'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'SUBMITTING...' : isConnected ? 'PLACE ORDER' : 'CONNECT TO TRADE'}
        </button>
      </form>
    </motion.div>
  );
}
