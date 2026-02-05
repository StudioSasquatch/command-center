'use client';

import { motion } from 'framer-motion';
import { 
  History,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  quantity: number;
  price?: number;
  status: 'filled' | 'pending' | 'cancelled' | 'rejected';
  filledPrice?: number;
  timestamp: string;
}

interface TradingOrdersProps {
  isConnected: boolean;
}

// Demo orders
const demoOrders: Order[] = [
  {
    id: '1',
    symbol: 'NVDA 2/13 $182.5C',
    side: 'buy',
    type: 'limit',
    quantity: 1,
    price: 2.23,
    status: 'filled',
    filledPrice: 2.23,
    timestamp: '2026-02-04T11:07:53'
  },
  {
    id: '2',
    symbol: 'META 2/20 $645P',
    side: 'buy',
    type: 'limit',
    quantity: 1,
    price: 9.15,
    status: 'filled',
    filledPrice: 9.15,
    timestamp: '2026-02-04T11:22:29'
  },
  {
    id: '3',
    symbol: 'TSLA 2/13 $422.5C',
    side: 'buy',
    type: 'limit',
    quantity: 1,
    price: 6.05,
    status: 'filled',
    filledPrice: 6.04,
    timestamp: '2026-02-04T09:24:00'
  },
  {
    id: '4',
    symbol: 'SPY 2/27 $697C',
    side: 'buy',
    type: 'limit',
    quantity: 1,
    price: 5.92,
    status: 'filled',
    filledPrice: 5.92,
    timestamp: '2026-02-04T09:22:54'
  }
];

export function TradingOrders({ isConnected }: TradingOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchOrders();
    } else {
      setOrders(demoOrders);
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/trading/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-[#00e676]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#ffab00]" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-[var(--text-muted)]" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-[#ff5252]" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'text-[#00e676]';
      case 'pending':
        return 'text-[#ffab00]';
      case 'cancelled':
        return 'text-[var(--text-muted)]';
      case 'rejected':
        return 'text-[#ff5252]';
      default:
        return 'text-white';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="card-dark p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
          <History className="w-5 h-5 text-[#00e5ff]" />
          Recent Orders
        </h2>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          TODAY
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No orders today</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Time</th>
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Symbol</th>
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Side</th>
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Qty</th>
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Price</th>
                <th className="pb-2 text-xs font-mono text-[var(--text-muted)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 text-sm font-mono text-[var(--text-muted)]">
                    {formatTime(order.timestamp)}
                  </td>
                  <td className="py-3 text-sm font-mono text-white font-medium">
                    {order.symbol}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      order.side === 'buy' 
                        ? 'bg-[#00e676]/20 text-[#00e676]' 
                        : 'bg-[#ff5252]/20 text-[#ff5252]'
                    }`}>
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-mono text-white">
                    {order.quantity}
                  </td>
                  <td className="py-3 text-sm font-mono text-white">
                    ${(order.filledPrice || order.price)?.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(order.status)}
                      <span className={`text-xs font-mono uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
