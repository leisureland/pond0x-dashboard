import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Search, Coins, Image, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolscanUrlBuilder } from '@/lib/solscanUrls';
import { useToast } from '@/hooks/use-toast';

interface SolscanIntegrationProps {
  solanaAddress: string;
  className?: string;
}

export function SolscanIntegration({ solanaAddress, className = '' }: SolscanIntegrationProps) {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const solscanUrls = SolscanUrlBuilder.getAllPond0xUrls(solanaAddress);

  const handleOpenUrl = (url: string, type: string) => {
    SolscanUrlBuilder.openInNewTab(url);
  };

  const handleCopyUrl = async (url: string, type: string) => {
    const success = await SolscanUrlBuilder.copyToClipboard(url);
    if (success) {
      setCopiedUrl(url);
      toast({
        title: "URL copied",
        description: `${type} URL copied to clipboard`
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive"
      });
    }
  };

  const urlItems = [
    {
      title: 'Hash Boost History',
      description: 'Mining boost transactions and rewards',
      url: solscanUrls.hashBoostHistory,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      type: 'Hash Boost History'
    },
    {
      title: 'Mining Claim History',
      description: 'Mining reward claims from contracts',
      url: solscanUrls.miningClaimHistory,
      icon: Coins,
      color: 'from-emerald-500 to-green-500',
      type: 'Mining Claim History'
    },
    {
      title: 'Swap Reward History',
      description: 'Rewards earned from swapping activities',
      url: solscanUrls.swapRewardHistory,
      icon: Search,
      color: 'from-cyan-500 to-blue-500',
      type: 'Swap Reward History'
    },
    {
      title: 'Pro Sub History',
      description: 'PondPro subscription payments',
      url: solscanUrls.proSubHistory,
      icon: Image,
      color: 'from-amber-500 to-orange-500',
      type: 'Pro Sub History'
    },
    {
      title: 'wPond In/Out History',
      description: 'wPond token transfers and movements',
      url: solscanUrls.wPondHistory,
      icon: ExternalLink,
      color: 'from-pink-500 to-rose-500',
      type: 'wPond In/Out History'
    }
  ];

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-slate-50/90 to-white/90 dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
            Pond0x Scan Data
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Direct links to Pond0x-specific transaction history on Solscan</p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {urlItems.map((item, index) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all duration-200 group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(item.url, item.type)}
                    className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-600 transition-opacity"
                    data-testid={`copy-solscan-${item.type.toLowerCase()}`}
                  >
                    <Copy className={`w-4 h-4 ${copiedUrl === item.url ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenUrl(item.url, item.type)}
                    className={`h-8 px-3 bg-gradient-to-r ${item.color} hover:opacity-90 text-white text-xs font-medium transition-all duration-200`}
                    data-testid={`open-solscan-${item.type.toLowerCase()}`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          

        </CardContent>
      </Card>
    </div>
  );
}
