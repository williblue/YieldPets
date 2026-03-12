"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// Floor diamond constants (match IsometricRoom.tsx)
const FLOOR_CX = 214;
const FLOOR_CY = 280;
const FLOOR_HW = 85;
const FLOOR_HH = 50;
const SHRINK = 0.7; // spawn within 70% of floor bounds

const MAX_VISUAL = 12;
const AUTO_COLLECT_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 10_000; // check expiry every 10s

// Gold nugget image variants (1-6)
const NUGGET_VARIANTS = 6;

export interface VisualNugget {
  id: string;
  x: number;
  y: number;
  value: number;
  spawnedAt: number;
  variant: number; // 1-6, which gold nugget image to use
  // Jump animation: start position (pet) -> land position (floor)
  startX: number;
  startY: number;
  jumpDelay: number; // stagger delay in ms
}

let nuggetIdCounter = 0;

function randomFloorPoint(): { x: number; y: number } {
  for (let i = 0; i < 20; i++) {
    const x = FLOOR_CX + (Math.random() * 2 - 1) * FLOOR_HW * SHRINK;
    const y = FLOOR_CY + (Math.random() * 2 - 1) * FLOOR_HH * SHRINK;
    if (
      Math.abs(x - FLOOR_CX) / FLOOR_HW +
        Math.abs(y - FLOOR_CY) / FLOOR_HH <=
      1
    ) {
      return { x, y };
    }
  }
  return { x: FLOOR_CX, y: FLOOR_CY };
}

export function useNuggetCollector(gameNuggets: number) {
  const prevNuggetsRef = useRef(gameNuggets);
  const [visualNuggets, setVisualNuggets] = useState<VisualNugget[]>([]);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petPosRef = useRef<{ x: number; y: number }>({ x: FLOOR_CX, y: FLOOR_CY });

  // Displayed nuggets = actual total minus uncollected visual nuggets
  const pendingValue = visualNuggets.reduce((sum, n) => sum + n.value, 0);
  const displayedNuggets = gameNuggets - pendingValue;

  // Update pet position (called from IsometricRoom)
  const updatePetPos = useCallback((x: number, y: number) => {
    petPosRef.current = { x, y };
  }, []);

  // Spawn a single nugget from the pet's position
  const spawnOne = useCallback((delay: number) => {
    const landPos = randomFloorPoint();
    const petPos = petPosRef.current;
    const nugget: VisualNugget = {
      id: `vn_${++nuggetIdCounter}`,
      x: landPos.x,
      y: landPos.y,
      value: 1,
      spawnedAt: Date.now(),
      variant: Math.floor(Math.random() * NUGGET_VARIANTS) + 1,
      startX: petPos.x,
      startY: petPos.y,
      jumpDelay: delay,
    };
    setVisualNuggets((prev) => {
      if (prev.length >= MAX_VISUAL) return prev;
      return [...prev, nugget];
    });
  }, []);

  // Spawn multiple nuggets with stagger
  const spawnNuggets = useCallback(
    (count: number) => {
      if (count <= 0) return;
      const toSpawn = Math.min(count, MAX_VISUAL);
      // Spawn first one immediately
      spawnOne(0);
      // Stagger the rest
      let spawned = 1;
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

      function spawnNext() {
        if (spawned >= toSpawn) return;
        spawnTimerRef.current = setTimeout(() => {
          spawnOne(spawned * 80);
          spawned++;
          spawnNext();
        }, 80);
      }
      spawnNext();
    },
    [spawnOne]
  );

  // Detect nugget increases
  useEffect(() => {
    const delta = gameNuggets - prevNuggetsRef.current;
    prevNuggetsRef.current = gameNuggets;
    if (delta > 0) {
      spawnNuggets(delta);
    }
  }, [gameNuggets, spawnNuggets]);

  // Collect a nugget (on click)
  const collectNugget = useCallback((id: string) => {
    setVisualNuggets((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auto-collect expired nuggets
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setVisualNuggets((prev) => {
        const expired = prev.filter(
          (n) => now - n.spawnedAt >= AUTO_COLLECT_MS
        );
        if (expired.length === 0) return prev;
        return prev.filter((n) => now - n.spawnedAt < AUTO_COLLECT_MS);
      });
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Cleanup spawn timer
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, []);

  return {
    visualNuggets,
    displayedNuggets,
    collectNugget,
    updatePetPos,
  };
}
