"use client";

import { useState, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useAuth } from "@/contexts/AuthProvider";
import { TRANSFER_FLOW } from "@/lib/flow";

export default function WalletScreen() {
  const { address, balance, email, logout, refreshBalance, magicAuthz } =
    useAuth();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "—";

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
      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header */}
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 900,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          Wallet
        </h2>

        {/* Email */}
        {email && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            {email}
          </p>
        )}

        {/* Address card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Flow Address
          </span>
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
              padding: "4px 8px",
              borderRadius: 8,
            }}
          >
            {copied ? "Copied!" : truncatedAddress}
          </button>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            FLOW Balance
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "var(--text-primary)",
            }}
          >
            {balance !== null ? balance.toFixed(4) : "—"}
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

        {/* Transfer section */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
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
              transition:
                "transform 80ms ease-out, box-shadow 80ms ease-out, background 80ms ease-out",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: "2px solid #ECD8A0",
            cursor: "pointer",
            background: "transparent",
            color: "var(--text-secondary)",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 16,
            transition: "background 120ms ease-out",
            userSelect: "none",
            WebkitUserSelect: "none",
            marginBottom: 8,
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
