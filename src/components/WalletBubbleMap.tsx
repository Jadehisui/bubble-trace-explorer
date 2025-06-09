
import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { BubbleMap } from './BubbleMap';
import { TokenData } from '../types';
import { mockTokenData } from '../data/mockData';

export const WalletBubbleMap: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, use mock data
      const data = mockTokenData[symbol];
      
      if (data) {
        setTokenData(data);
      } else {
        setError(`Token "${symbol}" not found. Try SHIB or SUI.`);
        setTokenData(null);
      }
    } catch (err) {
      setError('Failed to fetch token data. Please try again.');
      setTokenData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Sui Token Wallet Map
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Visualize token distribution across wallet holders. Search for any Sui token 
            to see the network of holders and their connections.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-center">
            <div className="text-red-400 font-medium">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-300">Loading token data...</div>
            </div>
          </div>
        )}

        {/* Bubble Map */}
        {!isLoading && tokenData && (
          <div className="space-y-6">
            <BubbleMap 
              wallets={tokenData.wallets} 
              tokenSymbol={tokenData.symbol}
            />
            
            {/* Legend */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">How to use:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <strong className="text-cyan-400">• Click bubbles</strong> to view wallet details
                </div>
                <div>
                  <strong className="text-cyan-400">• Scroll</strong> to zoom in/out
                </div>
                <div>
                  <strong className="text-cyan-400">• Drag</strong> to pan around the map
                </div>
                <div>
                  <strong className="text-cyan-400">• Lines</strong> show wallet connections
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        {!tokenData && !isLoading && !error && (
          <div className="text-center text-slate-400 mt-12">
            <div className="text-lg mb-4">Try searching for:</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSearch('SHIB')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded 
                           border border-slate-600 transition-colors"
              >
                SHIB
              </button>
              <button
                onClick={() => handleSearch('SUI')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded 
                           border border-slate-600 transition-colors"
              >
                SUI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
