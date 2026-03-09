"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameProvider";

interface PetStatsModalProps {
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  petName: string;
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

function computePersonality(balance: number, streak: number, hearts: number) {
  let score = 0;
  if (balance >= 5000) score += 10;
  else if (balance >= 1000) score += 7;
  else if (balance >= 500) score += 5;
  else if (balance >= 100) score += 3;
  else if (balance >= 50) score += 1;
  else score -= 3;
  score += Math.min(6, Math.floor(streak / 2));
  score += hearts - 2;
  score = Math.max(-20, Math.min(20, score));

  let name: string;
  let lean: string;
  let traits: string[];

  if (score <= -10) {
    name = "Cozy Cloud";
    lean = "Chill";
    traits = [
      "Prefers steady, predictable growth.",
      "Likes small, frequent deposits.",
      "Gets uneasy with large market swings.",
    ];
  } else if (score <= -3) {
    name = "Calm Pebble";
    lean = "Chill";
    traits = [
      "Values stability over big returns.",
      "Prefers conservative vault strategies.",
      "Takes comfort in gradual progress.",
    ];
  } else if (score <= 2) {
    name = "Balanced Bean";
    lean = "Neutral";
    traits = [
      "Adapts to different market conditions.",
      "Open to various vault strategies.",
      "Stays even-keeled through ups and downs.",
    ];
  } else if (score <= 14) {
    name = "Bold Bud";
    lean = "Thrill";
    traits = [
      "Gets excited by bigger swings.",
      "Prefers adventurous vault paths.",
      "May feel stressed during sudden dips.",
    ];
  } else {
    name = "Daring Flame";
    lean = "Thrill";
    traits = [
      "Thrives on market volatility.",
      "Seeks the highest-yield vault paths.",
      "Embraces risk for potential rewards.",
    ];
  }

  return { score, name, lean, traits };
}

export default function PetStatsModal({
  onClose,
  onDeposit,
  onWithdraw,
  petName,
}: PetStatsModalProps) {
  const game = useGame();
  const [tab, setTab] = useState<Tab>("about");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [depositPressed, setDepositPressed] = useState(false);
  const [withdrawPressed, setWithdrawPressed] = useState(false);
  const [tip, setTip] = useState<"pocketPile" | "harvested" | "growthRate" | null>(null);
  const [clickFrame, setClickFrame] = useState(-1); // -1 = idle, 0–5 = animating

  // Periodic click animation every 7–10s, stepping through 6 frames
  useEffect(() => {
    if (clickFrame >= 0) {
      // Advance through 6 frames then stop
      if (clickFrame >= 6) {
        setClickFrame(-1);
        return;
      }
      const timer = setTimeout(() => setClickFrame((f) => f + 1), 150);
      return () => clearTimeout(timer);
    }
    // Idle — schedule next animation
    const delay = 7000 + Math.random() * 3000;
    const timer = setTimeout(() => setClickFrame(0), delay);
    return () => clearTimeout(timer);
  }, [clickFrame]);

  const personality = computePersonality(game.depositBalance, game.currentStreak, game.hearts);

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

        {/* Pet Info Card (shared between tabs) */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Pet Sprite — polaroid style */}
              <div
                style={{
                  width: 128,
                  height: 136,
                  borderRadius: 4,
                  border: "1px solid #D4B896",
                  background: "#F8F4EC",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 8,
                  boxShadow: "inset 0 0 0 6px #FFFFFF",
                }}
              >
                {clickFrame >= 0 && clickFrame < 6 ? (
                  <div
                    style={{
                      width: 88,
                      height: 97,
                      backgroundImage: "url(/pet_click_sheet.png)",
                      backgroundSize: "528px 97px",
                      backgroundPosition: `${-clickFrame * 88}px 0`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      backgroundImage: "url(/pet_walk_sheet.png)",
                      backgroundSize: "1406px 97px",
                      backgroundPosition: "0 center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
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
              <img
                src="/yieldpets_stamp.png"
                alt=""
                style={{
                  position: "absolute",
                  top: -23,
                  right: -20,
                  width: 160,
                  height: 160,
                  opacity: 0.15,
                  transform: "rotate(15deg)",
                  pointerEvents: "none",
                  objectFit: "contain",
                }}
              />
            </div>

        {/* ABOUT Tab Content */}
        {tab === "about" && (
          <>
            {/* Stats Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Pocket Pile */}
              <button
                onClick={onDeposit}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setTip("pocketPile"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setTip("pocketPile"); } }}
                      style={{ cursor: "pointer", display: "flex" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                        <text x="7" y="10.5" textAnchor="middle" fill="#C0B8A8" fontSize="9" fontWeight="bold" fontFamily="inherit">i</text>
                      </svg>
                    </div>
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
                onClick={onDeposit}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setTip("harvested"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setTip("harvested"); } }}
                      style={{ cursor: "pointer", display: "flex" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                        <text x="7" y="10.5" textAnchor="middle" fill="#C0B8A8" fontSize="9" fontWeight="bold" fontFamily="inherit">i</text>
                      </svg>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#5BAF48",
                      marginTop: 2,
                    }}
                  >
                    +{(game.totalYieldEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                onClick={onDeposit}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setTip("growthRate"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setTip("growthRate"); } }}
                      style={{ cursor: "pointer", display: "flex" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="#C0B8A8" strokeWidth="1.2" />
                        <text x="7" y="10.5" textAnchor="middle" fill="#C0B8A8" fontSize="9" fontWeight="bold" fontFamily="inherit">i</text>
                      </svg>
                    </div>
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
              <img
                src="/streak_icon.png"
                alt=""
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
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
            </button>

          </>
        )}

        {/* PERSONALITY Tab */}
        {tab === "personality" && (
          <>
            {/* Dare Meter */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Dare meter
              </div>

              {/* Bar */}
              <div style={{ position: "relative", paddingTop: 20 }}>
                <div
                  style={{
                    height: 16,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #A8D8E8 0%, #8CC8A0 50%, #C8E888 100%)",
                    position: "relative",
                  }}
                >
                  {/* Pet face indicator */}
                  <img
                    src="/happy_face.png"
                    alt=""
                    style={{
                      position: "absolute",
                      top: -16,
                      left: `${((personality.score + 20) / 40) * 100}%`,
                      transform: "translateX(-50%)",
                      width: 44,
                      height: 44,
                      objectFit: "contain",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                    }}
                  />
                </div>

                {/* Chill / Thrill labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                    Chill
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                    Thrill
                  </span>
                </div>
              </div>

              {/* Personality type pill + lean label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    background: "#F0E8D8",
                    borderRadius: 999,
                    padding: "6px 20px",
                    fontSize: 15,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                  }}
                >
                  {personality.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                  {personality.lean === "Neutral"
                    ? "Neutral"
                    : `Leans ${personality.lean} ${personality.score >= 0 ? "+" : ""}${personality.score}`}
                </div>
              </div>
            </div>

            {/* What this means */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-primary)" }}>
                What this means
              </div>
              {personality.traits.map((trait, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background:
                        i === 0
                          ? "rgba(160,120,80,0.12)"
                          : i === 1
                            ? "rgba(120,120,160,0.12)"
                            : "rgba(200,140,160,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i === 0 && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#A07850" strokeWidth="1.3" />
                        <path d="M5.5 5.5H10.5M5.5 8H10.5M5.5 10.5H8" stroke="#A07850" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                    {i === 1 && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 13V7L8 4L12 7V13H4Z" stroke="#7878A0" strokeWidth="1.3" strokeLinejoin="round" />
                        <rect x="6.5" y="9.5" width="3" height="3.5" rx="0.5" stroke="#7878A0" strokeWidth="1" />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="7" r="3.5" stroke="#C88CA0" strokeWidth="1.3" />
                        <path d="M8 10.5V14" stroke="#C88CA0" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M6 12.5L8 11L10 12.5" stroke="#C88CA0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                      paddingTop: 3,
                    }}
                  >
                    {trait}
                  </span>
                </div>
              ))}
            </div>

          </>
        )}
      </div>

      {/* Tip Modal */}
      {tip && (
        <div
          onClick={() => setTip(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 320,
              background: "#FFF8E8",
              borderRadius: 20,
              border: "2px solid #ECD8A0",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
              {tip === "pocketPile" && "Pocket Pile"}
              {tip === "harvested" && "Harvested"}
              {tip === "growthRate" && "Growth Rate"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {tip === "pocketPile" && "Your total savings balance. Deposit more to grow your pocket pile and earn higher yield over time."}
              {tip === "harvested" && "The total yield your deposits have earned. Keep your pet happy with full hearts to maximize earnings."}
              {tip === "growthRate" && "Your current daily yield rate based on your deposit balance and pet happiness. More hearts = faster growth."}
            </div>
            <button
              onClick={() => { setTip(null); onDeposit(); }}
              style={{
                width: "100%",
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
              Deposit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
