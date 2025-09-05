// API Caching utility to handle rate limiting and improve performance
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  getStale(key: string): any | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getStats(): { size: number; entries: Array<{ key: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000),
      ttl: Math.round((entry.expiresAt - now) / 1000)
    }));

    return { size: this.cache.size, entries };
  }
}

// Singleton instance
export const apiCache = new ApiCache();

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) break;

      // Check if it's a rate limiting error
      const isRateLimit = error instanceof Error && 
        (error.message.includes('429') || error.message.includes('RATE_LIMITED'));

      if (!isRateLimit && attempt > 0) {
        // If it's not rate limiting and we've already tried once, don't keep retrying
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ API retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced fetch with caching and retry logic
export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  cacheTtl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<{ data: any; fromCache: boolean; isStale: boolean }> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Try to get from cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit for ${url}`);
    return { data: cached, fromCache: true, isStale: false };
  }

  // If not in cache, fetch with retry logic
  try {
    const data = await retryWithBackoff(async () => {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        throw new Error(`RATE_LIMITED: ${url}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      
      const jsonData = await response.json();
      
      // Check for API-level errors
      if (jsonData.error) {
        throw new Error(`API Error: ${jsonData.error}`);
      }
      
      return jsonData;
    });

    // Cache successful response
    apiCache.set(cacheKey, data, cacheTtl);
    console.log(`✅ Fresh data cached for ${url}`);
    return { data, fromCache: false, isStale: false };

  } catch (error) {
    console.error(`❌ Failed to fetch ${url}:`, error);
    
    // Try to return stale cache data as fallback
    const staleData = apiCache.getStale(cacheKey);
    if (staleData) {
      console.log(`⚠️ Using stale cache data for ${url}`);
      return { data: staleData, fromCache: true, isStale: true };
    }
    
    throw error;
  }
}
