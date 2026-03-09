"use client";

import { useEffect, useState } from "react";

export type PetAction = "feed" | "deposit" | "stats";

interface PetRadialMenuProps {
  visible: boolean;
  onAction: (action: PetAction) => void;
  onClose: () => void;
}

const ITEMS: { action: PetAction; label: string; bg: string; tx: number; ty: number }[] = [
  { action: "feed", label: "Feed", bg: "#F8B0B8", tx: -56, ty: -48 },
  { action: "deposit", label: "Save", bg: "#F5C030", tx: 0, ty: -68 },
  { action: "stats", label: "Stats", bg: "#8FC0D8", tx: 56, ty: -48 },
];

export default function PetRadialMenu({ visible, onAction, onClose }: PetRadialMenuProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // Delay to allow the DOM to render at scale(0) before transitioning
      const raf = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Menu items */}
      {ITEMS.map((item, i) =>
        item.action === "stats" ? (
          <button
            key={item.action}
            onClick={() => onAction(item.action)}
            style={{
              position: "absolute",
              left: -24,
              top: -30,
              width: 48,
              height: 56,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: 0,
              zIndex: 21,
              opacity: show ? 1 : 0,
              transform: show
                ? `translate(${item.tx}px, ${item.ty}px) scale(1)`
                : `translate(0px, 0px) scale(0)`,
              transition: `opacity 200ms ease-out ${i * 40}ms, transform 200ms ease-out ${i * 40}ms`,
            }}
          >
            <img
              src="/paw_icon.png"
              alt="Stats"
              style={{
                width: 35,
                height: 35,
                marginLeft: 3,
                objectFit: "contain",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1,
                marginTop: 3,
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              Stats
            </span>
          </button>
        ) : (
          <button
            key={item.action}
            onClick={() => onAction(item.action)}
            style={{
              position: "absolute",
              left: -22,
              top: -22,
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.6)",
              background: item.bg,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 21,
              opacity: show ? 1 : 0,
              transform: show
                ? `translate(${item.tx}px, ${item.ty}px) scale(1)`
                : `translate(0px, 0px) scale(0)`,
              transition: `opacity 200ms ease-out ${i * 40}ms, transform 200ms ease-out ${i * 40}ms`,
            }}
          >
            {item.action === "feed" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C7 3 4 5.5 4 9c0 2.5 1.5 4.5 3 5.5V16a1 1 0 001 1h4a1 1 0 001-1v-1.5c1.5-1 3-3 3-5.5 0-3.5-3-6-6-6z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0.5"/>
                <ellipse cx="10" cy="9" rx="3.5" ry="4" fill={item.bg}/>
              </svg>
            )}
            {item.action === "deposit" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="7" width="12" height="9" rx="2" fill="#FFFFFF"/>
                <ellipse cx="10" cy="7" rx="6" ry="2.5" fill="#FFFFFF"/>
                <circle cx="10" cy="11" r="2" fill={item.bg}/>
                <rect x="9.25" y="4" width="1.5" height="4" rx="0.75" fill="#FFFFFF"/>
              </svg>
            )}
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1,
                marginTop: 1,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {item.label}
            </span>
          </button>
        )
      )}
    </>
  );
}
