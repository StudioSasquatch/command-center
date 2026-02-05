import { NextResponse } from 'next/server';

const TASTYTRADE_API_URL = 'https://api.tastytrade.com';

async function getSession() {
  const username = process.env.TASTYTRADE_USERNAME;
  const password = process.env.TASTYTRADE_PASSWORD;
  
  if (!username || !password) return null;
  
  try {
    const loginRes = await fetch(`${TASTYTRADE_API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: username,
        password: password,
        'remember-me': true
      }),
    });
    
    if (!loginRes.ok) return null;
    
    const loginData = await loginRes.json();
    const sessionToken = loginData.data['session-token'];
    
    const accountsRes = await fetch(`${TASTYTRADE_API_URL}/customers/me/accounts`, {
      headers: { 'Authorization': sessionToken },
    });
    
    if (!accountsRes.ok) return null;
    
    const accountsData = await accountsRes.json();
    const accountNumber = accountsData.data.items[0].account['account-number'];
    
    return { sessionToken, accountNumber };
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    // Return demo positions
    return NextResponse.json({
      positions: [
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
      ]
    });
  }
  
  try {
    const positionsRes = await fetch(
      `${TASTYTRADE_API_URL}/accounts/${session.accountNumber}/positions`,
      {
        headers: { 'Authorization': session.sessionToken },
      }
    );
    
    if (!positionsRes.ok) {
      throw new Error('Failed to fetch positions');
    }
    
    const positionsData = await positionsRes.json();
    const rawPositions = positionsData.data?.items || [];
    
    const positions = rawPositions.map((pos: any) => {
      const avgPrice = parseFloat(pos['average-open-price']) || 0;
      const mark = parseFloat(pos['mark-price']) || avgPrice;
      const quantity = parseInt(pos.quantity) || 0;
      const pnl = (mark - avgPrice) * quantity * (pos['instrument-type'] === 'Equity Option' ? 100 : 1);
      const pnlPercent = avgPrice > 0 ? ((mark - avgPrice) / avgPrice) * 100 : 0;
      
      // Calculate DTE for options
      let dte;
      if (pos['expires-at']) {
        const expiry = new Date(pos['expires-at']);
        const now = new Date();
        dte = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      return {
        symbol: pos.symbol,
        description: pos['underlying-symbol'] || pos.symbol,
        quantity: Math.abs(quantity),
        avgPrice,
        mark,
        pnl,
        pnlPercent,
        dte,
        type: pos['instrument-type'] === 'Equity Option' ? 'option' : 'stock'
      };
    });
    
    return NextResponse.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ positions: [], error: 'Failed to fetch positions' }, { status: 500 });
  }
}
