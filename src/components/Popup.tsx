import React from 'react';
import { PopupData } from '../types';
import { Moon } from 'lucide-react';

interface PopupProps {
  popup: PopupData;
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({ popup, onClose }) => {
  if (!popup.visible) return null;

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleExplorerClick = () => {
    window.open(`https://suiexplorer.com/address/${popup.wallet.address}`, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="absolute z-20 bg-slate-900/90 backdrop-blur-md border border-slate-600/50 
                   rounded-lg p-4 shadow-xl min-w-64 shadow-indigo-500/10"
        style={{
          left: Math.min(popup.x + 10, window.innerWidth - 280),
          top: Math.min(popup.y - 50, window.innerHeight - 200),
        }}
      >
        <div className="space-y-3">
          {popup.wallet.tag && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-300" />
                <span className="text-indigo-300 font-medium text-sm">
                  {popup.wallet.tag}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          <div>
            <div className="text-slate-400 text-xs mb-1">Cosmic Address</div>
            <div className="text-slate-100 font-mono text-sm bg-slate-950/50 px-2 py-1 rounded border border-slate-700/50">
              {shortenAddress(popup.wallet.address)}
            </div>
          </div>
          
          <div>
            <div className="text-slate-400 text-xs mb-1">Stellar Holdings</div>
            <div className="text-indigo-300 font-bold text-lg">
              {popup.wallet.percentage.toFixed(1)}%
            </div>
          </div>
          
          <button
            onClick={handleExplorerClick}
            className="w-full mt-3 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 
                       text-slate-100 text-sm rounded transition-all duration-200
                       border border-indigo-500/30 hover:border-indigo-400/50
                       hover:shadow-lg hover:shadow-indigo-500/20"
          >
            View in Sui Observatory
          </button>
        </div>
      </div>
    </>
  );
};
