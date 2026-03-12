"use client";

import { useMemo } from "react";
import { useGame } from "@/contexts/GameProvider";
import { Transaction } from "@/contexts/GameProvider";

interface PocketPileScreenProps {
  onClose: () => void;
  onDeposit: () => void;
}

function fmtUSD(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtCompact(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DepositEntry {
  amount: number;
  timestamp: number;
  balanceAfter: number;
}

function getDepositHistory(transactions: Transaction[], currentBalance: number): DepositEntry[] {
  // Deposits in chronological order (oldest first)
  const deposits = transactions
    .filter((tx) => tx.type === "deposit")
    .sort((a, b) => a.timestamp - b.timestamp);

  // Calculate running balance after each deposit
  let runningBalance = currentBalance;
  // Work backwards from current balance
  const reversed = [...deposits].reverse();
  const entries: DepositEntry[] = [];
  for (const d of reversed) {
    entries.unshift({
      amount: d.amount,
      timestamp: d.timestamp,
      balanceAfter: runningBalance,
    });
    runningBalance -= d.amount;
  }

  return entries;
}

function getMonthlyData(deposits: DepositEntry[]): { label: string; amount: number }[] {
  const now = new Date();
  const months: { label: string; amount: number }[] = [];

  // Show last 5 months
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const label = MONTH_LABELS[d.getMonth()];
    let total = 0;
    for (const dep of deposits) {
      const depDate = new Date(dep.timestamp);
      const depKey = `${depDate.getFullYear()}-${depDate.getMonth()}`;
      if (depKey === monthKey) total += dep.amount;
    }
    months.push({ label, amount: total });
  }

  return months;
}

// Color palette for timeline cards
const TIMELINE_COLORS = [
  { border: "#5BAF48", bg: "rgba(91,175,72,0.08)", label: "#5BAF48" },
  { border: "#4A90C4", bg: "rgba(74,144,196,0.08)", label: "#4A90C4" },
  { border: "#E8A040", bg: "rgba(232,160,64,0.08)", label: "#E8A040" },
];

export default function PocketPileScreen({ onClose, onDeposit }: PocketPileScreenProps) {
  const game = useGame();
  const hidden = !(game.balanceVisible ?? true);

  const deposits = useMemo(
    () => getDepositHistory(game.transactions, game.depositBalance),
    [game.transactions, game.depositBalance],
  );

  const monthlyData = useMemo(() => getMonthlyData(deposits), [deposits]);
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const avgDeposit = deposits.length > 0 ? totalDeposited / deposits.length : 0;

  // Timeline entries
  const mostRecent = deposits.length > 0 ? deposits[deposits.length - 1] : null;
  const biggest = deposits.length > 0
    ? deposits.reduce((max, d) => (d.amount > max.amount ? d : max), deposits[0])
    : null;
  const firstEver = deposits.length > 0 ? deposits[0] : null;

  // Always show all three timeline entries, combining tags when they overlap
  const timelineEntries = useMemo(() => {
    if (deposits.length === 0) return [];

    const entries: {
      tag: string;
      deposit: DepositEntry;
      color: typeof TIMELINE_COLORS[0];
      milestone?: string;
    }[] = [];

    // Build tag map: which roles does each deposit have?
    const tagMap = new Map<number, string[]>();
    if (mostRecent) {
      const tags = tagMap.get(mostRecent.timestamp) || [];
      tags.push("Most Recent");
      tagMap.set(mostRecent.timestamp, tags);
    }
    if (biggest) {
      const tags = tagMap.get(biggest.timestamp) || [];
      tags.push("Biggest");
      tagMap.set(biggest.timestamp, tags);
    }
    if (firstEver) {
      const tags = tagMap.get(firstEver.timestamp) || [];
      tags.push("First ever");
      tagMap.set(firstEver.timestamp, tags);
    }

    // Deduplicate: show each unique deposit once with combined tags
    const seen = new Set<number>();
    const order: { deposit: DepositEntry; colorIdx: number; milestone?: string }[] = [];

    if (mostRecent && !seen.has(mostRecent.timestamp)) {
      seen.add(mostRecent.timestamp);
      order.push({ deposit: mostRecent, colorIdx: 0 });
    }
    if (biggest && !seen.has(biggest.timestamp)) {
      seen.add(biggest.timestamp);
      order.push({ deposit: biggest, colorIdx: 1 });
    }
    if (firstEver && !seen.has(firstEver.timestamp)) {
      seen.add(firstEver.timestamp);
      order.push({ deposit: firstEver, colorIdx: 2, milestone: `${game.petName}'s journey began!` });
    }

    for (const item of order) {
      const tags = tagMap.get(item.deposit.timestamp) || [];
      const isFirst = tags.includes("First ever");
      entries.push({
        tag: tags.join(" · "),
        deposit: item.deposit,
        color: TIMELINE_COLORS[item.colorIdx],
        milestone: isFirst ? `${game.petName}'s journey began!` : item.milestone,
      });
    }

    return entries;
  }, [deposits, mostRecent, biggest, firstEver, game.petName]);

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
          overflowY: "auto",
          padding: "20px 20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Hero Card */}
        <div
          style={{
            ...cardStyle,
            padding: "28px 20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            minHeight: 180,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Pocket Pile
              {game.onChainMode && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "#E8F5E3",
                    color: "#2E7D32",
                    verticalAlign: "middle",
                  }}
                >
                  On-Chain
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "var(--text-primary)",
                marginTop: 8,
                lineHeight: 1.1,
              }}
            >
              <span onClick={() => game.toggleBalanceVisible()} style={{ cursor: "pointer" }}>
                {hidden ? "••••••" : fmtUSD(game.depositBalance)}{" "}
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>USD</span>
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginTop: 6,
              }}
            >
              Total Deposit
            </div>

            {/* Status badges */}
            <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
              {game.depositBalance > 0 && (
                <div
                  style={{
                    background: "rgba(91,175,72,0.12)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#5BAF48",
                  }}
                >
                  Actively Growing
                </div>
              )}
              {game.depositBalance > 0 && (
                <div
                  style={{
                    background: "rgba(91,175,72,0.12)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#5BAF48",
                  }}
                >
                  Earning {apyRate}% yearly
                </div>
              )}
            </div>
          </div>

          {/* Money bag image */}
          <img
            src="/pet_money_bag.png"
            alt=""
            style={{
              width: 90,
              height: 125,
              objectFit: "contain",
              flexShrink: 0,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
            }}
          />
        </div>

        {/* Deposit History Chart */}
        <div style={{ ...cardStyle }}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>Deposit History</div>

          {/* Bar chart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: 100,
              gap: 8,
              padding: "0 8px",
            }}
          >
            {monthlyData.map((m, i) => {
              const barH = m.amount > 0 ? Math.max(8, (m.amount / maxMonthly) * 80) : 0;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {m.amount > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                      }}
                    >
                      +{m.amount >= 1000 ? `${Math.round(m.amount / 1000)}K` : m.amount}
                    </span>
                  )}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 40,
                      height: barH,
                      borderRadius: 6,
                      background: m.amount > 0
                        ? "linear-gradient(180deg, #B8D8E8 0%, #8FC0D8 100%)"
                        : "transparent",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Month labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 8px 0",
            }}
          >
            {monthlyData.map((m, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: 8 }}>
          {/* Deposits count */}
          <div
            style={{
              ...cardStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "14px 8px",
            }}
          >
            <span style={labelStyle}>Deposits</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              {deposits.length}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
              times
            </span>
          </div>

          {/* Avg Deposit */}
          <div
            style={{
              ...cardStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "14px 8px",
            }}
          >
            <span style={labelStyle}>Avg. Deposit</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              {hidden ? "••••" : fmtCompact(Math.round(avgDeposit))}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
              USD
            </span>
          </div>

          {/* Yield Earned */}
          <div
            style={{
              ...cardStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "14px 8px",
            }}
          >
            <span style={labelStyle}>Yield Earned</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#5BAF48",
              }}
            >
              {hidden ? "••••" : `+${fmtCompact(Math.round(game.totalYieldEarned ?? 0))}`}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
              so far
            </span>
          </div>
        </div>

        {/* Timeline */}
        {timelineEntries.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0 0",
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
                Timeline
              </span>
              <div style={{ flex: 1, height: 1, background: "#E0D8C8" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {timelineEntries.map((entry, idx) => {
                const yieldFromDeposit = entry.deposit.amount > 0
                  ? ((game.totalYieldEarned ?? 0) * (entry.deposit.amount / totalDeposited))
                  : 0;

                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      borderLeft: `4px solid ${entry.color.border}`,
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    {/* Tag header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 16px",
                        background: entry.color.bg,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: entry.color.label,
                        }}
                      >
                        Deposit #{deposits.indexOf(entry.deposit) + 1} &middot; {entry.tag}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: entry.color.label,
                        }}
                      >
                        {hidden ? "••••" : `+${fmtCompact(entry.deposit.amount)}`}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={labelStyle}>Date</div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginTop: 2,
                            }}
                          >
                            {formatDate(entry.deposit.timestamp)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={labelStyle}>Balance After</div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginTop: 2,
                            }}
                          >
                            {hidden ? "••••" : fmtUSD(entry.deposit.balanceAfter)}
                          </div>
                        </div>
                      </div>

                      {/* Yield from this deposit */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={labelStyle}>Yield from this deposit</div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#5BAF48",
                              marginTop: 2,
                            }}
                          >
                            {hidden ? "••••" : `+${fmtCompact(Math.round(yieldFromDeposit * 100) / 100)} earned`}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {relativeTime(entry.deposit.timestamp)}
                        </span>
                      </div>

                      {/* Milestone */}
                      {entry.milestone && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                            padding: "8px 12px",
                            background: "rgba(232,160,64,0.08)",
                            borderRadius: 10,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>🐾</span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "var(--text-primary)",
                            }}
                          >
                            {entry.milestone}
                          </span>
                        </div>
                      )}

                      {/* Unlocked tier milestone for biggest */}
                      {entry.tag === "Biggest" && entry.deposit.balanceAfter >= 1000 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                            padding: "8px 12px",
                            background: "rgba(74,144,196,0.08)",
                            borderRadius: 10,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>🏆</span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "var(--text-primary)",
                            }}
                          >
                            Unlocked nugget hoarder tier with this deposit!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {deposits.length === 0 && (
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
              src="/pet_money_bag.png"
              alt=""
              style={{ width: 64, height: 89, objectFit: "contain", opacity: 0.4 }}
            />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-secondary)", textAlign: "center" }}>
              No deposits yet. Start saving to grow your pocket pile!
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
              Make First Deposit
            </button>
          </div>
        )}

        {/* Deposit CTA */}
        {deposits.length > 0 && (
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
            Add to Pocket Pile
          </button>
        )}
      </div>
    </div>
  );
}
