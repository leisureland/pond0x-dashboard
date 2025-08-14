// Wallet address memory functionality similar to Cary's implementation
const STORAGE_KEY = 'pond0x_saved_wallets';
const MAX_SAVED_WALLETS = 10;

export interface SavedWallet {
  address: string;
  nickname?: string;
  lastUsed: number;
  addedAt: number;
}

export class WalletMemory {
  static getSavedWallets(): SavedWallet[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      
      const wallets = JSON.parse(saved) as SavedWallet[];
      // Sort by last used, most recent first
      return wallets.sort((a, b) => b.lastUsed - a.lastUsed);
    } catch (error) {
      console.error('Error reading saved wallets:', error);
      return [];
    }
  }

  static saveWallet(address: string, nickname?: string): void {
    try {
      const existing = this.getSavedWallets();
      const now = Date.now();
      
      // Check if wallet already exists
      const existingIndex = existing.findIndex(w => w.address === address);
      
      if (existingIndex >= 0) {
        // Update existing wallet
        existing[existingIndex].lastUsed = now;
        if (nickname) existing[existingIndex].nickname = nickname;
      } else {
        // Add new wallet
        const newWallet: SavedWallet = {
          address,
          nickname,
          lastUsed: now,
          addedAt: now
        };
        existing.unshift(newWallet);
      }
      
      // Keep only the most recent MAX_SAVED_WALLETS
      const trimmed = existing.slice(0, MAX_SAVED_WALLETS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving wallet:', error);
    }
  }

  static removeWallet(address: string): void {
    try {
      const existing = this.getSavedWallets();
      const filtered = existing.filter(w => w.address !== address);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing wallet:', error);
    }
  }

  static updateWalletUsage(address: string): void {
    try {
      const existing = this.getSavedWallets();
      const wallet = existing.find(w => w.address === address);
      if (wallet) {
        wallet.lastUsed = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Error updating wallet usage:', error);
    }
  }
}