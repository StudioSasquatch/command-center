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

// GET - Fetch recent orders
export async function GET() {
  const session = await getSession();
  
  if (!session) {
    // Return demo orders
    return NextResponse.json({
      orders: [
        {
          id: '1',
          symbol: 'NVDA 2/13 $182.5C',
          side: 'buy',
          type: 'limit',
          quantity: 1,
          price: 2.23,
          status: 'filled',
          filledPrice: 2.23,
          timestamp: new Date().toISOString()
        }
      ]
    });
  }
  
  try {
    const ordersRes = await fetch(
      `${TASTYTRADE_API_URL}/accounts/${session.accountNumber}/orders/live`,
      {
        headers: { 'Authorization': session.sessionToken },
      }
    );
    
    if (!ordersRes.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const ordersData = await ordersRes.json();
    const rawOrders = ordersData.data?.items || [];
    
    const orders = rawOrders.map((order: any) => ({
      id: order.id,
      symbol: order.legs?.[0]?.symbol || order['underlying-symbol'],
      side: order.legs?.[0]?.action?.toLowerCase().includes('buy') ? 'buy' : 'sell',
      type: order['order-type']?.toLowerCase() || 'limit',
      quantity: parseInt(order.legs?.[0]?.quantity) || 1,
      price: parseFloat(order.price) || 0,
      status: order.status?.toLowerCase() || 'pending',
      filledPrice: parseFloat(order['filled-price']) || parseFloat(order.price) || 0,
      timestamp: order['updated-at'] || order['created-at']
    }));
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ orders: [], error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Place a new order
export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Not connected to tastytrade' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, symbol, side, strike, expiry, quantity, limitPrice } = body;
    
    // Build the option symbol (OCC format)
    // Example: NVDA  260213C00182500 for NVDA $182.5 Call expiring 2/13/26
    const expiryDate = new Date(expiry);
    const expiryStr = expiryDate.toISOString().slice(2, 10).replace(/-/g, '');
    const sideChar = side === 'call' ? 'C' : 'P';
    const strikeStr = (strike * 1000).toString().padStart(8, '0');
    const occSymbol = `${symbol.padEnd(6)}${expiryStr}${sideChar}${strikeStr}`;
    
    // Build order payload
    const orderPayload = {
      'time-in-force': 'Day',
      'order-type': limitPrice ? 'Limit' : 'Market',
      'price': limitPrice ? limitPrice.toString() : undefined,
      'price-effect': 'Debit',
      'legs': [{
        'instrument-type': 'Equity Option',
        'symbol': occSymbol,
        'action': action === 'close' ? 'Sell to Close' : 'Buy to Open',
        'quantity': quantity.toString()
      }]
    };
    
    // Place the order
    const orderRes = await fetch(
      `${TASTYTRADE_API_URL}/accounts/${session.accountNumber}/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': session.sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      }
    );
    
    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      console.error('Order failed:', errorData);
      return NextResponse.json({ 
        error: errorData.error?.message || 'Order failed' 
      }, { status: 400 });
    }
    
    const orderData = await orderRes.json();
    
    return NextResponse.json({
      success: true,
      orderId: orderData.data?.order?.id,
      status: orderData.data?.order?.status
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
