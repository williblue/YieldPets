"use client";

import { useState } from "react";
import { RoomState, FurnitureItem } from "@/types";

interface IsometricRoomProps {
  room: RoomState;
  onFurnitureTap: (item: FurnitureItem) => void;
}

export default function IsometricRoom({
  room,
  onFurnitureTap,
}: IsometricRoomProps) {
  const [petImageError, setPetImageError] = useState(false);
  const [failedFurniture, setFailedFurniture] = useState<Set<string>>(
    new Set(),
  );

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
        <ellipse cx="60" cy="520" rx="70" ry="28" fill="#FFFFFF" />
        <ellipse cx="110" cy="515" rx="55" ry="22" fill="#FFFFFF" />
        <ellipse cx="30" cy="525" rx="45" ry="18" fill="#FFFFFF" />

        <ellipse cx="350" cy="540" rx="65" ry="25" fill="#FFFFFF" />
        <ellipse cx="390" cy="535" rx="50" ry="20" fill="#FFFFFF" />

        <ellipse cx="200" cy="620" rx="90" ry="30" fill="#FFFFFF" />
        <ellipse cx="280" cy="625" rx="70" ry="25" fill="#FFFFFF" />
        <ellipse cx="130" cy="625" rx="60" ry="22" fill="#FFFFFF" />

        <ellipse cx="70" cy="660" rx="80" ry="28" fill="#FFFFFF" />
        <ellipse cx="140" cy="665" rx="60" ry="22" fill="#FFFFFF" />

        <ellipse cx="370" cy="660" rx="70" ry="26" fill="#FFFFFF" />
        <ellipse cx="320" cy="665" rx="55" ry="20" fill="#FFFFFF" />
      </svg>

      {/* Isometric room PNG */}
      <img
        src="/iso_room.png"
        alt="Isometric room"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 200,
          transform: "translateX(-50%)",
          width: 400,
          height: "auto",
          pointerEvents: "none",
        }}
      />

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
              onError={() =>
                setFailedFurniture((prev) => new Set(prev).add(item.id))
              }
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
          bottom: 280,
          transform: "translateX(-50%)",
          width: 60,
          height: 60,
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
            style={{ maxWidth: 60, maxHeight: 60, objectFit: "contain" }}
            onError={() => setPetImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
