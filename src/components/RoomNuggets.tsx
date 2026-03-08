"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { VisualNugget } from "@/hooks/useNuggetCollector";

// HUD counter target (approximate center of nugget pill in fixed coords)
const HUD_TARGET_X = 52;
const HUD_TARGET_Y = 18;

interface RoomNuggetsProps {
  nuggets: VisualNugget[];
  onCollect: (id: string) => void;
}

interface FlyingNugget {
  id: string;
  startX: number;
  startY: number;
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
      // Clean up fading after animation
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

      // Get the nugget element's position for the fly animation
      const el = (e.currentTarget as HTMLElement);
      const rect = el.getBoundingClientRect();

      flyingDataRef.current.set(nugget.id, {
        id: nugget.id,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
      });

      setFlyingIds((prev) => new Set([...prev, nugget.id]));

      // After fly animation, collect
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

  // Room-relative coordinates: nugget positions use room coordinate system
  // where (0,0) is top-left of the IsometricRoom container
  // The room container has paddingTop 52px in page.tsx, so room top = 52px from viewport

  return (
    <>
      {/* In-room nuggets */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 6,
        }}
      >
        {nuggets.map((nugget) => {
          if (flyingIds.has(nugget.id)) return null;

          const age = Date.now() - nugget.spawnedAt;
          const isNew = age < 350;

          return (
            <button
              key={nugget.id}
              onClick={(e) => handleClick(nugget, e)}
              style={{
                position: "absolute",
                left: nugget.x - 10,
                top: nugget.y - 10,
                width: 20,
                height: 20,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                pointerEvents: "auto",
                zIndex: 6,
                animation: isNew
                  ? "nuggetSpawn 300ms ease-out forwards"
                  : "nuggetBob 2s ease-in-out infinite",
                animationDelay: isNew ? "0ms" : `${Math.random() * 2000}ms`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="#F5C030"
                  stroke="#D4A020"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="5" fill="#F8D868" />
                <circle cx="8" cy="8" r="2" fill="#FFFFFF" opacity="0.35" />
              </svg>
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
              width: 20,
              height: 20,
              zIndex: 200,
              pointerEvents: "none",
              transform: `translate(${data.startX - 10}px, ${data.startY - 10}px)`,
              animation: `nuggetFly 500ms ease-in-out forwards`,
              ["--fly-start-x" as string]: `${data.startX - 10}px`,
              ["--fly-start-y" as string]: `${data.startY - 10}px`,
              ["--fly-end-x" as string]: `${HUD_TARGET_X - 10}px`,
              ["--fly-end-y" as string]: `${HUD_TARGET_Y - 10}px`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="#F5C030"
                stroke="#D4A020"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="10" r="5" fill="#F8D868" />
              <circle cx="8" cy="8" r="2" fill="#FFFFFF" opacity="0.35" />
            </svg>
          </div>
        );
      })}
    </>
  );
}
