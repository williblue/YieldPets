"use client";

interface DepositMethodScreenProps {
  onClose: () => void;
  onCreditCard: () => void;
  onCrypto: () => void;
}

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  boxShadow: "var(--shadow-card)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  border: "2px solid #ECD8A0",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
  fontFamily: "inherit",
  transition: "border 120ms ease-out, background 120ms ease-out",
};

export default function DepositMethodScreen({
  onClose,
  onCreditCard,
  onCrypto,
}: DepositMethodScreenProps) {
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

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "16px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 900,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          Deposit / Withdraw
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          Choose how to add funds
        </p>

        {/* Credit Card option */}
        <button onClick={onCreditCard} style={cardStyle}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(240,144,152,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" fill="#F09098" />
              <rect x="2" y="9" width="20" height="3" fill="#C07078" />
              <rect x="5" y="15" width="6" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.6" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Credit Card
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
                marginTop: 2,
              }}
            >
              Buy PYUSD with card
            </div>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            <path
              d="M7.5 5L12.5 10L7.5 15"
              stroke="#A0A8B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Crypto option */}
        <button onClick={onCrypto} style={cardStyle}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(74,144,196,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="12" rx="2" fill="#4A90C4" />
              <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" opacity="0.3" />
              <path d="M12 9v6M9 12h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Crypto
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-secondary)",
                marginTop: 2,
              }}
            >
              Send PYUSD from a wallet
            </div>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            <path
              d="M7.5 5L12.5 10L7.5 15"
              stroke="#A0A8B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
