
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

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

    // Try to get total supply
    let totalSupply = '0';
    try {
      const supply = await suiClient.getTotalSupply({ coinType });
      totalSupply = supply.value;
    } catch (error) {
      console.log('Could not fetch total supply:', error);
    }

    return {
      symbol: metadata.symbol || 'UNKNOWN',
      name: metadata.name || 'Unknown Token',
      decimals: metadata.decimals || 0,
      totalSupply
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw new Error('Failed to fetch token information');
  }
};

export const getTokenHolders = async (
  coinType: string, 
  limit: number = 50
): Promise<TokenHolder[]> => {
  try {
    console.log('Fetching holders for coin type:', coinType);
    
    // Get recent transactions to find holders
    const transactions = await suiClient.queryTransactionBlocks({
      filter: {
        MoveFunction: {
          package: coinType.split('::')[0],
          module: coinType.split('::')[1],
          function: null
        }
      },
      options: {
        showInput: true,
        showEvents: true,
        showEffects: true,
        showBalanceChanges: true,
      },
      limit: 200,
    });

    console.log('Found transactions:', transactions.data.length);

    // Process transactions to find holders
    const holderMap = new Map<string, bigint>();
    
    for (const tx of transactions.data) {
      if (!tx.balanceChanges) continue;
      
      // Look for balance changes involving our coin type
      for (const change of tx.balanceChanges) {
        if (change.coinType === coinType && BigInt(change.amount) > 0) {
          const owner = typeof change.owner === 'object' && 'AddressOwner' in change.owner 
            ? change.owner.AddressOwner 
            : change.owner;
          
          if (typeof owner === 'string') {
            const current = holderMap.get(owner) || BigInt(0);
            holderMap.set(owner, current + BigInt(change.amount));
          }
        }
      }
    }

    console.log('Found holders:', holderMap.size);

    // Convert to array and calculate percentages
    const holders: TokenHolder[] = [];
    const totalAmount = Array.from(holderMap.values()).reduce((sum, balance) => sum + balance, BigInt(0));

    for (const [address, balance] of holderMap.entries()) {
      const percentage = totalAmount > 0 
        ? Number((balance * BigInt(10000) / totalAmount)) / 100 
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
    throw new Error('Failed to fetch token holder data');
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

// Utility function to validate coin type
export const isValidCoinType = (coinType: string): boolean => {
  return /^0x[a-fA-F0-9]+::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*$/.test(coinType);
};
