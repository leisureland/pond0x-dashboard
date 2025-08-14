import { isAddress } from 'ethers';

export function validateEthereumAddress(address: string): boolean {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
