"use client";

import { useState } from "react";
import { RoomState, FurnitureItem } from "@/types";

interface IsometricRoomProps {
  room: RoomState;
  onFurnitureTap: (item: FurnitureItem) => void;
}

export default function IsometricRoom({ room, onFurnitureTap }: IsometricRoomProps) {
  const [petImageError, setPetImageError] = useState(false);
  const [failedFurniture, setFailedFurniture] = useState<Set<string>>(new Set());

  const canvasHeight = 702;

  return (
    <div
      style={{
        position: "relative",
        width: 428,
        height: canvasHeight,
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {/* Sky background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #BDD8EE 0%, #D8EEF8 100%)",
        }}
      />

      {/* Clouds */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.85 }}
        width="428"
        height={canvasHeight}
        viewBox={`0 0 428 ${canvasHeight}`}
        fill="none"
      >
        {/* Cloud cluster top-left */}
        <ellipse cx="60" cy="520" rx="70" ry="28" fill="#FFFFFF" />
        <ellipse cx="110" cy="515" rx="55" ry="22" fill="#FFFFFF" />
        <ellipse cx="30" cy="525" rx="45" ry="18" fill="#FFFFFF" />

        {/* Cloud cluster top-right */}
        <ellipse cx="350" cy="540" rx="65" ry="25" fill="#FFFFFF" />
        <ellipse cx="390" cy="535" rx="50" ry="20" fill="#FFFFFF" />

        {/* Cloud cluster bottom-center */}
        <ellipse cx="200" cy="620" rx="90" ry="30" fill="#FFFFFF" />
        <ellipse cx="280" cy="625" rx="70" ry="25" fill="#FFFFFF" />
        <ellipse cx="130" cy="625" rx="60" ry="22" fill="#FFFFFF" />

        {/* Cloud bottom-left */}
        <ellipse cx="70" cy="660" rx="80" ry="28" fill="#FFFFFF" />
        <ellipse cx="140" cy="665" rx="60" ry="22" fill="#FFFFFF" />

        {/* Cloud bottom-right */}
        <ellipse cx="370" cy="660" rx="70" ry="26" fill="#FFFFFF" />
        <ellipse cx="320" cy="665" rx="55" ry="20" fill="#FFFFFF" />
      </svg>

      {/* Isometric room box */}
      <svg
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          transform: "translateX(-50%)",
        }}
        width="380"
        height="440"
        viewBox="0 0 380 440"
        fill="none"
      >
        {/* Floor */}
        <polygon
          points="190,280 380,380 190,440 0,380"
          fill="var(--floor-wood)"
        />
        {/* Floor edge stripe */}
        <polygon
          points="190,436 380,376 380,380 190,440 0,380 0,376"
          fill="var(--floor-wood-dark)"
        />

        {/* Left wall */}
        <polygon
          points="0,140 190,40 190,280 0,380"
          fill="var(--wall-left-blue)"
        />
        {/* Left wall border lines */}
        <line x1="0" y1="180" x2="190" y2="80" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="220" x2="190" y2="120" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="260" x2="190" y2="160" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="300" x2="190" y2="200" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="340" x2="190" y2="240" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        {/* Left wall vertical lines */}
        <line x1="48" y1="156" x2="48" y2="356" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.2" />
        <line x1="95" y1="132" x2="95" y2="332" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.2" />
        <line x1="143" y1="108" x2="143" y2="308" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.2" />

        {/* Back wall (right side) */}
        <polygon
          points="190,40 380,140 380,380 190,280"
          fill="var(--wall-back-pink)"
        />
        {/* Back wall decorative lines */}
        <line x1="190" y1="80" x2="380" y2="180" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="190" y1="120" x2="380" y2="220" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="190" y1="160" x2="380" y2="260" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="190" y1="200" x2="380" y2="300" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="190" y1="240" x2="380" y2="340" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />

        {/* Window on left wall - arch */}
        <ellipse cx="70" cy="220" rx="22" ry="12" fill="#FFFFFF" opacity="0.4" />
        <rect x="48" y="220" width="44" height="50" rx="0" fill="#FFFFFF" opacity="0.3" />
        <line x1="70" y1="210" x2="70" y2="270" stroke="var(--wall-left-blue)" strokeWidth="1.5" opacity="0.6" />

        {/* Picture frame on left wall */}
        <rect x="110" y="155" width="40" height="30" rx="3" fill="#E8C888" opacity="0.6" />
        <rect x="114" y="159" width="32" height="22" rx="2" fill="#D8EEF8" opacity="0.5" />

        {/* Round window on back wall */}
        <circle cx="320" cy="200" r="20" fill="#FFFFFF" opacity="0.35" />
        <line x1="320" y1="180" x2="320" y2="220" stroke="var(--wall-back-pink)" strokeWidth="1.5" opacity="0.6" />
        <line x1="300" y1="200" x2="340" y2="200" stroke="var(--wall-back-pink)" strokeWidth="1.5" opacity="0.6" />

        {/* Square window on back wall */}
        <rect x="230" y="170" width="40" height="35" rx="3" fill="#FFFFFF" opacity="0.3" />
        <line x1="250" y1="170" x2="250" y2="205" stroke="var(--wall-back-pink)" strokeWidth="1" opacity="0.5" />
        <line x1="230" y1="187" x2="270" y2="187" stroke="var(--wall-back-pink)" strokeWidth="1" opacity="0.5" />

        {/* Hanging plant on left wall */}
        <line x1="150" y1="60" x2="150" y2="90" stroke="#7CB87C" strokeWidth="1.5" />
        <circle cx="150" cy="95" r="10" fill="#7CB87C" opacity="0.8" />
        <circle cx="145" cy="88" r="6" fill="#8EC88E" opacity="0.7" />
        <circle cx="155" cy="88" r="6" fill="#8EC88E" opacity="0.7" />

        {/* Shelf on back wall */}
        <rect x="290" y="250" width="70" height="6" rx="2" fill="#D49060" opacity="0.7" />
        {/* Items on shelf */}
        <rect x="300" y="238" width="12" height="12" rx="2" fill="#B8D8B0" opacity="0.7" />
        <rect x="318" y="240" width="10" height="10" rx="1" fill="#D8A0D0" opacity="0.7" />
        <rect x="335" y="236" width="8" height="14" rx="1" fill="#A0C8E8" opacity="0.7" />
        <rect x="348" y="240" width="8" height="10" rx="1" fill="#E8C888" opacity="0.7" />
      </svg>

      {/* Furniture items */}
      {room.furniture.map((item) => {
        if (failedFurniture.has(item.id)) return null;
        return (
          <button
            key={item.id}
            onClick={() => onFurnitureTap(item)}
            style={{
              position: "absolute",
              left: `${item.positionX}%`,
              top: `${item.positionY}%`,
              width: Math.max(item.width, 44),
              height: Math.max(item.height, 44),
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              width={item.width}
              height={item.height}
              onError={() => setFailedFurniture((prev) => new Set(prev).add(item.id))}
              style={{ pointerEvents: "none" }}
            />
          </button>
        );
      })}

      {/* Pet sprite */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 140,
          transform: "translateX(-50%)",
          width: 120,
          height: 120,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {petImageError ? (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "var(--radius-md)",
              background: "var(--hud-bar-bg)",
            }}
          />
        ) : (
          <img
            src={room.pet.imageUrl}
            alt={room.pet.petName}
            style={{ maxWidth: 120, maxHeight: 120, objectFit: "contain" }}
            onError={() => setPetImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
