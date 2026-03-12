"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useAuth } from "@/contexts/AuthProvider";
import { useGame } from "@/contexts/GameProvider";
import { TRANSFER_FLOW, GET_COA_ADDRESS, CREATE_COA } from "@/lib/flow";
import TransactionHistory from "@/components/TransactionHistory";

// ─── Shared UI helpers ──────────────────────────────────────

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4l4 4-4 4"
        stroke="var(--text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="#7878A0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 8,
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 16,
  boxShadow: "var(--shadow-card)",
};

// ─── Toggle component ───────────────────────────────────────

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        border: "none",
        background: on ? "#5BAF48" : "#D0D0D8",
        position: "relative",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 150ms ease-out",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          position: "absolute",
          top: 2,
          left: on ? 24 : 2,
          transition: "left 150ms ease-out",
        }}
      />
    </button>
  );
}

// ─── Row item ───────────────────────────────────────────────

function SettingsRow({
  label,
  sublabel,
  onClick,
  right,
}: {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minHeight: 48,
        padding: "10px 0",
        background: "transparent",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
      {right ?? <ChevronRight />}
    </button>
  );
}

// ─── Name edit popup ────────────────────────────────────────

function NameEditModal({
  value,
  onSave,
  onClose,
}: {
  value: string;
  onSave: (v: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (draft.trim()) {
      onSave(draft.trim());
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#FFF8E8",
          borderRadius: 20,
          border: "2px solid #ECD8A0",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          Change pet name
        </div>
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onClose();
            }}
            maxLength={20}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 999,
              border: "2px solid #ECD8A0",
              background: "#FFFFFF",
              padding: "0 40px 0 20px",
              fontSize: 15,
              fontFamily: "inherit",
              fontWeight: 700,
              color: "var(--text-primary)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {draft.length > 0 && (
            <button
              onClick={() => {
                setDraft("");
                inputRef.current?.focus();
              }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "none",
                background: "#D0CCC0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!draft.trim()}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "none",
            cursor: draft.trim() ? "pointer" : "default",
            background: draft.trim()
              ? "linear-gradient(180deg, #6DC95A 0%, #5BAF48 100%)"
              : "#E0D8C8",
            boxShadow: draft.trim() ? "0 3px 0px #3D8A30" : "none",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 16,
            opacity: draft.trim() ? 1 : 0.6,
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Developer Settings sub-view ────────────────────────────

function DeveloperSettings({ onBack }: { onBack: () => void }) {
  const { address, balance, magicAuthz, refreshBalance } = useAuth();
  const game = useGame();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [coaAddress, setCoaAddress] = useState<string | null>(null);
  const [coaLoading, setCoaLoading] = useState(true);
  const [coaCreating, setCoaCreating] = useState(false);
  const [coaStatus, setCoaStatus] = useState<string | null>(null);
  const [coaCopied, setCoaCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "\u2014";

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [address]);

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

  const copyCoaAddress = useCallback(async () => {
    if (!coaAddress) return;
    try {
      await navigator.clipboard.writeText(coaAddress);
      setCoaCopied(true);
      setTimeout(() => setCoaCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [coaAddress]);

  const truncatedCoaAddress = coaAddress
    ? `${coaAddress.slice(0, 6)}...${coaAddress.slice(-4)}`
    : null;

  const handleTransfer = useCallback(async () => {
    if (!magicAuthz || !recipient || !amount || sending) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setTxStatus("Invalid amount");
      return;
    }
    if (!recipient.startsWith("0x") || recipient.length !== 18) {
      setTxStatus("Invalid Flow address");
      return;
    }
    setSending(true);
    setTxStatus("Signing transaction...");
    try {
      const txId = await fcl.mutate({
        cadence: TRANSFER_FLOW,
        args: (arg: typeof fcl.arg) => [
          arg(parsedAmount.toFixed(8), t.UFix64),
          arg(recipient, t.Address),
        ],
        limit: 9999,
        authorizations: [magicAuthz],
        payer: magicAuthz,
        proposer: magicAuthz,
      });
      setTxStatus("Waiting for confirmation...");
      await fcl.tx(txId).onceSealed();
      setTxStatus("Transfer complete!");
      setRecipient("");
      setAmount("");
      await refreshBalance();
    } catch (err) {
      console.error("Transfer failed:", err);
      setTxStatus("Transfer failed. Please try again.");
    } finally {
      setSending(false);
    }
  }, [magicAuthz, recipient, amount, sending, refreshBalance]);

  const canSend =
    recipient.length > 0 && amount.length > 0 && !sending && magicAuthz;

  return (
    <>
      {/* Header with back */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "2px solid #ECD8A0",
            background: "#FFF8E8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <BackArrow />
        </button>
        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Developer
        </span>
      </div>

      {/* Flow Address */}
      <div style={cardStyle}>
        <span style={sectionLabel}>Flow Address</span>
        <button
          onClick={copyAddress}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--text-primary)",
            fontFamily: "inherit",
            padding: "4px 0",
            display: "block",
          }}
        >
          {copied ? "Copied!" : truncatedAddress}
        </button>
      </div>

      {/* COA Address */}
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={sectionLabel}>COA Address</span>
        {coaLoading ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>
            Loading...
          </span>
        ) : coaAddress ? (
          <button
            onClick={copyCoaAddress}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              padding: "4px 0",
              textAlign: "left",
            }}
          >
            {coaCopied ? "Copied!" : truncatedCoaAddress}
          </button>
        ) : (
          <>
            {coaStatus && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: coaStatus.includes("failed") ? "#E85878" : "var(--text-secondary)",
                }}
              >
                {coaStatus}
              </p>
            )}
            <button
              onClick={handleCreateCoa}
              disabled={coaCreating || !magicAuthz}
              style={{
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 999,
                border: "none",
                cursor: coaCreating || !magicAuthz ? "default" : "pointer",
                background:
                  coaCreating || !magicAuthz
                    ? "#E0D8C8"
                    : "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)",
                boxShadow: coaCreating || !magicAuthz ? "none" : "0 3px 0px #C07078",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 14,
                opacity: coaCreating || !magicAuthz ? 0.6 : 1,
              }}
            >
              {coaCreating ? "Setting up..." : "Set Up COA"}
            </button>
          </>
        )}
      </div>

      {/* FLOW Balance */}
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span style={sectionLabel}>FLOW Balance</span>
        <span style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>
          {balance !== null ? balance.toFixed(4) : "\u2014"}
        </span>
        <button
          onClick={() => refreshBalance()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--shield-blue)",
            fontFamily: "inherit",
            padding: "4px 8px",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Send FLOW */}
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
          Send FLOW
        </span>
        <input
          type="text"
          placeholder="Recipient address (0x...)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={sending}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "2px solid #ECD8A0",
            background: "#FFFFFF",
            padding: "0 16px",
            fontSize: 14,
            fontFamily: "inherit",
            fontWeight: 700,
            color: "#3C3848",
            outline: "none",
            opacity: sending ? 0.6 : 1,
            boxSizing: "border-box",
          }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={sending}
          step="0.0001"
          min="0"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "2px solid #ECD8A0",
            background: "#FFFFFF",
            padding: "0 16px",
            fontSize: 14,
            fontFamily: "inherit",
            fontWeight: 700,
            color: "#3C3848",
            outline: "none",
            opacity: sending ? 0.6 : 1,
            boxSizing: "border-box",
          }}
        />
        {txStatus && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: txStatus.includes("complete")
                ? "#4A90C4"
                : txStatus.includes("failed") || txStatus.includes("Invalid")
                  ? "#E85878"
                  : "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            {txStatus}
          </p>
        )}
        <button
          onClick={handleTransfer}
          disabled={!canSend}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "none",
            cursor: canSend ? "pointer" : "default",
            background: canSend
              ? "linear-gradient(180deg, #F8B0B8 0%, #F09098 100%)"
              : "#E0D8C8",
            boxShadow: canSend ? "0 3px 0px #C07078" : "none",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 16,
            opacity: canSend ? 1 : 0.6,
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Deposit $10k */}
      <div style={{ paddingTop: 16 }}>
        <button
          onClick={() => game.deposit(10000)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(180deg, #8CD468 0%, #5BAF48 100%)",
            boxShadow: "0 3px 0px #3D7A30",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Deposit $10,000
        </button>
      </div>

      {/* Reset game state */}
      <div style={{ paddingTop: 16 }}>
        <button
          onClick={() => {
            if (window.confirm("Reset all game data? This cannot be undone.")) {
              game.resetState();
            }
          }}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "1.5px solid #E85878",
            background: "transparent",
            color: "#E85878",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Reset Game State
        </button>
      </div>
    </>
  );
}

// ─── Main Settings Screen ───────────────────────────────────

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { email, logout } = useAuth();
  const game = useGame();

  const [view, setView] = useState<"main" | "developer" | "transactions">("main");
  const [bgMusic, setBgMusic] = useState(true);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

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
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {view === "developer" ? (
          <DeveloperSettings onBack={() => setView("main")} />
        ) : view === "transactions" ? (
          <TransactionHistory onBack={() => setView("main")} />
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Settings
              </span>
            </div>

            {/* Pet Name */}
            <div style={cardStyle}>
              <SettingsRow
                label="Pet Name"
                sublabel={game.petName}
                onClick={() => setShowNameEdit(true)}
              />
            </div>

            {/* Sound */}
            <div>
              <span style={sectionLabel}>Sound</span>
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 44,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Background Music
                  </span>
                  <Toggle on={bgMusic} onToggle={() => setBgMusic(!bgMusic)} />
                </div>
                <div
                  style={{
                    height: 1,
                    background: "#F0E8D8",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 44,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Sound Effects
                  </span>
                  <Toggle on={game.sfxEnabled ?? true} onToggle={game.toggleSfx} />
                </div>
              </div>
            </div>

            {/* Savings */}
            <div>
              <span style={sectionLabel}>Savings</span>
              <div style={cardStyle}>
                <SettingsRow
                  label="Transaction History"
                  onClick={() => setView("transactions")}
                />
              </div>
            </div>

            {/* Account */}
            <div>
              <span style={sectionLabel}>Account</span>
              <div style={cardStyle}>
                <SettingsRow
                  label="Email"
                  sublabel={email || undefined}
                  right={<span />}
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <span style={sectionLabel}>Info</span>
              <div style={cardStyle}>
                <SettingsRow label="Credits info" onClick={() => setShowCredits(true)} />
                <div
                  style={{
                    height: 1,
                    background: "#F0E8D8",
                    margin: "0",
                  }}
                />
                <SettingsRow
                  label="Developer Settings"
                  onClick={() => setView("developer")}
                />
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={logout}
              style={{
                width: "100%",
                height: 48,
                minHeight: 48,
                flexShrink: 0,
                borderRadius: 999,
                border: "2px solid #ECD8A0",
                cursor: "pointer",
                background: "transparent",
                color: "var(--text-secondary)",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 16,
                transition: "background 120ms ease-out",
                marginBottom: 8,
              }}
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {showNameEdit && (
        <NameEditModal
          value={game.petName}
          onSave={game.setPetName}
          onClose={() => setShowNameEdit(false)}
        />
      )}

      {showCredits && (
        <div
          onClick={() => setShowCredits(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 340,
              background: "#FFF8E8",
              borderRadius: 20,
              border: "2px solid #ECD8A0",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
                textAlign: "center",
              }}
            >
              Credits
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              Sound effects by Kenney.nl
              <br />
              Licensed under CC0 1.0 Universal
            </div>
            <button
              onClick={() => setShowCredits(false)}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(180deg, #6DC95A 0%, #5BAF48 100%)",
                boxShadow: "0 3px 0px #3D8A30",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
