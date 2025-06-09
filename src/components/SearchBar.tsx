
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim().toUpperCase());
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter cosmic token symbol (e.g., SHIB, SUI)"
          className="w-full px-4 py-3 pl-12 bg-slate-900/50 border border-slate-600/50 rounded-lg 
                     text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-200
                     backdrop-blur-sm hover:bg-slate-800/50"
          disabled={isLoading}
        />
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
          size={18} 
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-400/50 border-t-indigo-300 rounded-full animate-spin"></div>
          </div>
        )}
      </form>
    </div>
  );
};
