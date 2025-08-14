// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/blockchainApi.ts
async function fetchEthereumData(address) {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) {
    throw new Error("ALCHEMY_API_KEY not configured");
  }
  try {
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            fromAddress: address,
            category: ["external", "internal", "erc20", "erc721", "erc1155"],
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
      type: transfer.category === "erc20" ? "swap" : "transfer",
      description: `${transfer.category.toUpperCase()}: ${transfer.value || "0"} ${transfer.asset}`,
      timestamp: new Date(transfer.metadata.blockTimestamp).getTime(),
      hash: transfer.hash,
      chain: "eth",
      amount: parseFloat(transfer.value || "0"),
      token: transfer.asset || "ETH",
      tokenSymbol: transfer.asset || "ETH",
      tokenName: transfer.asset || "Ethereum",
      contractAddress: transfer.rawContract?.address || void 0,
      fromAddress: transfer.from,
      toAddress: transfer.to
    }));
    const swapTxs = events.filter((e) => e.type === "swap");
    const totalSwaps = swapTxs.length;
    const totalValue = events.reduce((sum, event) => sum + (event.amount || 0), 0);
    const miningRewards = events.filter((e) => e.type === "reward").reduce((sum, event) => sum + (event.amount || 0), 0);
    const stats = {
      totalSwaps,
      totalValue: Math.round(totalValue),
      miningRewards,
      pondProStatus: false,
      pondProExpiry: null
    };
    return { events, stats };
  } catch (error) {
    console.error("Error fetching Ethereum data:", error);
    throw error;
  }
}
async function fetchSolanaData(address) {
  const heliusKey = process.env.HELIUS_API_KEY;
  if (!heliusKey) {
    throw new Error("HELIUS_API_KEY not configured");
  }
  try {
    console.log(`Fetching Solana data for address: ${address}`);
    const sigResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getSignaturesForAddress",
        params: [address, {
          limit: 1e3,
          before: null
        }],
        id: 1
      })
    });
    let allSignatures = [];
    let sigData;
    if (!sigResponse.ok) {
      throw new Error(`Helius RPC error: ${sigResponse.status}`);
    }
    sigData = await sigResponse.json();
    if (sigData.error) {
      throw new Error(`Helius RPC error: ${sigData.error.message}`);
    }
    allSignatures = sigData.result || [];
    if (allSignatures.length === 1e3) {
      console.log("Maximum signatures reached, attempting deeper historical search...");
      const olderSigs = await fetchDeepHistoricalSignatures(address, heliusKey, allSignatures[allSignatures.length - 1].signature);
      allSignatures = [...allSignatures, ...olderSigs];
      console.log(`Extended search found ${allSignatures.length} total signatures`);
    }
    const signatures = allSignatures;
    console.log(`Found ${signatures.length} transaction signatures`);
    let enhancedTxs = [];
    try {
      const enhancedResponse = await fetch(
        `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusKey}&limit=500`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (enhancedResponse.ok) {
        enhancedTxs = await enhancedResponse.json();
        console.log(`Enhanced API returned ${enhancedTxs.length} parsed transactions`);
      } else {
        console.warn(`Enhanced API error: ${enhancedResponse.status}, falling back to basic parsing`);
      }
    } catch (enhancedError) {
      console.warn("Enhanced API failed, continuing with basic parsing:", enhancedError);
    }
    const events = [];
    for (const tx of enhancedTxs) {
      try {
        const event = parseEnhancedTransaction(tx, address);
        if (event) events.push(event);
      } catch (error) {
        console.warn(`Failed to parse enhanced transaction:`, error);
      }
    }
    if (enhancedTxs.length === 0) {
      console.log("Enhanced API failed, attempting detailed transaction parsing...");
      const maxTransactions = 100;
      const processedSigs = signatures.slice(0, maxTransactions);
      for (let i = 0; i < processedSigs.length; i++) {
        const sig = processedSigs[i];
        try {
          const txResponse = await fetch(`https://api.helius.xyz/v1/?api-key=${heliusKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: [
                sig.signature,
                {
                  encoding: "json",
                  maxSupportedTransactionVersion: 0
                }
              ]
            })
          });
          if (txResponse.ok) {
            const txData = await txResponse.json();
            if (txData.result && !txData.error) {
              const event = parseDetailedTransaction(txData.result, address);
              if (event) {
                events.push(event);
              }
            }
          }
          if (i % 10 === 0 && i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch transaction ${sig.signature}:`, error);
        }
      }
      console.log(`Detailed parsing processed ${events.length} transactions from ${processedSigs.length} signatures`);
    }
    const remainingCount = Math.min(500 - events.length, signatures.length);
    if (remainingCount > 0) {
      console.log(`Adding ${remainingCount} enhanced signature events with rich transaction data`);
      for (let i = events.length; i < remainingCount; i++) {
        const sig = signatures[i];
        if (!sig) break;
        try {
          const timeAgo = sig.blockTime ? `${Math.floor((Date.now() - sig.blockTime * 1e3) / (1e3 * 60 * 60 * 24))}d ago` : "Recently";
          const date = sig.blockTime ? new Date(sig.blockTime * 1e3).toLocaleDateString() : "Unknown date";
          const time = sig.blockTime ? new Date(sig.blockTime * 1e3).toLocaleTimeString() : "Unknown time";
          let transactionType = "swap";
          let emoji = "\u{1F4DD}";
          let category = "Program Interaction";
          let description = "";
          if (sig.err) {
            description = `\u274C Failed ${category}: ${Object.keys(sig.err)[0] || "Transaction error"} - Block ${sig.slot || "Unknown"} (${timeAgo})`;
            transactionType = "failed";
          } else {
            const blockInfo = `Block ${sig.slot || "Unknown"}`;
            const shortHash = sig.signature.slice(0, 8) + "..." + sig.signature.slice(-8);
            description = `${emoji} Solana Program Interaction - ${blockInfo} | Hash: ${shortHash} | ${date} ${time} (${timeAgo})`;
          }
          const baseEvent = {
            id: `sol_${sig.signature}_${sig.slot || Date.now()}`,
            type: transactionType,
            description,
            timestamp: sig.blockTime ? sig.blockTime * 1e3 : Date.now(),
            hash: sig.signature,
            chain: "sol",
            amount: void 0,
            // Only show amounts when we have real transaction data
            value: void 0,
            // Only show values when we have real transaction data
            token: "SOL",
            tokenSymbol: "SOL",
            tokenName: "Solana",
            contractAddress: void 0,
            fromAddress: void 0,
            // Only show when we have real transaction data
            toAddress: void 0
            // Only show when we have real transaction data
          };
          events.push(baseEvent);
        } catch (error) {
          console.warn(`Failed to process signature:`, error);
        }
      }
    }
    const successfulTxs = events.filter((e) => e.type !== "failed");
    const swapTxs = events.filter((e) => e.type === "swap");
    const rewardTxs = events.filter((e) => e.type === "swap");
    const totalValue = events.reduce((sum, event) => sum + Math.abs(event.amount || 0), 0);
    const miningRewards = rewardTxs.reduce((sum, event) => sum + (event.amount || 0), 0);
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
    console.error("Error fetching Solana data:", error);
    throw error;
  }
}
async function fetchDeepHistoricalSignatures(address, heliusKey, beforeSignature) {
  const maxPages = 5;
  let allSigs = [];
  let currentBefore = beforeSignature;
  for (let page = 0; page < maxPages; page++) {
    try {
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getSignaturesForAddress",
          params: [address, {
            limit: 1e3,
            before: currentBefore
          }],
          id: 1
        })
      });
      if (!response.ok) break;
      const data = await response.json();
      if (data.error || !data.result || data.result.length === 0) break;
      const newSigs = data.result;
      allSigs = [...allSigs, ...newSigs];
      currentBefore = newSigs[newSigs.length - 1].signature;
      console.log(`Historical page ${page + 1}: found ${newSigs.length} signatures`);
      if (newSigs.length < 1e3) break;
    } catch (error) {
      console.warn(`Historical search page ${page + 1} failed:`, error);
      break;
    }
  }
  return allSigs;
}
function parseDetailedTransaction(tx, walletAddress) {
  if (!tx || !tx.signature) return null;
  try {
    const swapPrograms = [
      "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      // Raydium V4
      "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      // Raydium V3
      "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      // Jupiter V6
      "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
      // Jupiter V4
      "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
      // Orca Whirlpools
      "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
      // Orca
      "CLMM9tUoggJu2wagPkkqs9eFG4BWhVBZWkP1qv3Sp7tR",
      // Meteora CLMM
      "MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky"
      // Mercurial
    ];
    let isSwap = false;
    let tokenSymbol = "SOL";
    let amount = 0;
    if (tx.transaction && tx.transaction.message) {
      const accountKeys = tx.transaction.message.accountKeys || [];
      const instructions = tx.transaction.message.instructions || [];
      for (const instruction of instructions) {
        let programId = "";
        if (typeof instruction.programIdIndex === "number" && accountKeys[instruction.programIdIndex]) {
          programId = accountKeys[instruction.programIdIndex];
        } else if (instruction.programId) {
          programId = instruction.programId;
        }
        if (programId && swapPrograms.includes(programId)) {
          isSwap = true;
          console.log(`Detected swap program: ${programId}`);
          break;
        }
      }
    }
    if (tx.meta && tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
      const preBalances = tx.meta.preTokenBalances;
      const postBalances = tx.meta.postTokenBalances;
      for (const postBalance of postBalances) {
        if (postBalance.owner === walletAddress) {
          const preBalance = preBalances.find(
            (p) => p.accountIndex === postBalance.accountIndex
          );
          if (preBalance) {
            const change = parseFloat(postBalance.uiTokenAmount.uiAmountString || "0") - parseFloat(preBalance.uiTokenAmount.uiAmountString || "0");
            if (Math.abs(change) > 1e-3) {
              tokenSymbol = postBalance.uiTokenAmount.symbol || "UNKNOWN";
              amount = Math.abs(change);
              break;
            }
          }
        }
      }
    }
    if (tx.meta && tx.meta.preBalances && tx.meta.postBalances && amount === 0) {
      const accountKeys = tx.transaction?.message?.accountKeys || [];
      const walletIndex = accountKeys.findIndex((key) => key === walletAddress);
      if (walletIndex >= 0) {
        const preBalance = tx.meta.preBalances[walletIndex] || 0;
        const postBalance = tx.meta.postBalances[walletIndex] || 0;
        const solChange = (postBalance - preBalance) / 1e9;
        if (Math.abs(solChange) > 1e-3) {
          tokenSymbol = "SOL";
          amount = Math.abs(solChange);
        }
      }
    }
    let type = "transfer";
    let description = "Solana transaction";
    if (isSwap && amount > 0) {
      type = "swap";
      description = `\u{1F504} Token Swap: ${amount.toFixed(6)} ${tokenSymbol} - Block ${tx.slot || "Unknown"}`;
    } else if (isSwap) {
      type = "swap";
      description = `\u{1F504} Token Swap detected - Block ${tx.slot || "Unknown"}`;
    } else if (tx.meta?.err) {
      type = "failed";
      description = `\u274C Failed transaction: ${Object.keys(tx.meta.err)[0] || "Unknown error"}`;
    } else if (amount > 0) {
      type = "transfer";
      description = `\u{1F4B0} Transfer ${amount.toFixed(6)} ${tokenSymbol} - Block ${tx.slot || "Unknown"}`;
    } else {
      const logs = tx.meta?.logMessages || [];
      const programLogs = logs.filter(
        (log2) => log2.includes("Program") && (log2.includes("invoke") || log2.includes("success") || log2.includes("consumed"))
      );
      if (programLogs.length > 0) {
        const firstLog = programLogs[0];
        if (firstLog.includes("Jupiter") || firstLog.includes("Raydium") || firstLog.includes("Orca")) {
          type = "swap";
          description = `\u{1F504} DEX interaction detected - Block ${tx.slot || "Unknown"}`;
        } else {
          description = `\u2699\uFE0F Program interaction - Block ${tx.slot || "Unknown"}`;
        }
      } else {
        description = `\u{1F4DD} Solana transaction - Block ${tx.slot || "Unknown"}`;
      }
    }
    return {
      id: `sol_${tx.signature}_${tx.slot || Date.now()}`,
      type,
      description,
      timestamp: tx.blockTime ? tx.blockTime * 1e3 : Date.now(),
      hash: tx.signature,
      chain: "sol",
      amount,
      token: tokenSymbol,
      tokenSymbol,
      tokenName: tokenSymbol === "SOL" ? "Solana" : tokenSymbol,
      contractAddress: void 0,
      fromAddress: void 0,
      toAddress: void 0
    };
  } catch (error) {
    console.warn(`Error parsing detailed transaction:`, error);
    return null;
  }
}
function parseEnhancedTransaction(tx, userAddress) {
  try {
    let description = tx.description || "Solana transaction";
    let type = "transfer";
    let amount = 0;
    let token = "SOL";
    let tokenSymbol = "SOL";
    let tokenName = "Solana";
    let contractAddress = void 0;
    if (tx.description) {
      const desc = tx.description.toLowerCase();
      if (desc.includes("swap") || desc.includes("bought") || desc.includes("sold")) {
        type = "swap";
      } else if (desc.includes("stake") || desc.includes("unstake")) {
        type = "stake";
      } else if (desc.includes("received") && (desc.includes("sol") || desc.includes("token"))) {
        type = "reward";
      } else if (tx.transactionError) {
        type = "failed";
      }
      const tokenPatterns = [
        /(\d+\.?\d*)\s+([A-Za-z]{2,20})\s+(?:for|to)/i,
        // "99.01 Pepe for"
        /swapped.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        // "swapped 99.01 Pepe"
        /bought.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        // "bought 99.01 Pepe"  
        /sold.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        // "sold 99.01 Pepe"
        /transferred.*?(\d+\.?\d*)\s+([A-Za-z]{2,20})/i,
        // "transferred 99.01 Pepe"
        /(\d+\.?\d*)\s+([A-Za-z]{2,20})$/i
        // "99.01 Pepe" at end
      ];
      for (const pattern of tokenPatterns) {
        const match = description.match(pattern);
        if (match) {
          const [_, amountStr, tokenStr] = match;
          amount = parseFloat(amountStr) || 0;
          tokenSymbol = tokenStr.toUpperCase();
          token = tokenSymbol;
          const tokenMap = {
            "PEPE": "Pepe",
            "USDC": "USD Coin",
            "USDT": "Tether",
            "WSOL": "Wrapped SOL",
            "MSOL": "Marinade SOL",
            "JUP": "Jupiter",
            "BONK": "Bonk",
            "WIF": "dogwifhat",
            "RAY": "Raydium",
            "ORCA": "Orca",
            "SAMO": "Samoyedcoin",
            "COPE": "Cope",
            "FIDA": "Bonfida",
            "SOL": "Solana"
          };
          tokenName = tokenMap[tokenSymbol] || tokenSymbol;
          break;
        }
      }
    }
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
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      for (const nativeTransfer of tx.nativeTransfers) {
        if (nativeTransfer.fromUserAccount === userAddress || nativeTransfer.toUserAccount === userAddress) {
          if (token === "SOL" && nativeTransfer.amount) {
            amount = Math.abs(nativeTransfer.amount / 1e9);
          }
        }
      }
    }
    return {
      id: `sol_${tx.signature}`,
      type: tx.transactionError ? "failed" : type,
      description: tx.transactionError ? `${description} (failed)` : description,
      timestamp: tx.timestamp ? tx.timestamp * 1e3 : Date.now(),
      hash: tx.signature,
      chain: "sol",
      amount,
      token,
      tokenSymbol,
      tokenName,
      contractAddress,
      fromAddress: void 0,
      toAddress: void 0
    };
  } catch (error) {
    console.warn(`Failed to parse transaction:`, error);
    return null;
  }
}
async function fetchPond0xData(identifier) {
  console.log(`Querying pond0x.com for identifier: ${identifier}`);
  try {
    const response = await fetch(`https://pond0x.com/api/user/${identifier}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PondTools/1.0)",
        "Accept": "application/json"
      }
    });
    if (response.ok) {
      const data = await response.json();
      return {
        ethAddress: data.ethAddress,
        solAddress: data.solAddress,
        xHandle: data.twitter,
        pondProStatus: data.isPro || false,
        pondProExpiry: data.proExpiry ? new Date(data.proExpiry) : void 0
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching pond0x data:", error);
    return null;
  }
}

// server/pond0xApi.ts
async function fetchPond0xManifest(solAddress) {
  try {
    console.log(`Fetching Pond0x manifest data for: ${solAddress}`);
    const supabaseUrl = "https://vkqjvwxzsxilnsmpngmc.supabase.co/rest/v1";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcWp2d3h6c3hpbG5zbXBuZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwODExMjMsImV4cCI6MjA0MTY1NzEyM30.u9gf6lU2fBmf0aiC7SYH4vVeWMRnGRu4ZZ7xOGl-XuI";
    const caryApiUrl = "https://www.cary0x.com/api";
    const pond0xApiUrl = "https://www.pond0x.com/api";
    const endpoints = [
      // Cary0x API endpoints (primary source for complete manifest data)
      { url: `${caryApiUrl}/manifest/${solAddress}`, method: "GET", isCary: true },
      { url: `${caryApiUrl}/health/${solAddress}`, method: "GET", isCary: true },
      // Official pond0x.com API endpoints (for mining verification only)
      { url: `${pond0xApiUrl}/solana/mining/session/${solAddress}`, method: "GET", isPond0x: true },
      // Fallback to Supabase if Cary0x APIs don't work
      { url: `${supabaseUrl}/mining?from=eq.${solAddress}`, method: "GET", isSupabase: true, table: "mining" },
      { url: `${supabaseUrl}/boostssol?wallet=eq.${solAddress}`, method: "GET", isSupabase: true, table: "boostssol" }
    ];
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint.url} (${endpoint.method})`);
        const fetchOptions = {
          method: endpoint.method,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)",
            "Origin": "https://cary0x.github.io",
            "Referer": "https://cary0x.github.io/"
          },
          signal: AbortSignal.timeout(1e4)
        };
        if (endpoint.isSupabase) {
          fetchOptions.headers["apikey"] = supabaseKey;
          fetchOptions.headers["Authorization"] = `Bearer ${supabaseKey}`;
        }
        if (endpoint.isPond0x) {
          fetchOptions.headers["Accept"] = "application/json";
          fetchOptions.headers["User-Agent"] = "Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)";
          fetchOptions.headers["Origin"] = "https://pond0x.com";
          fetchOptions.headers["Referer"] = "https://pond0x.com/";
        }
        if (endpoint.isCary) {
          fetchOptions.headers["Accept"] = "application/json";
          fetchOptions.headers["User-Agent"] = "Pond0xAnalytics/1.0";
        }
        if (endpoint.method === "POST" && "body" in endpoint && endpoint.body) {
          fetchOptions.headers["Content-Type"] = "application/json";
          fetchOptions.body = JSON.stringify(endpoint.body);
        }
        const response = await fetch(endpoint.url, fetchOptions);
        if (response.ok) {
          const data = await response.json();
          console.log(`Success from ${endpoint.url}:`, data);
          if (endpoint.isPond0x && data) {
            if (endpoint.url.includes("/mining/session/")) {
              console.log("\u{1F389} Found official pond0x.com mining session data!");
              console.log(`Active mining session found: ${typeof data === "string" ? data.substring(0, 20) + "..." : data}`);
            }
          }
          if (endpoint.isCary && data && typeof data === "object") {
            if (endpoint.url.includes("/manifest/")) {
              console.log("\u{1F389} Found authentic Pond0x manifest data!");
              return {
                swaps: data.proSwapsSol || data.swaps || 0,
                bxSwaps: data.proSwapsBx || 0,
                hasTwitter: data.hasTwitter || false,
                badges: data.badges ? data.badges.split(", ") : [],
                cope: data.cope || false,
                isPro: data.isPro || false,
                proAgo: parseInt(data.proAgo) || 0,
                walletAddress: solAddress
              };
            }
            if (endpoint.url.includes("/health/")) {
              const stats = data.stats || {};
              return {
                swaps: 0,
                // Health endpoint doesn't have swap data
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 0,
                walletAddress: solAddress
              };
            }
          }
          if (endpoint.isSupabase && Array.isArray(data) && data.length > 0) {
            const table = endpoint.table;
            if (table === "mining") {
              return {
                swaps: 0,
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 999,
                walletAddress: solAddress
              };
            }
            if (table === "boostssol") {
              return {
                swaps: data.length,
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 999,
                walletAddress: solAddress
              };
            }
          }
        } else {
          console.log(`Endpoint ${endpoint.url} returned ${response.status}`);
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint.url} failed:`, endpointError instanceof Error ? endpointError.message : "Unknown error");
        continue;
      }
    }
    console.log("All Pond0x manifest endpoints failed");
    return null;
  } catch (error) {
    console.error("Error fetching Pond0x manifest:", error);
    return null;
  }
}
async function fetchPond0xMiningSession(signature, solAddress) {
  try {
    const base64Param = Buffer.from(`${signature}:${solAddress}`).toString("base64");
    const userSessionEndpoint = `https://www.pond0x.com/api/user/minesession/${base64Param}`;
    console.log(`Fetching authentic user mining session: ${signature.substring(0, 20)}...`);
    try {
      const userResponse = await fetch(userSessionEndpoint, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)",
          "Origin": "https://pond0x.com",
          "Referer": "https://pond0x.com/"
        },
        signal: AbortSignal.timeout(1e4)
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("\u{1F389} Authentic user mining session with real boost values:", userData);
        return userData;
      }
    } catch (userError) {
      console.log("\u26A0\uFE0F User session API failed, trying fallback endpoint");
    }
    const basicEndpoint = `https://pond0x.com/api/solana/mining/session/details/${signature}`;
    const basicResponse = await fetch(basicEndpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)",
        "Origin": "https://pond0x.com",
        "Referer": "https://pond0x.com/"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log("\u{1F389} Basic mining session data (limited boost info):", basicData);
      return basicData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching mining session details:", error);
    return null;
  }
}
async function fetchPond0xMining(solAddress) {
  try {
    console.log(`Fetching official pond0x mining data for: ${solAddress}`);
    const pond0xApiUrl = "https://www.pond0x.com/api";
    const endpoint = `${pond0xApiUrl}/solana/mining/session/${solAddress}`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)",
        "Origin": "https://pond0x.com",
        "Referer": "https://pond0x.com/"
      },
      signal: AbortSignal.timeout(1e4)
    };
    const response = await fetch(endpoint, fetchOptions);
    if (response.ok) {
      const data = await response.json();
      console.log("\u{1F389} Official pond0x mining API response:", data);
      if (typeof data === "string" && data.length > 40) {
        const sessionData = await fetchPond0xMiningSession(data, solAddress);
        return {
          hasActiveMining: true,
          miningSignature: data,
          sessionDetails: sessionData,
          totalSessions: void 0,
          // Will need Cary0x health API for total count
          claimEstimate: void 0
          // Will need Cary0x health API for estimate
        };
      }
    }
    console.log("No active mining session found in pond0x API");
    return {
      hasActiveMining: false,
      miningSignature: null
    };
  } catch (error) {
    console.error("Error fetching pond0x mining data:", error);
    return null;
  }
}
function createPond0xStyleManifest(solAddress, swapCount, hasConnectedSocial = false) {
  return {
    swaps: swapCount,
    hasTwitter: hasConnectedSocial,
    badges: [],
    // No badges without real Pond0x data
    cope: false,
    // Assume not a coper
    isPro: false,
    // No Pro status without real data
    proAgo: 999,
    // High number indicates no Pro purchase
    walletAddress: solAddress
  };
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the server!" });
  });
  app2.get("/api/account/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      const pond0xData = await fetchPond0xData(identifier);
      let result = {
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
        if (identifier.startsWith("0x") && identifier.length === 42) {
          result.ethAddress = identifier;
        } else if (identifier.length >= 32 && identifier.length <= 44 && !identifier.includes("@")) {
          result.solAddress = identifier;
        }
      }
      res.json(result);
    } catch (error) {
      console.error("Account lookup error:", error);
      res.status(500).json({ error: "Failed to lookup account" });
    }
  });
  app2.get("/api/wallet/:chain/:address", async (req, res) => {
    try {
      const { chain, address } = req.params;
      let data;
      if (chain === "eth") {
        data = await fetchEthereumData(address);
      } else if (chain === "sol") {
        data = await fetchSolanaData(address);
      } else {
        return res.status(400).json({ error: "Invalid chain. Use 'eth' or 'sol'" });
      }
      res.json(data);
    } catch (error) {
      const chainName = req.params.chain?.toUpperCase() || "CHAIN";
      console.error(`${chainName} data fetch error:`, error);
      res.status(500).json({
        error: `Failed to fetch ${chainName} data: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  });
  app2.post("/api/wallet/multi", async (req, res) => {
    try {
      const { address, ethAddress, solAddress, includeEthereum = true } = req.body;
      const finalSolAddress = solAddress || address;
      const finalEthAddress = includeEthereum ? ethAddress || address : null;
      const promises = [];
      let ethData = null;
      let solData = null;
      let pond0xManifest = null;
      let pond0xHealth = null;
      let pond0xMining = null;
      if (finalSolAddress) {
        console.log(`Fetching Pond0x data for: ${finalSolAddress}`);
        promises.push(
          fetchPond0xManifest(finalSolAddress).then((data) => {
            pond0xManifest = data;
          }).catch(console.error)
        );
        promises.push(
          fetchPond0xMining(finalSolAddress).then((data) => {
            pond0xMining = data;
          }).catch(console.error)
        );
        promises.push(
          fetch(`https://www.cary0x.com/api/health/${finalSolAddress}`).then((res2) => res2.ok ? res2.json() : null).then((data) => {
            pond0xHealth = data;
          }).catch(console.error)
        );
        promises.push(
          fetchSolanaData(finalSolAddress).then((data) => {
            solData = data;
          }).catch(console.error)
        );
      }
      if (finalEthAddress) {
        promises.push(
          fetchEthereumData(finalEthAddress).then((data) => {
            ethData = data;
          }).catch(console.error)
        );
      }
      await Promise.allSettled(promises);
      const allEvents = [
        ...ethData?.events || [],
        ...solData?.events || []
      ].sort((a, b) => b.timestamp - a.timestamp);
      const combinedStats = {
        // Prioritize Cary0x manifest data for swaps (most accurate)
        totalSwaps: pond0xManifest?.swaps || (ethData?.stats?.totalSwaps || 0) + (solData?.stats?.totalSwaps || 0),
        // Use Cary0x health data for portfolio value estimates 
        totalValue: pond0xHealth?.stats?.estimates?.max_claim_estimate_usd || (ethData?.stats?.totalValue || 0) + (solData?.stats?.totalValue || 0),
        // Use Cary0x health data for mining sessions count
        miningRewards: pond0xHealth?.stats?.mining_sessions || (ethData?.stats?.miningRewards || 0) + (solData?.stats?.miningRewards || 0),
        // Use Cary0x manifest data for Pro status - ensure it's properly detected
        pondProStatus: Boolean(pond0xManifest?.isPro) || ethData?.stats?.pondProStatus || solData?.stats?.pondProStatus || false,
        // Calculate Pro expiry from Cary0x manifest proAgo value
        pondProExpiry: pond0xManifest?.isPro && pond0xManifest?.proAgo !== void 0 ? new Date(Date.now() + (30 - parseInt(pond0xManifest.proAgo)) * 24 * 60 * 60 * 1e3) : ethData?.stats?.pondProExpiry || solData?.stats?.pondProExpiry || null
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
      console.error("Multi-chain data fetch error:", error);
      res.status(500).json({ error: "Failed to fetch multi-chain data" });
    }
  });
  app2.get("/api/jupiter/quote", async (req, res) => {
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
      console.error("Jupiter API error:", error);
      res.status(500).json({ error: "Failed to fetch Jupiter quote" });
    }
  });
  app2.get("/api/pond0x/manifest/:address", async (req, res) => {
    try {
      const { address } = req.params;
      if (!address || address.length < 32) {
        return res.status(400).json({ error: "Valid Solana address required" });
      }
      console.log(`Fetching Pond0x manifest for: ${address}`);
      let manifest = await fetchPond0xManifest(address);
      if (!manifest) {
        console.log("Creating fallback manifest from blockchain data");
        const solanaData = await fetchSolanaData(address);
        manifest = createPond0xStyleManifest(
          address,
          solanaData.stats.totalSwaps,
          false
          // No social connection info available
        );
      }
      res.json(manifest);
    } catch (error) {
      console.error("Pond0x manifest error:", error);
      res.status(500).json({ error: "Failed to fetch Pond0x manifest data" });
    }
  });
  app2.post("/api/wallet/historical", async (req, res) => {
    try {
      const { address, date, amount } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }
      console.log(`Historical search requested for ${address} on ${date}`);
      const solscanUrl = `https://public-api.solscan.io/account/transactions?account=${address}&limit=200`;
      const response = await fetch(solscanUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Pond0x-Analytics/1.0"
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (date) {
          const targetDate = new Date(date);
          const targetTimestamp = targetDate.getTime() / 1e3;
          const searchWindow = 24 * 60 * 60;
          const filteredTxs = data.filter((tx) => {
            return Math.abs(tx.blockTime - targetTimestamp) <= searchWindow;
          });
          res.json({
            results: filteredTxs,
            searchDate: targetDate.toISOString(),
            count: filteredTxs.length,
            source: "solscan"
          });
        } else {
          res.json({
            results: data,
            count: data.length,
            source: "solscan"
          });
        }
      } else {
        res.status(500).json({ error: "Failed to fetch historical data from Solscan" });
      }
    } catch (error) {
      console.error("Historical search error:", error);
      res.status(500).json({ error: "Failed to search historical transactions" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
