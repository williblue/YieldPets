"use client";

import { useState } from "react";

interface StartScreenProps {
  onPlay: () => void;
}

export default function StartScreen({ onPlay }: StartScreenProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => setPressed(true);
  const handleRelease = () => {
    setPressed(false);
    onPlay();
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        zIndex: 300,
      }}
    >
      {/* Cloud background */}
      <img
        src="/cloud_bg_mobile.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: "inherit",
            fontWeight: 900,
            fontSize: 52,
            color: "#3C3848",
            letterSpacing: "-0.5px",
            textShadow: "0 2px 0 rgba(255,255,255,0.8)",
            margin: 0,
          }}
        >
          YieldPets
        </h1>

        {/* Pet illustration */}
        <img
          src="/Subject.png"
          alt="Pet"
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 16,
            color: "#7878A0",
            margin: 0,
          }}
        >
          Grow your pet, earn rewards
        </p>

        {/* Play button */}
        <button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          style={{
            width: 200,
            height: 64,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: pressed
              ? "linear-gradient(180deg, #F09098 0%, #F09098 100%)"
              : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
            boxShadow: pressed
              ? "0 1px 0px #C07078"
              : "0 4px 0px #C07078",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 20,
            transform: pressed ? "scale(0.97) translateY(3px)" : "scale(1) translateY(0)",
            transition: pressed
              ? "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out"
              : "transform 120ms ease-out, box-shadow 120ms ease-out, background 120ms ease-out",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
