// api/wallet/multi.js - FIXED VERSION with Correct Data Parsing
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { address, ethAddress, solAddress, includeEthereum = true } = req.body;
    const finalSolAddress = solAddress || address;
    const finalEthAddress = includeEthereum ? (ethAddress || address) : null;
    
    console.log(`🚀 Processing multi-chain request:`, { finalSolAddress, finalEthAddress });
    
    let ethData = null;
    let solData = null;
    let pond0xManifest = null;
    let pond0xHealth = null;
    let pond0xMining = null;
    
    // Fetch all data in parallel
    const promises = [];
    
    if (finalSolAddress) {
      console.log(`📡 Fetching Pond0x data for: ${finalSolAddress}`);
      
      // 1. Cary0x Manifest API (FIXED parsing)
      promises.push(
        fetch(`https://www.cary0x.com/api/manifest/${finalSolAddress}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)'
          }
        })
        .then(async res => {
          if (res.ok) {
            const data = await res.json();
            console.log('✅ Raw Cary0x manifest data:', data);
            
            // FIXED: Parse the actual data structure correctly
            pond0xManifest = {
              swaps: data.proSwapsSol || data.swaps || 0,
              bxSwaps: data.proSwapsBx || 0,
              hasTwitter: data.hasTwitter || false,
              badges: data.badges ? data.badges.split(', ').filter(Boolean) : [],
              cope: data.cope || false,
              isPro: data.isPro || false,
              proAgo: data.proAgo === "undefined" ? 999 : parseInt(data.proAgo) || 0,
              walletAddress: finalSolAddress
            };
            console.log('✅ Parsed manifest:', pond0xManifest);
          } else {
            console.log('❌ Cary0x manifest failed:', res.status);
          }
        })
        .catch(err => console.error('❌ Manifest fetch error:', err))
      );
      
      // 2. Pond0x Health API
      promises.push(
        fetch(`https://www.pond0x.com/api/solana/mining/health/${finalSolAddress}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
            'Origin': 'https://pond0x.com',
            'Referer': 'https://pond0x.com/'
          }
        })
        .then(async res => {
          if (res.ok) {
            pond0xHealth = await res.json();
            console.log('✅ Pond0x health data:', pond0xHealth);
          } else {
            console.log('❌ Pond0x health failed:', res.status);
          }
        })
        .catch(err => console.error('❌ Health fetch error:', err))
      );
      
      // 3. Pond0x Mining Session API
      promises.push(
        fetch(`https://www.pond0x.com/api/solana/mining/session/${finalSolAddress}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
            'Origin': 'https://pond0x.com',
            'Referer': 'https://pond0x.com/'
          }
        })
        .then(async res => {
          if (res.ok) {
            const data = await res.text();
            if (data && data.length > 40) {
              pond0xMining = {
                hasActiveMining: true,
                miningSignature: data,
                sessionDetails: null
              };
              console.log('✅ Mining signature found:', data.substring(0, 20) + '...');
            } else {
              pond0xMining = { hasActiveMining: false, miningSignature: null };
              console.log('❌ No active mining session');
            }
          } else {
            pond0xMining = { hasActiveMining: false, miningSignature: null };
            console.log('❌ Pond0x mining failed:', res.status);
          }
        })
        .catch(err => {
          console.error('❌ Mining fetch error:', err);
          pond0xMining = { hasActiveMining: false, miningSignature: null };
        })
      );
      
      // 4. Solana blockchain data (simplified for now)
      promises.push(
        fetchSolanaDataSimple(finalSolAddress)
          .then(data => {
            solData = data;
            console.log('✅ Solana blockchain data:', solData?.events?.length, 'events');
          })
          .catch(err => console.error('❌ Solana blockchain error:', err))
      );
    }
    
    // Wait for all promises
    await Promise.allSettled(promises);
    
    // Create events showing real data
    const allEvents = [
      ...(solData?.events || []),
      {
        id: `pond0x_${Date.now()}`,
        type: 'swap',
        description: `🎉 Real Pond0x Data Loaded! ${pond0xManifest?.swaps || 0} swaps, ${pond0xManifest?.badges?.length || 0} badges, Pro: ${pond0xManifest?.isPro ? 'YES' : 'NO'}
