import React from "react";
import { PopupData } from "../types";
import { TrendingUp, ExternalLink } from "lucide-react";

interface PopupProps {
  popup: PopupData;
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({ popup, onClose }) => {
  if (!popup.visible) return null;

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const handleExplorerClick = () => {
    window.open(
      `https://suiscan.xyz/mainnet/account/${popup.wallet.address}`,
      "_blank"
    );
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(popup.wallet.address);
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
        className="fixed z-20 bg-slate-900/90 backdrop-blur-md border border-slate-600/50 
                   rounded-lg p-4 shadow-xl min-w-72 shadow-indigo-500/10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-300 font-medium text-sm">
                Token Holder
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ×
            </button>
          </div>

          <div>
            <div className="text-slate-400 text-xs mb-1">Holder Address</div>
            <div
              className="text-slate-100 font-mono text-sm bg-slate-950/50 px-2 py-1 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={copyAddress}
              title="Click to copy address"
            >
              {shortenAddress(popup.wallet.address)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-slate-400 text-xs mb-1">Holdings %</div>
              <div className="text-indigo-300 font-bold text-lg">
                {popup.wallet.percentage.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Rank</div>
              <div className="text-slate-200 font-mono text-sm">
                #{popup.wallet.id}
              </div>
            </div>
          </div>

          {popup.wallet.formattedBalance && (
            <div>
              <div className="text-slate-400 text-xs mb-1">Token Balance</div>
              <div className="text-slate-200 font-mono text-sm bg-slate-950/30 px-2 py-1 rounded">
                {popup.wallet.formattedBalance}
              </div>
            </div>
          )}

          <button
            onClick={handleExplorerClick}
            className="w-full mt-3 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 
                       text-slate-100 text-sm rounded transition-all duration-200
                       border border-indigo-500/30 hover:border-indigo-400/50
                       hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on Sui Explorer
          </button>
        </div>
      </div>
    </>
  );
};
