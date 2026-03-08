"use client";

import { useState } from "react";
import { useGame } from "@/contexts/GameProvider";

interface PetStatsModalProps {
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  petName: string;
  petImageUrl: string;
}

type Tab = "about" | "personality";

const MOCK_AGE = "4 months old";

function stashStatus(balance: number): string {
  if (balance >= 10000) return "Stash Legend";
  if (balance >= 1000) return "Stash Grower";
  if (balance >= 100) return "Stash Sprout";
  if (balance > 0) return "Stash Seedling";
  return "No Stash";
}

export default function PetStatsModal({
  onClose,
  onDeposit,
  onWithdraw,
  petName,
  petImageUrl,
}: PetStatsModalProps) {
  const game = useGame();
  const [tab, setTab] = useState<Tab>("about");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [depositPressed, setDepositPressed] = useState(false);
  const [withdrawPressed, setWithdrawPressed] = useState(false);

  const growthRate = game.depositBalance > 0
    ? ((game.yieldPerDay / game.depositBalance) * 100).toFixed(1)
    : "0.0";

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    boxShadow: "var(--shadow-card)",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 72,
        zIndex: 90,
        background: "var(--modal-bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Back button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 2,
          width: 44,
          height: 44,
          borderRadius: 999,
          border: "2px solid #ECD8A0",
          background: "#FFF8E8",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="#7878A0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: 0,
            justifyContent: "center",
            background: "#F0E8D8",
            borderRadius: 999,
            padding: 3,
            alignSelf: "center",
          }}
        >
          {(["about", "personality"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: 36,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 999,
                border: "none",
                background: tab === t ? "#FFFFFF" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                transition: "background 120ms ease-out, color 120ms ease-out",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {t === "about" ? "About" : "Personality"}
            </button>
          ))}
        </div>

        {/* ABOUT Tab Content */}
        {tab === "about" && (
          <>
            {/* Pet Info Card */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Pet Image */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 12,
                  border: "3px solid #D4B896",
                  background: "#F8F4EC",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={petImageUrl}
                  alt={petName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Pet Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <div>
                  <span style={labelStyle}>Pet Name:</span>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      marginTop: 1,
                    }}
                  >
                    {petName}
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>Age:</span>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginTop: 1,
                    }}
                  >
                    {MOCK_AGE}
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>Stash Status:</span>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginTop: 1,
                    }}
                  >
                    {stashStatus(game.depositBalance)}
                  </div>
                </div>
              </div>

              {/* YieldPets Official Badge */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: -8,
                  width: 72,
                  height: 72,
                  opacity: 0.15,
                  transform: "rotate(15deg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    border: "3px solid #3C3848",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#3C3848",
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                    padding: 6,
                  }}
                >
                  YieldPets Official
                </div>
              </div>
            </div>

            {/* Stats Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Pocket Pile */}
              <button
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(91,175,72,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="9" fill="#5BAF48" />
                    <text
                      x="11"
                      y="15"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="inherit"
                    >
                      $
                    </text>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Pocket Pile
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                      <text
                        x="7"
                        y="10.5"
                        textAnchor="middle"
                        fill="#C0B8A8"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="inherit"
                      >
                        i
                      </text>
                    </svg>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      marginTop: 2,
                    }}
                  >
                    {balanceVisible ? game.depositBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "****"}{" "}
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                      (USD)
                    </span>
                  </div>
                </div>
                {/* Eye toggle */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBalanceVisible(!balanceVisible);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setBalanceVisible(!balanceVisible);
                    }
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    {balanceVisible ? (
                      <>
                        <path
                          d="M1.5 9C1.5 9 4 4 9 4C14 4 16.5 9 16.5 9C16.5 9 14 14 9 14C4 14 1.5 9 1.5 9Z"
                          stroke="#A0A8B8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle cx="9" cy="9" r="2.5" stroke="#A0A8B8" strokeWidth="1.5" />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1.5 9C1.5 9 4 4 9 4C14 4 16.5 9 16.5 9C16.5 9 14 14 9 14C4 14 1.5 9 1.5 9Z"
                          stroke="#A0A8B8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 15L15 3"
                          stroke="#A0A8B8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="#C0B8A8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Harvested */}
              <button
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(160,120,80,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <ellipse cx="11" cy="16" rx="4" ry="3" fill="#A07850" />
                    <path
                      d="M11 14V8"
                      stroke="#6B9E56"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="9"
                      cy="7"
                      rx="3"
                      ry="4"
                      transform="rotate(25 9 7)"
                      fill="#7CC74E"
                    />
                    <ellipse
                      cx="13"
                      cy="7"
                      rx="3"
                      ry="4"
                      transform="rotate(-25 13 7)"
                      fill="#7CC74E"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Harvested
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                      <text
                        x="7"
                        y="10.5"
                        textAnchor="middle"
                        fill="#C0B8A8"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="inherit"
                      >
                        i
                      </text>
                    </svg>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#5BAF48",
                      marginTop: 2,
                    }}
                  >
                    +{game.yieldPerDay.toFixed(2)}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="#C0B8A8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Growth Rate */}
              <button
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(74,144,196,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="4" y="12" width="3" height="6" rx="1" fill="#4A90C4" opacity="0.5" />
                    <rect x="9.5" y="8" width="3" height="10" rx="1" fill="#4A90C4" opacity="0.7" />
                    <rect x="15" y="5" width="3" height="13" rx="1" fill="#4A90C4" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Growth Rate:
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "var(--text-primary)",
                      }}
                    >
                      {growthRate}%
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                      <text
                        x="7"
                        y="10.5"
                        textAnchor="middle"
                        fill="#C0B8A8"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="inherit"
                      >
                        i
                      </text>
                    </svg>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="#C0B8A8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Deposit / Withdraw Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={onDeposit}
                onMouseDown={() => setDepositPressed(true)}
                onMouseUp={() => setDepositPressed(false)}
                onMouseLeave={() => setDepositPressed(false)}
                onTouchStart={() => setDepositPressed(true)}
                onTouchEnd={() => setDepositPressed(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(180deg, #8CD468 0%, #5BAF48 100%)",
                  boxShadow: depositPressed
                    ? "0 1px 0px #3D7A30"
                    : "0 4px 0px #3D7A30",
                  color: "#FFFFFF",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 16,
                  transform: depositPressed
                    ? "scale(0.97) translateY(3px)"
                    : "scale(1) translateY(0)",
                  transition: depositPressed
                    ? "transform 80ms ease-out, box-shadow 80ms ease-out"
                    : "transform 120ms ease-out, box-shadow 120ms ease-out",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                Deposit
              </button>
              <button
                onClick={onWithdraw}
                onMouseDown={() => setWithdrawPressed(true)}
                onMouseUp={() => setWithdrawPressed(false)}
                onMouseLeave={() => setWithdrawPressed(false)}
                onTouchStart={() => setWithdrawPressed(true)}
                onTouchEnd={() => setWithdrawPressed(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
                  boxShadow: withdrawPressed
                    ? "0 1px 0px #C07078"
                    : "0 4px 0px #C07078",
                  color: "#FFFFFF",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 16,
                  transform: withdrawPressed
                    ? "scale(0.97) translateY(3px)"
                    : "scale(1) translateY(0)",
                  transition: withdrawPressed
                    ? "transform 80ms ease-out, box-shadow 80ms ease-out"
                    : "transform 120ms ease-out, box-shadow 120ms ease-out",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                Withdraw
              </button>
            </div>

            {/* Streak Card */}
            <button
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(245,192,48,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="8" fill="#F5C030" />
                  <circle cx="11" cy="11" r="5.5" fill="#F8D868" />
                  <circle cx="11" cy="11" r="3" fill="#F5C030" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                  }}
                >
                  {game.currentStreak} day streak
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  Longest: {game.longestStreak} days
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M6 4L10 8L6 12"
                  stroke="#C0B8A8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

          </>
        )}

        {/* PERSONALITY Tab Placeholder */}
        {tab === "personality" && (
          <div
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "48px 24px",
            }}
          >
            <span style={{ fontSize: 32 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="16" fill="#F0E8D8" />
                <circle cx="14" cy="17" r="2" fill="#7878A0" />
                <circle cx="26" cy="17" r="2" fill="#7878A0" />
                <path
                  d="M14 26C14 26 17 29 20 29C23 29 26 26 26 26"
                  stroke="#7878A0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Coming Soon
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              Your pet&apos;s personality traits will appear here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
