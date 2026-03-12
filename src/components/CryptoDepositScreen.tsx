"use client";

import { useState, useEffect, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useFlowQuery } from "@onflow/kit";
import { useAuth } from "@/contexts/AuthProvider";
import { useGame } from "@/contexts/GameProvider";
import { GET_COA_ADDRESS, CREATE_COA, CHECK_PYUSD_VAULT, SETUP_PYUSD_VAULT } from "@/lib/flow";
import { useUsdcVault } from "@/hooks/useUsdcVault";
import QRCode from "qrcode";

type Network = "cadence" | "evm";
type TokenType = "pyusd0" | "stgusdc";

interface CryptoDepositScreenProps {
  onBack: () => void;
}

export default function CryptoDepositScreen({ onBack }: CryptoDepositScreenProps) {
  const { address, magicAuthz } = useAuth();
  const game = useGame();
  const { depositUsdc, getStgUsdcBalance, isLoading: vaultTxLoading } = useUsdcVault();

  const [token, setToken] = useState<TokenType>("stgusdc");
  const [network, setNetwork] = useState<Network>("evm");
  const [coaCreating, setCoaCreating] = useState(false);
  const [coaStatus, setCoaStatus] = useState<string | null>(null);

  const [vaultCreating, setVaultCreating] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // stgUSDC balance polling for deposit CTA
  const [stgBalance, setStgBalance] = useState<number>(0);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);

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

  // Check PYUSD0 vault via Flow React SDK
  const vaultArgs = useCallback(
    (arg: typeof fcl.arg) => [arg(address!, t.Address)],
    [address]
  );
  const {
    data: vaultRaw,
    isLoading: vaultLoading,
    refetch: refetchVault,
  } = useFlowQuery({
    cadence: CHECK_PYUSD_VAULT,
    args: vaultArgs,
    query: { enabled: !!address },
  }) as { data: boolean | null; isLoading: boolean; refetch: () => void };
  const vaultReady = vaultRaw === true;

  const displayAddress = network === "cadence" ? address : coaAddress;

  // Generate QR code when address changes
  useEffect(() => {
    if (!displayAddress) {
      setQrDataUrl(null);
      return;
    }
    // For Cadence, only generate QR if vault is ready
    if (network === "cadence" && !vaultReady) {
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
  }, [displayAddress, network, vaultReady]);

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
      refetchCoa();
    } catch (err) {
      console.error("COA creation failed:", err);
      setCoaStatus("Setup failed. Please try again.");
    } finally {
      setCoaCreating(false);
    }
  }, [magicAuthz, coaCreating, refetchCoa]);

  const handleSetupVault = useCallback(async () => {
    if (!magicAuthz || vaultCreating) return;
    setVaultCreating(true);
    setVaultStatus("Signing transaction...");
    try {
      const txId = await fcl.mutate({
        cadence: SETUP_PYUSD_VAULT,
        limit: 9999,
        authorizations: [magicAuthz],
        payer: magicAuthz,
        proposer: magicAuthz,
      });
      setVaultStatus("Waiting for confirmation...");
      await fcl.tx(txId).onceSealed();
      setVaultStatus(null);
      refetchVault();
    } catch (err) {
      console.error("PYUSD0 vault setup failed:", err);
      setVaultStatus("Setup failed. Please try again.");
    } finally {
      setVaultCreating(false);
    }
  }, [magicAuthz, vaultCreating, refetchVault]);

  // Poll stgUSDC balance in COA every 15s when on EVM + stgusdc
  useEffect(() => {
    if (network !== "evm" || token !== "stgusdc" || !coaAddress) return;
    let cancelled = false;

    const poll = async () => {
      const bal = await getStgUsdcBalance();
      if (!cancelled) setStgBalance(bal);
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [network, token, coaAddress, getStgUsdcBalance]);

  const handleDepositToEarn = useCallback(async () => {
    if (stgBalance <= 0 || vaultTxLoading) return;
    setDepositStatus("Depositing to earn yield...");
    const success = await depositUsdc(stgBalance);
    if (success) {
      setDepositStatus("Deposited! Earning ~2% APY");
      setStgBalance(0);
    } else {
      setDepositStatus("Deposit failed. Please try again.");
    }
  }, [stgBalance, vaultTxLoading, depositUsdc]);

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
  const showCadenceVaultSetup = network === "cadence" && !vaultLoading && !vaultReady;
  const isLoading =
    (network === "evm" && coaLoading) ||
    (network === "cadence" && vaultLoading);
  const showAddress =
    !isLoading && !showEvmSetup && !showCadenceVaultSetup;

  const ctaButtonStyle = (disabled: boolean): React.CSSProperties => ({
    height: 44,
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 999,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    background: disabled
      ? "#E0D8C8"
      : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
    boxShadow: disabled ? "none" : "0 3px 0px #C07078",
    color: "#FFFFFF",
    fontFamily: "inherit",
    fontWeight: 800,
    fontSize: 15,
    opacity: disabled ? 0.6 : 1,
    transition:
      "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out",
  });

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
          Receive Stablecoin
        </h2>

        {/* Token Selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {([
            { key: "stgusdc" as TokenType, label: "USDC", desc: "~2% APY" },
            { key: "pyusd0" as TokenType, label: "PYUSD0", desc: "~10% APY (capped)" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setToken(t.key)}
              style={{
                height: 44,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 12,
                border: token === t.key ? "2px solid #F09098" : "2px solid #ECD8A0",
                background: token === t.key ? "rgba(240,144,152,0.1)" : "#FFFFFF",
                color: token === t.key ? "#F09098" : "var(--text-secondary)",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 120ms ease-out",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span>{t.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Network Switcher */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {(["evm", "cadence"] as Network[]).map((n) => (
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

          {/* Loading state */}
          {isLoading && (
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

          {/* EVM: COA not set up */}
          {showEvmSetup && (
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
                style={ctaButtonStyle(coaCreating || !magicAuthz)}
              >
                {coaCreating ? "Setting up..." : "Set Up EVM Account"}
              </button>
            </div>
          )}

          {/* Cadence: PYUSD0 vault not set up */}
          {showCadenceVaultSetup && (
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
                PYUSD0 vault not set up yet
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                You need a PYUSD0 token vault on your Cadence account to receive deposits
              </p>
              {vaultStatus && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: vaultStatus.includes("failed")
                      ? "#E85878"
                      : "var(--text-secondary)",
                    textAlign: "center",
                  }}
                >
                  {vaultStatus}
                </p>
              )}
              <button
                onClick={handleSetupVault}
                disabled={vaultCreating || !magicAuthz}
                style={ctaButtonStyle(vaultCreating || !magicAuthz)}
              >
                {vaultCreating ? "Setting up..." : "Set Up PYUSD0 Vault"}
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

        {/* Deposit to Earn CTA — shown when stgUSDC balance detected in COA */}
        {network === "evm" && token === "stgusdc" && coaAddress && stgBalance > 0 && (
          <div
            style={{
              ...cardStyle,
              background: "#E8F5E3",
              border: "2px solid #5BAF48",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#2E7D32",
              }}
            >
              ${stgBalance.toFixed(2)} stgUSDC available
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              Deposit to More Markets to earn ~2% APY
            </span>
            {depositStatus && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: depositStatus.includes("failed") ? "#E85878" : "#2E7D32",
                }}
              >
                {depositStatus}
              </span>
            )}
            <button
              onClick={handleDepositToEarn}
              disabled={vaultTxLoading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 999,
                border: "none",
                cursor: vaultTxLoading ? "default" : "pointer",
                background: vaultTxLoading
                  ? "#E0D8C8"
                  : "linear-gradient(180deg, #6DC95A 0%, #5BAF48 100%)",
                boxShadow: vaultTxLoading ? "none" : "0 3px 0px #3D8A30",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 16,
                opacity: vaultTxLoading ? 0.6 : 1,
              }}
            >
              {vaultTxLoading ? "Depositing..." : `Deposit $${stgBalance.toFixed(2)} to Earn`}
            </button>
          </div>
        )}

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
              Only send {token === "stgusdc" ? "stgUSDC" : "PYUSD0"} on the Flow network
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
