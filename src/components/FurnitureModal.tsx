"use client";

import { useEffect, useState, useCallback } from "react";
import { FurnitureItem } from "@/types";

interface FurnitureModalProps {
  item: FurnitureItem | null;
  onClose: () => void;
}

export default function FurnitureModal({ item, onClose }: FurnitureModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (item) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    }
  }, [item]);

  const handleClose = useCallback(() => {
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 160);
  }, [onClose]);

  if (!item || !visible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 428,
        height: 926,
        background: "var(--modal-overlay)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: animating ? 1 : 0,
        transition: animating ? "opacity 200ms ease-out" : "opacity 160ms ease-in",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          minHeight: 200,
          maxHeight: 500,
          borderRadius: "var(--modal-radius)",
          background: "var(--modal-bg)",
          border: "1.5px solid var(--modal-border)",
          boxShadow: "var(--shadow-modal)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: animating ? "translateY(0)" : "translateY(40px)",
          opacity: animating ? 1 : 0,
          transition: animating
            ? "transform 220ms ease-out, opacity 220ms ease-out"
            : "transform 160ms ease-in, opacity 160ms ease-in",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Furniture image */}
        <div
          style={{
            width: 120,
            height: 120,
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ maxWidth: 120, maxHeight: 120, objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {item.name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-secondary)",
            textAlign: "center",
            padding: "0 24px",
            marginTop: 8,
          }}
        >
          {item.description}
        </div>

        {/* Action button */}
        {!item.isOwned && item.price !== undefined && (
          <button
            style={{
              width: 240,
              height: 52,
              borderRadius: "var(--radius-pill)",
              background: "linear-gradient(180deg, var(--feed-btn-top) 0%, var(--feed-btn-bg) 40%)",
              border: "none",
              cursor: "pointer",
              color: "var(--feed-btn-text)",
              fontSize: 18,
              fontWeight: 700,
              boxShadow: "0 4px 0px var(--feed-btn-shadow)",
              margin: "24px auto",
              padding: 0,
              lineHeight: 1,
            }}
          >
            Buy — {item.price.toLocaleString("en-US")} gold
          </button>
        )}

        {item.isOwned && (
          <button
            style={{
              width: 240,
              height: 52,
              borderRadius: "var(--radius-pill)",
              background: "linear-gradient(180deg, var(--feed-btn-top) 0%, var(--feed-btn-bg) 40%)",
              border: "none",
              cursor: "pointer",
              color: "var(--feed-btn-text)",
              fontSize: 18,
              fontWeight: 700,
              boxShadow: "0 4px 0px var(--feed-btn-shadow)",
              margin: "24px auto",
              padding: 0,
              lineHeight: 1,
            }}
          >
            Inspect
          </button>
        )}
      </div>
    </div>
  );
}
