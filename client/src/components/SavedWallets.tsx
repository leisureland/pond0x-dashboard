import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Copy, User } from 'lucide-react';
import { WalletMemory, type SavedWallet } from '@/lib/walletMemory';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SavedWalletsProps {
  onSelectWallet: (address: string) => void;
  className?: string;
}

export function SavedWallets({ onSelectWallet, className = '' }: SavedWalletsProps) {
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedWallets();
  }, []);

  const loadSavedWallets = () => {
    const wallets = WalletMemory.getSavedWallets();
    setSavedWallets(wallets);
  };

  const handleSelectWallet = (address: string) => {
    WalletMemory.updateWalletUsage(address);
    onSelectWallet(address);
    loadSavedWallets(); // Refresh to update last used time
  };

  const handleRemoveWallet = (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    WalletMemory.removeWallet(address);
    loadSavedWallets();
    toast({
      title: "Wallet removed",
      description: "The wallet has been removed from your saved list."
    });
  };

  const handleCopyAddress = async (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive"
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLastUsed = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (savedWallets.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Saved Wallets
            </span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <AnimatePresence>
              {savedWallets.map((wallet, index) => (
                <motion.div
                  key={wallet.address}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group"
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSelectWallet(wallet.address)}
                    className="w-full justify-between h-auto p-3 bg-white/50 dark:bg-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 transition-all duration-200"
                    data-testid={`saved-wallet-${wallet.address.slice(0, 8)}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
                            {formatAddress(wallet.address)}
                          </span>
                          {wallet.nickname && (
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                              ({wallet.nickname})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatLastUsed(wallet.lastUsed)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleCopyAddress(wallet.address, e)}
                        className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
                        data-testid={`copy-wallet-${wallet.address.slice(0, 8)}`}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleRemoveWallet(wallet.address, e)}
                        className="h-6 w-6 p-0 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        data-testid={`remove-wallet-${wallet.address.slice(0, 8)}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}