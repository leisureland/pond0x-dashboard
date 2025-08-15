export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { solAddress } = req.body;
    
    if (!solAddress) {
      return res.status(400).json({ error: 'Solana address required' });
    }

    console.log(`Processing address: ${solAddress}`);
    
    let pond0xData = {
      manifest: null,
      mining: null,
      health: null
    };

    // 1. Call Cary0x manifest API
    try {
      const manifestResponse = await fetch(`https://www.cary0x.com/api/manifest/${solAddress}`);
      if (manifestResponse.ok) {
        const data = await manifestResponse.json();
        pond0xData.manifest = {
          swaps: data.swaps || 0,
          bxSwaps: data.proSwapsBx || 0,
          hasTwitter: data.hasTwitter || false,
          badges: data.badges ? data.badges.split(',').filter(Boolean) : [],
          cope: data.cope || false,
          isPro: data.isPro || false,
          proAgo: data.proAgo || 0,
          walletAddress: solAddress
        };
        console.log('✅ Manifest data loaded');
      }
    } catch (e) {
      console.log('❌ Manifest failed:', e.message);
    }

    // 2. Call pond0x health API
    try {
      const healthResponse = await fetch(`https://www.pond0x.com/api/solana/mining/health/${solAddress}`);
      if (healthResponse.ok) {
        pond0xData.health = await healthResponse.json();
        console.log('✅ Health data loaded');
      }
    } catch (e) {
      console.log('❌ Health failed:', e.message);
    }

    // 3. Call pond0x mining API
    try {
      const miningResponse = await fetch(`https://www.pond0x.com/api/solana/mining/session/${solAddress}`);
      if (miningResponse.ok) {
        const signature = await miningResponse.text();
        if (signature && signature.length > 40) {
          const base64 = Buffer.from(`${signature}:${solAddress}`).toString('base64');
          const sessionResponse = await fetch(`https://www.pond0x.com/api/user/minesession/${base64}`);
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            pond0xData.mining = {
              hasActiveMining: true,
              miningSignature: signature,
              sessionDetails: sessionData
            };
            console.log('✅ Mining data loaded');
          }
        }
      }
    } catch (e) {
      console.log('❌ Mining failed:', e.message);
    }

    // Create response
    const events = [{
      id: `sol_${Date.now()}`,
      type: 'swap',
      description: `✅ Real data loaded: ${pond0xData.manifest?.swaps || 0} swaps found`,
      timestamp: Date.now(),
      hash: 'real_data_hash',
      chain: 'sol',
      amount: pond0xData.manifest?.swaps || 0,
      token: 'SOL',
      tokenSymbol: 'SOL',
      tokenName: 'Solana'
    }];

    return res.status(200).json({
      events,
      stats: {
        totalSwaps: pond0xData.manifest?.swaps || 0,
        totalValue: (pond0xData.manifest?.swaps || 0) * 200,
        miningRewards: 0,
        pondProStatus: pond0xData.manifest?.isPro || false,
        pondProExpiry: null,
        pond0xData
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
