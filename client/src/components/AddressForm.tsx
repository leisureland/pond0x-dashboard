import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidEthereumAddress, isValidSolanaAddress } from '@/lib/validate';
import { WalletMemory } from '@/lib/walletMemory';
import { SavedWallets } from '@/components/SavedWallets';

interface AddressFormProps {
  onSubmit: (ethAddress: string, solAddress: string) => void;
  onDemo: () => void;
}

export function AddressForm({ onSubmit, onDemo }: AddressFormProps) {
  const [ethAddress, setEthAddress] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [ethError, setEthError] = useState('');
  const [solError, setSolError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ethTrimmed = ethAddress.trim();
    const solTrimmed = solAddress.trim();
    
    // Reset errors
    setEthError('');
    setSolError('');
    
    // If empty, show demo
    if (!solTrimmed) {
      onDemo();
      return;
    }
    
    // Validate Solana address
    if (!isValidSolanaAddress(solTrimmed)) {
      setSolError('Invalid Solana address format');
      return;
    }

    // Save wallet to memory
    WalletMemory.saveWallet(solTrimmed);
    
    onSubmit('', solTrimmed);
  };

  const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEthAddress(e.target.value);
    if (ethError) setEthError('');
  };

  const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolAddress(e.target.value);
    if (solError) setSolError('');
  };

  const handleSelectSavedWallet = (address: string) => {
    setSolAddress(address);
    if (solError) setSolError('');
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-white via-slate-50/50 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-purple-900/20 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-purple-500/5 dark:from-transparent dark:via-slate-700/5 dark:to-purple-400/5 rounded-2xl"></div>
      
      <div className="relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Solana Address Input */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                id="sol-address"
                type="text"
                value={solAddress}
                onChange={handleSolChange}
                className={`h-14 text-base px-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 rounded-xl shadow-sm transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${solError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="Enter your Solana wallet address"
                aria-label="Solana wallet address input"
                data-testid="input-sol-address"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium">
                  SOL
                </span>
              </div>
            </div>
            {solError && (
              <motion.p
                className="text-red-500 text-sm font-medium"
                role="alert"
                aria-live="polite"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="text-sol-error"
              >
                {solError}
              </motion.p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              data-testid="button-analyze-wallet"
            >
              <Search className="w-5 h-5 mr-2" />
              Analyze Wallet
            </Button>
            <Button
              type="button"
              onClick={onDemo}
              variant="outline"
              className="h-12 px-6 border-0 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-200"
              data-testid="button-try-demo"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Demo
            </Button>
          </div>
        </form>
        
        {/* Saved Wallets */}
        <SavedWallets 
          onSelectWallet={handleSelectSavedWallet}
          className="mt-6"
        />
      </div>
    </motion.div>
  );
}