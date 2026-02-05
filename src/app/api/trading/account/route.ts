import { NextResponse } from 'next/server';

// tastytrade API configuration
const TASTYTRADE_API_URL = 'https://api.tastytrade.com';

interface TastytradeSession {
  sessionToken: string;
  accountNumber: string;
}

async function getSession(): Promise<TastytradeSession | null> {
  const username = process.env.TASTYTRADE_USERNAME;
  const password = process.env.TASTYTRADE_PASSWORD;
  
  console.log('ENV CHECK:', { username: !!username, password: !!password });
  
  if (!username || !password) {
    console.log('Missing credentials');
    return null;
  }
  
  try {
    // Login to tastytrade
    const loginRes = await fetch(`${TASTYTRADE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TastyTradeAPI/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        login: username,
        password: password,
        'remember-me': true
      }),
    });
    
    console.log('Login response status:', loginRes.status);
    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      console.error('tastytrade login failed:', errorText);
      return null;
    }
    
    const loginData = await loginRes.json();
    const sessionToken = loginData.data['session-token'];
    
    // Get accounts
    const accountsRes = await fetch(`${TASTYTRADE_API_URL}/customers/me/accounts`, {
      headers: {
        'Authorization': sessionToken,
        'User-Agent': 'TastyTradeAPI/1.0',
        'Accept': 'application/json',
      },
    });
    
    if (!accountsRes.ok) {
      console.error('Failed to get accounts');
      return null;
    }
    
    const accountsData = await accountsRes.json();
    const accountNumber = accountsData.data.items[0].account['account-number'];
    
    return { sessionToken, accountNumber };
  } catch (error) {
    console.error('tastytrade session error:', error);
    return null;
  }
}

export async function GET() {
  const hasUsername = !!process.env.TASTYTRADE_USERNAME;
  const hasPassword = !!process.env.TASTYTRADE_PASSWORD;
  
  const session = await getSession();
  
  if (!session) {
    // Return demo data when not connected
    return NextResponse.json({
      connected: false,
      debug: { hasUsername, hasPassword },
      account: {
        balance: 2942.76,
        buyingPower: 641.76,
        dayPnL: 77.65,
        dayPnLPercent: 2.71,
        totalPnL: 714.71,
        totalPnLPercent: 32.1,
        positionCount: 4,
        cashBalance: 641.76
      }
    });
  }
  
  try {
    // Get account balances
    const balancesRes = await fetch(
      `${TASTYTRADE_API_URL}/accounts/${session.accountNumber}/balances`,
      {
        headers: {
          'Authorization': session.sessionToken,
          'User-Agent': 'TastyTradeAPI/1.0',
          'Accept': 'application/json',
        },
      }
    );
    
    if (!balancesRes.ok) {
      throw new Error('Failed to fetch balances');
    }
    
    const balancesData = await balancesRes.json();
    const balances = balancesData.data;
    
    // Get positions count
    const positionsRes = await fetch(
      `${TASTYTRADE_API_URL}/accounts/${session.accountNumber}/positions`,
      {
        headers: {
          'Authorization': session.sessionToken,
          'User-Agent': 'TastyTradeAPI/1.0',
          'Accept': 'application/json',
        },
      }
    );
    
    const positionsData = await positionsRes.json();
    const positionCount = positionsData.data?.items?.length || 0;
    
    return NextResponse.json({
      connected: true,
      account: {
        balance: parseFloat(balances['net-liquidating-value']) || 0,
        buyingPower: parseFloat(balances['derivative-buying-power']) || 0,
        dayPnL: parseFloat(balances['pending-cash']) || 0,
        dayPnLPercent: 0, // Would need to calculate from history
        totalPnL: parseFloat(balances['closed-loop-available-balance']) || 0,
        totalPnLPercent: 0,
        positionCount,
        cashBalance: parseFloat(balances['cash-balance']) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({
      connected: false,
      error: 'Failed to fetch account data'
    }, { status: 500 });
  }
}
