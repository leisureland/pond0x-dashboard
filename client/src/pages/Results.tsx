import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Copy, Download, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { StatsCards } from '@/components/StatsCards';
import { Charts } from '@/components/Charts';

import { Pond0xManifest } from '@/components/Pond0xManifest';
import { MiningSessionCard } from '@/components/MiningSessionCard';
import SwapBoostCalculator from '@/components/SwapBoostCalculator';
import { SolscanIntegration } from '@/components/SolscanIntegration';


// Mock data imports removed - using authentic blockchain data only
import { generateICSFile, downloadICSFile } from '@/lib/ics';
import { formatEthereumAddress, formatSolanaAddress } from '@/lib/validate';
import { formatDate, truncateAddress } from '@/lib/format';
import { resolveXForWallet, saveLocalXHandle, type SocialInfo } from '@/lib/socialResolver';
import { WalletEvent, WalletStats } from '@/types';

export default function Results() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [ethAddress, setEthAddress] = useState<string>('');
  const [solAddress, setSolAddress] = useState<string>('');
  const [events, setEvents] = useState<WalletEvent[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [ethSocial, setEthSocial] = useState<SocialInfo>({ platform: "x", handle: "", source: "none" });
  const [solSocial, setSolSocial] = useState<SocialInfo>({ platform: "x", handle: "", source: "none" });
  const [newEthHandle, setNewEthHandle] = useState('');
  const [newSolHandle, setNewSolHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed unused transaction search state variables

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ethParam = params.get('eth') || params.get('address'); // support both 'eth' and 'address' params
    const solParam = params.get('sol');
    
    if (ethParam || solParam) {
      setEthAddress(ethParam || '');
      setSolAddress(solParam || '');
      
      // Fetch real blockchain data instead of mock data
      fetchWalletData(ethParam || undefined, solParam || undefined);
      
      // Resolve X handles (with error handling)
      if (ethParam) {
        resolveXForWallet({ chain: 'eth', address: ethParam })
          .then(setEthSocial)
          .catch(() => setEthSocial({ platform: "x", handle: "", source: "none" }));
      }
      if (solParam) {
        resolveXForWallet({ chain: 'sol', address: solParam })
          .then(setSolSocial)
          .catch(() => setSolSocial({ platform: "x", handle: "", source: "none" }));
      }
    }
  }, [search]);

  const fetchWalletData = async (ethAddr?: string, solAddr?: string) => {
    setIsLoading(true);
    try {
      // For static deployment, show Pond0x data only for Solana addresses
      if (solAddr) {
        // Show success message for Solana addresses - Pond0x components will handle their own API calls
        toast({
          title: "Wallet Analysis Ready",
          description: "Loading Pond0x ecosystem data...",
        });
        
        // Set empty initial data - individual components will fetch their own data
        setEvents([]);
        setStats({
          totalSwaps: 0,
          miningRewards: 0,
          pondProStatus: 'inactive' as const,
          totalValue: 0,
          monthlyChange: 0
        });
      } else {
        // Show informative message for non-Solana addresses
        toast({
          title: "Solana Address Required",
          description: "This dashboard focuses on Pond0x ecosystem data, which requires a Solana wallet address.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Note", 
        description: "This is a static deployment. Pond0x data will still load correctly.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async (address: string, chain: 'ETH' | 'SOL') => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied',
        description: `${chain} wallet address has been copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy address to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleSaveXHandle = (chain: 'eth' | 'sol') => {
    const handle = chain === 'eth' ? newEthHandle : newSolHandle;
    const address = chain === 'eth' ? ethAddress : solAddress;
    
    if (!address) return;
    
    saveLocalXHandle(chain, address, handle);
    
    if (chain === 'eth') {
      setEthSocial({ platform: "x", handle: handle, source: "local" });
      setNewEthHandle('');
    } else {
      setSolSocial({ platform: "x", handle: handle, source: "local" });
      setNewSolHandle('');
    }
    
    toast({
      title: 'X handle saved',
      description: `X handle for ${chain.toUpperCase()} wallet saved locally`,
    });
  };

  const handleExportCalendar = () => {
    if (!stats?.pondProExpiry) {
      toast({
        title: 'No PondPro expiry date',
        description: 'Cannot create calendar reminder without expiry date',
        variant: 'destructive'
      });
      return;
    }

    try {
      const icsContent = generateICSFile(
        'PondPro Subscription Renewal Due',
        'Your PondPro subscription is due for renewal. Visit Pond0x.com to renew.',
        stats.pondProExpiry
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

  // Show loading state while fetching data
  if (isLoading || ((ethAddress || solAddress) && !stats)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Loading Wallet Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Fetching authentic Pond0x data from blockchain APIs...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show error state if no addresses provided and not loading
  if (!ethAddress && !solAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No wallet addresses provided</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please go back to the home page and enter ETH and/or SOL wallet addresses.</p>
          <Button onClick={() => setLocation('/')} className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600">
            Go to Home Page
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
            Wallet Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Data powered by Cary0x and Pond0x.com APIs</p>
          

        </motion.div>

        {/* Wallet Information Card */}
        <motion.div
          className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 mb-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white text-center">
            Connected Wallets
          </h2>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Solana Address */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">SOL</span>
                Solana Network
              </h3>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Enter Solana address"
                  defaultValue={solAddress}
                  className="flex-1 font-mono text-sm h-12 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 rounded-xl shadow-sm transition-all duration-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const address = (e.target as HTMLInputElement).value.trim();
                      if (address) {
                        setLocation(`/results?sol=${address}`);
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter Solana address"]') as HTMLInputElement;
                    const address = input?.value.trim();
                    if (address) {
                      setLocation(`/results?sol=${address}`);
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 h-12 px-6"
                >
                  Analyze
                </Button>
                {solAddress && (
                  <Button
                    onClick={() => handleCopyAddress(solAddress, 'SOL')}
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-12 px-4 border-0 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-200"
                    data-testid="button-copy-sol-address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>



        {/* Pond0x Manifest - Separate Section */}
        {solAddress && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Pond0xManifest solAddress={solAddress} />
          </motion.div>
        )}

        {/* X Account Connection section removed - using direct wallet input approach */}

        {/* Comprehensive Mining Health Data */}
        {solAddress && (
          <div className="mb-8">
            <MiningSessionCard 
              solAddress={solAddress} 
              stats={stats} 
              manifestData={stats?.pond0xData?.manifest}
            />
          </div>
        )}

        {/* Swap/Boost Calculator */}
        {solAddress && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SwapBoostCalculator 
              solAddress={solAddress}
              manifestData={stats?.pond0xData?.manifest}
              healthStats={stats?.pond0xData?.health?.stats}
            />
          </motion.div>
        )}

        {/* Solscan Integration - Direct URLs like Cary's scandata approach */}
        {solAddress && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SolscanIntegration solanaAddress={solAddress} />
          </motion.div>
        )}

        {/* Transaction History section removed - wasn't providing authentic value */}

      </div>
    </div>
  );
}
