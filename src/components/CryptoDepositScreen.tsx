"use client";

import { useState, useEffect, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useFlowQuery } from "@onflow/kit";
import { useAuth } from "@/contexts/AuthProvider";
import { GET_COA_ADDRESS, CREATE_COA } from "@/lib/flow";
import QRCode from "qrcode";

interface CryptoDepositScreenProps {
  onBack: () => void;
}

export default function CryptoDepositScreen({ onBack }: CryptoDepositScreenProps) {
  const { address, magicAuthz } = useAuth();

  const [coaCreating, setCoaCreating] = useState(false);
  const [coaStatus, setCoaStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Query COA address via Flow React SDK
  const coaArgs = useCallback(
    (arg: typeof fcl.arg) => [arg(address!, t.Address)],
    [address]
  );
  const {
    data: coaAddress = null,
    isLoading: coaLoading,
    refetch: refetchCoa,
  } = useFlowQuery({
    cadence: GET_COA_ADDRESS,
    args: coaArgs,
    query: { enabled: !!address },
  }) as { data: string | null; isLoading: boolean; refetch: () => void };

  // Generate QR code when address changes
  useEffect(() => {
    if (!coaAddress) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(coaAddress, {
      width: 200,
      margin: 2,
      color: { dark: "#3C3848", light: "#FFFFFF" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(() => {
      if (!cancelled) setQrDataUrl(null);
    });
    return () => { cancelled = true; };
  }, [coaAddress]);

  const handleCopy = useCallback(async () => {
    if (!coaAddress) return;
    try {
      await navigator.clipboard.writeText(coaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [coaAddress]);

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
      refetchCoa();
    } catch (err) {
      console.error("COA creation failed:", err);
      setCoaStatus("Setup failed. Please try again.");
    } finally {
      setCoaCreating(false);
    }
  }, [magicAuthz, coaCreating, refetchCoa]);

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

  const showSetup = !coaLoading && !coaAddress;
  const showAddress = !coaLoading && !!coaAddress;

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
          Receive stgUSDC
        </h2>

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
          <span style={labelStyle}>Flow EVM Address</span>

          {/* Loading state */}
          {coaLoading && (
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
          )}

          {/* COA not set up */}
          {showSetup && (
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
                  background: coaCreating || !magicAuthz
                    ? "#E0D8C8"
                    : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
                  boxShadow: coaCreating || !magicAuthz ? "none" : "0 3px 0px #C07078",
                  color: "#FFFFFF",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 15,
                  opacity: coaCreating || !magicAuthz ? 0.6 : 1,
                }}
              >
                {coaCreating ? "Setting up..." : "Set Up EVM Account"}
              </button>
            </div>
          )}

          {/* Address + QR */}
          {showAddress && (
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
                {coaAddress || "—"}
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

        {/* Info Card */}
        <div
          style={{
            ...cardStyle,
            background: "#E8F5E3",
            border: "2px solid #5BAF48",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="8" fill="#5BAF48" />
            <path d="M6 10.5L9 13.5L14 8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#2E7D32",
            }}
          >
            stgUSDC sent here is auto-deposited to earn ~2% APY
          </span>
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
              Only send stgUSDC on the Flow network
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
