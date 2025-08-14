import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AddressForm } from '@/components/AddressForm';
import { UnifiedAccountConnection } from '@/components/UnifiedAccountConnection';

export default function Home() {
  const [, setLocation] = useLocation();

  const handleAddressSubmit = (ethAddress: string, solAddress: string) => {
    const params = new URLSearchParams();
    if (ethAddress) params.set('eth', ethAddress);
    if (solAddress) params.set('sol', solAddress);
    setLocation(`/results?${params.toString()}`);
  };

  const handleUnifiedAccountFound = (account: any) => {
    const params = new URLSearchParams();
    if (account.ethAddress) params.set('eth', account.ethAddress);
    if (account.solAddress) params.set('sol', account.solAddress);
    if (account.xHandle) params.set('x', account.xHandle);
    setLocation(`/results?${params.toString()}`);
  };

  const handleDemo = () => {
    setLocation('/results?eth=0x1234567890123456789012345678901234567890&sol=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&demo=true');
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/50">
      <div className="relative">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-900/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/20 to-transparent dark:from-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/20 to-transparent dark:from-purple-900/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <section className="pt-24 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-purple-800 to-blue-900 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                  Sumguy's Unofficial Pond0x Dashboard
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">Get analytics for the Pond0x ecosystem. Enter your Solana wallet address to see your mining stats, PondPro status, and real-time insights.</p>
            </motion.div>

            {/* Modern Address Input */}
            <AddressForm onSubmit={handleAddressSubmit} onDemo={handleDemo} />
          </section>

          {/* Intro & Disclaimer Section */}
          <section className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Please note:</h2>
                </div>
                
                <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>This is an unofficial, community-built dashboard for quick, visual access to your Pond0x mining and swapping data all in one place. Just enter your wallet address for an instant snapshot—no wallet connection needed.</p>
                  
                  <p>
                    Big thanks to{" "}
                    <a 
                      href="https://twitter.com/Cary0x2" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline decoration-blue-600/30 hover:decoration-blue-600/60 transition-colors"
                    >
                      @Cary0x2
                    </a>{" "}
                    for the data sources and to the{" "}
                    <a 
                      href="https://www.pond0x.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline decoration-blue-600/30 hover:decoration-blue-600/60 transition-colors"
                    >
                      Pond0x
                    </a>{" "}
                    for making this ecosystem possible.
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Disclaimer:</strong> Independent, unofficial, and for informational purposes only. I do not represent Pond0x. Data may be inaccurate or change without notice. Not financial advice. Always verify before making decisions. Use at your own risk.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

        </div>
      </div>
    </div>
  );
}