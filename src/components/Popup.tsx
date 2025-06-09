
import React from 'react';
import { PopupData } from '../types';

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
        className="fixed inset-0 bg-black/20 z-10"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="absolute z-20 bg-slate-800/95 backdrop-blur-md border border-slate-600 
                   rounded-lg p-4 shadow-xl min-w-64"
        style={{
          left: Math.min(popup.x + 10, window.innerWidth - 280),
          top: Math.min(popup.y - 50, window.innerHeight - 200),
        }}
      >
        <div className="space-y-3">
          {popup.wallet.tag && (
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-medium text-sm">
                {popup.wallet.tag}
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          <div>
            <div className="text-slate-300 text-xs mb-1">Wallet Address</div>
            <div className="text-white font-mono text-sm bg-slate-900/50 px-2 py-1 rounded">
              {shortenAddress(popup.wallet.address)}
            </div>
          </div>
          
          <div>
            <div className="text-slate-300 text-xs mb-1">Token Holdings</div>
            <div className="text-cyan-400 font-bold text-lg">
              {popup.wallet.percentage.toFixed(1)}%
            </div>
          </div>
          
          <button
            onClick={handleExplorerClick}
            className="w-full mt-3 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 
                       text-white text-sm rounded transition-colors duration-200"
          >
            View on Sui Explorer
          </button>
        </div>
      </div>
    </>
  );
};
