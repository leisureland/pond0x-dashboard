// api/wallet/multi.js - DEBUG VERSION
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { solAddress } = req.body;
    const testAddress = solAddress || 'GPieLbY26GPaje1PDs4s7maUGZNqGQNGm7FzZN3LEoLF';
    
    console.log('🔍 Testing APIs individually...');
    
    const results = {
      testAddress,
      apis: {}
    };

    // Test 1: Cary0x Manifest
    try {
      console.log('Testing Cary0x manifest...');
      const manifestResponse = await fetch(`https://www.cary0x.com/api/manifest/${testAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)'
        }
      });
      
      results.apis.caryManifest = {
        status: manifestResponse.status,
        ok: manifestResponse.ok,
        data: manifestResponse.ok ? await manifestResponse.json() : await manifestResponse.text()
      };
      console.log('✅ Cary0x manifest result:', results.apis.caryManifest);
    } catch (error) {
      results.apis.caryManifest = { error: error.message };
      console.log('❌ Cary0x manifest failed:', error.message);
    }

    // Test 2: Pond0x Health
    try {
      console.log('Testing Pond0x health...');
      const healthResponse = await fetch(`https://www.pond0x.com/api/solana/mining/health/${testAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
          'Origin': 'https://pond0x.com',
          'Referer': 'https://pond0x.com/'
        }
      });
      
      results.apis.pond0xHealth = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: healthResponse.ok ? await healthResponse.json() : await healthResponse.text()
      };
      console.log('✅ Pond0x health result:', results.apis.pond0xHealth);
    } catch (error) {
      results.apis.pond0xHealth = { error: error.message };
      console.log('❌ Pond0x health failed:', error.message);
    }

    // Test 3: Pond0x Mining Session
    try {
      console.log('Testing Pond0x mining session...');
      const miningResponse = await fetch(`https://www.pond0x.com/api/solana/mining/session/${testAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
          'Origin': 'https://pond0x.com',
          'Referer': 'https://pond0x.com/'
        }
      });
      
      results.apis.pond0xMining = {
        status: miningResponse.status,
        ok: miningResponse.ok,
        data: miningResponse.ok ? await miningResponse.text() : await miningResponse.text()
      };
      console.log('✅ Pond0x mining result:', results.apis.pond0xMining);
    } catch (error) {
      results.apis.pond0xMining = { error: error.message };
      console.log('❌ Pond0x mining failed:', error.message);
    }

    // Test 4: Environment Variables
    results.environment = {
      hasAlchemy: !!process.env.ALCHEMY_API_KEY,
      hasHelius: !!process.env.HELIUS_API_KEY,
      alchemyPreview: process.env.ALCHEMY_API_KEY ? process.env.ALCHEMY_API_KEY.substring(0, 10) + '...' : 'MISSING',
      heliusPreview: process.env.HELIUS_API_KEY ? process.env.HELIUS_API_KEY.substring(0, 10) + '...' : 'MISSING'
    };

    console.log('🔍 Full debug results:', results);

    return res.status(200).json({
      message: 'DEBUG: Individual API test results',
      debug: results,
      events: [{
        id: 'debug_1',
        type: 'swap',
        description: '🔍 Debug mode: Check the debug object for API test results',
        timestamp: Date.now(),
        hash: 'debug_hash',
        chain: 'sol',
        amount: 1,
        token: 'SOL',
        tokenSymbol: 'SOL',
        tokenName: 'Solana'
      }],
      stats: {
        totalSwaps: results.apis.caryManifest?.data?.swaps || 0,
        totalValue: 0,
        miningRewards: 0,
        pondProStatus: results.apis.caryManifest?.data?.isPro || false,
        pondProExpiry: null,
        pond0xData: {
          manifest: results.apis.caryManifest?.data || null,
          health: results.apis.pond0xHealth?.data || null,
          mining: results.apis.pond0xMining?.data || null
        }
      }
    });

  } catch (error) {
    console.error('❌ Debug API Error:', error);
    return res.status(500).json({ 
      error: 'Debug API failed',
      message: error.message 
    });
  }
}
