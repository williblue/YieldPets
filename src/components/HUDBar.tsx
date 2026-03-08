"use client";

import { HUDState, HeartCount } from "@/types";

function formatGold(value: number): string {
  return value.toLocaleString("en-US");
}

function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#F5C030" stroke="#D4A020" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="5" fill="#F8D868" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 15.5s-6.5-4.35-6.5-8.18A3.82 3.82 0 019 4.15a3.82 3.82 0 016.5 3.17C15.5 11.15 9 15.5 9 15.5z"
        fill={filled ? "var(--hearts-pink)" : "var(--hearts-empty)"}
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2L3 5.5v4.5c0 4.14 2.99 8.01 7 9 4.01-.99 7-4.86 7-9V5.5L10 2z"
        fill="var(--shield-blue)"
        stroke="var(--shield-border)"
        strokeWidth="1"
      />
    </svg>
  );
}

interface HUDBarProps {
  state: HUDState;
}

export default function HUDBar({ state }: HUDBarProps) {
  const { goldNuggets, hearts, shieldScore, loading } = state;

  const pillStyle: React.CSSProperties = {
    background: "var(--hud-bar-bg)",
    border: "1.5px solid var(--hud-border)",
    borderRadius: "var(--radius-pill)",
    height: 34,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "var(--shadow-hud)",
    opacity: loading ? 0 : 1,
    transition: "opacity 200ms ease-out",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 428,
        height: 52,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
      }}
    >
      {/* Gold Nuggets */}
      <div style={{ ...pillStyle, minWidth: 80 }}>
        <CoinIcon />
        <span style={valueStyle}>{loading ? "\u2014" : formatGold(goldNuggets)}</span>
      </div>

      {/* Hearts */}
      <div style={{ ...pillStyle }}>
        {([0, 1, 2, 3] as const).map((i) => (
          <HeartIcon key={i} filled={!loading && i < hearts} />
        ))}
      </div>

      {/* Shield */}
      <div style={{ ...pillStyle, minWidth: 60 }}>
        <ShieldIcon />
        <span style={valueStyle}>{loading ? "\u2014" : shieldScore}</span>
      </div>
    </div>
  );
}
