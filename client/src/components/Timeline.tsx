import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ExternalLink, ArrowUpDown, Send, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletEvent, Chain } from '@/types';
import { formatRelativeTime } from '@/lib/format';

interface TimelineProps {
  events: WalletEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'swap' | 'other'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get actual transaction types, tokens, and important addresses from the data
  const { popularTokens, stats, importantAddresses } = useMemo(() => {
    const tokens = new Map<string, number>();
    const addresses = new Map<string, number>();
    let swapCount = 0;
    let transferCount = 0;

    // Known important addresses for Pond0x ecosystem
    const knownAddresses: Record<string, string> = {
      '2bsXHfqzWS3kgcgGifmffNCRokzgV1K9RMEiTcL6zQRF': 'PondPro Subscription',
      'AYg4dKoZJudVkD7Eu3ZaJjkzfoaATUqfiv8w8pS53opT': 'wPond Rewards',
      '1orFCnFfgwPzSgUaoK6Wr3MjgXZ7mtk8NGz9Hh4iWWL': 'wPond Rewards Alt'
    };

    events.forEach(event => {
      // Count transaction types - only authentic swap transactions
      if (event.type === 'swap') swapCount++;
      // All other transactions are program interactions
      else transferCount++;
      
      // Count token occurrences
      if (event.tokenSymbol) {
        tokens.set(event.tokenSymbol, (tokens.get(event.tokenSymbol) || 0) + 1);
      }

      // Count interactions with important addresses
      if (event.description) {
        Object.keys(knownAddresses).forEach(addr => {
          if (event.description.includes(addr)) {
            addresses.set(addr, (addresses.get(addr) || 0) + 1);
          }
        });
      }
    });

    // Get top 5 most common tokens
    const sortedTokens = Array.from(tokens.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([token]) => token);

    // Get important addresses with interactions
    const addressList = Array.from(addresses.entries())
      .map(([addr, count]) => ({ address: addr, label: knownAddresses[addr], count }))
      .sort((a, b) => b.count - a.count);

    return {
      popularTokens: sortedTokens,
      importantAddresses: addressList,
      stats: { swapCount, transferCount, totalCount: events.length }
    };
  }, [events]);

  // Helper function to get blockchain explorer URL
  const getExplorerUrl = (hash: string, chain: Chain): string => {
    if (chain === 'eth') {
      return `https://etherscan.io/tx/${hash}`;
    } else if (chain === 'sol') {
      return `https://solscan.io/tx/${hash}`;
    }
    return '#';
  };
  
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Type filter - only show functional types
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Enhanced search: tokens, transaction hash, addresses, descriptions
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => {
        // Search in description for token mentions (more comprehensive)
        const descriptionMatch = event.description.toLowerCase().includes(query);
        // Search in hash
        const hashMatch = event.hash.toLowerCase().includes(query);
        // Search in token symbol (more comprehensive)
        const tokenMatch = event.tokenSymbol && event.tokenSymbol.toLowerCase().includes(query);
        // Search in addresses if they exist
        const fromMatch = event.fromAddress && event.fromAddress.toLowerCase().includes(query);
        const toMatch = event.toAddress && event.toAddress.toLowerCase().includes(query);
        // Search in transaction ID
        const idMatch = event.id.toLowerCase().includes(query);
        // Search for common token names in description (like "PEPE", "SOL", "USDC", etc.)
        const tokenInDescriptionMatch = event.description.toLowerCase().includes(query);
        // Search in any amount or additional fields that might contain token info
        const amountMatch = event.amount && event.amount.toString().toLowerCase().includes(query);
        
        return descriptionMatch || hashMatch || tokenMatch || fromMatch || toMatch || idMatch || tokenInDescriptionMatch || amountMatch;
      });
    }

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      filtered = filtered.filter(event => new Date(event.timestamp).getTime() >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day
      filtered = filtered.filter(event => new Date(event.timestamp).getTime() <= toDate);
    }

    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events, selectedType, searchQuery, dateFrom, dateTo]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
  
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Reset to page 1 when search/filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: 'all' | 'swap' | 'other') => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || dateFrom || dateTo;

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
            <p className="text-slate-600 dark:text-slate-300">
              {stats.totalCount} transactions • {stats.swapCount} swaps • {stats.transferCount} transfers
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>

        {/* Enhanced Search Bar with Date Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by token (PEPE, SOL, USDC), address, or transaction hash..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Transaction Type Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('all')}
            className="gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <Coins className="w-4 h-4" />
            All ({stats.totalCount})
          </Button>
          <Button
            variant={selectedType === 'swap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('swap')}
            className="gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <ArrowUpDown className="w-4 h-4" />
            Swaps ({stats.swapCount})
          </Button>
          <Button
            variant={selectedType === 'other' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('other')}
            className="gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Other ({stats.transferCount})
          </Button>
        </div>

        {/* Quick Search Options */}
        <div className="space-y-3 mb-4">
          {popularTokens.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Popular tokens:</p>
              <div className="flex flex-wrap gap-2">
                {popularTokens.map(token => (
                  <Button
                    key={token}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearchChange(token)}
                    className="text-xs"
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {importantAddresses.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Important addresses:</p>
              <div className="flex flex-wrap gap-2">
                {importantAddresses.map(({ address, label, count }) => (
                  <Button
                    key={address}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearchChange(address)}
                    className="text-xs"
                    title={`${count} interactions`}
                  >
                    {label} ({count})
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {hasActiveFilters ? 'Try adjusting your search or filters' : 'No transaction data available'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} transactions</span>
              {totalPages > 1 && (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </div>
            {paginatedEvents.map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.type === 'swap' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300'
                      }`}>
                        {event.type === 'swap' ? (
                          <ArrowUpDown className="w-3 h-3 mr-1" />
                        ) : (
                          <Coins className="w-3 h-3 mr-1" />
                        )}
                        PROGRAM INTERACTION
                      </span>
                      {event.tokenSymbol && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {event.tokenSymbol}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded font-mono">
                        {event.hash.substring(0, 12)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(event.hash, event.chain), '_blank')}
                        className="text-xs h-6 px-2"
                      >
                        View <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}