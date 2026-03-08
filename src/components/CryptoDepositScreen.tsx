"use client";

import { useState, useEffect, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useAuth } from "@/contexts/AuthProvider";
import { GET_COA_ADDRESS, CREATE_COA } from "@/lib/flow";
import QRCode from "qrcode";

type Network = "cadence" | "evm";

interface CryptoDepositScreenProps {
  onBack: () => void;
}

export default function CryptoDepositScreen({ onBack }: CryptoDepositScreenProps) {
  const { address, magicAuthz } = useAuth();

  const [network, setNetwork] = useState<Network>("cadence");
  const [coaAddress, setCoaAddress] = useState<string | null>(null);
  const [coaLoading, setCoaLoading] = useState(true);
  const [coaCreating, setCoaCreating] = useState(false);
  const [coaStatus, setCoaStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const displayAddress = network === "cadence" ? address : coaAddress;

  // Query COA address on mount
  useEffect(() => {
    if (!address) {
      setCoaLoading(false);
      return;
    }
    let cancelled = false;

    const fetchCoa = async () => {
      setCoaLoading(true);
      try {
        const result = await fcl.query({
          cadence: GET_COA_ADDRESS,
          args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
        });
        if (!cancelled) setCoaAddress(result ?? null);
      } catch {
        if (!cancelled) setCoaAddress(null);
      } finally {
        if (!cancelled) setCoaLoading(false);
      }
    };

    fetchCoa();
    return () => { cancelled = true; };
  }, [address]);

  // Generate QR code when address changes
  useEffect(() => {
    if (!displayAddress) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;

    QRCode.toDataURL(displayAddress, {
      width: 200,
      margin: 2,
      color: { dark: "#3C3848", light: "#FFFFFF" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(() => {
      if (!cancelled) setQrDataUrl(null);
    });

    return () => { cancelled = true; };
  }, [displayAddress]);

  const handleCopy = useCallback(async () => {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [displayAddress]);

  const handleCreateCoa = useCallback(async () => {
    if (!magicAuthz || coaCreating) return;
    setCoaCreating(true);
    setCoaStatus("Signing transaction...");
    try {
      const txId = await fcl.mutate({
        cadence: CREATE_COA,
        limit: 9999,
        authorizations: [magicAuthz],
        payer: magicAuthz,
        proposer: magicAuthz,
      });
      setCoaStatus("Waiting for confirmation...");
      await fcl.tx(txId).onceSealed();
      setCoaStatus(null);

      if (address) {
        const result = await fcl.query({
          cadence: GET_COA_ADDRESS,
          args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
        });
        setCoaAddress(result ?? null);
      }
    } catch (err) {
      console.error("COA creation failed:", err);
      setCoaStatus("Setup failed. Please try again.");
    } finally {
      setCoaCreating(false);
    }
  }, [magicAuthz, coaCreating, address]);

  // Reset copied state when switching network
  useEffect(() => {
    setCopied(false);
  }, [network]);

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

  const showEvmSetup = network === "evm" && !coaLoading && !coaAddress;

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
          Receive Crypto
        </h2>

        {/* Network Switcher */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {(["cadence", "evm"] as Network[]).map((n) => (
            <button
              key={n}
              onClick={() => setNetwork(n)}
              style={{
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 999,
                border: network === n ? "none" : "2px solid #ECD8A0",
                background: network === n ? "#F09098" : "transparent",
                color: network === n ? "#FFFFFF" : "var(--text-secondary)",
                fontSize: 14,
                fontFamily: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                transition:
                  "background 120ms ease-out, color 120ms ease-out, border 120ms ease-out",
              }}
            >
              {n === "cadence" ? "Cadence" : "Flow EVM"}
            </button>
          ))}
        </div>

        {/* QR Code Card */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={labelStyle}>
            {network === "cadence" ? "Flow Cadence Address" : "Flow EVM Address"}
          </span>

          {network === "evm" && coaLoading ? (
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-secondary)",
                padding: "40px 0",
              }}
            >
              Loading...
            </span>
          ) : showEvmSetup ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "24px 0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                No EVM account set up yet
              </p>
              {coaStatus && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: coaStatus.includes("failed")
                      ? "#E85878"
                      : "var(--text-secondary)",
                    textAlign: "center",
                  }}
                >
                  {coaStatus}
                </p>
              )}
              <button
                onClick={handleCreateCoa}
                disabled={coaCreating || !magicAuthz}
                style={{
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 999,
                  border: "none",
                  cursor: coaCreating || !magicAuthz ? "default" : "pointer",
                  background:
                    coaCreating || !magicAuthz
                      ? "#E0D8C8"
                      : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
                  boxShadow:
                    coaCreating || !magicAuthz
                      ? "none"
                      : "0 3px 0px #C07078",
                  color: "#FFFFFF",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 15,
                  opacity: coaCreating || !magicAuthz ? 0.6 : 1,
                  transition:
                    "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {coaCreating ? "Setting up..." : "Set Up EVM Account"}
              </button>
            </div>
          ) : (
            <>
              {/* QR code */}
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "2px solid #F0E8D8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Wallet QR code"
                    width={196}
                    height={196}
                    style={{ display: "block" }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Generating...
                  </span>
                )}
              </div>

              {/* Full address */}
              <div
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#F8F4EC",
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  wordBreak: "break-all",
                  textAlign: "center",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
              >
                {displayAddress || "—"}
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                style={{
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 999,
                  border: "2px solid #ECD8A0",
                  background: copied ? "#F09098" : "#FFF8E8",
                  color: copied ? "#FFFFFF" : "var(--text-primary)",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  transition:
                    "background 120ms ease-out, color 120ms ease-out, border-color 120ms ease-out",
                  borderColor: copied ? "#F09098" : "#ECD8A0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8.5L6.5 12L13 4"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="#7878A0"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M11 5V3.5C11 2.67 10.33 2 9.5 2H3.5C2.67 2 2 2.67 2 3.5V9.5C2 10.33 2.67 11 3.5 11H5"
                        stroke="#7878A0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Copy Address
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Warning Card */}
        <div
          style={{
            ...cardStyle,
            background: "#FFF5E6",
            border: "2px solid #F5C030",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          {/* Warning icon */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(245,192,48,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L16 15H2L9 2Z"
                fill="#F5C030"
                stroke="#D4A020"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M9 7V10"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="9" cy="12.5" r="0.75" fill="#FFFFFF" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#3C3848",
              }}
            >
              Only send PYUSD on the Flow network
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              Funds sent from other networks will be lost permanently.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
