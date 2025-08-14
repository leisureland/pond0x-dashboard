export type Chain = "eth" | "sol";

export type SocialInfo = { 
  platform: "x"; 
  handle: string; 
  source: "pond0x" | "local" | "none" 
};

export async function resolveXForWallet(params: { chain: Chain; address: string }): Promise<SocialInfo> {
  // Skip API calls entirely to avoid fetch errors in development
  // In production, these endpoints would be available through the Pond0x platform
  
  // Check localStorage for user-saved handles
  try {
    const localKey = `xmap:${params.chain}:${params.address}`;
    const localHandle = localStorage.getItem(localKey);
    if (localHandle) {
      return { platform: "x", handle: localHandle, source: "local" };
    }
  } catch {
    // Continue to none
  }

  // Default: no handle found
  return { platform: "x", handle: "", source: "none" };
}

export function saveLocalXHandle(chain: Chain, address: string, handle: string): void {
  try {
    const localKey = `xmap:${chain}:${address}`;
    if (handle.trim()) {
      localStorage.setItem(localKey, handle.trim());
    } else {
      localStorage.removeItem(localKey);
    }
  } catch {
    // Fail silently
  }
}