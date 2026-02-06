import { NextResponse } from 'next/server';

/**
 * Trading Strategy Configuration API
 *
 * Returns the current trading strategy parameters.
 * This ensures the UI always displays the correct values.
 */

export async function GET() {
  // These values should match the trading-agent's OPTIONS_STRATEGY.md
  const strategyConfig = {
    // Exit Rules
    takeProfit: 0.50,        // +50%
    stopLoss: -0.40,         // -40%

    // Entry Criteria
    minPremium: 150000,      // $150K minimum (conservative filter)
    targetPremium: 500000,   // $500K+ preferred (high conviction)
    minDTE: 7,               // Minimum 7 days to expiry
    maxDTE: 35,              // Maximum 35 days to expiry
    maxCostPerContract: 500, // $500 max per contract

    // Risk Management
    maxPositionSize: 500,    // $500 max per trade
    maxPositions: 8,         // Max 8 open positions
    maxDailyLoss: 0.10,      // 10% max daily loss
    cashReserve: 0.20,       // 20% cash reserve

    // Signal Requirements
    requiredTags: ['BIGMO', 'FARTAR'],  // Preferred tags
    sideFilter: 'BUY',       // Only follow BUY signals

    // Liquid Tickers
    liquidTickers: [
      'SPY', 'QQQ', 'NVDA', 'TSLA', 'AAPL',
      'AMD', 'META', 'MSFT', 'GOOGL', 'AMZN'
    ],

    // Display formatting
    display: {
      takeProfit: '+50%',
      stopLoss: '-40%',
      minPremium: '≥$150K',
      targetPremium: '≥$500K',
      dteRange: '7-35 days',
      maxCost: '≤$500/contract'
    },

    // Metadata
    version: '2.0',
    source: 'OPTIONS_STRATEGY.md',
    lastUpdated: '2026-02-05'
  };

  return NextResponse.json(strategyConfig);
}
