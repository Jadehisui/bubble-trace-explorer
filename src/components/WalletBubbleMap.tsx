
import React, { useState } from 'react';
import { TransactionSearchForm } from './TransactionSearchForm';
import { BubbleMap } from './BubbleMap';
import { TokenData } from '../types';
import { getTokenInfo, getTransactionSenders, formatBalance } from '../services/suiService';
import { Moon, Stars, TrendingUp } from 'lucide-react';

export const WalletBubbleMap: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWalletPositions = (senders: any[], decimals: number, targetAddress: string) => {
    const centerX = 400;
    const centerY = 300;
    
    return senders.map((sender, index) => {
      // Arrange in concentric circles based on percentage
      const angle = (index * 2 * Math.PI) / Math.max(senders.length, 8);
      const distanceFromCenter = sender.percentage > 20 ? 50 : 
                                sender.percentage > 10 ? 100 : 
                                sender.percentage > 5 ? 150 : 200;
      
      return {
        id: (index + 1).toString(),
        address: sender.address,
        percentage: sender.percentage,
        balance: sender.totalAmount,
        formattedBalance: formatBalance(sender.totalAmount, decimals),
        transactionCount: sender.transactionCount,
        x: centerX + Math.cos(angle) * distanceFromCenter + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * distanceFromCenter + (Math.random() - 0.5) * 50,
        connections: index > 0 && Math.random() > 0.7 ? [(index).toString()] : undefined
      };
    });
  };

  const handleSearch = async (toAddress: string, coinType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Searching transactions for address:', toAddress, 'coin type:', coinType);
      
      // Fetch token info and transaction senders in parallel
      const [tokenInfo, senders] = await Promise.all([
        getTokenInfo(coinType),
        getTransactionSenders(toAddress, coinType, 50)
      ]);

      if (senders.length === 0) {
        setError(`No transactions found for "${coinType}" sent to "${toAddress.slice(0, 8)}...${toAddress.slice(-6)}". The address may not have received this token or the coin type may be incorrect.`);
        setTokenData(null);
        return;
      }

      // Generate positions for the bubble map
      const wallets = generateWalletPositions(senders, tokenInfo.decimals, toAddress);

      setTokenData({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        coinType,
        targetAddress: toAddress,
        wallets
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction data from Sui network.');
      setTokenData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-300" />
            <h1 className="text-4xl font-bold text-slate-100 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-300 bg-clip-text text-transparent">
              SUI TRANSACTION ANALYZER
            </h1>
            <Stars className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Discover who sent tokens to any Sui address. Enter a recipient address and coin type to visualize the top 50 senders as an interactive bubble map.
          </p>
        </div>

        {/* Search Form */}
        <div className="flex justify-center mb-8">
          <TransactionSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 mb-6 text-center backdrop-blur-sm">
            <div className="text-red-300 font-medium">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="relative w-8 h-8 mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-b-indigo-300/50 rounded-full animate-spin animation-delay-75"></div>
              </div>
              <div className="text-slate-300">Analyzing blockchain transactions...</div>
            </div>
          </div>
        )}

        {/* Bubble Map */}
        {!isLoading && tokenData && (
          <div className="space-y-6">
            <BubbleMap wallets={tokenData.wallets} tokenSymbol={tokenData.symbol} />
            
            {/* Token and Analysis Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                  <Stars className="w-4 h-4" />
                  Token Information:
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>
                    <strong className="text-indigo-300">Symbol:</strong> {tokenData.symbol}
                  </div>
                  <div>
                    <strong className="text-indigo-300">Name:</strong> {tokenData.name}
                  </div>
                  <div>
                    <strong className="text-indigo-300">Total Supply:</strong> {tokenData.totalSupply ? formatBalance(tokenData.totalSupply, tokenData.decimals || 0) : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analysis Results:
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>
                    <strong className="text-indigo-300">Target Address:</strong> {tokenData.targetAddress?.slice(0, 8)}...{tokenData.targetAddress?.slice(-6)}
                  </div>
                  <div>
                    <strong className="text-indigo-300">Unique Senders:</strong> {tokenData.wallets.length}
                  </div>
                  <div>
                    <strong className="text-indigo-300">Total Transactions:</strong> {tokenData.wallets.reduce((sum, w) => sum + (w.transactionCount || 0), 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Navigation Guide:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <strong className="text-indigo-300">• Click bubbles</strong> to view sender details
                </div>
                <div>
                  <strong className="text-indigo-300">• Scroll</strong> to zoom through space
                </div>
                <div>
                  <strong className="text-indigo-300">• Drag</strong> to navigate the cosmos
                </div>
                <div>
                  <strong className="text-indigo-300">• Larger bubbles</strong> indicate higher amounts sent
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        {!tokenData && !isLoading && !error && (
          <div className="text-center text-slate-400 mt-12">
            <div className="text-lg mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Enter an address and coin type to analyze transactions:
            </div>
            <div className="text-sm text-slate-500 max-w-2xl mx-auto">
              This tool searches the Sui blockchain for all transactions where the specified coin type was sent to your target address, 
              then visualizes the top 50 senders as an interactive bubble map.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
