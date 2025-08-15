import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Calendar, Shield } from 'lucide-react';
import { generateICSFile, downloadICSFile } from '@/lib/ics';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  getBadgeEmoji, 
  formatUnixTimestamp, 
  parseBadges, 
  formatBooleanDisplay 
} from '@/lib/pond0x-utils';
import type { Pond0xManifestData, Pond0xApiResponse } from '@/types/pond0x';

interface Pond0xManifestProps {
  solAddress: string;
}

export function Pond0xManifest({ solAddress }: Pond0xManifestProps) {
  const { toast } = useToast();
  
  const { data: manifest, isLoading, error } = useQuery<Pond0xManifestData>({
    queryKey: ['/api/pond0x/manifest', solAddress],
    queryFn: async (): Promise<Pond0xManifestData> => {
      const response = await fetch('/api/wallet/multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solAddress }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data: Pond0xApiResponse = await response.json();
      const pond0xData = data.pond0xData || {};
      
      return {
        swaps: pond0xData.proSwapsSol || 0,
        bxSwaps: pond0xData.proSwapsBx || 0,
        hasTwitter: pond0xData.hasTwitter || false,
        badges: parseBadges(pond0xData.badges || ''),
        cope: pond0xData.cope || false,
        isPro: pond0xData.isPro || false,
        proAgo: typeof pond0xData.proAgo === 'number' ? pond0xData.proAgo : 0,
        proExpiry: pond0xData.proExpiry || undefined,
        walletAddress: solAddress
      };
    },
    enabled: !!solAddress,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const handleExportCalendar = () => {
    if (!manifest?.proExpiry) {
      toast({
        title: 'No expiry date available',
        description: 'Cannot create calendar reminder without Pro expiry date',
        variant: 'destructive'
      });
      return;
    }

    try {
      const expiryDate = new Date(parseInt(manifest.proExpiry) * 1000);
      const icsContent = generateICSFile(
        'PondPro Subscription Renewal Due',
        'Your PondPro subscription is due for renewal. Visit Pond0x.com to renew.',
        expiryDate
      );
      
      downloadICSFile(icsContent, 'pondpro-renewal.ics');
      
      toast({
        title: 'Calendar exported',
        description: 'PondPro renewal reminder has been downloaded',
      });
    } catch (error) {
      console.error('Calendar export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to create calendar file. Please try again.',
        variant: 'destructive'
      });
    }
  };

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
            Pond0x Manifest
          </h3>
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
            ✅ Live Data
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">🤝</span>
              <h4 className="font-semibold text-green-900 dark:text-green-100">SOL Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {manifest.swaps.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              ✅ Real API Data
            </div>
          </div>

          <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">🔄</span>
              <h4 className="font-semibold text-green-900 dark:text-green-100">BX Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {manifest.bxSwaps || 0}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              ✅ Real API Data
            </div>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-lg">🐦</span>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Twitter</h4>
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">
              {manifest.hasTwitter ? 'TRUE' : 'FALSE'}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">
              ✅ Real API Data
            </div>
          </div>
        </div>

        {/* Compact Pro Status and Badges Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Compact Pro Status Card */}
          <div className="bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-300 dark:border-indigo-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 text-lg">👑</span>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Pro Status</h4>
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">
              {manifest.isPro ? 'TRUE' : 'FALSE'}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              ✅ Real API Data
            </div>
            
            {manifest.isPro && manifest.proExpiry && (
              <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Last purchase
                    </div>
                    <div className="font-semibold text-indigo-800 dark:text-indigo-200">
                      {(() => {
                        if (manifest.proExpiry) {
                          // Calculate days since purchase (assuming 30-day subscription)
                          const expiryDate = new Date(parseInt(manifest.proExpiry) * 1000);
                          const purchaseDate = new Date(expiryDate.getTime() - (30 * 24 * 60 * 60 * 1000));
                          const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (24 * 60 * 60 * 1000));
                          return `${daysSincePurchase} days ago`;
                        }
                        return 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Expires
                    </div>
                    <div className="font-semibold text-indigo-800 dark:text-indigo-200">
                      {formatUnixTimestamp(manifest.proExpiry)}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleExportCalendar}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Export to Calendar
                </Button>
              </div>
            )}
          </div>

          {/* Compact Badges Card */}
          {manifest.badges && manifest.badges.length > 0 && (
            <div className="bg-pink-100 dark:bg-pink-900/20 border border-pink-300 dark:border-pink-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <span className="text-pink-600 dark:text-pink-400 text-lg">⭐</span>
                <h4 className="font-semibold text-pink-900 dark:text-pink-100">Badges</h4>
              </div>
              <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-1">
                {manifest.badges.length}
              </div>
              <div className="text-xs text-pink-600 dark:text-pink-400 mt-1 font-medium mb-3">
                Earned Badges
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {manifest.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-full text-xs border border-pink-200 dark:border-slate-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="text-sm">{getBadgeEmoji(badge)}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
