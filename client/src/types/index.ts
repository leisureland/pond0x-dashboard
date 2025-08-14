export type Chain = "eth" | "sol";

export interface WalletEvent {
  id: string;
  chain: Chain;
  type: 'swap';
  description: string;
  timestamp: Date;
  hash: string;
  value?: number;
  token?: string;
  tokenSymbol?: string;
  tokenName?: string;
  contractAddress?: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: number;
}

export interface WalletStats {
  totalSwaps: number;
  miningRewards: number;
  pondProStatus: 'active' | 'inactive' | 'expired';
  pondProExpiry?: Date;
  totalValue: number;
  monthlyChange: number;
  pond0xData?: {
    manifest?: {
      swaps?: number;
      proSwapsSol?: number;
      proSwapsBx?: number;
      badges?: string;
      isPro?: boolean;
    };
    health?: {
      stats?: {
        mining_sessions?: number;
        priority?: number;
      };
    };
    mining?: any;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

export interface GlossaryTerm {
  id: string;
  name: string;
  definition: string;
  example: string;
  category?: string;
}

export type ChartPeriod = 'daily' | 'weekly' | 'monthly';
