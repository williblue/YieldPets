"use client";

import { useState } from "react";

interface DepositScreenProps {
  onClose: () => void;
}

export default function DepositScreen({ onClose }: DepositScreenProps) {
  const [amount, setAmount] = useState("");
  const [pressed, setPressed] = useState(false);

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
          padding: "24px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header */}
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 900,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          Deposit
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          Save money to earn yield for your pet
        </p>

        {/* Amount card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Amount
          </span>

          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            style={{
              width: "100%",
              height: 56,
              borderRadius: 16,
              border: "2px solid #ECD8A0",
              background: "#FFFFFF",
              padding: "0 20px",
              fontSize: 24,
              fontFamily: "inherit",
              fontWeight: 800,
              color: "#3C3848",
              outline: "none",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />

          {/* Quick amounts */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {["1", "5", "10", "25"].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                style={{
                  height: 36,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 999,
                  border: amount === val ? "2px solid #F09098" : "2px solid #ECD8A0",
                  background: amount === val ? "rgba(240,144,152,0.1)" : "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "inherit",
                  fontWeight: 800,
                  color: amount === val ? "#F09098" : "var(--text-secondary)",
                  transition: "border 120ms ease-out, background 120ms ease-out, color 120ms ease-out",
                }}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Deposit button */}
        <button
          disabled={!amount || parseFloat(amount) <= 0}
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
            cursor: amount && parseFloat(amount) > 0 ? "pointer" : "default",
            background:
              amount && parseFloat(amount) > 0
                ? pressed
                  ? "linear-gradient(180deg, #F09098 0%, #F09098 100%)"
                  : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)"
                : "#E0D8C8",
            boxShadow:
              amount && parseFloat(amount) > 0
                ? pressed
                  ? "0 1px 0px #C07078"
                  : "0 4px 0px #C07078"
                : "none",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 18,
            transform:
              pressed && amount && parseFloat(amount) > 0
                ? "scale(0.97) translateY(3px)"
                : "scale(1) translateY(0)",
            transition: pressed
              ? "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out"
              : "transform 120ms ease-out, box-shadow 120ms ease-out, background 120ms ease-out",
            userSelect: "none",
            WebkitUserSelect: "none",
            opacity: amount && parseFloat(amount) > 0 ? 1 : 0.5,
          }}
        >
          Deposit
        </button>
      </div>
    </div>
  );
}
