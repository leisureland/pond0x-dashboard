// api/wallet/multi.js - Serverless function for Pond0x data
export default async function handler(req, res) {
  // Set CORS headers
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
    const { address, ethAddress, solAddress, includeEthereum = true } = req.body;
    const finalSolAddress = solAddress || address;
    
    console.log(`🚀 Processing request for: ${finalSolAddress}`);
    
    if (!finalSolAddress) {
      return res.status(400).json({ error: 'No Solana address provided' });
    }

    let manifestData = null;
    let healthData = null;
    let caryHealthData = null;
    let miningSessionData = null;
    
    // Fetch data from external APIs in parallel
    const apiPromises = [
      // 1. Fetch Cary0x Manifest API
      fetch(`https://www.cary0x.com/api/manifest/${finalSolAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)'
        }
      }).then(async res => {
        if (res.ok) {
          manifestData = await res.json();
          console.log('✅ Manifest data received:', manifestData);
        } else {
          console.log('❌ Manifest API failed:', res.status);
        }
      }).catch(error => console.error('❌ Manifest fetch error:', error)),

      // 2. Fetch Pond0x Health API
      fetch(`https://www.pond0x.com/api/solana/mining/health/${finalSolAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)'
        }
      }).then(async res => {
        if (res.ok) {
          healthData = await res.json();
          console.log('✅ Pond0x health data received:', healthData);
        } else {
          console.log('❌ Pond0x health API failed:', res.status);
        }
      }).catch(error => console.error('❌ Pond0x health fetch error:', error)),

      // 3. Fetch Cary0x Health API (for mining session data)
      fetch(`https://www.cary0x.com/api/health/${finalSolAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)'
        }
      }).then(async res => {
        if (res.ok) {
          caryHealthData = await res.json();
          console.log('✅ Cary health data received:', caryHealthData);
        } else {
          console.log('❌ Cary health API failed:', res.status);
        }
      }).catch(error => console.error('❌ Cary health fetch error:', error)),

      // 4. Mining session data will be derived from health data instead of hardcoded endpoint
      // The minesession endpoint requires wallet-specific authentication tokens that we cannot generate
      // We'll use the health data to determine if there's active mining
      Promise.resolve().then(() => {
        console.log('ℹ️ Mining session data will be derived from health APIs');
      })
    ];

    // Wait for all API calls to complete
    await Promise.allSettled(apiPromises);

    // Parse and structure the response data
    const pond0xData = {
      isPro: manifestData?.isPro || false,
      proSwapsSol: manifestData?.proSwapsSol || 0,
      proSwapsBx: manifestData?.proSwapsBx || 0,
      badges: manifestData?.badges || '',
      hasTwitter: manifestData?.hasTwitter || false,
      cope: manifestData?.cope || false,
      proAgo: manifestData?.proAgo || 0,
      proExpiry: manifestData?.proExpiry || null
    };

    // Extract mining session data
    const miningSessions = healthData?.stats?.mining_sessions || caryHealthData?.mining_sessions || 0;
    const totalSwaps = pond0xData.proSwapsSol + pond0xData.proSwapsBx;
    
    // Calculate swap boost based on Cary's formula
    // Reference: https://cary0x.github.io/docs/info/swaps
    const calculateSwapBoost = (sessions, swaps) => {
      if (sessions === 0) return 1.0;
      const swapRatio = swaps / sessions;
      
      // Cary's boost formula approximation
      let boost = 1.0;
      if (swapRatio >= 1) boost = 1.5;
      if (swapRatio >= 2) boost = 2.0;
      if (swapRatio >= 5) boost = 2.5;
      if (swapRatio >= 10) boost = 3.0;
      if (swapRatio >= 20) boost = 3.5;
      if (swapRatio >= 50) boost = 4.0;
      
      return boost;
    };

    const swapBoost = calculateSwapBoost(miningSessions, totalSwaps);
    
    // Check for active mining session based on health data
    // A wallet has active mining if it has mempool transactions or recent activity
    const hasActiveMining = (healthData?.stats?.in_mempool > 0) || (caryHealthData?.mining_sessions > 0);
    
    // Create events for the timeline
    const events = [
      {
        id: `pond0x_${Date.now()}`,
        type: 'pond0x_data',
        timestamp: new Date().toISOString(),
        description: `Pond0x Data: ${pond0xData.proSwapsSol} SOL swaps, ${pond0xData.proSwapsBx} BX swaps, Pro: ${pond0xData.isPro}`,
        amount: pond0xData.proSwapsSol,
        success: true
      }
    ];

    // Return structured response with all data
    const response = {
      success: true,
      address: finalSolAddress,
      events: events,
      pond0xData: pond0xData,
      healthData: healthData,
      caryHealthData: caryHealthData,
      miningSessionData: miningSessionData,
      miningStats: {
        sessions: miningSessions,
        hasActiveMining: hasActiveMining,
        swapBoost: swapBoost,
        swapRatio: miningSessions > 0 ? (totalSwaps / miningSessions).toFixed(2) : '0.00'
      },
      stats: {
        totalSwaps: totalSwaps,
        solSwaps: pond0xData.proSwapsSol,
        bxSwaps: pond0xData.proSwapsBx,
        badgeCount: pond0xData.badges ? pond0xData.badges.split(',').length : 0,
        isPro: pond0xData.isPro,
        miningSessions: miningSessions,
        swapBoost: swapBoost
      }
    };

    console.log('✅ Returning response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      address: req.body?.solAddress || req.body?.address
    });
  }
}
