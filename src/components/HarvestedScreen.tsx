"use client";

import { useMemo } from "react";
import { useGame } from "@/contexts/GameProvider";
import { Transaction } from "@/contexts/GameProvider";

interface HarvestedScreenProps {
  onClose: () => void;
  onDeposit: () => void;
}

function fmtYield(value: number): string {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100) return value.toFixed(1);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(2);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface YieldDay {
  date: string;
  amount: number;
}

function getYieldByDay(transactions: Transaction[]): YieldDay[] {
  const yieldTxs = transactions.filter((tx) => tx.type === "yield");
  const dayMap = new Map<string, number>();

  for (const tx of yieldTxs) {
    const date = formatDate(tx.timestamp);
    dayMap.set(date, (dayMap.get(date) || 0) + tx.amount);
  }

  // Return sorted newest first
  return Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .reverse();
}

function getYieldBreakdown(transactions: Transaction[]) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekMs = startOfWeek.getTime();

  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(1);
  const monthMs = startOfMonth.getTime();

  const yieldTxs = transactions.filter((tx) => tx.type === "yield");

  let today = 0;
  let week = 0;
  let month = 0;

  for (const tx of yieldTxs) {
    if (tx.timestamp >= todayMs) today += tx.amount;
    if (tx.timestamp >= weekMs) week += tx.amount;
    if (tx.timestamp >= monthMs) month += tx.amount;
  }

  return { today, week, month };
}

export default function HarvestedScreen({ onClose, onDeposit }: HarvestedScreenProps) {
  const game = useGame();
  const hidden = !(game.balanceVisible ?? true);

  const breakdown = useMemo(() => getYieldBreakdown(game.transactions), [game.transactions]);
  const recentHarvests = useMemo(() => getYieldByDay(game.transactions), [game.transactions]);

  const totalYield = game.totalYieldEarned ?? 0;
  const apyRate = game.depositBalance > 0
    ? ((game.yieldPerDay / game.depositBalance) * 365 * 100).toFixed(1)
    : "0.0";

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    boxShadow: "var(--shadow-card)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 72,
        zIndex: 95,
        background: "var(--modal-bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: "1.5px solid #E0D8C8",
          background: "#FFFFFF",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          padding: "20px 20px 32px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Hero Card */}
        <div
          style={{
            ...cardStyle,
            padding: "24px 20px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Harvested
          </div>

          {/* Yield icon */}
          <img
            src="/yield_icon.png"
            alt=""
            style={{
              width: 48,
              height: 48,
              objectFit: "contain",
              marginTop: 4,
            }}
          />

          <div style={{ ...labelStyle, marginTop: 4 }}>Total Harvested</div>

          <div
            onClick={() => game.toggleBalanceVisible()}
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#5BAF48",
              lineHeight: 1.1,
              cursor: "pointer",
            }}
          >
            {hidden ? "••••••" : `+${fmtYield(totalYield)}`}
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            PYUSD since first deposit
          </div>

          {/* Status badges */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {game.yieldPerDay > 0 && (
              <div
                style={{
                  background: "rgba(91,175,72,0.12)",
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#5BAF48",
                }}
              >
                {hidden ? "••••" : `+${fmtYield(game.yieldPerDay)} today`}
              </div>
            )}
            {game.depositBalance > 0 && (
              <div
                style={{
                  background: "rgba(91,175,72,0.12)",
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#5BAF48",
                }}
              >
                {apyRate}% APY
              </div>
            )}
          </div>
        </div>

      

        {/* Yield Breakdown */}
        <div style={{ ...cardStyle }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "var(--text-primary)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              Yield Breakdown
            </span>
            <div style={{ flex: 1, height: 1, background: "#E0D8C8" }} />
          </div>

          {/* Rows */}
          {[
            { label: "Today", value: breakdown.today },
            { label: "This Week", value: breakdown.week },
            { label: "This Month", value: breakdown.month },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderTop: i > 0 ? "1px solid #F0E8D8" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#5BAF48",
                }}
              >
                {hidden ? "••••" : `+${fmtYield(row.value)}`}
              </span>
            </div>
          ))}

          {/* Daily Rate */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderTop: "1px solid #F0E8D8",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Daily Rate
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--text-secondary)",
              }}
            >
              {hidden ? "••••" : `~${fmtYield(game.yieldPerDay)} / day`}
            </span>
          </div>
        </div>

        {/* Recent Harvests */}
        {recentHarvests.length > 0 && (
          <div
            style={{
              ...cardStyle,
              borderLeft: "4px solid #5BAF48",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(91,175,72,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#5BAF48",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Recent Harvests
              </span>
            </div>

            <div style={{ padding: "4px 16px 8px" }}>
              {recentHarvests.slice(0, 10).map((harvest, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderTop: i > 0 ? "1px solid #F0E8D8" : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {harvest.date}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#5BAF48",
                    }}
                  >
                    {hidden ? "••••" : `+${fmtYield(harvest.amount)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalYield === 0 && (
          <div
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: 32,
            }}
          >
            <img
              src="/yield_icon.png"
              alt=""
              style={{ width: 48, height: 48, objectFit: "contain", opacity: 0.4 }}
            />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-secondary)", textAlign: "center" }}>
              No yield earned yet. Deposit and keep your pet happy to start earning!
            </div>
            <button
              onClick={onDeposit}
              style={{
                width: "100%",
                maxWidth: 200,
                height: 44,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(180deg, #8CD468 0%, #5BAF48 100%)",
                boxShadow: "0 3px 0px #3D7A30",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Make a Deposit
            </button>
          </div>
        )}

        {/* Deposit CTA */}
        {totalYield > 0 && (
          <button
            onClick={onDeposit}
            style={{
              width: "100%",
              minHeight: 52,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(180deg, #8CD468 0%, #5BAF48 100%)",
              boxShadow: "0 4px 0px #3D7A30",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: 16,
              marginTop: 4,
              marginBottom: 4,
              flexShrink: 0,
              padding: "14px 0",
            }}
          >
            Deposit More to Grow Yield
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
