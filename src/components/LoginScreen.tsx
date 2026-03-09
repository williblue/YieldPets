"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";

interface LoginScreenProps {
  onBack?: () => void;
}

export default function LoginScreen({ onBack }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim().length > 0 && !sending && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSending(true);
    try {
      await login(email.trim());
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handlePress = () => setPressed(true);
  const handleRelease = () => {
    setPressed(false);
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

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
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
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "0 32px",
          width: "100%",
        }}
      >
        {/* Logo */}
        <img
          src="/yieldpets_logo.png"
          alt="YieldPets"
          style={{ width: 280, height: "auto" }}
        />

        {/* Tagline */}
        <p
          style={{
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 18,
            color: "#7878A0",
            margin: 0,
            textAlign: "center",
          }}
        >
          Sign in with your email
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 320,
          }}
        >
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 16,
              border: "2px solid #ECD8A0",
              background: "#FFFFFF",
              padding: "0 20px",
              fontSize: 16,
              fontFamily: "inherit",
              fontWeight: 700,
              color: "#3C3848",
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              opacity: sending ? 0.6 : 1,
            }}
          />

          {error && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E85878",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            style={{
              width: 200,
              height: 56,
              borderRadius: 999,
              border: "none",
              cursor: canSubmit ? "pointer" : "default",
              background:
                pressed && canSubmit
                  ? "linear-gradient(180deg, #F09098 0%, #F09098 100%)"
                  : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
              boxShadow:
                pressed && canSubmit
                  ? "0 1px 0px #C07078"
                  : "0 4px 0px #C07078",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: 18,
              transform:
                pressed && canSubmit
                  ? "scale(0.97) translateY(3px)"
                  : "scale(1) translateY(0)",
              transition: pressed
                ? "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out"
                : "transform 120ms ease-out, box-shadow 120ms ease-out, background 120ms ease-out",
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            {sending ? "Sending..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
