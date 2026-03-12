"use client";

import { useState } from "react";
import { useGame } from "@/contexts/GameProvider";
import { FURNITURE_ITEMS, EXCLUSIVE_ITEMS } from "@/data/shopItems";

type ShopTab = "furniture" | "exclusives";

interface ShopScreenProps {
  onClose: () => void;
}

export default function ShopScreen({ onClose }: ShopScreenProps) {
  const game = useGame();
  const [tab, setTab] = useState<ShopTab>("furniture");
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuyFurniture = (furnitureId: string) => {
    const success = game.buyFurniture(furnitureId);
    if (success) {
      setBuyingId(furnitureId);
      setTimeout(() => setBuyingId(null), 600);
    }
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

      {/* Nugget balance pill */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 16,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#FFF8E8",
          border: "2px solid #ECD8A0",
          borderRadius: 999,
          padding: "6px 14px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#F5C030" stroke="#D4A020" strokeWidth="1" />
          <circle cx="8" cy="8" r="4" fill="#F8D868" />
        </svg>
        <span
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "var(--text-primary)",
          }}
        >
          {game.nuggets.toLocaleString()}
        </span>
      </div>

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
          Shop
        </h2>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {(["furniture", "exclusives"] as ShopTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
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
                transition: "background 120ms ease-out, color 120ms ease-out, border 120ms ease-out",
              }}
            >
              {t === "furniture" ? "Furniture" : "Exclusives"}
            </button>
          ))}
        </div>

        {/* Furniture Tab */}
        {tab === "furniture" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={labelStyle}>Room Items</span>
            {FURNITURE_ITEMS.map((item) => {
              const owned = game.ownedFurniture.includes(item.id);
              const canAfford = game.nuggets >= item.price;
              const justBought = buyingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Furniture placeholder icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#F4EDE0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="6" y="10" width="16" height="12" rx="3" fill="#D4B896" />
                      <rect x="8" y="8" width="12" height="8" rx="2" fill="#C4A880" />
                      <rect x="10" y="20" width="2" height="3" rx="1" fill="#A08860" />
                      <rect x="16" y="20" width="2" height="3" rx="1" fill="#A08860" />
                    </svg>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>

                  {owned ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#5BAF48",
                        background: "rgba(91,175,72,0.1)",
                        padding: "6px 12px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      Owned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyFurniture(item.id)}
                      disabled={!canAfford}
                      style={{
                        height: 36,
                        paddingLeft: 14,
                        paddingRight: 14,
                        borderRadius: 999,
                        border: "none",
                        background: justBought
                          ? "#5BAF48"
                          : canAfford
                            ? "linear-gradient(180deg, #F8D868 0%, #F5C030 100%)"
                            : "#E0D8C8",
                        boxShadow: canAfford && !justBought ? "0 2px 0px #D4A020" : "none",
                        color: "#FFFFFF",
                        fontFamily: "inherit",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: canAfford ? "pointer" : "default",
                        opacity: canAfford ? 1 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        transition: "background 120ms ease-out",
                      }}
                    >
                      {justBought ? (
                        "Bought!"
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" fill="#FFFFFF" opacity="0.3" />
                            <circle cx="6" cy="6" r="3" fill="#FFFFFF" opacity="0.3" />
                          </svg>
                          {item.price}
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Exclusives Tab */}
        {tab === "exclusives" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={labelStyle}>Limited Edition</span>
            {EXCLUSIVE_ITEMS.map((item) => {
              const owned = game.ownedFurniture.includes(item.id);
              const canAfford = game.nuggets >= item.price;
              const justBought = buyingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "2px solid #E8C8F0",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #F0E0F8 0%, #E8D0F0 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 4l3 6 7 1-5 5 1.2 7L14 20l-6.2 3L9 16l-5-5 7-1z" fill="#C090D8" />
                      <path d="M14 4l3 6 7 1-5 5 1.2 7L14 20l-6.2 3L9 16l-5-5 7-1z" fill="#D8B0E8" opacity="0.5" />
                    </svg>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>

                  {owned ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#5BAF48",
                        background: "rgba(91,175,72,0.1)",
                        padding: "6px 12px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      Owned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyFurniture(item.id)}
                      disabled={!canAfford}
                      style={{
                        height: 36,
                        paddingLeft: 14,
                        paddingRight: 14,
                        borderRadius: 999,
                        border: "none",
                        background: justBought
                          ? "#5BAF48"
                          : canAfford
                            ? "linear-gradient(180deg, #D8B0E8 0%, #C090D8 100%)"
                            : "#E0D8C8",
                        boxShadow: canAfford && !justBought ? "0 2px 0px #A070B8" : "none",
                        color: "#FFFFFF",
                        fontFamily: "inherit",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: canAfford ? "pointer" : "default",
                        opacity: canAfford ? 1 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        transition: "background 120ms ease-out",
                      }}
                    >
                      {justBought ? (
                        "Bought!"
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" fill="#FFFFFF" opacity="0.3" />
                            <circle cx="6" cy="6" r="3" fill="#FFFFFF" opacity="0.3" />
                          </svg>
                          {item.price}
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
