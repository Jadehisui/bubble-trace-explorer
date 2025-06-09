
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
          placeholder="Enter token symbol (e.g., SHIB, SUI)"
          className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-700 rounded-lg 
                     text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-cyan-400 focus:border-transparent transition-all duration-200
                     backdrop-blur-sm"
          disabled={isLoading}
        />
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
          size={18} 
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </form>
    </div>
  );
};
