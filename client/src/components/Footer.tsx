import { motion } from 'framer-motion';
import { Link } from 'wouter';

export function Footer() {
  return (
    <motion.footer
      className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Read-only, public data only. Twitter verification status checked via Pond0x APIs.
          </p>
          <div className="flex justify-center space-x-6 mt-4 mb-2">
            <Link href="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms of Use
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Built with ❤️ for the Pond0x community
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
