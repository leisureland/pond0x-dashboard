// Use built-in fetch for Node.js 18+

// Types matching the Pond0x manifest structure
export interface Pond0xManifest {
  swaps: number;
  bxSwaps?: number;
  hasTwitter: boolean;
  badges: string[];
  cope: boolean;
  isPro: boolean;
  proAgo: number;
  walletAddress: string;
}

export interface Pond0xMiningData {
  hasActiveMining: boolean;
  miningSignature: string | null;
  sessionDetails?: Pond0xMiningSession | null;
  totalSessions?: number;
  claimEstimate?: number;
}

export interface Pond0xMiningSession {
  sig: string;
  reward: number;
  status: string;
  slashes: number;
  min: number;
  boost: number;
  priority: number;
  no: number;
  peers: number;
  m: any[];
}

export async function fetchPond0xManifest(solAddress: string): Promise<Pond0xManifest | null> {
  try {
    console.log(`Fetching Pond0x manifest data for: ${solAddress}`);
    
    // Try Supabase endpoint discovered from cary0x.github.io JavaScript analysis
    const supabaseUrl = 'https://vkqjvwxzsxilnsmpngmc.supabase.co/rest/v1';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcWp2d3h6c3hpbG5zbXBuZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwODExMjMsImV4cCI6MjA0MTY1NzEyM30.u9gf6lU2fBmf0aiC7SYH4vVeWMRnGRu4ZZ7xOGl-XuI';
    
    // Prioritize Cary0x API endpoints for complete manifest data, then official pond0x.com for mining verification
    const caryApiUrl = 'https://www.cary0x.com/api';
    const pond0xApiUrl = 'https://www.pond0x.com/api';
    const endpoints = [
      // Cary0x API endpoints (primary source for complete manifest data)
      { url: `${caryApiUrl}/manifest/${solAddress}`, method: 'GET', isCary: true },
      { url: `${caryApiUrl}/health/${solAddress}`, method: 'GET', isCary: true },
      
      // Official pond0x.com API endpoints (for mining verification only)
      { url: `${pond0xApiUrl}/solana/mining/session/${solAddress}`, method: 'GET', isPond0x: true },

      // Fallback to Supabase if Cary0x APIs don't work
      { url: `${supabaseUrl}/mining?from=eq.${solAddress}`, method: 'GET', isSupabase: true, table: 'mining' },
      { url: `${supabaseUrl}/boostssol?wallet=eq.${solAddress}`, method: 'GET', isSupabase: true, table: 'boostssol' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint.url} (${endpoint.method})`);
        
        const fetchOptions: any = {
          method: endpoint.method,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
            'Origin': 'https://cary0x.github.io',
            'Referer': 'https://cary0x.github.io/'
          },
          signal: AbortSignal.timeout(10000)
        };
        
        if ((endpoint as any).isSupabase) {
          fetchOptions.headers['apikey'] = supabaseKey;
          fetchOptions.headers['Authorization'] = `Bearer ${supabaseKey}`;
        }
        
        if ((endpoint as any).isPond0x) {
          // Official pond0x.com API headers
          fetchOptions.headers['Accept'] = 'application/json';
          fetchOptions.headers['User-Agent'] = 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)';
          fetchOptions.headers['Origin'] = 'https://pond0x.com';
          fetchOptions.headers['Referer'] = 'https://pond0x.com/';
        }
        
        if ((endpoint as any).isCary) {
          fetchOptions.headers['Accept'] = 'application/json';
          fetchOptions.headers['User-Agent'] = 'Pond0xAnalytics/1.0';
        }
        
        if (endpoint.method === 'POST' && 'body' in endpoint && endpoint.body) {
          fetchOptions.headers['Content-Type'] = 'application/json';
          fetchOptions.body = JSON.stringify(endpoint.body);
        }
        
        const response = await fetch(endpoint.url, fetchOptions);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Success from ${endpoint.url}:`, data);
          
          // Process official pond0x.com API data (mining verification only - don't return here!)
          if ((endpoint as any).isPond0x && data) {
            if (endpoint.url.includes('/mining/session/')) {
              console.log('🎉 Found official pond0x.com mining session data!');
              // Just log the mining session, but continue to look for complete manifest data
              console.log(`Active mining session found: ${typeof data === 'string' ? data.substring(0, 20) + '...' : data}`);
              // Don't return here - continue to next endpoint for complete manifest data
            }
          }
          
          // Process Cary0x API data (authentic Pond0x manifest data!)
          if ((endpoint as any).isCary && data && typeof data === 'object') {
            if (endpoint.url.includes('/manifest/')) {
              // This is the authentic manifest data!
              console.log('🎉 Found authentic Pond0x manifest data!');
              return {
                swaps: data.proSwapsSol || data.swaps || 0,
                bxSwaps: data.proSwapsBx || 0,
                hasTwitter: data.hasTwitter || false,
                badges: data.badges ? data.badges.split(', ') : [],
                cope: data.cope || false,
                isPro: data.isPro || false,
                proAgo: parseInt(data.proAgo) || 0,
                walletAddress: solAddress
              };
            }
            
            if (endpoint.url.includes('/health/')) {
              // Health/mining data
              const stats = data.stats || {};
              return {
                swaps: 0, // Health endpoint doesn't have swap data
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 0,
                walletAddress: solAddress
              };
            }
          }
          
          // Process Supabase table data to create manifest (fallback)
          if ((endpoint as any).isSupabase && Array.isArray(data) && data.length > 0) {
            const table = (endpoint as any).table;
            
            if (table === 'mining') {
              return {
                swaps: 0,
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 999,
                walletAddress: solAddress
              };
            }
            
            if (table === 'boostssol') {
              return {
                swaps: data.length,
                hasTwitter: false,
                badges: [],
                cope: false,
                isPro: false,
                proAgo: 999,
                walletAddress: solAddress
              };
            }
          }
        } else {
          console.log(`Endpoint ${endpoint.url} returned ${response.status}`);
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint.url} failed:`, endpointError instanceof Error ? endpointError.message : 'Unknown error');
        continue;
      }
    }
    
    // If all API endpoints fail, return null so we can use blockchain data
    console.log('All Pond0x manifest endpoints failed');
    return null;
    
  } catch (error) {
    console.error('Error fetching Pond0x manifest:', error);
    return null;
  }
}

// Function to fetch detailed mining session from pond0x.com API with authentic boost values
export async function fetchPond0xMiningSession(signature: string, solAddress: string): Promise<Pond0xMiningSession | null> {
  try {
    const base64Param = Buffer.from(`${signature}:${solAddress}`).toString('base64');
    const userSessionEndpoint = `https://www.pond0x.com/api/user/minesession/${base64Param}`;
    
    console.log(`Fetching authentic user mining session: ${signature.substring(0, 20)}...`);
    
    // Try the user session endpoint first (has authentic boost values)
    try {
      const userResponse = await fetch(userSessionEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
          'Origin': 'https://pond0x.com',
          'Referer': 'https://pond0x.com/'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('🎉 Authentic user mining session with real boost values:', userData);
        return userData;
      }
    } catch (userError) {
      console.log('⚠️ User session API failed, trying fallback endpoint');
    }
    
    // Fallback to basic session details endpoint
    const basicEndpoint = `https://pond0x.com/api/solana/mining/session/details/${signature}`;
    const basicResponse = await fetch(basicEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
        'Origin': 'https://pond0x.com',
        'Referer': 'https://pond0x.com/'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('🎉 Basic mining session data (limited boost info):', basicData);
      return basicData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching mining session details:', error);
    return null;
  }
}

// New function to fetch mining data from official pond0x.com API
export async function fetchPond0xMining(solAddress: string): Promise<Pond0xMiningData | null> {
  try {
    console.log(`Fetching official pond0x mining data for: ${solAddress}`);
    
    const pond0xApiUrl = 'https://www.pond0x.com/api';
    const endpoint = `${pond0xApiUrl}/solana/mining/session/${solAddress}`;
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Pond0xAnalytics/1.0)',
        'Origin': 'https://pond0x.com',
        'Referer': 'https://pond0x.com/'
      },
      signal: AbortSignal.timeout(10000)
    };
    
    const response = await fetch(endpoint, fetchOptions);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 Official pond0x mining API response:', data);
      
      // Check if we got a valid mining signature
      if (typeof data === 'string' && data.length > 40) {
        // Try to get detailed session data with authentic boost values
        const sessionData = await fetchPond0xMiningSession(data, solAddress);
        
        return {
          hasActiveMining: true,
          miningSignature: data,
          sessionDetails: sessionData,
          totalSessions: undefined, // Will need Cary0x health API for total count
          claimEstimate: undefined  // Will need Cary0x health API for estimate
        };
      }
    }
    
    console.log('No active mining session found in pond0x API');
    return {
      hasActiveMining: false,
      miningSignature: null
    };
    
  } catch (error) {
    console.error('Error fetching pond0x mining data:', error);
    return null;
  }
}

// Fallback function to create Pond0x-style data from blockchain transactions
export function createPond0xStyleManifest(
  solAddress: string, 
  swapCount: number, 
  hasConnectedSocial: boolean = false
): Pond0xManifest {
  return {
    swaps: swapCount,
    hasTwitter: hasConnectedSocial,
    badges: [], // No badges without real Pond0x data
    cope: false, // Assume not a coper
    isPro: false, // No Pro status without real data
    proAgo: 999, // High number indicates no Pro purchase
    walletAddress: solAddress
  };
}