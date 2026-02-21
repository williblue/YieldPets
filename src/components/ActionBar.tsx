"use client";

import { useState } from "react";

interface ActionBarProps {
  onFeed: () => void;
  feedDisabled?: boolean;
}

export default function ActionBar({ onFeed, feedDisabled }: ActionBarProps) {
  const [feedPressed, setFeedPressed] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        width: 428,
        height: 100,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Feed button */}
      <button
        onTouchStart={() => !feedDisabled && setFeedPressed(true)}
        onTouchEnd={() => setFeedPressed(false)}
        onMouseDown={() => !feedDisabled && setFeedPressed(true)}
        onMouseUp={() => setFeedPressed(false)}
        onMouseLeave={() => setFeedPressed(false)}
        onClick={feedDisabled ? undefined : onFeed}
        disabled={feedDisabled}
        style={{
          width: 160,
          height: 56,
          borderRadius: "var(--radius-pill)",
          background: feedPressed
            ? "var(--feed-btn-bg)"
            : "linear-gradient(180deg, var(--feed-btn-top) 0%, var(--feed-btn-bg) 40%)",
          border: "none",
          cursor: feedDisabled ? "not-allowed" : "pointer",
          color: "var(--feed-btn-text)",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.5px",
          boxShadow: feedPressed
            ? "0 1px 0px var(--feed-btn-shadow)"
            : "0 4px 0px var(--feed-btn-shadow)",
          transform: feedPressed ? "scale(0.97)" : "scale(1)",
          transition: feedPressed
            ? "transform 80ms ease-out, box-shadow 80ms ease-out"
            : "transform 120ms ease-out, box-shadow 120ms ease-out",
          opacity: feedDisabled ? 0.4 : 1,
          padding: 0,
          lineHeight: 1,
        }}
      >
        Feed
      </button>
    </div>
  );
}
