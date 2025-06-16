
import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { isValidCoinType } from '../services/suiService';

interface TokenSearchFormProps {
  onSearch: (coinType: string) => void;
  isLoading?: boolean;
}

export const TokenSearchForm: React.FC<TokenSearchFormProps> = ({ onSearch, isLoading }) => {
  const [coinType, setCoinType] = useState('');
  const [error, setError] = useState<string>('');

  const validateForm = () => {
    if (!coinType.trim()) {
      setError('Coin type is required');
      return false;
    }
    
    if (!isValidCoinType(coinType.trim())) {
      setError('Invalid coin type format (e.g., 0x7b888393d6a552819bb0a7f878183abaf04550bfb9546b20ea586d338210826f::moon::MOON)');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch(coinType.trim());
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coin Type Input */}
        <div className="space-y-2">
          <label htmlFor="coinType" className="block text-sm font-medium text-slate-200">
            Coin Type
          </label>
          <div className="relative">
            <input
              id="coinType"
              type="text"
              value={coinType}
              onChange={(e) => setCoinType(e.target.value)}
              placeholder="0x7b888393d6a552819bb0a7f878183abaf04550bfb9546b20ea586d338210826f::moon::MOON"
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg 
                         text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 
                         transition-all duration-200 backdrop-blur-sm hover:bg-slate-800/50 text-sm
                         ${error 
                           ? 'border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50' 
                           : 'border-slate-600/50 focus:ring-indigo-400/50 focus:border-indigo-400/50'
                         }`}
              disabled={isLoading}
            />
            {error && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-indigo-600/80 hover:bg-indigo-500/80 disabled:bg-slate-700/50
                       text-slate-100 rounded-lg transition-all duration-200 flex items-center gap-2
                       border border-indigo-500/30 hover:border-indigo-400/50 disabled:border-slate-600/30
                       hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Finding Holders...' : 'Find Token Holders'}
            {isLoading && (
              <div className="w-4 h-4 border-2 border-indigo-400/50 border-t-indigo-300 rounded-full animate-spin ml-2"></div>
            )}
          </button>
        </div>
      </form>

      {/* Example */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-400">
          Example: <span className="text-indigo-300">0x7b888393d6a552819bb0a7f878183abaf04550bfb9546b20ea586d338210826f::moon::MOON</span>
        </div>
      </div>
    </div>
  );
};
