import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, TrendingUp, Clock, Shield, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/format';

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

interface HealthStats {
  mining_sessions: number;
  in_mempool: number;
  sent: number;
  failed: number;
  drifted: number;
  drift_risk: number;
  priority: number;
  estimates: {
    sol_usd: number;
    wpond_usd: number;
    drift_risk_usd: number;
    max_claim_estimate_usd: number;
    drifted_usd: number;
  };
  health: number;
}

interface MiningData {
  hasActiveMining: boolean;
  miningSignature: string | null;
  sessionDetails?: MiningSession | null;
}

interface MiningSessionCardProps {
  solAddress: string;
  stats?: any | null;
  manifestData?: {
    swaps?: number;
    proSwapsSol?: number;
    proSwapsBx?: number;
    badges?: string;
  };
}

export function MiningSessionCard({ solAddress, stats, manifestData }: MiningSessionCardProps) {
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [healthData, setHealthData] = useState<HealthStats | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        // Fetch Pond0x manifest to check Pro status
        const manifestResponse = await fetch(`https://www.cary0x.com/api/manifest/${solAddress}`);
        let proStatus = false;
        
        if (manifestResponse.ok) {
          const manifestData = await manifestResponse.json();
          proStatus = manifestData.isPro;
          setIsPro(proStatus);
        }

        // Fetch mining data directly from pond0x.com API
const miningResponse = await fetch(`https://pond0x.com/api/user/${solAddress}`);

if (miningResponse.ok) {
  const miningApiData = await miningResponse.json();
  
  // Set mining data from the direct API response
  setMiningData(miningApiData.mining || null);
  setHealthData(miningApiData.health?.stats || null);
  setAiInsights(miningApiData.health?.ai_beta || []);
}
      } catch (error) {
        console.error('Error fetching mining data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMiningData();
  }, [solAddress]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }



  if (!miningData?.hasActiveMining) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Mining Session</h3>
          <p className="text-slate-600 dark:text-slate-400">
            No current mining session found for this wallet address.
          </p>
        </div>
      </motion.div>
    );
  }

  const session = miningData.sessionDetails;
  const signature = miningData.miningSignature;

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Active Mining Session
          </h3>
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-1 rounded text-sm font-medium mt-2 inline-block">
            ✓ Official pond0x.com API Data
          </div>
        </div>
      </div>

      {/* AI Insights - Moved above Active Mining Session */}
      {aiInsights.length > 0 && (
        <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            AI Mining Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {session ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mining Rig Boost - First */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Mining Rig Boost</h4>
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {(() => {
                if (session.boost > 0) return session.boost;
                if (manifestData && healthData) {
                  // Calculate boost using authentic Cary0x formula
                  const totalSwaps = manifestData.swaps || 0;
                  const miningSessions = healthData.mining_sessions || 0;
                  const totalSwapBoost = totalSwaps / 6;
                  const totalSessionBoost = miningSessions * -3;
                  const calculatedBoost = Math.max(0, Math.round(totalSwapBoost + totalSessionBoost));
                  // Cap at maximum boost of 615
                  return Math.min(calculatedBoost, 615);
                }
                return 0;
              })()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {session.boost > 0 ? 'Live boost from pond0x.com API' : 'Calculated from Cary0x formula (capped at 615)'}
            </p>
          </div>

          {/* Mining Status - Second */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Mining Status</h4>
            </div>
            <div className={`text-lg font-bold ${
              session.status === 'QUEUED' ? 'text-yellow-600 dark:text-yellow-400' :
              session.status === 'PROCESSING' ? 'text-blue-600 dark:text-blue-400' :
              session.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' :
              'text-slate-600 dark:text-slate-400'
            }`}>
              {session.status}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Current mining status
            </p>
          </div>

          {/* Slashes - Third */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Slashes</h4>
            </div>
            <div className={`text-lg font-bold ${
              session.slashes === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {session.slashes}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Penalty count
            </p>
          </div>

          {/* Priority Level - Fourth */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Priority Level</h4>
            </div>
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {healthData?.priority !== undefined ? healthData.priority : 'Loading...'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mining priority from Cary0x health API </p>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              ✓ Live data from cary0x.com/api/health
            </div>
          </div>

          {/* Network Peers - Fifth */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Network Peers</h4>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(session.peers)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active network participants
            </p>
          </div>

          {/* Mining Reward - Sixth */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Mining Reward</h4>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatNumber(Math.round(session.reward / 1000000))}M $POND
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From pond0x.com/api/solana/mining/session
            </p>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              Raw: {session.reward.toLocaleString()} units
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Mining Session Active</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Mining signature confirmed, but detailed session data is not available.
          </p>
          <code className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-4 py-2 rounded text-sm font-mono break-all">
            {signature?.substring(0, 40)}...
          </code>
        </div>
      )}
      {/* Comprehensive Health Statistics */}
      {healthData && (
        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Comprehensive Mining Health
            <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm font-medium ml-auto">
              ✓ Cary0x Health API
            </div>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Mining Sessions */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50">
              <h5 className="font-semibold text-green-800 dark:text-green-200 text-sm mb-1">Total Sessions</h5>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatNumber(healthData.mining_sessions)}</div>
              <p className="text-xs text-green-600 dark:text-green-300">All-time mining sessions</p>
            </div>

            {/* Mempool Status */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">In Mempool</h5>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(healthData.in_mempool)}</div>
              <p className="text-xs text-blue-600 dark:text-blue-300">Pending transactions</p>
            </div>

            {/* Success Rate */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700/50">
              <h5 className="font-semibold text-purple-800 dark:text-purple-200 text-sm mb-1">Total Claims Sent</h5>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{healthData.sent}</div>
              <p className="text-xs text-purple-600 dark:text-purple-300">Successfully sent</p>
            </div>

            {/* Max Claim Estimate */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700/50">
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-1">Max Claim Est.</h5>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{formatCurrency(healthData.estimates.max_claim_estimate_usd)}</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">USD estimate</p>
            </div>
          </div>

          {/* Additional Statistics - Consistent Card Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Failed Transactions */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h5 className="font-semibold text-red-800 dark:text-red-200 text-sm">Failed Claims</h5>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{healthData.failed}</div>
              <p className="text-xs text-red-600 dark:text-red-300">Transaction failures</p>
            </div>

            {/* Drifted Transactions */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h5 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Drifted Claims</h5>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{healthData.drifted}</div>
              <p className="text-xs text-orange-600 dark:text-orange-300">Price drift instances</p>
              {healthData.estimates?.drifted_usd && (
                <div className="mt-2 bg-orange-100 dark:bg-orange-800/30 rounded px-2 py-1">
                  <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                    Estimated Value: ${healthData.estimates.drifted_usd.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Drift Risk Value */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h5 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">Drift Risk USD</h5>
              </div>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {healthData.estimates.drift_risk_usd === 0 ? (
                  <span className="flex items-center gap-1">
                    $0.00 
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-normal">
                      No Risk
                    </span>
                  </span>
                ) : (
                  formatCurrency(healthData.estimates.drift_risk_usd)
                )}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-300">
                {healthData.estimates.drift_risk_usd === 0 
                  ? 'All transactions within expected price ranges'
                  : 'Risk exposure from price slippage'
                }
              </p>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
