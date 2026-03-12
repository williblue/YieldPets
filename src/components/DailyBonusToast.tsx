"use client";

import { useState, useEffect } from "react";

interface DailyBonusToastProps {
  amount: number;
  streak: number;
  onDismiss: () => void;
}

export default function DailyBonusToast({ amount, streak, onDismiss }: DailyBonusToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true));
    // Auto dismiss after 4s
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleTap = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      onClick={handleTap}
      style={{
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        zIndex: 150,
        background: "linear-gradient(135deg, #FFF8E8 0%, #FFF0D0 100%)",
        borderRadius: 16,
        border: "2px solid #ECD8A0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transform: visible ? "translateY(0)" : "translateY(-120px)",
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 300ms ease-out, opacity 300ms ease-out"
          : "transform 250ms ease-in, opacity 250ms ease-in",
      }}
    >
      {/* Coin icon */}
      <img
        src="/gold nuggets/gold_nugget_icon.png"
        alt="Gold nugget"
        width={44}
        height={44}
        style={{ objectFit: "contain", flexShrink: 0 }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "var(--text-primary)",
          }}
        >
          +{amount} Nuggets
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginTop: 2,
          }}
        >
          Daily login bonus {streak > 1 ? `\u2022 ${streak} day streak` : ""}
        </div>
      </div>
    </div>
  );
}
