import React, { useState, useRef, useCallback, useEffect } from "react";
import { Wallet, PopupData } from "../types";
import { Popup } from "./Popup";

interface BubbleMapProps {
  wallets: Wallet[];
  tokenSymbol: string;
}

export const BubbleMap: React.FC<BubbleMapProps> = ({
  wallets,
  tokenSymbol,
}) => {
  const [popup, setPopup] = useState<PopupData>({
    wallet: {} as Wallet,
    x: 0,
    y: 0,
    visible: false,
  });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getBubbleRadius = (percentage: number) => {
    const baseRadius = percentage > 0 ? 15 + percentage * 2 : 15;
    return Math.max(15, Math.min(60, baseRadius));
  };

  const getBubbleColor = (percentage: number) => {
    if (percentage > 20) return "#ff4d4f";
    if (percentage > 10) return "#ffa940";
    if (percentage > 5) return "#36cfc9";
    if (percentage > 2) return "#40a9ff";
    return "#d3adf7";
  };

  const handleBubbleClick = useCallback(
    (wallet: Wallet, event: React.MouseEvent) => {
      event.stopPropagation();
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setPopup({
          wallet,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          visible: true,
        });
      }
    },
    []
  );

  const resolveCollisions = (wallets: Wallet[]) => {
    const adjustedWallets = wallets.map((wallet) => ({
      ...wallet,
      originalX: wallet.x,
      originalY: wallet.y,
    }));

    for (let i = 0; i < adjustedWallets.length; i++) {
      for (let j = i + 1; j < adjustedWallets.length; j++) {
        const walletA = adjustedWallets[i];
        const walletB = adjustedWallets[j];

        const dx = walletB.x - walletA.x;
        const dy = walletB.y - walletA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance =
          getBubbleRadius(walletA.percentage) +
          getBubbleRadius(walletB.percentage);

        if (distance < minDistance) {
          // Resolve overlap by moving the bubbles apart
          const overlap = minDistance - distance;
          const adjustX = (dx / distance) * overlap * 0.5; // Adjust half the overlap
          const adjustY = (dy / distance) * overlap * 0.5;

          walletA.x -= adjustX;
          walletA.y -= adjustY;
          walletB.x += adjustX;
          walletB.y += adjustY;
        }
      }
    }

    return adjustedWallets;
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3, prev.scale * delta)),
      }));
    };

    svg.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      svg.removeEventListener("wheel", wheelHandler);
    };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === svgRef.current) {
      setIsDragging(true);
      setLastPosition({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = event.clientX - lastPosition.x;
        const deltaY = event.clientY - lastPosition.y;
        setTransform((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        setLastPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [isDragging, lastPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, visible: false }));
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  if (wallets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="text-center">
          <div className="text-lg mb-2">No holder data available</div>
          <div className="text-sm">
            Search for a token to explore the holder network
          </div>
        </div>
      </div>
    );
  }

  const adjustedWallets = resolveCollisions(wallets);

  return (
    <div className="relative w-full h-96 border border-slate-600/50 rounded-lg bg-slate-950/30 overflow-hidden backdrop-blur-sm">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm 
                     rounded border border-slate-600/50 transition-all duration-200
                     backdrop-blur-sm hover:border-indigo-400/50"
        >
          Reset View
        </button>
      </div>

      {/* Token Info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border border-slate-600/50">
          <div className="text-indigo-300 font-bold">{tokenSymbol}</div>
          <div className="text-slate-300 text-sm">{wallets.length} holders</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="cosmic-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3730a3" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Connection Lines */}
          {adjustedWallets.map((wallet) =>
            wallet.connections?.map((connectionId) => {
              const connectedWallet = adjustedWallets.find(
                (w) => w.id === connectionId
              );
              if (!connectedWallet) return null;

              return (
                <line
                  key={`${wallet.id}-${connectionId}`}
                  x1={wallet.originalX} // Use original positions
                  y1={wallet.originalY} // Use original positions
                  x2={connectedWallet.originalX} // Use original positions
                  y2={connectedWallet.originalY} // Use original positions
                  stroke="#475569"
                  strokeWidth="1"
                  opacity="1"
                  strokeDasharray="2,3"
                />
              );
            })
          )}

          {/* Wallet Bubbles */}

          {adjustedWallets.map((wallet) => {
            const radius = getBubbleRadius(wallet.percentage);
            const color = getBubbleColor(wallet.percentage);

            return (
              <g key={wallet.id}>
                <circle
                  cx={wallet.x} // Use adjusted positions
                  cy={wallet.y} // Use adjusted positions
                  r={radius + 4}
                  fill="url(#cosmic-glow)"
                  className="animate-pulse"
                />
                <circle
                  cx={wallet.x} // Use adjusted positions
                  cy={wallet.y} // Use adjusted positions
                  r={radius}
                  fill={color}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200"
                  onClick={(e) => handleBubbleClick(wallet, e)}
                />
                <circle
                  cx={wallet.x} // Use adjusted positions
                  cy={wallet.y} // Use adjusted positions
                  r={radius * 0.6}
                  fill="#ffffff"
                  opacity="0.2"
                  pointerEvents="none"
                />
                <text
                  x={wallet.x} // Use adjusted positions
                  y={wallet.y} // Use adjusted positions
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f1f5f9"
                  fontSize={Math.max(8, radius / 3)}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {wallet.percentage.toFixed(3)}%
                </text>
                {wallet.tag && (
                  <text
                    x={wallet.x} // Use adjusted positions
                    y={wallet.y + radius + 15} // Use adjusted positions
                    textAnchor="middle"
                    fill="#a5b4fc"
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
