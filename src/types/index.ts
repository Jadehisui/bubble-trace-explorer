
export interface Wallet {
  id: string;
  address: string;
  percentage: number;
  tag?: string;
  x: number;
  y: number;
  connections?: string[];
}

export interface TokenData {
  symbol: string;
  name: string;
  wallets: Wallet[];
}

export interface PopupData {
  wallet: Wallet;
  x: number;
  y: number;
  visible: boolean;
}
