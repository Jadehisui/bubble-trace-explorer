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

  const getBubbleColor = (percentage: number) => {
    if (percentage > 20)
      return { base: "#ff4d4f", bright: "#ff7875", dark: "#7f1d1d" };
    if (percentage > 10)
      return { base: "#ffa940", bright: "#ffcc80", dark: "#7f501f" };
    if (percentage > 5)
      return { base: "#36cfc9", bright: "#70e0e8", dark: "#1b5f5e" };
    if (percentage > 2)
      return { base: "#40a9ff", bright: "#73c0ff", dark: "#1e429f" };
    return { base: "#d3adf7", bright: "#e0c1ff", dark: "#6b4e91" };
  };

  const getBubbleRadius = (percentage: number) => {
    const baseRadius = percentage > 0 ? 15 + percentage * 2 : 15;
    return Math.max(15, Math.min(60, baseRadius));
  };

  const handleBubbleClick = useCallback(
    (wallet: Wallet, event: React.MouseEvent) => {
      event.stopPropagation();
      const container = svgRef.current?.parentElement?.getBoundingClientRect();
      if (container) {
        setPopup({
          wallet,
          x: container.width / 2,
          y: container.height / 2,
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

    const maxIterations = 100;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let moved = false;
      for (let i = 0; i < adjustedWallets.length; i++) {
        for (let j = i + 1; j < adjustedWallets.length; j++) {
          const walletA = adjustedWallets[i];
          const walletB = adjustedWallets[j];

          const dx = walletB.x - walletA.x;
          const dy = walletB.y - walletA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radiusA = getBubbleRadius(walletA.percentage);
          const radiusB = getBubbleRadius(walletB.percentage);
          const minDistance = radiusA + radiusB + 10; // Increased padding to prevent overlap

          if (distance < minDistance) {
            moved = true;
            const overlap = minDistance - distance;
            const adjustX = (dx / distance) * overlap * 0.5;
            const adjustY = (dy / distance) * overlap * 0.5;

            walletA.x -= adjustX;
            walletA.y -= adjustY;
            walletB.x += adjustX;
            walletB.y += adjustY;
          }
        }
      }
      if (!moved) break; // Exit if no more collisions to resolve
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
      {/* Cosmic Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <pattern
            id="star-pattern"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="#a5b4fc" opacity="0.3" />
            <circle cx="40" cy="40" r="1.5" fill="#a5b4fc" opacity="0.2" />
            <circle cx="25" cy="25" r="1" fill="#a5b4fc" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#star-pattern)" />
      </svg>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-slate-800/80 hover:bg-indigo-600/80 text-slate-200 text-sm 
                     rounded border border-slate-600/50 transition-all duration-200
                     backdrop-blur-sm hover:border-indigo-400/50"
        >
          Reset View
        </button>
      </div>

      {/* Token Info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border border-indigo-500/50">
          <div className="text-indigo-300 font-bold">{tokenSymbol}</div>
          <div className="text-slate-300 text-sm">{wallets.length} holders</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-move relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="cosmic-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0, 6 2.5, 0 5" fill="#a5b4fc" />
          </marker>
          <marker
            id="arrowhead-start"
            markerWidth="6"
            markerHeight="5"
            refX="1"
            refY="2.5"
            orient="auto-start-reverse"
          >
            <polygon points="6 0, 0 2.5, 6 5" fill="#a5b4fc" />
          </marker>
          <marker
            id="arrowhead-end"
            markerWidth="6"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0, 6 2.5, 0 5" fill="#a5b4fc" />
          </marker>
        </defs>

        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Connection Lines with Arrows */}
          {adjustedWallets.map((wallet) =>
            wallet.connections?.map((connectionId) => {
              const connectedWallet = adjustedWallets.find(
                (w) => w.id === connectionId
              );
              if (!connectedWallet) return null;

              const radiusA = getBubbleRadius(wallet.percentage);
              const radiusB = getBubbleRadius(connectedWallet.percentage);
              const dx = connectedWallet.x - wallet.x;
              const dy = connectedWallet.y - wallet.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);

              // Calculate edge points (where the line should start/end at the bubble edges)
              const edgeX1 = wallet.x + radiusA * Math.cos(angle);
              const edgeY1 = wallet.y + radiusA * Math.sin(angle);
              const edgeX2 = connectedWallet.x - radiusB * Math.cos(angle);
              const edgeY2 = connectedWallet.y - radiusB * Math.sin(angle);

              // Calculate midpoint for the arrow
              const midX = (edgeX1 + edgeX2) / 2;
              const midY = (edgeY1 + edgeY2) / 2;

              return (
                <g key={`${wallet.id}-${connectionId}`}>
                  <line
                    x1={edgeX1}
                    y1={edgeY1}
                    x2={edgeX2}
                    y2={edgeY2}
                    stroke="#a5b4fc"
                    strokeWidth="1.5"
                    strokeDasharray={length > 200 ? "3,3" : "0"}
                    markerStart="url(#arrowhead-start)"
                    markerEnd="url(#arrowhead-end)"
                    opacity="0.6"
                  />
                  {length > 200 && (
                    <line
                      x1={midX - 10 * Math.cos(angle)}
                      y1={midY - 10 * Math.sin(angle)}
                      x2={midX + 10 * Math.cos(angle)}
                      y2={midY + 10 * Math.sin(angle)}
                      stroke="#a5b4fc"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-end)"
                      opacity="0.6"
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Wallet Bubbles */}
          {adjustedWallets.map((wallet, index) => {
            const radius = getBubbleRadius(wallet.percentage);
            const colors = getBubbleColor(wallet.percentage);

            return (
              <g key={wallet.id}>
                {/* <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius + 8} // Thicker outer layer
                  fill={colors.bright}
                  stroke={colors.bright}
                  strokeWidth="3"
                  opacity="0.9"
                  className="animate-[pulse_3s_ease-in-out_infinite]"
                /> */}
                <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius}
                  fill={colors.base}
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  opacity="0.85"
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    transformOrigin: "center",
                    transformBox: "fill-box",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.stroke = "#a5b4fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.stroke = "#e2e8f0";
                  }}
                  onClick={(e) => handleBubbleClick(wallet, e)}
                />
                <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius * 0.5}
                  fill={colors.dark}
                  opacity="0.9"
                  pointerEvents="none"
                />
                <text
                  x={wallet.x}
                  y={wallet.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f1f5f9"
                  fontSize={Math.max(10, radius / 2.5)}
                  fontWeight="bold"
                  pointerEvents="none"
                  style={{ textShadow: "0 0 3px rgba(0,0,0,0.5)" }}
                >
                  {wallet.percentage.toFixed(3)}%
                </text>
                {wallet.tag && (
                  <text
                    x={wallet.x}
                    y={wallet.y + radius + 15}
                    textAnchor="middle"
                    fill="#a5b4fc"
                    fontSize="12"
                    fontWeight="500"
                    pointerEvents="none"
                    style={{ textShadow: "0 0 3px rgba(0,0,0,0.5)" }}
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
