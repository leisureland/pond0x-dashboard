import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  className?: string;
  colorScheme: 'cyan' | 'emerald' | 'orange' | 'purple' | 'slate';
  children?: ReactNode;
}

const colorSchemes = {
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-700/50',
    icon: 'text-cyan-600 dark:text-cyan-400',
    title: 'text-cyan-900 dark:text-cyan-100',
    value: 'text-cyan-700 dark:text-cyan-300',
    subtitle: 'text-cyan-600 dark:text-cyan-400'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-100',
    value: 'text-emerald-700 dark:text-emerald-300',
    subtitle: 'text-emerald-600 dark:text-emerald-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-700/50',
    icon: 'text-orange-600 dark:text-orange-400',
    title: 'text-orange-900 dark:text-orange-100',
    value: 'text-orange-700 dark:text-orange-300',
    subtitle: 'text-orange-600 dark:text-orange-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700/50',
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-900 dark:text-purple-100',
    value: 'text-purple-700 dark:text-purple-300',
    subtitle: 'text-purple-600 dark:text-purple-400'
  },
  slate: {
    bg: 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80',
    border: 'border-slate-200 dark:border-slate-700/50',
    icon: 'text-slate-600 dark:text-slate-400',
    title: 'text-slate-900 dark:text-white',
    value: 'text-slate-700 dark:text-slate-300',
    subtitle: 'text-slate-600 dark:text-slate-400'
  }
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle = "✅ Real API Data", 
  className,
  colorScheme,
  children 
}: StatCardProps) {
  const colors = colorSchemes[colorScheme];
  
  return (
    <div className={cn(
      colors.bg,
      'border',
      colors.border,
      'rounded-lg p-4 text-center',
      className
    )}>
      <div className="flex items-center gap-2 mb-2 justify-center">
        <span className={cn(colors.icon, 'text-lg')}>{icon}</span>
        <h4 className={cn('font-semibold', colors.title)}>{title}</h4>
      </div>
      <div className={cn('text-2xl font-bold mb-1', colors.value)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className={cn('text-xs mt-1 font-medium', colors.subtitle)}>
        {subtitle}
      </div>
      {children}
    </div>
  );
}
