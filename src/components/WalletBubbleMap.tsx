
import React, { useState } from 'react';
import { TokenSearchForm } from './TokenSearchForm';
import { BubbleMap } from './BubbleMap';
import { TokenData } from '../types';
import { getTokenInfo, getTokenHolders, formatBalance } from '../services/suiService';
import { Moon, Stars, TrendingUp } from 'lucide-react';

export const WalletBubbleMap: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWalletPositions = (holders: any[], decimals: number) => {
    const centerX = 400;
    const centerY = 300;
    
    return holders.map((holder, index) => {
      // Arrange in concentric circles based on percentage
      const angle = (index * 2 * Math.PI) / Math.max(holders.length, 8);
      const distanceFromCenter = holder.percentage > 20 ? 50 : 
                                holder.percentage > 10 ? 100 : 
                                holder.percentage > 5 ? 150 : 200;
      
      return {
        id: (index + 1).toString(),
        address: holder.address,
        percentage: holder.percentage,
        balance: holder.balance,
        formattedBalance: formatBalance(holder.balance, decimals),
        x: centerX + Math.cos(angle) * distanceFromCenter + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * distanceFromCenter + (Math.random() - 0.5) * 50,
        connections: index > 0 && Math.random() > 0.7 ? [(index).toString()] : undefined
      };
    });
  };

  const handleSearch = async (coinType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Searching holders for coin type:', coinType);
      
      // Fetch token info and holders in parallel
      const [tokenInfo, holders] = await Promise.all([
        getTokenInfo(coinType),
        getTokenHolders(coinType, 50)
      ]);

      if (holders.length === 0) {
        setError(`No holders found for "${coinType}". The coin type may be incorrect or have no current holders.`);
        setTokenData(null);
        return;
      }

      // Generate positions for the bubble map
      const wallets = generateWalletPositions(holders, tokenInfo.decimals);

      setTokenData({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        coinType,
        wallets
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token data from Sui network.');
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
           
            <h1 className="text-4xl font-bold text-slate-100 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-300 bg-clip-text text-transparent">
              Moon Bubble.
            </h1>
            <Stars className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Discover the top 50 holders of any Sui token. Enter a coin type to visualize the distribution as an interactive bubble map.
          </p>
        </div>

        {/* Search Form */}
        <div className="flex justify-center mb-8">
          <TokenSearchForm onSearch={handleSearch} isLoading={isLoading} />
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
              <div className="text-slate-300">Finding token holders...</div>
            </div>
          </div>
        )}

        {/* Bubble Map */}
        {!isLoading && tokenData && (
          <div className="space-y-6">
            <BubbleMap wallets={tokenData.wallets} tokenSymbol={tokenData.symbol} />
            
            {/* Token Info */}
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
                  Holder Analysis:
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>
                    <strong className="text-indigo-300">Top Holders:</strong> {tokenData.wallets.length}
                  </div>
                  <div>
                    <strong className="text-indigo-300">Largest Holder:</strong> {tokenData.wallets[0]?.percentage.toFixed(2)}%
                  </div>
                  <div>
                    <strong className="text-indigo-300">Distribution:</strong> {tokenData.wallets.filter(w => w.percentage > 5).length} major holders
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
                  <strong className="text-indigo-300">• Click bubbles</strong> to view holder details
                </div>
                <div>
                  <strong className="text-indigo-300">• Scroll</strong> to zoom through space
                </div>
                <div>
                  <strong className="text-indigo-300">• Drag</strong> to navigate the cosmos
                </div>
                <div>
                  <strong className="text-indigo-300">• Larger bubbles</strong> indicate higher token holdings
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
              Enter a coin type to analyze token holders:
            </div>
            <div className="text-sm text-slate-500 max-w-2xl mx-auto">
              This tool searches the Sui blockchain for the top 50 holders of any token, 
              then visualizes their holdings as an interactive bubble map.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
