import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, CheckCircle, XCircle, Shield, Star } from 'lucide-react';
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
      const response = await fetch(`/api/pond0x/manifest/${solAddress}`);
      if (!response.ok) throw new Error('Failed to fetch Pond0x manifest');
      return response.json();
    },
    enabled: !!solAddress
  });

  const handleExportCalendar = () => {
    if (!manifest) return;
    try {
      // Calculate renewal date (assuming 30-day subscription cycle)
      const currentDate = new Date();
      const renewalDate = new Date(currentDate);
      renewalDate.setDate(currentDate.getDate() + (30 - manifest.proAgo));
      
      const icsContent = generateICSFile(
        'PondPro Subscription Renewal',
        `PondPro subscription renewal for wallet ${manifest.walletAddress}. Last purchased ${manifest.proAgo} days ago.`,
        renewalDate
      );
      
      downloadICSFile(icsContent, 'pondpro-renewal.ics');
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

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
                ❌ Unable to Load Manifest Data
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Failed to retrieve Pond0x manifest data. Please check your wallet address or try again later.
              </p>
            </div>
            <div className="text-center">
              <a
                href="https://cary0x.github.io/docs/info/manifest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View on Official Manifest
              </a>
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
            Manifest Data
          </h3>
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
            ✓ AUTHENTIC MANIFEST
          </div>
          {manifest.hasTwitter && (
            <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium" title="X (Twitter) Account Connected">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Connected
            </div>
          )}
        </div>
        
        {/* Reorganized Manifest Data - ordered as requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* SOL Swaps - First */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-cyan-600 dark:text-cyan-400 text-lg">🤝</span>
              <h4 className="font-semibold text-cyan-900 dark:text-cyan-100">Sol Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mb-1" data-testid="text-pond0x-swaps">
              {manifest.swaps.toLocaleString()}
            </div>
            <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
              ✓ Authentic ecosystem data
            </div>
          </div>

          {/* BX Swaps - Second */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 text-lg">🔄</span>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Bx Swaps</h4>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1" data-testid="text-pond0x-bx-swaps">
              {manifest.bxSwaps ? manifest.bxSwaps.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              ✓ Authentic ecosystem data
            </div>
          </div>

          {/* Badges - Third */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 text-lg">⭐</span>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Badges</h4>
            </div>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4" data-testid="text-pond0x-badges">
              {manifest.badges.length}
            </div>
            {manifest.badges.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2 pt-[2px] pb-[2px]">
                  Earned Badges:
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {manifest.badges.map((badge, index) => {
                    const badgeEmoji = {
                      'diamond': '💎',
                      'pork': '🐷', 
                      'chef': '👨‍🍳',
                      'points': '🎯',
                      'swap': '🤝',
                      'mine': '⛏️',
                      'spawn': '🧪',
                      'juice': '🥤',
                      'pond water': '💧',
                      'bubbles': '🫧'
                    }[badge.toLowerCase()] || '⭐';
                    
                    return (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 px-2 py-1"
                      >
                        <span className="mr-1.5 text-sm">{badgeEmoji}</span>
                        {badge.charAt(0).toUpperCase() + badge.slice(1)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            {manifest.badges.length === 0 && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                No badges earned yet
              </div>
            )}
          </div>

          {/* PondPro Active - Fourth */}
          {manifest.isPro ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <span className="text-amber-600 dark:text-amber-400 text-lg">⭐</span>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">PondPro Active</h4>
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                Yes
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                Last purchase: {manifest.proAgo} days ago
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                Expires: {new Date(Date.now() + (30 - parseInt(manifest.proAgo.toString())) * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
              <Button
                size="sm"
                onClick={handleExportCalendar}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                data-testid="button-export-calendar"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Export Calendar
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <span className="text-slate-500 dark:text-slate-400 text-lg">⭐</span>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">PondPro Active</h4>
              </div>
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-1">
                No
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                ✓ Authentic ecosystem data
              </div>
            </div>
          )}

          {/* Cope Status */}
          {manifest.cope && (
            <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-600/20 dark:to-orange-600/20 border border-red-300 dark:border-red-500/30 rounded-lg p-4">
              <div className="text-lg font-bold text-red-700 dark:text-red-300 mb-1">
                Cope Status: True
              </div>
              <div className="text-xs text-red-600 dark:text-red-200">
                Please sort your life out 📈
              </div>
            </div>
          )}
        </div>


      </div>
    </motion.div>
  );
}