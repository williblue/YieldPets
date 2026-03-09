"use client";

import { useState } from "react";
import { useGame } from "@/contexts/GameProvider";

interface DepositScreenProps {
  onClose: () => void;
  onCrypto: () => void;
  petName: string;
}

type Tab = "deposit" | "withdraw";

const NUGGETS_PER_USD_PER_DAY = 0.8;

const QUICK_AMOUNTS = ["10", "50", "100", "500"];

const methodCardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  boxShadow: "var(--shadow-card)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  border: "2px solid #ECD8A0",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
  fontFamily: "inherit",
  transition: "border 120ms ease-out, background 120ms ease-out",
};

export default function DepositScreen({ onClose, onCrypto, petName }: DepositScreenProps) {
  const game = useGame();
  const [tab, setTab] = useState<Tab>("deposit");
  const [depositMethod, setDepositMethod] = useState<"card" | null>(null);
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [pressed, setPressed] = useState(false);

  const numAmount = parseFloat(amount || customAmount || "0");
  const hasAmount = numAmount > 0;

  const currentBalance = game.depositBalance;
  const dailyYield = currentBalance * 0.0864; // ~8.64% APY mock
  const newBalance =
    tab === "deposit"
      ? currentBalance + numAmount
      : Math.max(0, currentBalance - numAmount);
  const newNuggets = Math.round(newBalance * NUGGETS_PER_USD_PER_DAY);

  const ctaLabel = hasAmount
    ? `${tab === "deposit" ? "Deposit" : "Withdraw"} $${numAmount.toFixed(2)} USD`
    : tab === "deposit"
      ? "Deposit"
      : "Withdraw";

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount("");
  };

  const handleTabSwitch = (t: Tab) => {
    setTab(t);
    setDepositMethod(null);
    setAmount("");
    setCustomAmount("");
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: 1,
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    boxShadow: "var(--shadow-card)",
  };

  // On deposit tab: show method picker first, then amount after picking credit card
  // On withdraw tab: show amount directly (withdrawal goes back to wallet)
  const showAmountSection = tab === "withdraw" || depositMethod === "card";
  const showMethodPicker = tab === "deposit" && !depositMethod;

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
        onClick={() => {
          if (depositMethod) {
            setDepositMethod(null);
            setAmount("");
            setCustomAmount("");
          } else {
            onClose();
          }
        }}
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
          gap: 16,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header */}
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 900,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          Deposit / Withdraw
        </h2>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {(["deposit", "withdraw"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              style={{
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 999,
                border: tab === t ? "none" : "2px solid #ECD8A0",
                background: tab === t ? "#F09098" : "transparent",
                color: tab === t ? "#FFFFFF" : "var(--text-secondary)",
                fontSize: 14,
                fontFamily: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                transition:
                  "background 120ms ease-out, color 120ms ease-out, border 120ms ease-out",
              }}
            >
              {t === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          ))}
        </div>

        {/* Balance Card */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <span style={labelStyle}>Current Balance</span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  marginTop: 4,
                }}
              >
                ${currentBalance.toFixed(2)}{" "}
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>
                  USD
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={labelStyle}>Daily Yield</span>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#F09098",
                  marginTop: 4,
                }}
              >
                +${dailyYield.toFixed(2)}/day
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
              borderTop: "1px solid #F0E8D8",
              paddingTop: 8,
            }}
          >
            Auto feeder active — {petName} is fed from yield
          </div>
        </div>

        {/* Deposit Method Picker */}
        {showMethodPicker && (
          <>
            <span style={labelStyle}>Choose how to add funds</span>

            {/* Credit Card option */}
            <button onClick={() => setDepositMethod("card")} style={methodCardStyle}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(240,144,152,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="3" fill="#F09098" />
                  <rect x="2" y="9" width="20" height="3" fill="#C07078" />
                  <rect x="5" y="15" width="6" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.6" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Credit Card
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  Add money with card
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="#A0A8B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Crypto option */}
            <button onClick={onCrypto} style={methodCardStyle}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(74,144,196,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" fill="#4A90C4" />
                  <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" opacity="0.3" />
                  <path d="M12 9v6M9 12h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Stablecoin
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  Send PYUSD0 from a wallet
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="#A0A8B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Amount Section — shown for withdraw tab or after picking credit card */}
        {showAmountSection && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={labelStyle}>
                {tab === "deposit" ? "Amount to Add" : "Amount to Withdraw"}
              </span>

              {/* Quick amounts */}
              <div style={{ display: "flex", gap: 8 }}>
                {QUICK_AMOUNTS.map((val) => {
                  const selected = amount === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleQuickAmount(val)}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 12,
                        border: selected ? "2px solid #F09098" : "2px solid #ECD8A0",
                        background: selected ? "#F09098" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "var(--text-primary)",
                        fontSize: 15,
                        fontFamily: "inherit",
                        fontWeight: 800,
                        cursor: "pointer",
                        transition:
                          "background 120ms ease-out, color 120ms ease-out, border 120ms ease-out",
                      }}
                    >
                      ${val}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="Custom amount..."
                  value={customAmount}
                  onChange={handleCustomChange}
                  step="0.01"
                  min="0"
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    border: "2px solid #ECD8A0",
                    background: "#FFFFFF",
                    padding: "0 60px 0 16px",
                    fontSize: 15,
                    fontFamily: "inherit",
                    fontWeight: 700,
                    color: "#3C3848",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    pointerEvents: "none",
                  }}
                >
                  USD
                </span>
              </div>
            </div>

            {/* After Deposit/Withdraw Preview */}
            {hasAmount && (
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span style={labelStyle}>
                  {tab === "deposit" ? "After Deposit" : "After Withdrawal"}
                </span>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    New balance
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                    }}
                  >
                    ${newBalance.toFixed(2)} USD
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Nuggets/day
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                    }}
                  >
                    ~{newNuggets}
                  </span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              disabled={!hasAmount}
              onClick={() => {
                if (!hasAmount) return;
                if (tab === "deposit") game.deposit(numAmount);
                else game.withdraw(numAmount);
                setAmount("");
                setCustomAmount("");
              }}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
              style={{
                width: "100%",
                height: 56,
                borderRadius: 999,
                border: "none",
                cursor: hasAmount ? "pointer" : "default",
                background: hasAmount
                  ? pressed
                    ? "linear-gradient(180deg, #F09098 0%, #F09098 100%)"
                    : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)"
                  : "#E0D8C8",
                boxShadow: hasAmount
                  ? pressed
                    ? "0 1px 0px #C07078"
                    : "0 4px 0px #C07078"
                  : "none",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 17,
                transform:
                  pressed && hasAmount
                    ? "scale(0.97) translateY(3px)"
                    : "scale(1) translateY(0)",
                transition: pressed
                  ? "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out"
                  : "transform 120ms ease-out, box-shadow 120ms ease-out, background 120ms ease-out",
                opacity: hasAmount ? 1 : 0.5,
              }}
            >
              {ctaLabel}
            </button>

            {/* Footer note */}
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              No fees · Funds settle on Flow blockchain
            </p>
          </>
        )}
      </div>
    </div>
  );
}
