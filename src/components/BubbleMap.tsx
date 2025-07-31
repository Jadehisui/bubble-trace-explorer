import { useState, useRef, useCallback, useEffect } from "react";
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

  const [initialPinchDistance, setInitialPinchDistance] = useState<
    number | null
  >(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const getBubbleColor = (percentage: number) => {
    if (percentage > 20) return { base: "#AE00FF" }; // Neon purple
    if (percentage > 10) return { base: "#00FFD1" }; // Aqua / neon green-blue
    if (percentage > 5) return { base: "#FFA940" }; // Orange-gold
    if (percentage > 2) return { base: "#29B6F6" }; // Light sky blue (lighter & warmer than #00A2FF)
    if (percentage > 1) return { base: "#B39DDB" }; // Deep violet (strong contrast with sky blue)
    return { base: "#8f0f7eff" }; // Soft lilac (for very small bubbles)
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
          const minDistance = radiusA + radiusB + 53;
          // Increased padding to prevent overlap

          if (distance < minDistance) {
            moved = true;
            const overlap = minDistance - distance;
            const adjustX = (dx / distance) * overlap * 0.2;
            const adjustY = (dy / distance) * overlap * 0.1;

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

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      setIsDragging(true);
      setLastPosition({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 1 && isDragging) {
        // Normal drag (one finger)
        const deltaX = event.touches[0].clientX - lastPosition.x;
        const deltaY = event.touches[0].clientY - lastPosition.y;

        setTransform((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        setLastPosition({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        });
      }

      // Pinch zoom (two fingers)
      if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (initialPinchDistance == null) {
          setInitialPinchDistance(distance);
        } else {
          const scaleChange = distance / initialPinchDistance;
          setTransform((prev) => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale * scaleChange, 0.3), 5), // limit zoom level
          }));
          setInitialPinchDistance(distance);
        }
      }
    },
    [isDragging, lastPosition, initialPinchDistance]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setInitialPinchDistance(null); // Reset zoom
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
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="15" r="0.8" fill="#a5b4fc" opacity="0.3" />
            <circle cx="30" cy="25" r="1.2" fill="#c4b5fd" opacity="0.2" />
            <circle cx="50" cy="35" r="0.6" fill="#a5b4fc" opacity="0.4" />
            <circle cx="70" cy="10" r="1.1" fill="#93c5fd" opacity="0.25" />
            <circle cx="20" cy="60" r="1.4" fill="#f9a8d4" opacity="0.15" />
            <circle cx="60" cy="50" r="0.9" fill="#c084fc" opacity="0.2" />
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
        className="cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          <filter id="bubble-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {adjustedWallets.map((wallet) => {
            const colors = getBubbleColor(wallet.percentage);
            return (
              <radialGradient
                key={wallet.id}
                id={`gradient-${wallet.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={colors.base} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.base} stopOpacity="0.1" />
              </radialGradient>
            );
          })}
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

              const arrowOffset = 6;
              // Calculate edge points (where the line should start/end at the bubble edges)
              const edgeX1 =
                wallet.x + (radiusA + arrowOffset) * Math.cos(angle);
              const edgeY1 =
                wallet.y + (radiusA + arrowOffset) * Math.sin(angle);
              const edgeX2 =
                connectedWallet.x - (radiusB + arrowOffset) * Math.cos(angle);
              const edgeY2 =
                connectedWallet.y - (radiusB + arrowOffset) * Math.sin(angle);

              // Calculate midpoint for the arrow
              const midX = (edgeX1 + edgeX2) / 2;
              const midY = (edgeY1 + edgeY2) / 2;

              return (
                <g key={`${wallet.id}-${connectionId}`}>
                  <defs>
                    <marker
                      id="arrow-end"
                      markerWidth="6"
                      markerHeight="6"
                      refX="5"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.6)" />
                    </marker>

                    <marker
                      id="arrow-start"
                      markerWidth="6"
                      markerHeight="6"
                      refX="1"
                      refY="3"
                      orient="auto-start-reverse"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.6)" />
                    </marker>
                  </defs>

                  <line
                    x1={edgeX1}
                    y1={edgeY1}
                    x2={edgeX2}
                    y2={edgeY2}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.2"
                    markerStart="url(#arrow-start)"
                    markerEnd="url(#arrow-end)"
                    style={{ filter: "drop-shadow(0 0 1px #fff)" }}
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
                      opacity="0.9"
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
                  fill={`url(#gradient-${wallet.id})`}
                  stroke="#94a3b8" // Add a soft stroke
                  strokeWidth="1"
                  style={{
                    filter:
                      "drop-shadow(0 0 4px rgba(165, 180, 252, 0.3)) drop-shadow(0 0 10px rgba(165, 180, 252, 0.2))",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    // e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 12px rgba(165, 180, 252, 1)) drop-shadow(0 0 25px rgba(165, 180, 252, 0.9))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 8px rgba(165, 180, 252, 0.5)) drop-shadow(0 0 15px rgba(165, 180, 252, 0.3))";
                  }}
                  onClick={(e) => handleBubbleClick(wallet, e)}
                />

                {/* <circle
                  cx={wallet.x}
                  cy={wallet.y}
                  r={radius * 0.5}
                  fill={colors.base}
                  opacity="0.9"
                  pointerEvents="none"
                /> */}
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
