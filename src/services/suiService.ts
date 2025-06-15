
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { CoinBalance } from '@mysten/sui.js/dist/cjs/types';

const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet'),
});

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
}

export const getTokenInfo = async (coinType: string): Promise<TokenInfo> => {
  try {
    const metadata = await suiClient.getCoinMetadata({ coinType });
    
    if (!metadata) {
      throw new Error('Token metadata not found');
    }

    return {
      symbol: metadata.symbol || 'UNKNOWN',
      name: metadata.name || 'Unknown Token',
      decimals: metadata.decimals || 0,
      totalSupply: '0' // Sui doesn't provide total supply directly
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw new Error('Failed to fetch token information');
  }
};

export const getTokenHolders = async (coinType: string, limit: number = 50): Promise<TokenHolder[]> => {
  try {
    console.log('Fetching holders for coin type:', coinType);
    
    // Get all coins of this type
    const coins = await suiClient.getAllCoins({
      coinType,
      limit,
    });

    console.log('Found coins:', coins.data.length);

    // Group by owner and sum balances
    const holderMap = new Map<string, bigint>();
    
    for (const coin of coins.data) {
      const currentBalance = holderMap.get(coin.owner) || BigInt(0);
      holderMap.set(coin.owner, currentBalance + BigInt(coin.balance));
    }

    // Convert to array and calculate percentages
    const holders: TokenHolder[] = [];
    const totalBalance = Array.from(holderMap.values()).reduce((sum, balance) => sum + balance, BigInt(0));

    for (const [address, balance] of holderMap.entries()) {
      const percentage = totalBalance > 0 
        ? Number((balance * BigInt(10000) / totalBalance)) / 100 
        : 0;

      holders.push({
        address,
        balance: balance.toString(),
        percentage
      });
    }

    // Sort by balance (descending) and take top holders
    holders.sort((a, b) => {
      const balanceA = BigInt(a.balance);
      const balanceB = BigInt(b.balance);
      return balanceA > balanceB ? -1 : balanceA < balanceB ? 1 : 0;
    });

    return holders.slice(0, limit);
  } catch (error) {
    console.error('Error fetching token holders:', error);
    throw new Error('Failed to fetch token holders');
  }
};

// Utility function to format balance with decimals
export const formatBalance = (balance: string, decimals: number): string => {
  const balanceBigInt = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const wholePart = balanceBigInt / divisor;
  const fractionalPart = balanceBigInt % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
};
