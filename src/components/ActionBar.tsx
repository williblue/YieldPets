"use client";

import { useState } from "react";

function PlantIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 28V18" stroke="#8B6C42" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 20c-4-2-7-7-5-12 5 1 8 6 5 12z" fill="#7CB87C" />
      <path d="M18 22c4-2 7-6 5-11-5 1-8 5-5 11z" fill="#8EC88E" />
      <ellipse cx="18" cy="30" rx="8" ry="4" fill="#8B6C42" opacity="0.7" />
    </svg>
  );
}

function HeartBubbleIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="4" width="28" height="24" rx="12" fill="var(--hud-bar-bg)" stroke="var(--hud-border)" strokeWidth="1" />
      <path
        d="M18 23s-5-3.5-5-6.5a3 3 0 015-2.2 3 3 0 015 2.2c0 3-5 6.5-5 6.5z"
        fill="var(--hearts-pink)"
      />
      <polygon points="18,28 14,24 22,24" fill="var(--hud-bar-bg)" />
    </svg>
  );
}

interface ActionBarProps {
  onFeed: () => void;
  onPlant: () => void;
  onHeart: () => void;
  feedDisabled?: boolean;
}

export default function ActionBar({ onFeed, onPlant, onHeart, feedDisabled }: ActionBarProps) {
  const [feedPressed, setFeedPressed] = useState(false);
  const [plantPressed, setPlantPressed] = useState(false);
  const [heartPressed, setHeartPressed] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        width: 428,
        height: 100,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Plant button */}
      <button
        onTouchStart={() => setPlantPressed(true)}
        onTouchEnd={() => setPlantPressed(false)}
        onMouseDown={() => setPlantPressed(true)}
        onMouseUp={() => setPlantPressed(false)}
        onMouseLeave={() => setPlantPressed(false)}
        onClick={onPlant}
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-pill)",
          background: "var(--hud-bar-bg)",
          border: "1.5px solid var(--hud-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: plantPressed ? "scale(0.94)" : "scale(1)",
          transition: plantPressed ? "transform 80ms ease-out" : "transform 120ms ease-out",
          padding: 0,
        }}
      >
        <PlantIcon />
      </button>

      {/* Feed button */}
      <button
        onTouchStart={() => !feedDisabled && setFeedPressed(true)}
        onTouchEnd={() => setFeedPressed(false)}
        onMouseDown={() => !feedDisabled && setFeedPressed(true)}
        onMouseUp={() => setFeedPressed(false)}
        onMouseLeave={() => setFeedPressed(false)}
        onClick={feedDisabled ? undefined : onFeed}
        disabled={feedDisabled}
        style={{
          width: 160,
          height: 56,
          borderRadius: "var(--radius-pill)",
          background: feedPressed
            ? "var(--feed-btn-bg)"
            : "linear-gradient(180deg, var(--feed-btn-top) 0%, var(--feed-btn-bg) 40%)",
          border: "none",
          cursor: feedDisabled ? "not-allowed" : "pointer",
          color: "var(--feed-btn-text)",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.5px",
          boxShadow: feedPressed
            ? "0 1px 0px var(--feed-btn-shadow)"
            : "0 4px 0px var(--feed-btn-shadow)",
          transform: feedPressed ? "scale(0.97)" : "scale(1)",
          transition: feedPressed
            ? "transform 80ms ease-out, box-shadow 80ms ease-out"
            : "transform 120ms ease-out, box-shadow 120ms ease-out",
          opacity: feedDisabled ? 0.4 : 1,
          padding: 0,
          lineHeight: 1,
        }}
      >
        Feed
      </button>

      {/* Heart button */}
      <button
        onTouchStart={() => setHeartPressed(true)}
        onTouchEnd={() => setHeartPressed(false)}
        onMouseDown={() => setHeartPressed(true)}
        onMouseUp={() => setHeartPressed(false)}
        onMouseLeave={() => setHeartPressed(false)}
        onClick={onHeart}
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-pill)",
          background: "var(--hud-bar-bg)",
          border: "1.5px solid var(--hud-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: heartPressed ? "scale(0.94)" : "scale(1)",
          transition: heartPressed ? "transform 80ms ease-out" : "transform 120ms ease-out",
          padding: 0,
        }}
      >
        <HeartBubbleIcon />
      </button>
    </div>
  );
}
