import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Target, ArrowUp, Clock, AlertTriangle } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';

interface SwapBoostCalculatorProps {
  solAddress: string;
  manifestData?: {
    swaps?: number;
    proSwapsSol?: number;
    proSwapsBx?: number;
    badges?: string;
  };
  healthStats?: {
    mining_sessions?: number;
  };
}

export default function SwapBoostCalculator({ solAddress, manifestData, healthStats }: SwapBoostCalculatorProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<{
    manifestFromCache: boolean;
    healthFromCache: boolean;
    manifestIsStale: boolean;
    healthIsStale: boolean;
  }>({
    manifestFromCache: false,
    healthFromCache: false,
    manifestIsStale: false,
    healthIsStale: false
  });

  useEffect(() => {
    const fetchSwapBoostData = async () => {
      try {
        const WORKER_BASE_URL = 'https://pond0x-api-proxy.pond0xdash.workers.dev';
        
        // Fetch manifest data with caching and retry logic
        let manifestData = {};
        let manifestStatus = { fromCache: false, isStale: false };
        try {
          const manifestResult = await cachedFetch(`${WORKER_BASE_URL}/manifest?id=${solAddress}`);
          manifestData = manifestResult.data;
          manifestStatus = { fromCache: manifestResult.fromCache, isStale: manifestResult.isStale };
          console.log('✅ Manifest data loaded:', { fromCache: manifestResult.fromCache, isStale: manifestResult.isStale });
        } catch (error) {
          console.error('❌ Manifest API failed completely:', error);
          manifestData = {}; // Keep empty object as fallback
        }

        // Fetch health data with caching and retry logic
        let healthData = {};
        let healthStatus = { fromCache: false, isStale: false };
        try {
          const healthResult = await cachedFetch(`${WORKER_BASE_URL}/health?id=${solAddress}`);
          healthData = healthResult.data;
          healthStatus = { fromCache: healthResult.fromCache, isStale: healthResult.isStale };
          console.log('✅ Health data loaded:', { fromCache: healthResult.fromCache, isStale: healthResult.isStale });
        } catch (error) {
          console.error('❌ Health API failed completely:', error);
          healthData = {}; // Keep empty object as fallback
        }

        // Update data status for UI indicators
        setDataStatus({
          manifestFromCache: manifestStatus.fromCache,
          healthFromCache: healthStatus.fromCache,
          manifestIsStale: manifestStatus.isStale,
          healthIsStale: healthStatus.isStale
        });

        // Structure data to match original format
        const data = {
          pond0xData: manifestData,
          miningStats: {
            sessions: (healthData as any)?.stats?.mining_sessions || 0
          },
          healthData: {
            stats: (healthData as any)?.stats || {}
          }
        };
        
        console.log('✅ SwapBoost API response:', data);
        console.log('🔍 Manifest data structure:', manifestData);
        console.log('🔍 Health data structure:', healthData);
        setApiData(data);
      } catch (error) {
        console.error('Error fetching swap boost data:', error);
        // Set empty data structure so component can still render
        setApiData({
          pond0xData: {},
          miningStats: { sessions: 0 },
          healthData: { stats: {} }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSwapBoostData();
  }, [solAddress]);
  
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 rounded-xl p-3">
            <Calculator className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Swap/Boost Calculator
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">
            Loading swap and boost calculation data...
          </p>
        </div>
      </motion.div>
    );
  }

  // Extract data from the API response
  const pond0xData = apiData?.pond0xData || {};
  const miningStats = apiData?.miningStats || {};
  const healthData = apiData?.healthData?.stats || {};

  // Get total swaps and mining sessions from API data
  const totalSwaps = (pond0xData.proSwapsSol || 0) + (pond0xData.proSwapsBx || 0);
  const miningSessions = miningStats.sessions || healthData.mining_sessions || 0;
  
  // Log API data for debugging
  console.log('📊 API Data Retrieved:', {
    address: solAddress,
    proSwapsSol: pond0xData.proSwapsSol,
    proSwapsBx: pond0xData.proSwapsBx,
    totalSwaps,
    miningSessions,
    apiWorking: totalSwaps > 0 || miningSessions > 0
  });
  const isPro = pond0xData.isPro || false;

  // Show the calculated swap boost from the API
  const calculatedSwapBoost = miningStats.swapBoost || 0;
  const swapRatio = parseFloat(miningStats.swapRatio || '0');

  // Debug logging
  console.log('🔍 SwapBoost Debug:', {
    totalSwaps,
    miningSessions,
    isPro,
    calculatedSwapBoost,
    pond0xData,
    miningStats,
    healthData
  });

  // Implement authentic Cary0x boost calculator formulas
  // Based on https://cary0x.github.io/docs/info/swaps
  const totalSwapBoost = totalSwaps / 6;
  const totalSessionBoost = miningSessions * -3;
  const currentBoost = totalSwapBoost + totalSessionBoost;

  // Target calculations - this represents the maximum effective boost cap
  const maxBoost = 615;
  const targetBoost = maxBoost;
  
  // More debug logging
  console.log('🧮 Boost Calculations:', {
    totalSwapBoost,
    totalSessionBoost,
    currentBoost,
    targetBoost
  });
  
  // Calculate swaps needed for 615
  // If current boost is already at or above 615, no additional swaps needed
  // Otherwise: (target - current_boost) * 6
  const swapsNeededFor615 = currentBoost >= targetBoost ? 0 : Math.max(0, Math.ceil((targetBoost - currentBoost) * 6));
  
  // Calculate sessions until boost reaches 615 or 0
  // For sessions until 615: if current boost is above 615, you can mine (currentBoost - 615) / 3 sessions
  // while staying at the 615 cap. If current boost is below 615, you can't mine any sessions without going below 615.
  const sessionsUntil615 = currentBoost <= targetBoost ? 0 : Math.max(0, Math.floor((currentBoost - targetBoost) / 3));
  
  // For sessions until 0: current / 3
  const sessionsUntil0 = Math.max(0, Math.ceil(currentBoost / 3));

  console.log('📊 Final Results:', {
    swapsNeededFor615,
    sessionsUntil615,
    sessionsUntil0
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/20 rounded-xl p-3">
          <Calculator className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          Swap/Boost Calculator
        </h3>
      </div>

      {/* Data Status Warning */}
      {(dataStatus.manifestIsStale || dataStatus.healthIsStale) && (
        <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Using cached data due to API rate limiting
            </span>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Data may be up to 5 minutes old. Calculations are still accurate.
          </p>
        </div>
      )}
      {/* Input Data Summary - Two Separate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Mining Sessions Card - BLUE for mining data */}
        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-150/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-300/50 dark:border-blue-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-900 dark:text-blue-100">Mining Sessions</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {miningSessions.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            ✅ Real API Data
          </div>
        </div>

        {/* Total Swaps Card - GREEN for financial data */}
        <div className="p-4 bg-gradient-to-br from-green-100 to-green-150/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-300/50 dark:border-green-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-900 dark:text-green-100">Total Swaps</span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {totalSwaps.toLocaleString()}
          </div>
        </div>
      </div>
      {/* Current Boost Calculation - Compact */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {/* GREEN for financial/rewards data */}
          <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
            <span className="text-slate-700 dark:text-slate-300">Total Swap Boost:</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {totalSwapBoost.toFixed(0)}
            </span>
          </div>
          
          {/* BLUE for mining-related data (even if negative) */}
          <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
            <span className="text-slate-700 dark:text-slate-300">Total Session Boost:</span>
            <span className="font-bold text-blue-900 dark:text-blue-100">
              {totalSessionBoost.toFixed(0)}
            </span>
          </div>
          
          {/* BLUE for mining-related data */}
          <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Current Boost:</span>
            <span className="font-bold text-blue-900 dark:text-blue-100">
              ~{currentBoost.toFixed(0)}
              {currentBoost > maxBoost && (
                <span className="text-xs text-green-600 dark:text-green-400 ml-1">(capped at {maxBoost})</span>
              )}
            </span>
          </div>
        </div>
      </div>
      {/* Target Calculations - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {/* YELLOW for status/achievements/targets */}
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Swaps for 615</div>
          <div className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
            {swapsNeededFor615.toLocaleString()}
          </div>
        </div>

        {/* BLUE for mining-related calculations */}
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Sessions to 615</div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {sessionsUntil615}
          </div>
        </div>

        {/* BLUE for mining-related calculations */}
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Sessions to 0</div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {sessionsUntil0}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
