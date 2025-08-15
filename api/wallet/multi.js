// api/wallet/multi.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { ethAddress, solAddress } = req.body;
    
    if (!ethAddress && !solAddress) {
      res.status(400).json({ error: 'At least one address is required' });
      return;
    }

    let allEvents = [];
    let combinedStats = {
      totalSwaps: 0,
      totalValue: 0,
      miningRewards: 0,
      pondProStatus: false,
      pondProExpiry: null,
      pond0xData: {
        manifest: null,
        mining: null,
        health: null
      }
    };

    // Only process Solana address for now (since your 3 APIs are Solana-focused)
    if (solAddress) {
      console.log(`Processing Solana address: ${solAddress}`);
      
      // 1. Call Cary0x API for manifest data
      try {
        console.log('Calling Cary0x manifest API...');
        const manifestResponse = await fetch(`https://www.cary0x.com/api/manifest/${solAddress}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
          }
        });
        
        if (manifestResponse.ok) {
          const manifestData = await manifestResponse.json();
          console.log('✅ Cary0x manifest data retrieved');
          
          // Transform to match your interface
          combinedStats.pond0xData.manifest = {
            swaps: manifestData.swaps || 0,
            bxSwaps: manifestData.proSwapsBx || 0,
            hasTwitter: manifestData.hasTwitter || false,
            badges: manifestData.badges ? manifestData.badges.split(',').filter(Boolean) : [],
            cope: manifestData.cope || false,
            isPro: manifestData.isPro || false,
            proAgo: manifestData.proAgo || 0,
            walletAddress: solAddress
          };
          
          combinedStats.totalSwaps = manifestData.swaps || 0;
        } else {
          console.log('❌ Cary0x manifest API failed:', manifestResponse.status);
        }
      } catch (manifestError) {
        console.error('❌ Cary0x manifest error:', manifestError.message);
      }

      // 2. Call pond0x.com mining health API
      try {
        console.log('Calling pond0x health API...');
        const healthResponse = await fetch(`https://www.pond0x.com/api/solana/mining/health/${solAddress}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
            'Origin': 'https://pond0x.com',
            'Referer': 'https://pond0x.com/'
          }
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('✅ Pond0x health data retrieved');
          combinedStats.pond0xData.health = healthData;
        } else {
          console.log('❌ Pond0x health API failed:', healthResponse.status);
        }
      } catch (healthError) {
        console.error('❌ Pond0x health error:', healthError.message);
      }

      // 3. Call pond0x.com mining session API (requires special encoding)
      try {
        console.log('Calling pond0x mining session API...');
        
        // First get the mining signature
        const miningResponse = await fetch(`https://www.pond0x.com/api/solana/mining/session/${solAddress}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
            'Origin': 'https://pond0x.com',
            'Referer': 'https://pond0x.com/'
          }
        });
        
        if (miningResponse.ok) {
          const miningSignature = await miningResponse.text();
          console.log('✅ Mining signature retrieved');
          
          if (miningSignature && miningSignature.length > 40) {
            // Now get detailed session data
            const base64Param = Buffer.from(`${miningSignature}:${solAddress}`).toString('base64');
            const sessionResponse = await fetch(`https://www.pond0x.com/api/user/minesession/${base64Param}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
                'Origin': 'https://pond0x.com',
                'Referer': 'https://pond0x.com/'
              }
            });
            
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              console.log('✅ Mining session data retrieved');
              combinedStats.pond0xData.mining = {
                hasActiveMining: true,
                miningSignature: miningSignature,
                sessionDetails: sessionData
              };
            }
          }
        } else {
          console.log('❌ Pond0x mining API failed:', miningResponse.status);
          combinedStats.pond0xData.mining = {
            hasActiveMining: false,
            miningSignature: null
          };
        }
      } catch (miningError) {
        console.error('❌ Pond0x mining error:', miningError.message);
        combinedStats.pond0xData.mining = {
          hasActiveMining: false,
          miningSignature: null
        };
      }

      // Create sample events to show data is working
      allEvents = [
        {
          id: `sol_${Date.now()}_1`,
          type: 'swap',
          description: `🎉 API Integration Working! Found ${combinedStats.totalSwaps} swaps from Cary0x`,
          timestamp: Date.now(),
          hash: 'api_test_hash',
          chain: 'sol',
          amount: combinedStats.totalSwaps,
          token: 'SOL',
          tokenSymbol: 'SOL',
          tokenName: 'Solana'
        }
      ];

      // Update stats from manifest data
      if (combinedStats.pond0xData.manifest) {
        combinedStats.pondProStatus = combinedStats.pond0xData.manifest.isPro;
        if (combinedStats.pond0xData.manifest.isPro && combinedStats.pond0xData.manifest.proAgo < 365) {
          const proExpiry = new Date();
          proExpiry.setDate(proExpiry.getDate() + (365 - combinedStats.pond0xData.manifest.proAgo));
          combinedStats.pondProExpiry = proExpiry;
        }
      }
    }

    // Sort events by timestamp (newest first)
    allEvents.sort((a, b) => b.timestamp - a.timestamp);

    console.log('✅ API processing complete');
    res.status(200).json({
      events: allEvents,
      stats: combinedStats
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
