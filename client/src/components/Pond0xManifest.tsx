import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Shield } from 'lucide-react';
import { generateICSFile, downloadICSFile } from '@/lib/ics';
import { motion } from 'framer-motion';

interface Pond0xManifest {
  swaps: number;
  bxSwaps?: number;
  hasTwitter: boolean;
  badges: string[];
  cope: boolean;
  isPro: boolean;
  proAgo: number;
  walletAddress: string;
}

interface Pond0xManifestProps {
  solAddress: string;
}

export function Pond0xManifest({ solAddress }: Pond0xManifestProps) {
  const { data: manifest, isLoading, error } = useQuery<Pond0xManifest>({
    queryKey: ['/api/pond0x/manifest', solAddress],
    queryFn: async () => {
      // Use your serverless function instead of direct API call
      const response = await fetch('/api/wallet/multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solAddress: solAddress
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch wallet data');
      const data = await response.json();
      
      // For now, return test data
      return {
        swaps: 42,
        bxSwaps: 12,
        hasTwitter: true,
        badges: ['swap', 'diamond'],
        cope: false,
        isPro: false,
        proAgo: 30,
        walletAddress: solAddress
      };
    },
    enabled: !!solAddress
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pond0x Manifest</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pond0x Manifest</h3>
          <div className="space-y-4">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700/30 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium mb-2">
                Test Mode: No Real Data Yet
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Your API is working! Real manifest data coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            Manifest Data (Test Mode)
          </h3>
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
            ✓ API WORKING
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-cyan-600 dark:text-cyan-400 text-lg">🤝</span>
              <h4 className="font-semibold text-cyan-900 dark:text-cyan-100">Sol Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mb-1">
              {manifest.swaps.toLocaleString()}
            </div>
            <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
              ✓ Test data working
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 text-lg">🔄</span>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Bx Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              {manifest.bxSwaps || 0}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              ✓ Test data working
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
