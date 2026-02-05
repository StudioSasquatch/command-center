'use client';

import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  PieChart,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AccountData {
  balance: number;
  buyingPower: number;
  dayPnL: number;
  dayPnLPercent: number;
  totalPnL: number;
  totalPnLPercent: number;
  positionCount: number;
  cashBalance: number;
}

interface AccountOverviewProps {
  isConnected: boolean;
}

export function AccountOverview({ isConnected }: AccountOverviewProps) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchAccount();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchAccount = async () => {
    try {
      const res = await fetch('/api/trading/account');
      const data = await res.json();
      if (data.account) {
        setAccount(data.account);
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Portfolio Value',
      value: account?.balance ?? 0,
      format: 'currency',
      icon: Wallet,
      color: '#00e5ff'
    },
    {
      label: 'Buying Power',
      value: account?.buyingPower ?? 0,
      format: 'currency',
      icon: DollarSign,
      color: '#00e676'
    },
    {
      label: "Today's P&L",
      value: account?.dayPnL ?? 0,
      percent: account?.dayPnLPercent ?? 0,
      format: 'pnl',
      icon: account?.dayPnL && account.dayPnL >= 0 ? TrendingUp : TrendingDown,
      color: account?.dayPnL && account.dayPnL >= 0 ? '#00e676' : '#ff5252'
    },
    {
      label: 'Open Positions',
      value: account?.positionCount ?? 0,
      format: 'number',
      icon: PieChart,
      color: '#bf5af2'
    }
  ];

  const formatValue = (value: number, format: string, percent?: number) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'pnl':
        const sign = value >= 0 ? '+' : '';
        const pnlStr = `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (percent !== undefined) {
          return `${pnlStr} (${sign}${percent.toFixed(2)}%)`;
        }
        return pnlStr;
      case 'number':
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="card-dark p-4 sm:p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon 
                className="w-4 h-4 sm:w-5 sm:h-5" 
                style={{ color: stat.color }} 
              />
            </div>
            {!isConnected && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">DEMO</span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)] font-mono tracking-wider uppercase">
              {stat.label}
            </p>
            {isLoading ? (
              <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
            ) : (
              <p 
                className="text-lg sm:text-xl font-bold font-mono"
                style={{ color: stat.format === 'pnl' ? stat.color : 'white' }}
              >
                {formatValue(stat.value, stat.format, stat.percent)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
