"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RoomState, FurnitureItem } from "@/types";
import PetRadialMenu, { PetAction } from "@/components/PetRadialMenu";
import RoomNuggets from "@/components/RoomNuggets";
import { VisualNugget } from "@/hooks/useNuggetCollector";

interface IsometricRoomProps {
  room: RoomState;
  onFurnitureTap: (item: FurnitureItem) => void;
  showEgg?: boolean;
  onEggTap?: () => void;
  onPetMenuAction?: (action: PetAction) => void;
  visualNuggets?: VisualNugget[];
  onCollectNugget?: (id: string) => void;
  sfxEnabled?: boolean;
}

/* ── Walkable floor (isometric diamond) ────────────────────────── */
const FLOOR_CX = 214;
const FLOOR_CY = 280;
const FLOOR_HW = 85;
const FLOOR_HH = 50;

/* ── Walk sprite sheet: 4784×329 px, 16 frames in 1 row ──────── */
const TOTAL_FRAMES = 16;
const SHEET_W = 4784;
const SHEET_H = 329;
const FRAME_W = SHEET_W / TOTAL_FRAMES; // 299
const PET_W = 54; // display width per frame
const SCALE = PET_W / FRAME_W; // ≈ 0.2676
const BG_W = SHEET_W * SCALE; // 1280
const PET_H = Math.ceil(SHEET_H * SCALE); // 89
const FRAME_MS = 100; // ms per sprite frame

/* ── Click reaction sprite sheet: 768×140 px, 6 frames in 1 row ─ */
const CLICK_FRAMES = 6;
const CLICK_SHEET_W = 768;
const CLICK_SHEET_H = 140;
const CLICK_FRAME_W = CLICK_SHEET_W / CLICK_FRAMES; // 128
const CLICK_SCALE = PET_W / CLICK_FRAME_W;
const CLICK_PET_H = Math.ceil(CLICK_SHEET_H * CLICK_SCALE); // display height
const CLICK_BG_W = Math.ceil(CLICK_SHEET_W * CLICK_SCALE); // scaled sheet width

/* ── Movement ──────────────────────────────────────────────────── */
const SPEED = PET_W / 144; // 0.5 at PET_W=72, scales proportionally
const IDLE_MIN = 1400;
const IDLE_MAX = 3200;
// Minimum walk distance so one full animation cycle (16 frames) plays
const MIN_WALK_DIST = Math.ceil(
  SPEED * 60 * ((TOTAL_FRAMES * FRAME_MS) / 1000),
); // ~96px

function inFloor(x: number, y: number) {
  return (
    Math.abs(x - FLOOR_CX) / FLOOR_HW + Math.abs(y - FLOOR_CY) / FLOOR_HH <= 1
  );
}

function randFloor(from: { x: number; y: number }): { x: number; y: number } {
  let x: number, y: number;
  let attempts = 0;
  do {
    x = FLOOR_CX + (Math.random() * 2 - 1) * FLOOR_HW * 0.8;
    y = FLOOR_CY + (Math.random() * 2 - 1) * FLOOR_HH * 0.8;
    attempts++;
    if (attempts > 100) break; // fallback to prevent infinite loop
  } while (
    !inFloor(x, y) ||
    Math.sqrt((x - from.x) ** 2 + (y - from.y) ** 2) < MIN_WALK_DIST
  );
  return { x, y };
}

export default function IsometricRoom({
  room,
  onFurnitureTap,
  showEgg = false,
  onEggTap,
  onPetMenuAction,
  visualNuggets = [],
  onCollectNugget,
  sfxEnabled = true,
}: IsometricRoomProps) {
  const [failedFurniture, setFailedFurniture] = useState<Set<string>>(
    new Set(),
  );

  const [walking, setWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [frame, setFrame] = useState(0);
  const [clickFrame, setClickFrame] = useState(-1); // -1 = not clicking, 0–5 = animating
  const clicking = clickFrame >= 0;
  const [eggTapped, setEggTapped] = useState(false);
  const [showRadial, setShowRadial] = useState(false);
  const [radialPos, setRadialPos] = useState({ x: FLOOR_CX, y: FLOOR_CY });

  const posRef = useRef({ x: FLOOR_CX, y: FLOOR_CY });
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);
  const idleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spriteRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const wasWalkingRef = useRef(false);
  const petElRef = useRef<HTMLDivElement>(null);
  const walkLayerRef = useRef<HTMLDivElement>(null);

  const popSfx = useRef<HTMLAudioElement | null>(null);

  const canvasHeight = 702;

  const startWalk = useCallback(() => {
    const target = randFloor(posRef.current);
    targetRef.current = target;
    setFacingLeft(target.x < posRef.current.x);
    setWalking(true);

    // Cycle through all 16 frames while walking
    spriteRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % TOTAL_FRAMES);
    }, FRAME_MS);

    const step = () => {
      const pos = posRef.current;
      const t = targetRef.current;
      if (!t) return;

      const dx = t.x - pos.x;
      const dy = t.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        posRef.current = { x: t.x, y: t.y };
        targetRef.current = null;
        if (spriteRef.current) clearInterval(spriteRef.current);
        setFrame(0);
        setWalking(false);
        if (petElRef.current) {
          petElRef.current.style.left = `${t.x}px`;
          petElRef.current.style.bottom = `${t.y}px`;
        }
        return;
      }

      const move = Math.min(SPEED, dist);
      posRef.current = {
        x: pos.x + (dx / dist) * move,
        y: pos.y + (dy / dist) * move,
      };

      if (petElRef.current) {
        petElRef.current.style.left = `${posRef.current.x}px`;
        petElRef.current.style.bottom = `${posRef.current.y}px`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  /* ── Preload click sprite sheet + sound ────────────────────── */
  useEffect(() => {
    const img = new Image();
    img.src = "/pet_click_sheet.png";
    const audio = new Audio("/bubble_pop.mp3");
    audio.preload = "auto";
    popSfx.current = audio;
  }, []);

  /* ── Click handler: pause walk/idle, enter click state ──────── */
  const handlePetClick = useCallback(() => {
    if (clicking || showRadial) return;

    wasWalkingRef.current = walking;

    if (walking) {
      cancelAnimationFrame(rafRef.current);
      if (spriteRef.current) clearInterval(spriteRef.current);
    }
    if (idleRef.current) clearTimeout(idleRef.current);

    if (sfxEnabled && popSfx.current) {
      popSfx.current.currentTime = 0;
      popSfx.current.play();
    }

    if (walkLayerRef.current) walkLayerRef.current.style.visibility = "hidden";
    setClickFrame(0);
  }, [clicking, walking, showRadial, sfxEnabled]);

  /* ── JS-driven click animation: step through 6 frames ─────────── */
  useEffect(() => {
    if (clickFrame < 0) return;
    if (clickFrame >= CLICK_FRAMES) {
      // Animation done — show radial menu
      if (walkLayerRef.current) walkLayerRef.current.style.visibility = "visible";
      setClickFrame(-1);
      setRadialPos({ x: posRef.current.x, y: posRef.current.y });
      setShowRadial(true);
      return;
    }
    const timer = setTimeout(() => setClickFrame((f) => f + 1), 150);
    return () => clearTimeout(timer);
  }, [clickFrame]);

  /* ── Resume walk/idle after radial menu closes ──────────────── */
  const resumeAfterMenu = useCallback(() => {
    setShowRadial(false);

    if (wasWalkingRef.current) {
      spriteRef.current = setInterval(() => {
        setFrame((prev) => (prev + 1) % TOTAL_FRAMES);
      }, FRAME_MS);

      const step = () => {
        const pos = posRef.current;
        const t = targetRef.current;
        if (!t) {
          if (spriteRef.current) clearInterval(spriteRef.current);
          setFrame(0);
          setWalking(false);
          return;
        }

        const dx = t.x - pos.x;
        const dy = t.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          posRef.current = { x: t.x, y: t.y };
          targetRef.current = null;
          if (spriteRef.current) clearInterval(spriteRef.current);
          setFrame(0);
          setWalking(false);
          if (petElRef.current) {
            petElRef.current.style.left = `${t.x}px`;
            petElRef.current.style.bottom = `${t.y}px`;
          }
          return;
        }

        const move = Math.min(SPEED, dist);
        posRef.current = {
          x: pos.x + (dx / dist) * move,
          y: pos.y + (dy / dist) * move,
        };

        if (petElRef.current) {
          petElRef.current.style.left = `${posRef.current.x}px`;
          petElRef.current.style.bottom = `${posRef.current.y}px`;
        }

        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    }
  }, []);

  const handleRadialAction = useCallback((action: PetAction) => {
    resumeAfterMenu();
    onPetMenuAction?.(action);
  }, [resumeAfterMenu, onPetMenuAction]);

  const handleRadialClose = useCallback(() => {
    resumeAfterMenu();
  }, [resumeAfterMenu]);

  useEffect(() => {
    if (walking || clicking || showRadial) return;
    const delay = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
    idleRef.current = setTimeout(startWalk, delay);
    return () => {
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [walking, clicking, showRadial, startWalk]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (idleRef.current) clearTimeout(idleRef.current);
      if (spriteRef.current) clearInterval(spriteRef.current);
    };
  }, []);

  const bgX = -frame * PET_W;

  const handleEggTap = useCallback(() => {
    if (eggTapped) return;
    setEggTapped(true);
    if (sfxEnabled && popSfx.current) {
      popSfx.current.currentTime = 0;
      popSfx.current.play();
    }
    setTimeout(() => {
      onEggTap?.();
      setEggTapped(false);
    }, 400);
  }, [eggTapped, onEggTap, sfxEnabled]);

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

      {showEgg ? (
        /* Egg — shown when not signed in */
        <div
          className={eggTapped ? "egg-tap" : "egg-idle"}
          onClick={handleEggTap}
          style={{
            position: "absolute",
            left: FLOOR_CX,
            bottom: FLOOR_CY,
            width: 70,
            height: 55,
            zIndex: 5,
            cursor: "pointer",
          }}
        >
          <img
            src="/egg_without_bush.png"
            alt="Egg"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : (
        /* Pet sprite */
        <div
          ref={petElRef}
          onClick={handlePetClick}
          style={{
            position: "absolute",
            left: FLOOR_CX,
            bottom: FLOOR_CY,
            width: PET_W,
            height: PET_H,
            transform: `translateX(-50%) ${facingLeft ? "scaleX(-1)" : ""}`,
            zIndex: 5,
            cursor: "pointer",
          }}
        >
          {/* Walk layer — always rendered */}
          <div
            ref={walkLayerRef}
            style={{
              width: PET_W,
              height: PET_H,
              backgroundImage: "url(/pet_walk_sheet.png)",
              backgroundSize: `${BG_W}px ${PET_H}px`,
              backgroundPosition: `${bgX}px 0px`,
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Click layer — overlays on top, removed when done */}
          {clickFrame >= 0 && clickFrame < CLICK_FRAMES && (
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 2,
                width: PET_W,
                height: CLICK_PET_H,
                backgroundImage: "url(/pet_click_sheet.png)",
                backgroundSize: `${CLICK_BG_W}px ${CLICK_PET_H}px`,
                backgroundPosition: `${-clickFrame * PET_W}px 0`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>
      )}

      {/* Collectible nuggets on the floor */}
      {visualNuggets.length > 0 && onCollectNugget && (
        <RoomNuggets nuggets={visualNuggets} onCollect={onCollectNugget} />
      )}

      {/* Radial menu backdrop — full room, catches outside taps */}
      {showRadial && !showEgg && (
        <div
          onClick={handleRadialClose}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 19,
          }}
        />
      )}

      {/* Radial menu — anchored at pet center */}
      {!showEgg && (
        <div
          style={{
            position: "absolute",
            left: radialPos.x,
            bottom: radialPos.y + PET_H / 2,
            zIndex: 20,
            pointerEvents: showRadial ? "auto" : "none",
          }}
        >
          <PetRadialMenu
            visible={showRadial}
            onAction={handleRadialAction}
            onClose={handleRadialClose}
          />
        </div>
      )}
    </div>
  );
}
