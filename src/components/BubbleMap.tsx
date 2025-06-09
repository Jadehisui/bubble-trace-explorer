
import React, { useState, useRef, useCallback } from 'react';
import { Wallet, PopupData } from '../types';
import { Popup } from './Popup';

interface BubbleMapProps {
  wallets: Wallet[];
  tokenSymbol: string;
}

export const BubbleMap: React.FC<BubbleMapProps> = ({ wallets, tokenSymbol }) => {
  const [popup, setPopup] = useState<PopupData>({
    wallet: {} as Wallet,
    x: 0,
    y: 0,
    visible: false
  });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getBubbleRadius = (percentage: number) => {
    return Math.max(8, Math.min(50, percentage * 1.5));
  };

  const getBubbleColor = (percentage: number) => {
    if (percentage > 20) return '#06b6d4'; // cyan-500
    if (percentage > 10) return '#0891b2'; // cyan-600
    if (percentage > 5) return '#0e7490';  // cyan-700
    return '#155e75'; // cyan-800
  };

  const handleBubbleClick = useCallback((wallet: Wallet, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setPopup({
        wallet,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true
      });
    }
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, transform.scale * delta));
    setTransform(prev => ({ ...prev, scale: newScale }));
  }, [transform.scale]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === svgRef.current) {
      setIsDragging(true);
      setLastPosition({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = event.clientX - lastPosition.x;
      const deltaY = event.clientY - lastPosition.y;
      setTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPosition({ x: event.clientX, y: event.clientY });
    }
  }, [isDragging, lastPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const closePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  if (wallets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="text-center">
          <div className="text-lg mb-2">No data available</div>
          <div className="text-sm">Search for a token to view wallet distribution</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 border border-slate-700 rounded-lg bg-slate-900/30 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 text-white text-sm 
                     rounded border border-slate-600 transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* Token Info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded border border-slate-600">
          <div className="text-cyan-400 font-bold">{tokenSymbol}</div>
          <div className="text-slate-300 text-sm">{wallets.length} holders</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Connection Lines */}
          {wallets.map(wallet => 
            wallet.connections?.map(connectionId => {
              const connectedWallet = wallets.find(w => w.id === connectionId);
              if (!connectedWallet) return null;
              
              return (
                <line
                  key={`${wallet.id}-${connectionId}`}
                  x1={wallet.x}
                  y1={wallet.y}
                  x2={connectedWallet.x}
                  y2={connectedWallet.y}
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.6"
                />
              );
            })
          )}

          {/* Wallet Bubbles */}
          {wallets.map(wallet => {
            const radius = getBubbleRadius(wallet.percentage);
            const color = getBubbleColor(wallet.percentage);
            
            return (
              <g key={wallet.id}>
                {/* Glow Effect */}
                <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius + 2}
                  fill={color}
                  opacity="0.3"
                  className="animate-pulse"
                />
                
                {/* Main Bubble */}
                <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleBubbleClick(wallet, e)}
                />
                
                {/* Percentage Label */}
                <text
                  x={wallet.x}
                  y={wallet.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={Math.max(8, radius / 3)}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {wallet.percentage.toFixed(1)}%
                </text>
                
                {/* Tag Label */}
                {wallet.tag && (
                  <text
                    x={wallet.x}
                    y={wallet.y + radius + 15}
                    textAnchor="middle"
                    fill="#06b6d4"
                    fontSize="10"
                    fontWeight="500"
                    pointerEvents="none"
                  >
                    {wallet.tag}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};
