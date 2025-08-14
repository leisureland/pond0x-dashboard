import { motion } from 'framer-motion';
import { WalletEvent } from '@/types';

interface CalendarHeatmapProps {
  events: WalletEvent[];
}

export function CalendarHeatmap({ events }: CalendarHeatmapProps) {
  // Generate a simple calendar grid for the last 84 days (12 weeks)
  const generateHeatmapData = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        count: dayEvents.length,
        intensity: Math.min(dayEvents.length, 4) // Cap at 4 for visual consistency
      });
    }
    
    return days;
  };

  const heatmapData = generateHeatmapData();

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-300 dark:bg-gray-600';
      case 1: return 'bg-cyan-500/20';
      case 2: return 'bg-cyan-500/40';
      case 3: return 'bg-cyan-500/60';
      case 4: return 'bg-cyan-500/80';
      default: return 'bg-slate-300 dark:bg-gray-600';
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-8 mb-8 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Activity Calendar</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Daily activity intensity over the past 12 weeks
        </p>
      </div>
      <div className="overflow-x-auto px-4">
        <div className="inline-grid grid-cols-12 gap-2 min-w-full" data-testid="calendar-heatmap">
          {heatmapData.map((day, index) => (
            <motion.div
              key={index}
              className={`w-6 h-6 rounded-lg ${getIntensityClass(day.intensity)} hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer`}
              title={`${day.date.toLocaleDateString()}: ${day.count} events`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              data-testid={`heatmap-day-${index}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-6 text-sm text-slate-600 dark:text-slate-300">
          <span>Less activity</span>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-slate-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="w-4 h-4 bg-cyan-500/20 rounded-lg"></div>
            <div className="w-4 h-4 bg-cyan-500/40 rounded-lg"></div>
            <div className="w-4 h-4 bg-cyan-500/60 rounded-lg"></div>
            <div className="w-4 h-4 bg-cyan-500/80 rounded-lg"></div>
          </div>
          <span>More activity</span>
        </div>
      </div>
    </motion.div>
  );
}
