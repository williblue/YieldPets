"use client";

import { HUDState, HeartCount } from "@/types";
import { useGame } from "@/contexts/GameProvider";

function formatGold(value: number): string {
  return value.toLocaleString("en-US");
}

function formatBalance(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1)}K`;
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${value.toFixed(2)}`;
}

function formatYield(value: number): string {
  if (value >= 1_000) return `+${(value / 1_000).toFixed(1)}K`;
  if (value >= 100) return `+${Math.floor(value)}`;
  if (value >= 1) return `+${value.toFixed(1)}`;
  return `+${value.toFixed(2)}`;
}

function CoinIcon() {
  return (
    <img
      src="/gold nuggets/gold_nugget_icon.png"
      alt="Gold nugget"
      width={20}
      height={20}
      style={{ objectFit: "contain" }}
    />
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

function BalanceIcon() {
  return (
    <span
      style={{
        fontSize: 14,
        fontWeight: 900,
        color: "#5BAF48",
        lineHeight: 1,
        letterSpacing: -0.5,
      }}
    >
      USD
    </span>
  );
}

interface HUDBarProps {
  state: HUDState;
  onBalanceTap?: () => void;
}

export default function HUDBar({ state, onBalanceTap }: HUDBarProps) {
  const { goldNuggets, hearts, depositBalance, yieldPerDay, loading } = state;
  const game = useGame();

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
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "9px 12px 0",
      }}
    >
      {/* Gold Nuggets */}
      <div id="hud-nugget-pill" style={{ ...pillStyle, minWidth: 80 }}>
        <CoinIcon />
        <span style={valueStyle}>{loading ? "\u2014" : formatGold(goldNuggets)}</span>
      </div>

      {/* Hearts */}
      <div style={{ ...pillStyle }}>
        {([0, 1, 2, 3] as const).map((i) => (
          <HeartIcon key={i} filled={!loading && i < hearts} />
        ))}
      </div>

      {/* Deposit Balance + Yield */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, cursor: "pointer" }}
        onClick={() => onBalanceTap ? onBalanceTap() : game.toggleBalanceVisible()}
      >
        <div style={{ ...pillStyle, minWidth: 80 }}>
          <BalanceIcon />
          <span style={valueStyle}>
            {loading ? "\u2014" : (game.balanceVisible ?? true) ? formatBalance(depositBalance) : "••••"}
          </span>
        </div>
        {!loading && yieldPerDay > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#5BAF48",
              paddingRight: 4,
              lineHeight: 1,
            }}
          >
            {(game.balanceVisible ?? true) ? `${formatYield(yieldPerDay * 7)}/week` : "••••"}
          </span>
        )}
      </div>
    </div>
  );
}
