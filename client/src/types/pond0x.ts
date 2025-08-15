/**
 * TypeScript types for Pond0x data structures
 */

export interface Pond0xManifestData {
  swaps: number;
  bxSwaps?: number;
  hasTwitter: boolean;
  badges: string[];
  cope: boolean;
  isPro: boolean;
  proAgo: number;
  proExpiry?: string;
  walletAddress: string;
}

export interface Pond0xApiResponse {
  success: boolean;
  address: string;
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    description: string;
    amount: number;
    success: boolean;
  }>;
  pond0xData: {
    isPro: boolean;
    proSwapsSol: number;
    proSwapsBx: number;
    badges: string;
    hasTwitter: boolean;
    cope: boolean;
    proAgo: number | string;
    proExpiry?: string;
  };
  healthData?: {
    account: string;
    stats: {
      mining_sessions: number;
      in_mempool: number;
      sent: number;
      failed: number;
      drifted: number;
      drift_risk: number;
      priority: number;
      estimates: {
        sol_usd: number;
        wpond_usd: number;
        drift_risk_usd: number;
        max_claim_estimate_usd: number;
        drifted_usd: number;
      };
      health: number;
    };
    ai_beta: string[];
    data: { msg: string };
  };
  miningSessionData?: {
    sig: string;
    reward: number;
    status: string;
    slashes: number;
    min: number;
    boost: number;
    piority: number;
    no: number;
    peers: number;
    m: unknown[];
  };
  miningStats?: {
    sessions: number;
    hasActiveMining: boolean;
    swapBoost: number;
    swapRatio: string;
  };
  stats?: {
    totalSwaps: number;
    solSwaps: number;
    bxSwaps: number;
    badgeCount: number;
    isPro: boolean;
    miningSessions: number;
    swapBoost: number;
  };
}

export type BadgeType = 'diamond' | 'pork' | 'chef' | 'points' | 'swap';

export interface CalendarExportOptions {
  title: string;
  description: string;
  date: Date;
}

export interface ToastMessage {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}
