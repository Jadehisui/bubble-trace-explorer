import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { BubbleMap } from './BubbleMap';
import { TokenData } from '../types';
import { mockTokenData } from '../data/mockData';
import { Moon, Stars } from 'lucide-react';

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
        setError(`Token "${symbol}" not found in the cosmic void. Try SHIB or SUI.`);
        setTokenData(null);
      }
    } catch (err) {
      setError('Connection to the cosmic network failed. Please try again.');
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
              Lunar Token Observatory
            </h1>
            <Stars className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Explore the cosmic distribution of tokens across the digital universe. 
            Navigate through wallet constellations and discover the celestial holders.
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
              <div className="text-slate-300">Scanning the cosmic network...</div>
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
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                <Stars className="w-4 h-4" />
                Navigation Guide:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <strong className="text-indigo-300">• Click celestial bodies</strong> to view wallet details
                </div>
                <div>
                  <strong className="text-indigo-300">• Scroll</strong> to zoom through space
                </div>
                <div>
                  <strong className="text-indigo-300">• Drag</strong> to navigate the cosmos
                </div>
                <div>
                  <strong className="text-indigo-300">• Constellation lines</strong> show wallet connections
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
              Begin your cosmic journey:
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSearch('SHIB')}
                className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-indigo-300 rounded-lg 
                           border border-slate-600/50 transition-all duration-300 hover:border-indigo-400/50
                           backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20"
              >
                SHIB
              </button>
              <button
                onClick={() => handleSearch('SUI')}
                className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-indigo-300 rounded-lg 
                           border border-slate-600/50 transition-all duration-300 hover:border-indigo-400/50
                           backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20"
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
