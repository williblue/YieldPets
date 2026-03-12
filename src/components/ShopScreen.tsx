"use client";

import { useState } from "react";
import { useGame } from "@/contexts/GameProvider";
import { FURNITURE_ITEMS, EXCLUSIVE_ITEMS, FurnitureItemDef } from "@/data/shopItems";

type ShopTab = "furniture" | "exclusives";

interface ShopScreenProps {
  onClose: () => void;
}

export default function ShopScreen({ onClose }: ShopScreenProps) {
  const game = useGame();
  const [tab, setTab] = useState<ShopTab>("furniture");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const exclusivesUnlocked = game.depositBalance >= 200;

  const handleBuy = (furnitureId: string) => {
    const success = game.buyFurniture(furnitureId);
    if (success) {
      setBuyingId(furnitureId);
      setTimeout(() => setBuyingId(null), 600);
    }
  };

  const handleToggleEquip = (itemId: string) => {
    if (game.placedFurniture.includes(itemId)) {
      game.removeFurniture(itemId);
    } else {
      game.placeFurniture(itemId);
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

  function renderItem(item: FurnitureItemDef, isExclusive: boolean) {
    const owned = game.ownedFurniture.includes(item.id);
    const equipped = game.placedFurniture.includes(item.id);
    const canAfford = game.nuggets >= item.price;
    const justBought = buyingId === item.id;
    const locked = isExclusive && !exclusivesUnlocked && !owned;

    return (
      <div
        key={item.id}
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...(isExclusive ? { border: "2px solid #E8C8F0" } : {}),
          ...(locked ? { opacity: 0.55 } : {}),
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: isExclusive
              ? "linear-gradient(135deg, #F0E0F8 0%, #E8D0F0 100%)"
              : "#F4EDE0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
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

        {/* Action button */}
        {locked ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(192,144,216,0.1)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="6.5" width="8" height="6" rx="1.5" fill="#C090D8" />
              <path d="M5 6.5V5a2 2 0 014 0v1.5" stroke="#C090D8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#C090D8" }}>$200</span>
          </div>
        ) : owned ? (
          <button
            onClick={() => handleToggleEquip(item.id)}
            style={{
              height: 36,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 999,
              border: equipped ? "2px solid #F09098" : "2px solid #D0D0D0",
              background: equipped ? "rgba(240,144,152,0.1)" : "transparent",
              color: equipped ? "#F09098" : "var(--text-secondary)",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 120ms ease-out",
            }}
          >
            {equipped ? "Unequip" : "Equip"}
          </button>
        ) : (
          <button
            onClick={() => handleBuy(item.id)}
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
                  ? isExclusive
                    ? "linear-gradient(180deg, #D8B0E8 0%, #C090D8 100%)"
                    : "linear-gradient(180deg, #F8D868 0%, #F5C030 100%)"
                  : "#E0D8C8",
              boxShadow: canAfford && !justBought
                ? isExclusive
                  ? "0 2px 0px #A070B8"
                  : "0 2px 0px #D4A020"
                : "none",
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
  }

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
            {FURNITURE_ITEMS.map((item) => renderItem(item, false))}
          </div>
        )}

        {/* Exclusives Tab */}
        {tab === "exclusives" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={labelStyle}>Limited Edition</span>
            {!exclusivesUnlocked && (
              <div
                style={{
                  background: "rgba(192,144,216,0.08)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1.5px solid #E8C8F0",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="4" y="7.5" width="8" height="6" rx="1.5" fill="#C090D8" />
                  <path d="M6 7.5V6a2 2 0 014 0v1.5" stroke="#C090D8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9070A8", lineHeight: 1.3 }}>
                  Deposit <span style={{ fontWeight: 900 }}>$200+</span> to unlock purchasing
                </span>
              </div>
            )}
            {EXCLUSIVE_ITEMS.map((item) => renderItem(item, true))}
          </div>
        )}
      </div>
    </div>
  );
}
