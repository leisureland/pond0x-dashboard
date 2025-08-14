import { WalletEvent, WalletStats, GlossaryTerm, ChartData, ChartPeriod, Chain } from '@/types';

export function generateMockEventsForChain(chain: Chain, address: string): WalletEvent[] {
  // Use address as seed for deterministic data with chain salt
  const chainSalt = chain === 'eth' ? 1000 : 2000;
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + chainSalt;
  
  const events: WalletEvent[] = [];
  const now = new Date();
  
  // Generate 15 mock events over the last 30 days
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor((seed + i * 7) % 30);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const eventTypes: WalletEvent['type'][] = ['swap', 'mine', 'subscription', 'reward', 'stake'];
    const typeIndex = (seed + i) % eventTypes.length;
    const type = eventTypes[typeIndex];
    
    let description = '';
    let value = 0;
    let token = '';
    let hash = '';
    
    if (chain === 'eth') {
      hash = `0x${(seed + i).toString(16).padStart(64, '0')}`;
    } else {
      // Generate Solana-like hash (base58-like)
      hash = `${(seed + i).toString(36).padStart(44, '0').slice(0, 44)}`;
    }
    
    switch (type) {
      case 'swap':
        value = ((seed + i) % 50) / 10 + 0.1;
        const ethTokens = ['POND', 'USDC', 'WETH'];
        const solTokens = ['POND', 'USDC', 'SOL'];
        const tokens = chain === 'eth' ? ethTokens : solTokens;
        token = tokens[(seed + i) % tokens.length];
        const baseToken = chain === 'eth' ? 'ETH' : 'SOL';
        description = `Swapped ${value.toFixed(2)} ${baseToken} for ${(value * 2400).toFixed(0)} ${token} tokens`;
        break;
      case 'mine':
        value = ((seed + i) % 20) / 100 + 0.01;
        const mineToken = chain === 'eth' ? 'ETH' : 'SOL';
        description = `Received ${value.toFixed(4)} ${mineToken} mining reward`;
        break;
      case 'subscription':
        description = 'Renewed PondPro subscription for 30 days';
        break;
      case 'reward':
        value = ((seed + i) % 100) / 10;
        description = `Earned ${value.toFixed(1)} POND tokens as staking reward`;
        break;
      case 'stake':
        value = ((seed + i) % 30) / 10 + 1;
        const stakeToken = chain === 'eth' ? 'ETH' : 'SOL';
        description = `Staked ${value.toFixed(1)} ${stakeToken} for 30 days`;
        break;
    }
    
    events.push({
      id: `${chain}-${address}-${i}`,
      chain,
      type,
      description,
      timestamp,
      hash,
      value,
      token
    });
  }
  
  // Ensure at least one subscription event
  if (!events.some(e => e.type === 'subscription')) {
    events[0] = {
      ...events[0],
      type: 'subscription',
      description: 'Renewed PondPro subscription for 30 days'
    };
  }
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateMockEvents(ethAddress?: string, solAddress?: string): WalletEvent[] {
  const allEvents: WalletEvent[] = [];
  
  if (ethAddress) {
    allEvents.push(...generateMockEventsForChain('eth', ethAddress));
  }
  
  if (solAddress) {
    allEvents.push(...generateMockEventsForChain('sol', solAddress));
  }
  
  return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateMockStats(ethAddress?: string, solAddress?: string): WalletStats {
  const ethSeed = ethAddress ? ethAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const solSeed = solAddress ? solAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const combinedSeed = ethSeed + solSeed;
  
  return {
    totalSwaps: 100 + (combinedSeed % 100),
    miningRewards: (combinedSeed % 500) / 100 + 1,
    pondProStatus: combinedSeed % 3 === 0 ? 'active' : combinedSeed % 3 === 1 ? 'expired' : 'inactive',
    pondProExpiry: new Date(Date.now() + (combinedSeed % 60) * 24 * 60 * 60 * 1000),
    totalValue: 10000 + (combinedSeed % 50000),
    monthlyChange: (combinedSeed % 50) - 25
  };
}

export function generateChartData(period: ChartPeriod, ethAddress?: string, solAddress?: string): ChartData {
  const ethSeed = ethAddress ? ethAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const solSeed = solAddress ? solAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const seed = ethSeed + solSeed;
  
  const mockData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: Array.from({ length: 7 }, (_, i) => (seed + i * 3) % 20 + 5)
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: Array.from({ length: 4 }, (_, i) => (seed + i * 7) % 50 + 10)
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: Array.from({ length: 6 }, (_, i) => (seed + i * 11) % 40 + 15)
    }
  };
  
  return {
    labels: mockData[period].labels,
    datasets: [{
      label: 'Activity',
      data: mockData[period].data,
      borderColor: 'rgb(6, 182, 212)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
}

export function getGlossaryTerms(): GlossaryTerm[] {
  return [
    {
      id: 'swap',
      name: 'Swap',
      definition: 'Exchanging one cryptocurrency for another through a decentralized exchange.',
      example: 'Trading your ETH for USDC to take profits or buying POND tokens with ETH to join the ecosystem.',
      category: 'Trading'
    },
    {
      id: 'mining',
      name: 'Mining',
      definition: 'Contributing computational power to validate transactions and earn cryptocurrency rewards.',
      example: 'Running mining software on your computer to help secure the Pond0x network and earn POND tokens as rewards.',
      category: 'Mining'
    },
    {
      id: 'liquidity-pool',
      name: 'Liquidity Pool',
      definition: 'A smart contract that holds funds to facilitate trading and provides liquidity for exchanges.',
      example: 'Depositing equal values of ETH and POND tokens into a pool to earn fees from traders who use that liquidity.',
      category: 'DeFi'
    },
    {
      id: 'staking',
      name: 'Staking',
      definition: 'Locking up cryptocurrency to support network operations and earn rewards.',
      example: 'Staking your POND tokens for 30 days to earn additional tokens while helping secure the network.',
      category: 'DeFi'
    },
    {
      id: 'yield-farming',
      name: 'Yield Farming',
      definition: 'Strategically moving funds between different protocols to maximize earning potential.',
      example: 'Providing liquidity to multiple pools and staking the receipt tokens elsewhere to compound your rewards.',
      category: 'DeFi'
    },
    {
      id: 'gas-fees',
      name: 'Gas Fees',
      definition: 'Transaction fees paid to miners or validators for processing blockchain transactions.',
      example: 'Paying $15 in ETH to execute a swap transaction during high network congestion times.',
      category: 'Blockchain'
    },
    {
      id: 'smart-contract',
      name: 'Smart Contract',
      definition: 'Self-executing contracts with terms directly written into code that runs on the blockchain.',
      example: 'A contract that automatically pays out staking rewards every 24 hours without human intervention.',
      category: 'Blockchain'
    },
    {
      id: 'slippage',
      name: 'Slippage',
      definition: 'The difference between expected and actual transaction price due to market movement.',
      example: 'Setting 2% slippage when swapping means you\'ll accept up to 2% price difference from the quoted rate.',
      category: 'Trading'
    },
    {
      id: 'defi',
      name: 'DeFi',
      definition: 'Decentralized Finance - financial services built on blockchain without traditional intermediaries.',
      example: 'Borrowing USDC against your ETH collateral or earning interest by lending tokens, all through smart contracts.',
      category: 'DeFi'
    },
    {
      id: 'impermanent-loss',
      name: 'Impermanent Loss',
      definition: 'Temporary loss experienced when token prices in a liquidity pool diverge from their original ratio.',
      example: 'If ETH price doubles while POND stays flat, your 50/50 ETH/POND pool position will have less ETH than if you just held it.',
      category: 'DeFi'
    }
  ];
}
