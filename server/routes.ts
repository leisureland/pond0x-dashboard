import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WalletStats, WalletEvent, UnifiedAccount } from "@shared/schema";
import type { Pond0xManifest } from "./pond0xApi";
import { fetchEthereumData, fetchSolanaData, fetchPond0xData } from "./blockchainApi";
import { fetchPond0xManifest, fetchPond0xMining, createPond0xStyleManifest } from "./pond0xApi";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the server!" });
  });

  // Unified account lookup - by X handle, ETH address, or SOL address
  app.get("/api/account/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // First try to resolve through pond0x platform
      const pond0xData = await fetchPond0xData(identifier);
      
      let result: UnifiedAccount = {
        pondProStatus: false
      };
      
      if (pond0xData) {
        result = {
          xHandle: pond0xData.xHandle,
          ethAddress: pond0xData.ethAddress,
          solAddress: pond0xData.solAddress,
          pondProStatus: pond0xData.pondProStatus,
          pondProExpiry: pond0xData.pondProExpiry
        };
      } else {
        // If not found in pond0x, treat identifier as a direct wallet address
        if (identifier.startsWith('0x') && identifier.length === 42) {
          result.ethAddress = identifier;
        } else if (identifier.length >= 32 && identifier.length <= 44 && !identifier.includes('@')) {
          result.solAddress = identifier;
        }
        // If it's an X handle (contains @ or is a username), we can't auto-populate addresses
        // User would need to enter their addresses manually
      }
      
      res.json(result);
    } catch (error) {
      console.error('Account lookup error:', error);
      res.status(500).json({ error: "Failed to lookup account" });
    }
  });

  // Get wallet data for specific address and chain
  app.get("/api/wallet/:chain/:address", async (req, res) => {
    try {
      const { chain, address } = req.params;
      
      let data;
      if (chain === 'eth') {
        data = await fetchEthereumData(address);
      } else if (chain === 'sol') {
        data = await fetchSolanaData(address);
      } else {
        return res.status(400).json({ error: "Invalid chain. Use 'eth' or 'sol'" });
      }
      
      res.json(data);
    } catch (error) {
      const chainName = req.params.chain?.toUpperCase() || 'CHAIN';
      console.error(`${chainName} data fetch error:`, error);
      res.status(500).json({ 
        error: `Failed to fetch ${chainName} data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Combined multi-chain data endpoint
  app.post("/api/wallet/multi", async (req, res) => {
    try {
      const { address, ethAddress, solAddress, includeEthereum = true } = req.body;
      
      // Use the provided address for Solana if single address provided
      const finalSolAddress = solAddress || address;
      const finalEthAddress = includeEthereum ? (ethAddress || address) : null;
      
      const promises: Promise<any>[] = [];
      let ethData: any = null;
      let solData: any = null;
      let pond0xManifest: any = null;
      let pond0xHealth: any = null;
      let pond0xMining: any = null;
      
      // Always try to fetch authentic Pond0x data if SOL address provided
      if (finalSolAddress) {
        console.log(`Fetching Pond0x data for: ${finalSolAddress}`);
        promises.push(
          fetchPond0xManifest(finalSolAddress).then(data => { pond0xManifest = data; }).catch(console.error)
        );
        promises.push(
          fetchPond0xMining(finalSolAddress).then(data => { pond0xMining = data; }).catch(console.error)
        );
        promises.push(
          fetch(`https://www.cary0x.com/api/health/${finalSolAddress}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { pond0xHealth = data; })
            .catch(console.error)
        );
        
        // Always fetch Solana blockchain data for transaction timeline
        promises.push(
          fetchSolanaData(finalSolAddress).then(data => { solData = data; }).catch(console.error)
        );
      }
      
      if (finalEthAddress) {
        promises.push(
          fetchEthereumData(finalEthAddress).then(data => { ethData = data; }).catch(console.error)
        );
      }
      
      await Promise.allSettled(promises);
      
      // Combine events from both chains (for timeline display only)
      const allEvents: WalletEvent[] = [
        ...(ethData?.events || []),
        ...(solData?.events || [])
      ].sort((a, b) => b.timestamp - a.timestamp);
      
      // Use authentic Cary0x Pond0x data when available, otherwise fallback to blockchain
      const combinedStats: WalletStats = {
        // Prioritize Cary0x manifest data for swaps (most accurate)
        totalSwaps: pond0xManifest?.swaps || 
                   ((ethData?.stats?.totalSwaps || 0) + (solData?.stats?.totalSwaps || 0)),
        
        // Use Cary0x health data for portfolio value estimates 
        totalValue: pond0xHealth?.stats?.estimates?.max_claim_estimate_usd || 
                   ((ethData?.stats?.totalValue || 0) + (solData?.stats?.totalValue || 0)),
        
        // Use Cary0x health data for mining sessions count
        miningRewards: pond0xHealth?.stats?.mining_sessions || 
                      ((ethData?.stats?.miningRewards || 0) + (solData?.stats?.miningRewards || 0)),
        
        // Use Cary0x manifest data for Pro status - ensure it's properly detected
        pondProStatus: Boolean(pond0xManifest?.isPro) || 
                      ethData?.stats?.pondProStatus || solData?.stats?.pondProStatus || false,
        
        // Calculate Pro expiry from Cary0x manifest proAgo value
        pondProExpiry: pond0xManifest?.isPro && pond0xManifest?.proAgo !== undefined
          ? new Date(Date.now() + (30 - parseInt(pond0xManifest.proAgo)) * 24 * 60 * 60 * 1000)
          : ethData?.stats?.pondProExpiry || solData?.stats?.pondProExpiry || null
      };
      
      res.json({
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
      console.error('Multi-chain data fetch error:', error);
      res.status(500).json({ error: "Failed to fetch multi-chain data" });
    }
  });



  // Jupiter price quote endpoint
  app.get("/api/jupiter/quote", async (req, res) => {
    try {
      const { inputMint, outputMint, amount } = req.query;
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&swapMode=ExactIn&asLegacyTransaction=false&platformFeeBps=90`
      );
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Jupiter API error:', error);
      res.status(500).json({ error: 'Failed to fetch Jupiter quote' });
    }
  });

  // Pond0x manifest data endpoint
  app.get("/api/pond0x/manifest/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!address || address.length < 32) {
        return res.status(400).json({ error: "Valid Solana address required" });
      }
      
      console.log(`Fetching Pond0x manifest for: ${address}`);
      
      // Try to get real Pond0x manifest data
      let manifest = await fetchPond0xManifest(address);
      
      if (!manifest) {
        // Fallback: create Pond0x-style data from blockchain analysis
        console.log('Creating fallback manifest from blockchain data');
        const solanaData = await fetchSolanaData(address);
        manifest = createPond0xStyleManifest(
          address, 
          solanaData.stats.totalSwaps,
          false // No social connection info available
        );
      }
      
      res.json(manifest);
      
    } catch (error) {
      console.error('Pond0x manifest error:', error);
      res.status(500).json({ error: 'Failed to fetch Pond0x manifest data' });
    }
  });

  // Historical search endpoint for older transactions
  app.post('/api/wallet/historical', async (req, res) => {
    try {
      const { address, date, amount } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }

      console.log(`Historical search requested for ${address} on ${date}`);
      
      // Try Solscan API for historical data
      const solscanUrl = `https://public-api.solscan.io/account/transactions?account=${address}&limit=200`;
      
      const response = await fetch(solscanUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Pond0x-Analytics/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (date) {
          const targetDate = new Date(date);
          const targetTimestamp = targetDate.getTime() / 1000; // Solscan uses seconds
          const searchWindow = 24 * 60 * 60; // 1 day in seconds
          
          const filteredTxs = data.filter((tx: any) => {
            return Math.abs(tx.blockTime - targetTimestamp) <= searchWindow;
          });
          
          res.json({ 
            results: filteredTxs,
            searchDate: targetDate.toISOString(),
            count: filteredTxs.length,
            source: 'solscan'
          });
        } else {
          res.json({ 
            results: data,
            count: data.length,
            source: 'solscan'
          });
        }
      } else {
        res.status(500).json({ error: 'Failed to fetch historical data from Solscan' });
      }
    } catch (error) {
      console.error('Historical search error:', error);
      res.status(500).json({ error: 'Failed to search historical transactions' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
