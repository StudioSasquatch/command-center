'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { 
  TrendingUp, 
  DollarSign,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { TradingPositions } from '@/components/trading/TradingPositions';
import { TradingOrders } from '@/components/trading/TradingOrders';
import { AccountOverview } from '@/components/trading/AccountOverview';
import { QuickTrade } from '@/components/trading/QuickTrade';
import { OptionsFlow } from '@/components/trading/OptionsFlow';

export default function TradingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Check connection status
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/trading/account');
      const data = await res.json();
      setIsConnected(data.connected);
      setLastUpdate(new Date());
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    checkConnection();
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="scene-bg" />
      <div className="grid-overlay" />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00e676]/10">
              <TrendingUp className="w-6 h-6 text-[#00e676]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wider text-white uppercase">
                Trader Hub
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                tastytrade Integration • Options Flow Strategy
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              isConnected 
                ? 'bg-[#00e676]/10 border-[#00e676]/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#00e676] animate-pulse' : 'bg-red-500'
              }`} />
              <span className={`text-xs font-mono ${
                isConnected ? 'text-[#00e676]' : 'text-red-500'
              }`}>
                {isLoading ? 'CONNECTING...' : isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            
            {/* Refresh */}
            <button 
              onClick={refreshData}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Settings */}
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>

        {/* Not Connected Warning */}
        {!isConnected && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-500">tastytrade Not Connected</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Add your tastytrade credentials to enable live trading. 
                  Set <code className="px-1.5 py-0.5 rounded bg-white/5 text-xs">TASTYTRADE_USERNAME</code> and 
                  <code className="px-1.5 py-0.5 rounded bg-white/5 text-xs ml-1">TASTYTRADE_PASSWORD</code> environment variables.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Overview */}
        <AccountOverview isConnected={isConnected} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Positions - 2 cols */}
          <div className="lg:col-span-2">
            <TradingPositions isConnected={isConnected} />
          </div>
          
          {/* Quick Trade - 1 col */}
          <div>
            <QuickTrade isConnected={isConnected} />
          </div>
        </div>

        {/* Options Flow */}
        <OptionsFlow />

        {/* Recent Orders */}
        <TradingOrders isConnected={isConnected} />

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </main>
    </div>
  );
}
