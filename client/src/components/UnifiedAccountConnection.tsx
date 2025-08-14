import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UnifiedAccount {
  xHandle?: string;
  ethAddress?: string;
  solAddress?: string;
  pondProStatus: boolean;
  pondProExpiry?: Date;
}

interface UnifiedAccountConnectionProps {
  onAccountFound: (account: UnifiedAccount) => void;
  initialAccount?: UnifiedAccount;
}

export function UnifiedAccountConnection({ onAccountFound, initialAccount }: UnifiedAccountConnectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localXHandle, setLocalXHandle] = useState('');
  const [showLocalInput, setShowLocalInput] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundAccount, setFoundAccount] = useState<UnifiedAccount | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const cleanTerm = searchTerm.trim().replace(/^@/, '');
      const response = await fetch(`/api/account/${encodeURIComponent(cleanTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const account = await response.json();
      console.log('Account found:', account); // Debug log
      
      // Show additional info if account has both addresses
      if (account.ethAddress && account.solAddress) {
        console.log('Multi-chain account detected:', {
          eth: account.ethAddress,
          sol: account.solAddress,
          x: account.xHandle
        });
      }
      setFoundAccount(account);
      onAccountFound(account);
    } catch (error) {
      console.error('Account search error:', error);
      setSearchError('pond0x.com does not provide public X handle lookup. Please enter your wallet addresses directly or use the manual address form below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocalXHandleSave = () => {
    if (!localXHandle.trim() || !initialAccount?.ethAddress) return;
    
    // Save to localStorage
    const localKey = `xmap:unified:${initialAccount.ethAddress}`;
    localStorage.setItem(localKey, localXHandle.trim());
    
    // Update the current account
    const updatedAccount = {
      ...initialAccount,
      xHandle: localXHandle.trim()
    };
    
    onAccountFound(updatedAccount);
    setShowLocalInput(false);
    setLocalXHandle('');
  };

  const getStoredXHandle = () => {
    if (!initialAccount?.ethAddress) return null;
    
    try {
      const localKey = `xmap:unified:${initialAccount.ethAddress}`;
      return localStorage.getItem(localKey);
    } catch {
      return null;
    }
  };

  const storedHandle = getStoredXHandle();

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            Unified Account Connection
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Enter your ETH or SOL wallet address to analyze blockchain activity
          </p>
        </div>

        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="0xabc123... or 9WzDXwB... (wallet addresses)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-cyan-500"
                data-testid="input-unified-search"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
              data-testid="button-search-account"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchError && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {searchError}
            </div>
          )}
        </div>

        {/* Found Account Display */}
        {foundAccount && (foundAccount.ethAddress || foundAccount.solAddress || foundAccount.xHandle) && (
          <motion.div
            className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-600/20 dark:to-blue-600/20 border border-cyan-200 dark:border-cyan-500/30 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-cyan-600" />
                <span className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">
                  Account Found
                </span>
              </div>
              <Button
                onClick={() => onAccountFound(foundAccount)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-4 py-2"
                data-testid="button-analyze-account"
              >
                Analyze →
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {foundAccount.xHandle && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400">X Handle:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    @{foundAccount.xHandle}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </div>
              )}

              {foundAccount.ethAddress && (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-600 dark:text-slate-400">ETH:</span>
                  <code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                    {foundAccount.ethAddress.slice(0, 6)}...{foundAccount.ethAddress.slice(-4)}
                  </code>
                </div>
              )}

              {foundAccount.solAddress && (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-slate-400">SOL:</span>
                  <code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                    {foundAccount.solAddress.slice(0, 6)}...{foundAccount.solAddress.slice(-4)}
                  </code>
                </div>
              )}
            </div>

            {foundAccount.pondProStatus && (
              <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 text-sm">
                PondPro Active {foundAccount.pondProExpiry && `(expires ${new Date(foundAccount.pondProExpiry).toLocaleDateString()})`}
              </div>
            )}
          </motion.div>
        )}

        {/* Local X Handle Connection (for accounts not in pond0x) */}
        {initialAccount && !initialAccount.xHandle && !storedHandle && (
          <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                X handle not registered for pond0x mining? Add local connection
              </p>
              {!showLocalInput ? (
                <Button
                  onClick={() => setShowLocalInput(true)}
                  variant="outline"
                  className="text-slate-700 dark:text-slate-300"
                  data-testid="button-add-local-handle"
                >
                  Add X Handle
                </Button>
              ) : (
                <div className="flex gap-2 max-w-sm mx-auto">
                  <Input
                    placeholder="@yourhandle"
                    value={localXHandle}
                    onChange={(e) => setLocalXHandle(e.target.value)}
                    className="flex-1 text-sm"
                    data-testid="input-local-handle"
                  />
                  <Button
                    onClick={handleLocalXHandleSave}
                    size="sm"
                    className="bg-slate-600 hover:bg-slate-700 text-white"
                    data-testid="button-save-local-handle"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {setShowLocalInput(false); setLocalXHandle('');}}
                    variant="outline"
                    size="sm"
                    data-testid="button-cancel-local"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show stored local handle */}
        {storedHandle && (
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Local X Handle:</span>
                <span className="font-medium text-slate-900 dark:text-white">@{storedHandle}</span>
              </div>
              <span className="bg-slate-500/20 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs">
                stored locally
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}