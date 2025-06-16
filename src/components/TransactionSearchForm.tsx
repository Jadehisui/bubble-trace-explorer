
import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { isValidSuiAddress, isValidCoinType } from '../services/suiService';

interface TransactionSearchFormProps {
  onSearch: (toAddress: string, coinType: string) => void;
  isLoading?: boolean;
}

export const TransactionSearchForm: React.FC<TransactionSearchFormProps> = ({ onSearch, isLoading }) => {
  const [toAddress, setToAddress] = useState('');
  const [coinType, setCoinType] = useState('');
  const [errors, setErrors] = useState<{ address?: string; coinType?: string }>({});

  const validateForm = () => {
    const newErrors: { address?: string; coinType?: string } = {};
    
    if (!toAddress.trim()) {
      newErrors.address = 'Address is required';
    } else if (!isValidSuiAddress(toAddress.trim())) {
      newErrors.address = 'Invalid Sui address format';
    }
    
    if (!coinType.trim()) {
      newErrors.coinType = 'Coin type is required';
    } else if (!isValidCoinType(coinType.trim())) {
      newErrors.coinType = 'Invalid coin type format (e.g., 0x2::sui::SUI)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch(toAddress.trim(), coinType.trim());
    }
  };

  return (
    <div className="relative w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address Input */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-200">
              Recipient Address
            </label>
            <div className="relative">
              <input
                id="address"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x123... (address that received coins)"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg 
                           text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 
                           transition-all duration-200 backdrop-blur-sm hover:bg-slate-800/50 text-sm
                           ${errors.address 
                             ? 'border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50' 
                             : 'border-slate-600/50 focus:ring-indigo-400/50 focus:border-indigo-400/50'
                           }`}
                disabled={isLoading}
              />
              {errors.address && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              )}
            </div>
            {errors.address && (
              <p className="text-red-400 text-xs">{errors.address}</p>
            )}
          </div>

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
                placeholder="0x2::sui::SUI"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg 
                           text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 
                           transition-all duration-200 backdrop-blur-sm hover:bg-slate-800/50 text-sm
                           ${errors.coinType 
                             ? 'border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50' 
                             : 'border-slate-600/50 focus:ring-indigo-400/50 focus:border-indigo-400/50'
                           }`}
                disabled={isLoading}
              />
              {errors.coinType && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              )}
            </div>
            {errors.coinType && (
              <p className="text-red-400 text-xs">{errors.coinType}</p>
            )}
          </div>
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
            {isLoading ? 'Analyzing Transactions...' : 'Search Transactions'}
            {isLoading && (
              <div className="w-4 h-4 border-2 border-indigo-400/50 border-t-indigo-300 rounded-full animate-spin ml-2"></div>
            )}
          </button>
        </div>
      </form>

      {/* Example */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-400">
          Example: Address: <span className="text-indigo-300">0xa1b2c3...</span>, 
          Coin Type: <span className="text-indigo-300">0x2::sui::SUI</span>
        </div>
      </div>
    </div>
  );
};
