"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { VisualNugget } from "@/hooks/useNuggetCollector";

// Get the center of the HUD nugget pill dynamically
function getHudTarget(): { x: number; y: number } {
  const el = document.getElementById("hud-nugget-pill");
  if (el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  // Fallback if element not found
  return { x: 52, y: 18 };
}

// Jump animation duration
const JUMP_DURATION = 500; // ms

interface RoomNuggetsProps {
  nuggets: VisualNugget[];
  onCollect: (id: string) => void;
}

interface FlyingNugget {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  variant: number;
}

export default function RoomNuggets({ nuggets, onCollect }: RoomNuggetsProps) {
  const [flyingIds, setFlyingIds] = useState<Set<string>>(new Set());
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const flyingDataRef = useRef<Map<string, FlyingNugget>>(new Map());

  // Detect nuggets that were removed (auto-collected) — fade them
  const prevIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const currentIds = new Set(nuggets.map((n) => n.id));
    const removed = new Set<string>();
    prevIdsRef.current.forEach((id) => {
      if (!currentIds.has(id) && !flyingIds.has(id)) {
        removed.add(id);
      }
    });
    if (removed.size > 0) {
      setFadingIds((prev) => new Set([...prev, ...removed]));
      setTimeout(() => {
        setFadingIds((prev) => {
          const next = new Set(prev);
          removed.forEach((id) => next.delete(id));
          return next;
        });
      }, 300);
    }
    prevIdsRef.current = currentIds;
  }, [nuggets, flyingIds]);

  const handleClick = useCallback(
    (nugget: VisualNugget, e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (flyingIds.has(nugget.id)) return;

      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const hudTarget = getHudTarget();

      flyingDataRef.current.set(nugget.id, {
        id: nugget.id,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: hudTarget.x,
        endY: hudTarget.y,
        variant: nugget.variant,
      });

      setFlyingIds((prev) => new Set([...prev, nugget.id]));

      setTimeout(() => {
        onCollect(nugget.id);
        setFlyingIds((prev) => {
          const next = new Set(prev);
          next.delete(nugget.id);
          return next;
        });
        flyingDataRef.current.delete(nugget.id);
      }, 500);
    },
    [flyingIds, onCollect]
  );

  return (
    <>
      {/* In-room nuggets */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        {nuggets.map((nugget) => {
          if (flyingIds.has(nugget.id)) return null;

          const age = Date.now() - nugget.spawnedAt;
          const isJumping = age < JUMP_DURATION + nugget.jumpDelay;
          const hasLanded = !isJumping;

          // Calculate jump offset from pet to land position
          // Coordinates use the same system as the pet: left/bottom
          const dx = nugget.x - nugget.startX;
          const dy = nugget.y - nugget.startY; // bottom-based, so positive = upward

          return (
            <button
              key={nugget.id}
              onClick={(e) => handleClick(nugget, e)}
              style={{
                position: "absolute",
                left: nugget.x - 16,
                bottom: nugget.y - 16,
                width: 32,
                height: 32,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                pointerEvents: hasLanded ? "auto" : "none",
                zIndex: 3,
                ["--jump-start-x" as string]: `${-dx}px`,
                ["--jump-start-y" as string]: `${dy}px`,
                ["--jump-delay" as string]: `${nugget.jumpDelay}ms`,
                animation: isJumping
                  ? `nuggetJump ${JUMP_DURATION}ms ease-out ${nugget.jumpDelay}ms forwards`
                  : "nuggetGlow 2s ease-in-out infinite",
                opacity: isJumping ? 0 : 1,
              }}
            >
              <img
                src={`/gold nuggets/gold nuggets ${nugget.variant}.png`}
                alt="Gold nugget"
                style={{
                  width: 32,
                  height: 32,
                  objectFit: "contain",
                  pointerEvents: "none",
                  filter: hasLanded
                    ? "drop-shadow(0 0 6px rgba(245, 192, 48, 0.6))"
                    : "none",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Flying nuggets (fixed position, animating to HUD) */}
      {Array.from(flyingIds).map((id) => {
        const data = flyingDataRef.current.get(id);
        if (!data) return null;

        return (
          <div
            key={`fly_${id}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: 28,
              height: 28,
              zIndex: 200,
              pointerEvents: "none",
              transform: `translate(${data.startX - 14}px, ${data.startY - 14}px)`,
              animation: `nuggetFly 500ms ease-in-out forwards`,
              ["--fly-start-x" as string]: `${data.startX - 14}px`,
              ["--fly-start-y" as string]: `${data.startY - 14}px`,
              ["--fly-end-x" as string]: `${data.endX - 14}px`,
              ["--fly-end-y" as string]: `${data.endY - 14}px`,
            }}
          >
            <img
              src={`/gold nuggets/gold nuggets ${data.variant}.png`}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
