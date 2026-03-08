"use client";

import { HUDState, HeartCount } from "@/types";

function formatGold(value: number): string {
  return value.toLocaleString("en-US");
}

function formatBalance(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1)}K`;
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${value.toFixed(2)}`;
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

function PiggyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <ellipse cx="11" cy="11.5" rx="6.5" ry="5" fill="#F8B0B8"/>
      <ellipse cx="11" cy="11.5" rx="5" ry="4" fill="#F09098"/>
      <circle cx="6" cy="10" r="2" fill="#F8B0B8"/>
      <ellipse cx="11" cy="8.5" rx="2" ry="1" fill="#FFFFFF" opacity="0.35"/>
      <rect x="8.5" y="15" width="1.8" height="2.5" rx="0.8" fill="#E08088"/>
      <rect x="12" y="15" width="1.8" height="2.5" rx="0.8" fill="#E08088"/>
      <circle cx="13.5" cy="10.5" r="0.7" fill="#3C3848"/>
      <rect x="10" y="6" width="2.2" height="2.2" rx="1.1" fill="#F5C030" stroke="#D4A020" strokeWidth="0.4"/>
    </svg>
  );
}

interface HUDBarProps {
  state: HUDState;
}

export default function HUDBar({ state }: HUDBarProps) {
  const { goldNuggets, hearts, depositBalance, loading } = state;

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

      {/* Deposit Balance */}
      <div style={{ ...pillStyle, minWidth: 80 }}>
        <PiggyIcon />
        <span style={valueStyle}>{loading ? "\u2014" : formatBalance(depositBalance)}</span>
      </div>
    </div>
  );
}
