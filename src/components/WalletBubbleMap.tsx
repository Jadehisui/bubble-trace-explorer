
import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { BubbleMap } from './BubbleMap';
import { TokenData } from '../types';
import { getTokenInfo, getTokenHolders, formatBalance } from '../services/suiService';
import { Moon, Stars } from 'lucide-react';

export const WalletBubbleMap: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWalletPositions = (holders: any[], decimals: number) => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
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
      console.log('Searching for coin type:', coinType);
      
      // Fetch token info and holders in parallel
      const [tokenInfo, holders] = await Promise.all([
        getTokenInfo(coinType),
        getTokenHolders(coinType, 50)
      ]);

      if (holders.length === 0) {
        setError(`No holders found for token "${coinType}". Please verify the contract address.`);
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
            <Moon className="w-8 h-8 text-slate-300" />
            <h1 className="text-4xl font-bold text-slate-100 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-300 bg-clip-text text-transparent">
              SUI BUBBLE MAP
            </h1>
            <Stars className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Explore real token distribution on the Sui blockchain. Enter any coin contract address to discover the top 50 holders.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
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
              <div className="text-slate-300">Scanning the Sui blockchain...</div>
            </div>
          </div>
        )}

        {/* Bubble Map */}
        {!isLoading && tokenData && (
          <div className="space-y-6">
            <BubbleMap wallets={tokenData.wallets} tokenSymbol={tokenData.symbol} />
            
            {/* Token Stats */}
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                <Stars className="w-4 h-4" />
                Token Information:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                <div>
                  <strong className="text-indigo-300">Symbol:</strong> {tokenData.symbol}
                </div>
                <div>
                  <strong className="text-indigo-300">Name:</strong> {tokenData.name}
                </div>
                <div>
                  <strong className="text-indigo-300">Holders Found:</strong> {tokenData.wallets.length}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                <Stars className="w-4 h-4" />
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
                  <strong className="text-indigo-300">• Larger bubbles</strong> indicate higher percentage holdings
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        {!tokenData && !isLoading && !error && (
          <div className="text-center text-slate-400 mt-12">
            <div className="text-lg mb-4 flex items-center justify-center gap-2">
              <Moon className="w-5 h-5" />
              Enter a Sui coin contract address to begin:
            </div>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => handleSearch('0x2::sui::SUI')} 
                className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-indigo-300 rounded-lg border border-slate-600/50 transition-all duration-300 hover:border-indigo-400/50 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20 text-lg"
              >
                Try SUI Native Token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
