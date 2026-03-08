"use client";

import { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameProvider";
import { TransactionType } from "@/contexts/GameProvider";

type FilterTab = "all" | "yield" | "deposit" | "nuggets";

const FILTER_MAP: Record<FilterTab, TransactionType[] | null> = {
  all: null,
  yield: ["yield"],
  deposit: ["deposit", "withdrawal"],
  nuggets: ["nuggets_collected", "nuggets_spent"],
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) return `Today, ${time}`;

  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}, ${time}`;
}

function formatAmount(amount: number, type: TransactionType): string {
  const abs = Math.abs(amount);
  if (type === "yield") return `+${abs.toFixed(2)}`;
  if (amount >= 0) return `+${abs.toFixed(2)}`;
  return `-${abs.toFixed(2)}`;
}

function TxIcon({ type }: { type: TransactionType }) {
  let bg = "#F4EDE0";
  let icon = "?";

  if (type === "yield") {
    bg = "rgba(91,175,72,0.12)";
    icon = "\u2191"; // ↑
  } else if (type === "deposit") {
    bg = "rgba(74,144,196,0.12)";
    icon = "+";
  } else if (type === "withdrawal") {
    bg = "rgba(74,144,196,0.12)";
    icon = "-";
  } else if (type === "nuggets_collected") {
    bg = "rgba(245,192,48,0.12)";
    icon = "\u2605"; // ★
  } else if (type === "nuggets_spent") {
    bg = "rgba(240,144,152,0.12)";
    icon = "\u2193"; // ↓
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 16,
        fontWeight: 800,
        color: "var(--text-secondary)",
      }}
    >
      {icon}
    </div>
  );
}

interface TransactionHistoryProps {
  onBack: () => void;
}

export default function TransactionHistory({ onBack }: TransactionHistoryProps) {
  const game = useGame();
  const [filter, setFilter] = useState<FilterTab>("all");
  const transactions = game.transactions ?? [];

  const totalYield = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "yield")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const nuggetsEarned = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "nuggets_collected")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const filtered = useMemo(() => {
    const types = FILTER_MAP[filter];
    if (!types) return transactions;
    return transactions.filter((tx) => types.includes(tx.type));
  }, [transactions, filter]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "yield", label: "Yield" },
    { key: "deposit", label: "Deposit" },
    { key: "nuggets", label: "Nuggets" },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Transactions
        </span>
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: "1.5px solid #ECD8A0",
            background: "#FFF8E8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="#7878A0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Drag handle */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "#D0CCC0",
          }}
        />
      </div>

      {/* Summary card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1.5px solid #ECD8A0",
          padding: 16,
          display: "flex",
        }}
      >
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Total Yield
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#5BAF48",
              marginTop: 4,
            }}
          >
            {totalYield.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            all time
          </div>
        </div>
        <div
          style={{
            width: 1,
            background: "#F0E8D8",
            margin: "0 8px",
          }}
        />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Nuggets Earned
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#5BAF48",
              marginTop: 4,
            }}
          >
            +{nuggetsEarned}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            all time
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "4px 0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              height: 32,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 999,
              border:
                filter === tab.key
                  ? "1.5px solid var(--text-primary)"
                  : "1.5px solid #ECD8A0",
              background: filter === tab.key ? "var(--text-primary)" : "transparent",
              color: filter === tab.key ? "#FFFFFF" : "var(--text-secondary)",
              fontSize: 13,
              fontFamily: "inherit",
              fontWeight: 700,
              cursor: "pointer",
              transition:
                "background 120ms ease-out, color 120ms ease-out, border 120ms ease-out",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            No transactions yet
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div key={tx.id}>
              {i > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "#F0E8D8",
                    marginLeft: 16,
                    marginRight: 16,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                }}
              >
                <TxIcon type={tx.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tx.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: tx.amount >= 0 ? "#5BAF48" : "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  {formatAmount(tx.amount, tx.type)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
