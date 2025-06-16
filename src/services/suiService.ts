
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet'),
});

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface TransactionSender {
  address: string;
  totalAmount: string;
  transactionCount: number;
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

export const getTransactionSenders = async (
  toAddress: string, 
  coinType: string, 
  limit: number = 50
): Promise<TransactionSender[]> => {
  try {
    console.log('Fetching transactions for address:', toAddress, 'coin type:', coinType);
    
    // Query transaction blocks with ToAddress filter
    const transactions = await suiClient.queryTransactionBlocks({
      filter: {
        ToAddress: toAddress
      },
      options: {
        showInput: true,
        showEvents: true,
        showEffects: true,
        showBalanceChanges: true,
      },
      limit: 200, // Fetch more to get better data
    });

    console.log('Found transactions:', transactions.data.length);

    // Process transactions to find coin transfers
    const senderMap = new Map<string, { amount: bigint; count: number }>();
    
    for (const tx of transactions.data) {
      if (!tx.balanceChanges) continue;
      
      // Look for balance changes involving our coin type
      for (const change of tx.balanceChanges) {
        if (change.coinType === coinType && 
            change.owner === toAddress && 
            BigInt(change.amount) > 0) {
          
          // Find the sender (should be in transaction inputs or from other balance changes)
          const sender = tx.transaction?.data.sender;
          if (sender && sender !== toAddress) {
            const current = senderMap.get(sender) || { amount: BigInt(0), count: 0 };
            senderMap.set(sender, {
              amount: current.amount + BigInt(change.amount),
              count: current.count + 1
            });
          }
        }
      }
    }

    console.log('Found senders:', senderMap.size);

    // Convert to array and calculate percentages
    const senders: TransactionSender[] = [];
    const totalAmount = Array.from(senderMap.values()).reduce((sum, data) => sum + data.amount, BigInt(0));

    for (const [address, data] of senderMap.entries()) {
      const percentage = totalAmount > 0 
        ? Number((data.amount * BigInt(10000) / totalAmount)) / 100 
        : 0;

      senders.push({
        address,
        totalAmount: data.amount.toString(),
        transactionCount: data.count,
        percentage
      });
    }

    // Sort by total amount (descending) and take top senders
    senders.sort((a, b) => {
      const amountA = BigInt(a.totalAmount);
      const amountB = BigInt(b.totalAmount);
      return amountA > amountB ? -1 : amountA < amountB ? 1 : 0;
    });

    return senders.slice(0, limit);
  } catch (error) {
    console.error('Error fetching transaction senders:', error);
    throw new Error('Failed to fetch transaction data');
  }
};

// Legacy function for backward compatibility - now returns empty array
export const getTokenHolders = async (coinType: string, limit: number = 50): Promise<TokenHolder[]> => {
  console.log('getTokenHolders called but deprecated for transaction analysis');
  return [];
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

// Utility function to validate Sui address
export const isValidSuiAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(address) || /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Utility function to validate coin type
export const isValidCoinType = (coinType: string): boolean => {
  return /^0x[a-fA-F0-9]+::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*$/.test(coinType);
};
