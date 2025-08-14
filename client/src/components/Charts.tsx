import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { ChartPeriod, ChartData } from '@/types';
import { generateChartData } from '@/lib/mock';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

interface ChartsProps {
  ethAddress?: string;
  solAddress?: string;
}

export function Charts({ ethAddress, solAddress }: ChartsProps) {
  const [period, setPeriod] = useState<ChartPeriod>('daily');
  const [chartData, setChartData] = useState<ChartData>(() => generateChartData('daily', ethAddress, solAddress));

  useEffect(() => {
    setChartData(generateChartData(period, ethAddress, solAddress));
  }, [period, ethAddress, solAddress]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutData = {
    labels: ['Swaps', 'Mining', 'Staking', 'PondPro'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: [
        'rgb(6, 182, 212)',
        'rgb(16, 185, 129)',
        'rgb(99, 102, 241)',
        'rgb(245, 158, 11)'
      ],
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  return (
    <>
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      <motion.div
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Activity Overview</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Transaction volume and frequency over time</p>
          </div>
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as ChartPeriod[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
                className="capitalize"
                data-testid={`button-chart-${p}`}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative h-48" data-testid="chart-activity">
          <Line data={chartData} options={lineOptions} />
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Event Distribution</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Breakdown of different transaction types</p>
        </div>
        <div className="relative h-48" data-testid="chart-distribution">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </motion.div>
    </div>

    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      <motion.div
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Monthly Gas Fees</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">Ethereum</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">0.024 ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">Solana</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">0.0012 SOL</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-sm text-slate-600 dark:text-slate-300">Total USD</span>
              <span className="text-sm text-green-600 dark:text-green-400">$58.40</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Top Tokens</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">ETH</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">2.458</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">SOL</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">45.2</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">USDC</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">1,250</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">7D Change</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+12.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">30D Change</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+8.7%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-300">Best Day</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">+24.1%</span>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
