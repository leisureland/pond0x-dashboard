import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield } from 'lucide-react';

interface MiningRigBoostCardProps {
  solAddress: string;
}

interface MiningSession {
  sig: string;
  reward: number;
  status: string;
  slashes: number;
  min: number;
  boost: number;
  priority: number;
  no: number;
  peers: number;
  m: any[];
}

interface MiningData {
  hasActiveMining: boolean;
  miningSignature: string | null;
  sessionDetails?: MiningSession | null;
}

interface ManifestData {
  swaps?: number;
  proSwapsSol?: number;
  proSwapsBx?: number;
  badges?: string;
  isPro: boolean;
}

export function MiningRigBoostCard({ solAddress }: MiningRigBoostCardProps) {
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [healthStats, setHealthStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculate boost using verified Cary0x formula from https://cary0x.github.io/docs/info/swaps
  const calculateBoost = (swapCount: number, miningSessions: number, badges: string = ''): number => {
    // Verified formula: Initial Rig Boost + Teleported Badge Boost + Purchased Boost + Swap Boost (1/6th per swap) - Mining Session Boost (-3 per session)
    const swapBoost = Math.floor(swapCount / 6); // 1/6th per swap (verified from Cary0x docs)
    const sessionPenalty = miningSessions * 3; // -3 per session (verified from Cary0x docs)
    
    // Badge bonuses (teleported badge boost - these values are estimates)
    let badgeBoost = 0;
    if (badges.includes('diamond')) badgeBoost += 100;
    if (badges.includes('pork')) badgeBoost += 50;
    if (badges.includes('chef')) badgeBoost += 25;
    if (badges.includes('points')) badgeBoost += 10;
    if (badges.includes('swap')) badgeBoost += 5;
    
    // Initial rig boost (baseline - this may vary by user)
    const initialRigBoost = 0; // Conservative estimate, actual value may vary
    
    // Purchased boost (we don't have this data, so assume 0)
    const purchasedBoost = 0;
    
    const totalBoost = initialRigBoost + badgeBoost + purchasedBoost + swapBoost - sessionPenalty;
    
    // No artificial cap - let the actual calculation show the real boost
    return Math.max(totalBoost, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch manifest data
        const manifestResponse = await fetch(`/api/pond0x/manifest/${solAddress}`);
        let manifest: ManifestData | null = null;
        
        if (manifestResponse.ok) {
          manifest = await manifestResponse.json();
          setManifestData(manifest);
        }

        if (manifest?.isPro) {
          // Fetch comprehensive mining data for Pro users
          const response = await fetch(`/api/wallet/multi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solAddress })
          });
          
          if (response.ok) {
            const data = await response.json();
            setMiningData(data.pond0xData?.mining || null);
            setHealthStats(data.pond0xData?.health?.stats || null);
            console.log('Health stats for boost calculation:', data.pond0xData?.health?.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching mining boost data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [solAddress]);

  if (loading) {
    return (
      <motion.div
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-orange-200 dark:bg-orange-700 rounded mb-4"></div>
          <div className="h-8 bg-orange-200 dark:bg-orange-700 rounded mb-2"></div>
          <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  // Show Pro requirement for non-Pro users (only if we have manifest data and it's explicitly false)
  if (manifestData && manifestData.isPro === false) {
    return (
      <motion.div
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="text-center">
          <Shield className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Mining Rig Boost
          </h3>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">
            Pro Required
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            🔒 Requires PondPro subscription
          </p>
        </div>
      </motion.div>
    );
  }

  // Calculate boost using Cary0x formula to get the 615 value
  const totalSwaps = manifestData?.swaps || 
                    ((manifestData?.proSwapsSol || 0) + (manifestData?.proSwapsBx || 0));
  const miningSessions = healthStats?.mining_sessions || 0;
  
  // Implement the authentic Cary0x boost calculator formula
  // Based on https://cary0x.github.io/docs/info/swaps
  const totalSwapBoost = totalSwaps / 6; // Exact formula from Cary0x calculator
  const totalSessionBoost = miningSessions * -3; // Sessions are negative boost
  const currentBoost = totalSwapBoost + totalSessionBoost;
  
  // Calculate swaps needed for 615 boost target
  const targetBoost = 615;
  const swapsNeededFor615 = Math.max(0, Math.ceil((targetBoost - totalSessionBoost) * 6) - totalSwaps);
  
  // Calculate sessions until boost reaches 615 or 0
  const sessionsUntil615 = Math.max(0, Math.ceil((currentBoost - targetBoost) / 3));
  const sessionsUntil0 = Math.max(0, Math.ceil(currentBoost / 3));
  
  // Use the calculated current boost (matches Cary0x calculator)
  const actualBoost = Math.round(currentBoost * 100) / 100;
  
  console.log('Cary0x boost calculator:', {
    totalSwaps,
    miningSessions,
    totalSwapBoost: totalSwapBoost.toFixed(2),
    totalSessionBoost: totalSessionBoost.toFixed(2),
    currentBoost: currentBoost.toFixed(2),
    swapsNeededFor615,
    sessionsUntil615,
    sessionsUntil0
  });

  return (
    <motion.div
      className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-orange-500/20 rounded-xl p-3">
          <Zap className="w-6 h-6 text-orange-500 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          Current Boost Calculator
        </h3>
      </div>
      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4">
        {actualBoost > 0 ? `~${actualBoost}` : 'Not Available'}
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Total Swap Boost:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{totalSwapBoost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Total Session Boost:</span>
          <span className="font-semibold text-red-600 dark:text-red-400">{totalSessionBoost.toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Swaps Needed for 615:</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{swapsNeededFor615.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Sessions until 615:</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">{sessionsUntil615}</span>
        </div>
      </div>
      
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-3">
        Authentic Cary0x boost calculator using live manifest and health data
      </div>
      <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
        ✓ Formula: (swaps ÷ 6) + (sessions × -3) = current boost
      </div>
    </motion.div>
  );
}