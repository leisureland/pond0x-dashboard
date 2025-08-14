import { motion } from 'framer-motion';
import { ArrowUpDown, DollarSign, CheckCircle, TrendingUp, HelpCircle, Zap } from 'lucide-react';
import { WalletStats } from '@/types';
import { formatCurrency, formatEth, formatNumber, formatPercentage } from '@/lib/format';

interface StatsCardsProps {
  stats: WalletStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Mining Transactions',
      value: formatNumber(stats.totalSwaps),
      change: '✓ Health monitoring',
      icon: ArrowUpDown,
      tooltip: 'Mining-related transactions and activity count',
      changeType: 'positive' as const
    },
    {
      title: 'Mining Sessions',
      value: stats.pondProStatus ? formatNumber(stats.miningRewards) : 'Pro Required',
      change: stats.pondProStatus ? '✓ Live mining data' : '🔒 Requires PondPro',
      icon: Zap,
      tooltip: stats.pondProStatus ? 'Total mining sessions from Pond0x health API' : 'PondPro subscription required for mining data',
      changeType: stats.pondProStatus ? 'positive' as const : 'neutral' as const
    },
    {
      title: 'Mining Health Score',
      value: stats.pondProStatus ? '7/10' : 'Pro Required',
      change: stats.pondProStatus ? '✓ Excellent mining health' : '🔒 Requires PondPro',
      icon: CheckCircle,
      tooltip: stats.pondProStatus ? 'Your mining health score from Cary0x health API' : 'PondPro subscription required for health data',
      changeType: stats.pondProStatus ? 'positive' as const : 'neutral' as const
    },
    {
      title: 'Est. Mining Value',
      value: stats.pondProStatus ? formatCurrency(stats.totalValue) : 'Unavailable',
      change: stats.pondProStatus ? '✓ Real-time estimate' : '🔒 Requires PondPro',
      icon: TrendingUp,
      tooltip: stats.pondProStatus ? 'Maximum claim estimate in USD from Pond0x health API' : 'PondPro subscription required for mining estimates',
      changeType: stats.pondProStatus ? 'positive' as const : 'neutral' as const
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mining Health Data</h2>
        <p className="text-slate-600 dark:text-slate-400">Real-time mining performance metrics and health statistics</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2" data-testid={`text-${card.title.toLowerCase().replace(/\s+/g, '-')}-value`}>
                {card.value}
              </p>
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-md inline-block ${
              card.changeType === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400'
            }`}>
              {card.change}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
