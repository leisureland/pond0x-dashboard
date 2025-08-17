import { motion } from 'framer-motion';
import { ExternalLink, Book, User, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pondIcon from '@/assets/pond-icon.png';
import caryProfile from '@/assets/cary-profile.jpg';

export default function Glossary() {
  const resources = [
    {
      title: "Pond0x Official Website", 
      description: "Official Pond0x platform for mining, staking, and ecosystem participation. Get the latest updates and official announcements.",
      url: "https://pond0x.com",
      icon: Database,
      primary: true,
      customIcon: pondIcon
    },
    {
      title: "Cary0x2's Unofficial Pond0x Info",
      description: "Your go-to resource for navigating the multifaceted world of Pond0x! This site is here to demystify the Pond0x ecosystem, offering accurate information, step-by-step guides, and clear answers to common issues.",
      url: "https://cary0x.github.io/",
      icon: User,
      primary: false,
      customIcon: caryProfile
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
              <Book className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
              Resources
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">For comprehensive Pond0x information, terminology, and ecosystem insights, visit the sources below.</p>
        </motion.div>

        {/* Resources Grid */}
        <div className="space-y-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  resource.primary 
                    ? 'ring-2 ring-blue-200/50 dark:ring-blue-400/30' 
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className={`rounded-xl p-4 flex items-center justify-center ${
                    resource.primary
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : 'bg-gradient-to-br from-slate-500 to-slate-600'
                  }`}>
                    {resource.customIcon ? (
                      <img 
                        src={resource.customIcon} 
                        alt={`${resource.title} logo`}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      Icon && <Icon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {resource.title}
                        {resource.primary && (
                          <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                            Official
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                    
                    <Button
                      asChild
                      className={`inline-flex items-center gap-2 ${
                        resource.primary
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : 'bg-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid={`link-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        Visit {resource.title.includes('Twitter') ? 'Profile' : 'Site'}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            asChild
            variant="outline"
            className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
          >
            <a href="/" data-testid="link-back-home">
              ← Back to Dashboard
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}