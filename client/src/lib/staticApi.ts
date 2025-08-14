// Static API functions for direct external API calls
import { WalletEvent, WalletStats } from '@/types';

// Direct API calls for static deployment
export async function fetchPond0xData(solAddress: string) {
  try {
    // Fetch manifest data from Cary0x
    const manifestResponse = await fetch(`https://www.cary0x.com/api/manifest/${solAddress}`);
    const manifestData = await manifestResponse.json();

    // Fetch mining data from pond0x.com
    const miningResponse = await fetch(`https://pond0x.com/api/user/${solAddress}`);
    const miningData = await miningResponse.json();

    return {
      manifest: manifestData,
      mining: miningData
    };
  } catch (error) {
    console.error('Error fetching Pond0x data:', error);
    throw error;
  }
}

export async function fetchSolanaTransactions(address: string): Promise<{ events: WalletEvent[], stats: WalletStats }> {
  try {
    // For static deployment, return empty data with error message
    // In a full deployment, this would call Helius API directly
    const events: WalletEvent[] = [];
    const stats: WalletStats = {
      totalSwaps: 0,
      miningRewards: 0,
      pondProStatus: 'inactive' as const,
      totalValue: 0,
      monthlyChange: 0
    };

    return { events, stats };
  } catch (error) {
    console.error('Error fetching Solana transactions:', error);
    throw error;
  }
}

export async function fetchEthereumTransactions(address: string): Promise<{ events: WalletEvent[], stats: WalletStats }> {
  try {
    // For static deployment, return empty data
    // In a full deployment, this would call Alchemy API directly
    const events: WalletEvent[] = [];
    const stats: WalletStats = {
      totalSwaps: 0,
      miningRewards: 0,
      pondProStatus: 'inactive' as const,
      totalValue: 0,
      monthlyChange: 0
    };

    return { events, stats };
  } catch (error) {
    console.error('Error fetching Ethereum transactions:', error);
    throw error;
  }
}