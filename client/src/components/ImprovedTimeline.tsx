import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletEvent, Chain } from '@/types';
import { formatRelativeTime } from '@/lib/format';

interface ImprovedTimelineProps {
  events: WalletEvent[];
}

export function ImprovedTimeline({ events }: ImprovedTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'swapped'>('all');
  const [selectedToken, setSelectedToken] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Process events to determine transaction types
  const processedEvents = useMemo(() => {
    return events.map(event => {
      let transactionType: 'swapped' | 'sent' | 'received' | 'program' = 'program';
      
      // Only determine transaction type from authentic data
      if (event.type === 'swap' || event.description.toLowerCase().includes('swap')) {
        transactionType = 'swapped';
      }
      // Don't categorize as sent/received without full transaction parsing
      // This prevents misleading "received X SOL" messages
      
      return {
        ...event,
        transactionType
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events]);

  // Get unique tokens for filtering
  const availableTokens = useMemo(() => {
    const tokens = new Set(processedEvents.map(event => event.tokenSymbol || 'SOL').filter(Boolean));
    return Array.from(tokens).sort();
  }, [processedEvents]);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    let filtered = processedEvents;
    
    // Filter by transaction type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((event: any) => event.transactionType === selectedFilter);
    }
    
    // Filter by token
    if (selectedToken !== 'all') {
      filtered = filtered.filter(event => (event.tokenSymbol || 'SOL') === selectedToken);
    }
    
    return filtered;
  }, [processedEvents, selectedFilter, selectedToken]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedToken]);

  // Helper function to get blockchain explorer URL
  const getExplorerUrl = (hash: string, chain: Chain): string => {
    if (chain === 'eth') {
      return `https://etherscan.io/tx/${hash}`;
    } else if (chain === 'sol') {
      return `https://solscan.io/tx/${hash}`;
    }
    return '#';
  };

  // Helper functions for transaction display
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swapped': return '🔄';
      case 'sent': return '📤';
      case 'received': return '📥';
      default: return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'swapped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'sent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'received': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getTokenIcon = (tokenSymbol?: string) => {
    switch (tokenSymbol?.toLowerCase()) {
      case 'sol': return '◎';
      case 'pond': return '🐸';
      case 'wpond': return '🌊';
      case 'usdc': return '💵';
      default: return '🪙';
    }
  };

  const formatTransactionValue = (event: any) => {
    const amount = event.value || event.amount;
    const token = event.tokenSymbol || 'SOL';
    // Only show amounts when we have authentic transaction data
    if (amount && amount > 0) {
      return `${amount.toFixed(6)} ${token}`;
    }
    return null; // Don't show fabricated amounts
  };

  const formatDateTime = (timestamp: number | Date) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const stats = {
    totalCount: filteredEvents.length,
    swappedCount: processedEvents.filter((e: any) => e.transactionType === 'swapped').length,
    sentCount: processedEvents.filter((e: any) => e.transactionType === 'sent').length,
    receivedCount: processedEvents.filter((e: any) => e.transactionType === 'received').length
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Transaction History
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {stats.totalCount} transactions found • {stats.swappedCount} swapped • {processedEvents.length - stats.swappedCount} program interactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Transaction Type Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All ({processedEvents.length})
          </Button>
          <Button
            variant={selectedFilter === 'swapped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('swapped')}
            className="gap-1"
          >
            🔄 Swapped ({stats.swappedCount})
          </Button>
          {/* Removed Sent/Received filters since we can't reliably determine these without full transaction parsing */}
        </div>

        {/* Token Filter */}
        {availableTokens.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedToken === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedToken('all')}
            >
              All Tokens
            </Button>
            {availableTokens.map(token => (
              <Button
                key={token}
                variant={selectedToken === token ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedToken(token)}
                className="gap-1"
              >
                {getTokenIcon(token)} {token}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Events List */}
      <AnimatePresence>
        <div className="space-y-3">
          {paginatedEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No transactions found for the selected filters.
            </div>
          ) : (
            paginatedEvents.map((event: any, index: number) => {
              const { date, time } = formatDateTime(event.timestamp);
              const transactionValue = formatTransactionValue(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Transaction Type Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionColor(event.transactionType)}`}>
                      {getTransactionIcon(event.transactionType)} {event.transactionType.toUpperCase()}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      {/* Main Transaction Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {getTokenIcon(event.tokenSymbol)} {event.tokenSymbol || 'SOL'}
                        </span>
                        {transactionValue && (
                          <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                            {transactionValue}
                          </span>
                        )}
                      </div>
                      
                      {/* Date and Time */}
                      <div className="flex items-center gap-3 mb-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>{date}</span>
                        <span>{time}</span>
                      </div>

                      {/* Transaction Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                          {event.chain.toUpperCase()} Transaction
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-mono">
                          Hash: {event.hash.slice(0, 8)}...
                        </span>
                        {/* Only show addresses when we have authentic data */}
                        {event.fromAddress && event.fromAddress !== 'undefined' && (
                          <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded font-mono">
                            From: {event.fromAddress.slice(0, 4)}...{event.fromAddress.slice(-4)}
                          </span>
                        )}
                        {event.toAddress && event.toAddress !== 'undefined' && event.toAddress !== event.fromAddress && (
                          <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded font-mono">
                            To: {event.toAddress.slice(0, 4)}...{event.toAddress.slice(-4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Explorer Link */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <a
                        href={getExplorerUrl(event.hash, event.chain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} transactions
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}