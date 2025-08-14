import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Target, ArrowUp, Clock } from 'lucide-react';

interface SwapBoostCalculatorProps {
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

export default function SwapBoostCalculator({ manifestData, healthStats }: SwapBoostCalculatorProps) {
  
  if (!manifestData) {
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

  // Get total swaps from manifest data (includes both SOL and BX swaps)
  const totalSwaps = manifestData.swaps || 0;
  const miningSessions = healthStats?.mining_sessions || 0;

  // Implement authentic Cary0x boost calculator formulas
  // Based on https://cary0x.github.io/docs/info/swaps
  const totalSwapBoost = totalSwaps / 6;
  const totalSessionBoost = miningSessions * -3;
  const currentBoost = totalSwapBoost + totalSessionBoost;

  // Target calculations - this represents the maximum effective boost cap
  const maxBoost = 615;
  const targetBoost = maxBoost;
  
  // Calculate swaps needed for 615
  // Formula: (target - session_boost) * 6 - current_swaps
  const swapsNeededFor615 = Math.max(0, Math.ceil((targetBoost - totalSessionBoost) * 6) - totalSwaps);
  
  // Calculate sessions until boost reaches 615 or 0
  // For sessions until 615: (current - target) / 3 
  const sessionsUntil615 = Math.max(0, Math.ceil((currentBoost - targetBoost) / 3));
  
  // For sessions until 0: current / 3
  const sessionsUntil0 = Math.max(0, Math.ceil(currentBoost / 3));

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
      {/* Input Data Summary - Two Separate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Mining Sessions Card */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-900 dark:text-purple-100">Mining Sessions</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {healthStats ? miningSessions.toLocaleString() : 'Pro Required'}
          </div>
          {!healthStats && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              ⚠️ Requires Pro subscription
            </div>
          )}
        </div>

        {/* Total Swaps Card */}
        <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10 rounded-xl border border-cyan-200/50 dark:border-cyan-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold text-cyan-900 dark:text-cyan-100">Total Swaps</span>
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            {totalSwaps.toLocaleString()}
          </div>
        </div>
      </div>
      {/* Current Boost Calculation - Compact */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <span className="text-slate-700 dark:text-slate-300">Total  Swap Boost:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {totalSwapBoost.toFixed(0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="text-slate-700 dark:text-slate-300">Total Session Boost:</span>
            <span className="font-bold text-red-600 dark:text-red-400">
              {totalSessionBoost.toFixed(0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Current Boost:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
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
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Swaps for 615</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {swapsNeededFor615.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Sessions to 615</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {healthStats ? sessionsUntil615 : 'Pro Required'}
          </div>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">Sessions to 0</div>
          <div className="text-xl font-bold text-slate-600 dark:text-slate-300">
            {healthStats ? sessionsUntil0 : 'Pro Required'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}