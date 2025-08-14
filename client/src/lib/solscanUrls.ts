// Direct Solscan URL building functionality matching Cary's exact scandata approach
export class SolscanUrlBuilder {
  private static readonly BASE_URL = 'https://solscan.io';

  /**
   * Generate Hash Boost History URL - shows transactions with specific mining addresses
   */
  static getHashBoostHistoryUrl(address: string): string {
    const params = new URLSearchParams({
      exclude_amount_zero: 'false',
      remove_spam: 'false',
      from_address: address,
      to_address: '!8bVEtH3bXnpoS8mHCHkv6xfeT8EvG1KtWoTQvP3mx5nV,4ngqDt821wV2CjxoZLCLcTAPZNt6ZqpswoqyQEztsU36,!' + address,
      token_address: 'So11111111111111111111111111111111111111111'
    });
    return `${this.BASE_URL}/account/${address}?${params.toString()}#transfers`;
  }

  /**
   * Generate Mining Claim History URL - shows claims from mining contract
   */
  static getMiningClaimHistoryUrl(address: string): string {
    const params = new URLSearchParams({
      from_address: 'AYg4dKoZJudVkD7Eu3ZaJjkzfoaATUqfiv8w8pS53opT'
    });
    return `${this.BASE_URL}/account/${address}?${params.toString()}#transfers`;
  }

  /**
   * Generate Swap Reward History URL - shows swap rewards
   */
  static getSwapRewardHistoryUrl(address: string): string {
    const params = new URLSearchParams({
      from_address: '1orFCnFfgwPzSgUaoK6Wr3MjgXZ7mtk8NGz9Hh4iWWL',
      remove_spam: 'false',
      exclude_amount_zero: 'false'
    });
    return `${this.BASE_URL}/account/${address}?${params.toString()}#transfers`;
  }

  /**
   * Generate Pro Subscription History URL - shows Pro sub payments
   */
  static getProSubHistoryUrl(address: string): string {
    const params = new URLSearchParams({
      exclude_amount_zero: 'false',
      remove_spam: 'false',
      to_address: '2bsXHfqzWS3kgcgGifmffNCRokzgV1K9RMEiTcL6zQRF,GSMBLYht4JGmm1ZofyTFTGykYCwsenNQpRmiJ5fMnHpD',
      token_address: 'So11111111111111111111111111111111111111111',
      value: '5'
    });
    return `${this.BASE_URL}/account/${address}?${params.toString()}#transfers`;
  }

  /**
   * Generate wPond In/Out History URL - shows wPond token movements
   */
  static getWPondHistoryUrl(address: string): string {
    const params = new URLSearchParams({
      from_address: '!AYg4dKoZJudVkD7Eu3ZaJjkzfoaATUqfiv8w8pS53opT,!1orFCnFfgwPzSgUaoK6Wr3MjgXZ7mtk8NGz9Hh4iWWL',
      to_address: '!1orFCnFfgwPzSgUaoK6Wr3MjgXZ7mtk8NGz9Hh4iWWL',
      token_address: '3JgFwoYV74f6LwWjQWnr3YDPFnmBdwQfNyubv99jqUoq',
      remove_spam: 'false',
      exclude_amount_zero: 'false',
      visualize: 'true'
    });
    return `${this.BASE_URL}/account/${address}?${params.toString()}#transfers`;
  }

  /**
   * Get all Pond0x-specific URLs for a wallet (matching Cary's scandata)
   */
  static getAllPond0xUrls(address: string) {
    return {
      hashBoostHistory: this.getHashBoostHistoryUrl(address),
      miningClaimHistory: this.getMiningClaimHistoryUrl(address),
      swapRewardHistory: this.getSwapRewardHistoryUrl(address),
      proSubHistory: this.getProSubHistoryUrl(address),
      wPondHistory: this.getWPondHistoryUrl(address)
    };
  }

  /**
   * Get all URLs (kept for backward compatibility)
   */
  static getAllUrls(address: string) {
    return this.getAllPond0xUrls(address);
  }

  /**
   * Open Solscan URL in new tab
   */
  static openInNewTab(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Copy Solscan URL to clipboard
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  }
}