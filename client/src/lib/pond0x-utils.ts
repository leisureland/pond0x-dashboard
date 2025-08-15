/**
 * Utility functions for Pond0x data processing
 */

// Badge emoji mapping
const BADGE_EMOJI_MAP: Record<string, string> = {
  'diamond': '💎',
  'pork': '🐷',
  'chef': '👨‍🍳',
  'points': '✨',
  'swap': '🤝'
} as const;

/**
 * Get emoji for a badge type
 */
export function getBadgeEmoji(badge: string): string {
  return BADGE_EMOJI_MAP[badge.toLowerCase()] || '🏆';
}

/**
 * Format Unix timestamp to readable date
 */
export function formatUnixTimestamp(timestamp: string | number): string {
  const date = new Date(parseInt(timestamp.toString()) * 1000);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric' 
  });
}

/**
 * Calculate days ago from Unix timestamp
 */
export function getDaysAgo(timestamp: string | number): number {
  const date = new Date(parseInt(timestamp.toString()) * 1000);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Parse badges string into array
 */
export function parseBadges(badgesString: string): string[] {
  return badgesString 
    ? badgesString.split(',').map((b: string) => b.trim()).filter(Boolean)
    : [];
}

/**
 * Format boolean to display string
 */
export function formatBooleanDisplay(value: boolean): string {
  return value ? 'TRUE' : 'FALSE';
}
