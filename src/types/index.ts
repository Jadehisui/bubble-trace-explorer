
export interface Wallet {
  id: string;
  address: string;
  percentage: number;
  balance?: string;
  formattedBalance?: string;
  transactionCount?: number;
  tag?: string;
  x: number;
  y: number;
  connections?: string[];
}

export interface TokenData {
  symbol: string;
  name: string;
  decimals?: number;
  totalSupply?: string;
  coinType?: string;
  targetAddress?: string;
  wallets: Wallet[];
}

export interface PopupData {
  wallet: Wallet;
  x: number;
  y: number;
  visible: boolean;
}
