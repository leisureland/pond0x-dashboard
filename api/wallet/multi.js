export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return test data to prove API works
  return res.status(200).json({
    events: [{
      id: 'test_1',
      type: 'swap',
      description: '🎉 API is working! Real data coming soon...',
      timestamp: Date.now(),
      hash: 'test_hash',
      chain: 'sol',
      amount: 1,
      token: 'SOL',
      tokenSymbol: 'SOL',
      tokenName: 'Solana'
    }],
    stats: {
      totalSwaps: 1,
      totalValue: 200,
      miningRewards: 0,
      pondProStatus: false,
      pondProExpiry: null,
      pond0xData: null
    }
  });
}
