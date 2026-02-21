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
