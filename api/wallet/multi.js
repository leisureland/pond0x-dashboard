// api/wallet/multi.js - Complete Recreation of Your Replit Functionality

export default async function handler(req, res) {
  // Enable CORS
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
    
    // Use the provided address for Solana if single address provided
    const finalSolAddress = solAddress || address;
    const finalEthAddress = includeEthereum ? (ethAddress || address) : null;
    
    console.log(`Processing multi-chain request:`, { finalSolAddress, finalEthAddress });
    
    let ethData = null;
    let solData = null;
    let pond0xManifest = null;
    let pond0xHealth = null;
    let pond0xMining = null;
    
    // Parallel promises for all data fetching
    const promises = [];
    
    // Always try to fetch authentic Pond0x data if SOL address provided
    if (finalSolAddress) {
      console.log(`Fetching Pond0x data for: ${finalSolAddress}`);
      
      // 1. Pond0x Manifest (Cary0x API)
      promises.push(
        fetchPond0xManifest(finalSolAddress)
          .then(data => { pond0xManifest = data; })
          .catch(err => console.error('Manifest fetch failed:', err))
      );
      
      // 2. Pond0x Mining (Official API)
      promises.push(
        fetchPond0xMining(finalSolAddress)
          .then(data => { pond0xMining = data; })
          .catch(err => console.error('Mining fetch failed:', err))
      );
      
      // 3. Pond0x Health (Cary0x Health API)
      promises.push(
        fetch(`https://www.cary0x.com/api/health/${finalSolAddress}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => { pond0xHealth = data; })
          .catch(err => console.error('Health fetch failed:', err))
      );
      
      // 4. Solana Blockchain Data (Full transaction history)
      promises.push(
        fetchSolanaData(finalSolAddress)
          .then(data => { solData = data; })
          .catch(err => console.error('Solana data fetch failed:', err))
      );
    }
    
    // 5. Ethereum data if requested
    if (finalEthAddress) {
      promises.push(
        fetchEthereumData(finalEthAddress)
          .then(data => { ethData = data; })
          .catch(err => console.error('Ethereum data fetch failed:', err))
      );
    }
    
    // Wait for all promises to complete
    await Promise.allSettled(promises);
    
    // Combine events from both chains (for timeline display)
    const allEvents = [
      ...(ethData?.events || []),
      ...(solData?.events || [])
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    // Use authentic Cary0x Pond0x data when available, otherwise fallback to blockchain
    const combinedStats = {
      // Prioritize Cary0x manifest data for swaps (most accurate)
      totalSwaps: pond0xManifest?.swaps || 
                 ((ethData?.stats?.totalSwaps || 0) + (solData?.stats?.totalSwaps || 0)),
      
      // Use Cary0x health data for portfolio value estimates 
      totalValue: pond0xHealth?.stats?.estimates?.max_claim_estimate_usd || 
                 ((ethData?.stats?.totalValue || 0) + (solData?.stats?.totalValue || 0)),
      
      // Use Cary0x health data for mining sessions count
      miningRewards: pond0xHealth?.stats?.mining_sessions || 
                    ((ethData?.stats?.miningRewards || 0) + (solData?.stats?.miningRewards || 0)),
      
      // Use Cary0x manifest data for Pro status
      pondProStatus: Boolean(pond0xManifest?.isPro) || 
                    ethData?.stats?.pondProStatus || solData?.stats?.pondProStatus || false,
      
      // Calculate Pro expiry from Cary0x manifest proAgo value
      pondProExpiry: pond0xManifest?.isPro && pond0xManifest?.proAgo !== undefined
        ? new Date(Date.now() + (30 - parseInt(pond0xManifest.proAgo)) * 24 * 60 * 60 * 1000)
        : ethData?.stats?.pondProExpiry || solData?.stats?.pondProExpiry || null
    };
    
    console.log(`✅ API processing complete:`, {
      events: allEvents.length,
      swaps: combinedStats.totalSwaps,
      manifest: !!pond0xManifest,
      mining: !!pond0xMining,
      health: !!pond0xHealth
    });
    
    return res.status(200).json({
      events: allEvents,
      stats: combinedStats,
      ethData,
      solData,
      pond0xData: {
        manifest: pond0xManifest,
        health: pond0xHealth,
        mining: pond0xMining
      }
    });

  } catch (error) {
    console.error('❌ Multi-chain data fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch multi-chain data',
      message: error.message 
    });
  }
}

// ========================================
// BLOCKCHAIN API FUNCTIONS (Converted from TypeScript)
// ========================================

async function fetchEthereumData(address) {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  
  if (!alchemyKey) {
    throw new Error('ALCHEMY_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: '0x0',
            toBlock: 'latest',
            fromAddress: address,
            category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: 100
          }]
        })
      }
    );

    const data = await response.json();
    const transfers = data.result?.transfers || [];

    const events = transfers.map((transfer, index) => ({
      id: `eth_${transfer.hash}_${index}`,
      type: transfer.category === 'erc20' ? 'swap' : 'transfer',
      description: `${transfer.category.toUpperCase()}: ${transfer.value || '0'} ${transfer.asset}`,
      timestamp: new Date(transfer.metadata.blockTimestamp).getTime(),
      hash: transfer.hash,
      chain: 'eth',
      amount: parseFloat(transfer.value || '0'),
      token: transfer.asset || 'ETH',
      tokenSymbol: transfer.asset || 'ETH',
      tokenName: transfer.asset || 'Ethereum',
      contractAddress: transfer.rawContract?.address || undefined,
      fromAddress: transfer.from,
      toAddress: transfer.to
    }));

    const swapTxs = events.filter(e => e.type === 'swap');
    const totalValue = events.reduce((sum, event) => sum + (event.amount || 0), 0);
    const miningRewards = events
      .filter(e => e.type === 'reward')
      .reduce((sum, event) => sum + (event.amount || 0), 0);

    const stats = {
      totalSwaps: swapTxs.length,
      totalValue: Math.round(totalValue),
      miningRewards,
      pondProStatus: false,
      pondProExpiry: null
    };

    return { events, stats };

  } catch (error) {
    console.error('Error fetching Ethereum data:', error);
    throw error;
  }
}

async function fetchSolanaData(address) {
  const heliusKey = process.env.HELIUS_API_KEY;
  
  if (!heliusKey) {
    throw new Error('HELIUS_API_KEY not configured');
  }

  try {
    console.log(`Fetching Solana data for address: ${address}`);
    
    // Get transaction signatures
    const sigResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getSignaturesForAddress',
        params: [address, { 
          limit: 1000,
          before: null
        }],
        id: 1
      })
    });

    if (!sigResponse.ok) {
      throw new Error(`Helius RPC error: ${sigResponse.status}`);
    }

    const sigData = await sigResponse.json();
    if (sigData.error) {
      throw new Error(`Helius RPC error: ${sigData.error.message}`);
    }

    let allSignatures = sigData.result || [];
    const signatures = allSignatures;
    console.log(`Found ${signatures.length} transaction signatures`);

    // Try enhanced API for detailed transaction parsing
    let enhancedTxs = [];
    try {
      const enhancedResponse = await fetch(
        `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusKey}&limit=500`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (enhancedResponse.ok) {
        enhancedTxs = await enhancedResponse.json();
        console.log(`Enhanced API returned ${enhancedTxs.length} parsed transactions`);
      }
    } catch (enhancedError) {
      console.warn('Enhanced API failed, continuing with basic parsing:', enhancedError);
    }

    const events = [];

    // Process enhanced transactions if available
    for (const tx of enhancedTxs) {
      try {
        const event = parseEnhancedTransaction(tx, address);
        if (event) events.push(event);
      } catch (error) {
        console.warn(`Failed to parse enhanced transaction:`, error);
      }
    }

    // Add remaining signatures as basic events
    const remainingCount = Math.min(500 - events.length, signatures.length);
    if (remainingCount > 0) {
      console.log(`Adding ${remainingCount} enhanced signature events`);
      
      for (let i = events.length; i < remainingCount; i++) {
        const sig = signatures[i];
        if (!sig) break;
        
        try {
          const timeAgo = sig.blockTime ? 
            `${Math.floor((Date.now() - sig.blockTime * 1000) / (1000 * 60 * 60 * 24))}d ago` : 
            'Recently';
          
          const date = sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleDateString() : 'Unknown date';
          const time = sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleTimeString() : 'Unknown time';
          
          let transactionType = 'swap';
          let emoji = '🔄';
          let category = 'Program Interaction';
          
          let description = '';
          if (sig.err) {
            description = `❌ Failed ${category}: ${Object.keys(sig.err)[0] || 'Transaction error'} - Block ${sig.slot || 'Unknown'} (${timeAgo})`;
            transactionType = 'failed';
          } else {
            const blockInfo = `Block ${sig.slot || 'Unknown'}`;
            const shortHash = sig.signature.slice(0, 8) + '...' + sig.signature.slice(-8);
            description = `${emoji} Solana Program Interaction - ${blockInfo} | Hash: ${shortHash} | ${date} ${time} (${timeAgo})`;
          }
          
          const baseEvent = {
            id: `sol_${sig.signature}_${sig.slot || Date.now()}`,
            type: transactionType,
            description,
            timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
            hash: sig.signature,
            chain: 'sol',
            amount: undefined,
            value: undefined,
            token: 'SOL',
            tokenSymbol: 'SOL', 
            tokenName: 'Solana',
            contractAddress: undefined,
            fromAddress: undefined,
            toAddress: undefined
          };
          
          events.push(baseEvent);
        } catch (error) {
          console.warn(`Failed to process signature:`, error);
        }
      }
    }

    // Calculate stats from transaction data
    const swapTxs = events.filter(e => e.type === 'swap');
    const totalValue = events.reduce((sum, event) => sum + Math.abs(event.amount || 0), 0);
    const miningRewards = swapTxs.reduce((sum, event) => sum + (event.amount || 0), 0);
    const solToUsd = 200;
    
    console.log(`Processed ${events.length} events, ${swapTxs.length} swaps`);
    
    const stats = {
      totalSwaps: swapTxs.length,
      totalValue: Math.round(totalValue * solToUsd * 100) / 100,
      miningRewards: Math.round(miningRewards * 100) / 100,
      pondProStatus: false,
      pondProExpiry: null
    };

    return { events, stats };

  } catch (error) {
    console.error('Error fetching Solana data:', error);
    throw error;
  }
}

function parseEnhancedTransaction(tx, userAddress) {
  try {
    let description = tx.description || 'Solana transaction';
    let type = 'transfer';
    let amount = 0;
    let token = 'SOL';
    let tokenSymbol = 'SOL';
    let tokenName = 'Solana';
    let contractAddress = undefined;

    // Parse transaction type from description
    if (tx.description) {
      const desc = tx.description.toLowerCase();
      if (desc.includes('swap') || desc.includes('bought') || desc.includes('sold')) {
        type = 'swap';
      } else if (desc.includes('stake') || desc.includes('unstake')) {
        type = 'stake';
      } else if (desc.includes('received') && (desc.includes('sol') || desc.includes('token'))) {
        type = 'reward';
      } else if (tx.transactionError) {
        type = 'failed';
      }

      // Enhanced token extraction from description
      const tokenPatterns = [
        /(\d+\.?\d*)\s+([A-Za-z]{2,20})\s+(?:for|to)/i,
        /swapped.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        /bought.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        /sold.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        /transferred.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        /(\d+\.?\d*)\s+([A-Za-z]{2,20})$/i
      ];

      for (const pattern of tokenPatterns) {
        const match = description.match(pattern);
        if (match) {
          const [_, amountStr, tokenStr] = match;
          amount = parseFloat(amountStr) || 0;
          tokenSymbol = tokenStr.toUpperCase();
          token = tokenSymbol;
          
          // Token name mapping
          const tokenMap = {
            'PEPE': 'Pepe',
            'USDC': 'USD Coin',
            'USDT': 'Tether',
            'WSOL': 'Wrapped SOL', 
            'MSOL': 'Marinade SOL',
            'JUP': 'Jupiter',
            'BONK': 'Bonk',
            'WIF': 'dogwifhat',
            'RAY': 'Raydium',
            'ORCA': 'Orca',
            'SOL': 'Solana'
          };
          
          tokenName = tokenMap[tokenSymbol] || tokenSymbol;
          break;
        }
      }
    }

    // Process token transfers for accurate data
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      for (const transfer of tx.tokenTransfers) {
        if (transfer.fromUserAccount === userAddress || transfer.toUserAccount === userAddress) {
          if (transfer.tokenAmount && transfer.mint) {
            tokenSymbol = transfer.symbol || tokenSymbol;
            tokenName = transfer.name || tokenName;
            contractAddress = transfer.mint;
            amount = Math.abs(parseFloat(transfer.tokenAmount) || 0);
          }
        }
      }
    }

    // Process native SOL transfers
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      for (const nativeTransfer of tx.nativeTransfers) {
        if (nativeTransfer.fromUserAccount === userAddress || nativeTransfer.toUserAccount === userAddress) {
          if (token === 'SOL' && nativeTransfer.amount) {
            amount = Math.abs(nativeTransfer.amount / 1e9);
          }
        }
      }
    }

    return {
      id: `sol_${tx.signature}`,
      type: tx.transactionError ? 'failed' : type,
      description: tx.transactionError ? `${description} (failed)` : description,
      timestamp: tx.timestamp ? tx.timestamp * 1000 : Date.now(),
      hash: tx.signature,
      chain: 'sol',
      amount,
      token,
      tokenSymbol,
      tokenName,
      contractAddress,
      fromAddress: undefined,
      toAddress: undefined
    };

  } catch (error) {
    console.warn(`Failed to parse transaction:`, error);
    return null;
  }
}

// ========================================
// POND0X API FUNCTIONS (Converted from TypeScript)
// ========================================

async function fetchPond0xManifest(solAddress) {
  try {
    console.log(`Fetching Pond0x manifest data for: ${solAddress}`);
    
    const caryApiUrl = 'https://www.cary0x.com/api';
    const endpoint = `${caryApiUrl}/manifest/${solAddress}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
        'Origin': 'https://cary0x.github.io',
        'Referer': 'https://cary0x.github.io/'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Found authentic Pond0x manifest data!');
      return {
        swaps: data.proSwapsSol || data.swaps || 0,
        bxSwaps: data.proSwapsBx || 0,
        hasTwitter: data.hasTwitter || false,
        badges: data.badges ? data.badges.split(', ') : [],
        cope: data.cope || false,
        isPro: data.isPro || false,
        proAgo: parseInt(data.proAgo) || 0,
        walletAddress: solAddress
      };
    }
    
    console.log('Pond0x manifest not found');
    return null;
    
  } catch (error) {
    console.error('Error fetching Pond0x manifest:', error);
    return null;
  }
}

async function fetchPond0xMining(solAddress) {
  try {
    console.log(`Fetching official pond0x mining data for: ${solAddress}`);
    
    const endpoint = `https://www.pond0x.com/api/solana/mining/session/${solAddress}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
        'Origin': 'https://pond0x.com',
        'Referer': 'https://pond0x.com/'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Official pond0x mining API response:', data);
      
      // Check if we got a valid mining signature
      if (typeof data === 'string' && data.length > 40) {
        // Try to get detailed session data
        const sessionData = await fetchPond0xMiningSession(data, solAddress);
        
        return {
          hasActiveMining: true,
          miningSignature: data,
          sessionDetails: sessionData
        };
      }
    }
    
    console.log('No active mining session found');
    return {
      hasActiveMining: false,
      miningSignature: null
    };
    
  } catch (error) {
    console.error('Error fetching pond0x mining data:', error);
    return null;
  }
}

async function fetchPond0xMiningSession(signature, solAddress) {
  try {
    const base64Param = Buffer.from(`${signature}:${solAddress}`).toString('base64');
    const userSessionEndpoint = `https://www.pond0x.com/api/user/minesession/${base64Param}`;
    
    console.log(`Fetching detailed mining session: ${signature.substring(0, 20)}...`);
    
    const userResponse = await fetch(userSessionEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
        'Origin': 'https://pond0x.com',
        'Referer': 'https://pond0x.com/'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Authentic user mining session with real boost values:', userData);
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching mining session details:', error);
    return null;
  }
}
