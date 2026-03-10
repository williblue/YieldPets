"use client";

import { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameProvider";

interface GrowthRateScreenProps {
  onClose: () => void;
  onDeposit: () => void;
}

type HistoryRange = "1W" | "1M" | "3M" | "ALL";
type ProjectionRange = "5Y" | "10Y" | "20Y" | "30Y";

// ─── Helpers ─────────────────────────────────────────────────

function fmtCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${Math.round(value).toLocaleString("en-US")}`;
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${value.toFixed(2)}`;
}

function fmtApy(value: number): string {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(1);
}

// Generate simulated APY history data points
function generateApyHistory(currentApy: number, range: HistoryRange) {
  const points: { label: string; value: number }[] = [];
  const variance = currentApy * 0.08; // 8% variance for realistic look

  if (range === "1W") {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    for (let i = 0; i < 7; i++) {
      const drift = (i / 6) * variance * 0.5; // slight upward trend
      const noise = (Math.sin(i * 2.1 + 1.3) * variance * 0.6);
      points.push({ label: days[i], value: Math.max(0, currentApy - variance + drift + noise) });
    }
  } else if (range === "1M") {
    for (let i = 0; i < 8; i++) {
      const week = i + 1;
      const drift = (i / 7) * variance * 0.4;
      const noise = (Math.sin(i * 1.7 + 0.5) * variance * 0.5);
      points.push({ label: `W${week}`, value: Math.max(0, currentApy - variance * 0.5 + drift + noise) });
    }
  } else if (range === "3M") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const drift = ((2 - i) / 2) * variance * 0.3;
      const noise = (Math.sin(i * 3.1) * variance * 0.4);
      points.push({ label: months[d.getMonth()], value: Math.max(0, currentApy - variance * 0.3 + drift + noise) });
    }
  } else {
    // ALL — 6 points over a longer time
    const labels = ["6mo", "5mo", "4mo", "3mo", "2mo", "1mo"];
    for (let i = 0; i < 6; i++) {
      const drift = (i / 5) * variance * 0.6;
      const noise = (Math.sin(i * 1.3 + 2.1) * variance * 0.5);
      points.push({ label: labels[i], value: Math.max(0, currentApy - variance * 0.8 + drift + noise) });
    }
  }

  // Ensure last point is current APY
  if (points.length > 0) {
    points[points.length - 1].value = currentApy;
  }

  return points;
}

// Calculate compound growth projection
function calculateProjection(principal: number, apy: number, years: number) {
  const monthlyRate = apy / 100 / 12;
  const points: { year: number; value: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const value = principal * Math.pow(1 + monthlyRate, months);
    points.push({ year: y, value });
  }
  return points;
}

// ─── SVG Line Chart ──────────────────────────────────────────

function ApyLineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 280;
  const H = 120;
  const PX = 24;
  const PY = 16;
  const chartW = W - PX * 2;
  const chartH = H - PY * 2;

  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.97;
  const max = Math.max(...values) * 1.03;
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: PX + (i / Math.max(1, data.length - 1)) * chartW,
    y: PY + chartH - ((d.value - min) / range) * chartH,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Y-axis labels
  const yLabels = [max, (max + min) / 2, min];

  return (
    <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", height: "auto" }}>
      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = PY + (i / 2) * chartH;
        return (
          <g key={i}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#F0E8D8" strokeWidth="1" />
            <text x={PX - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#B0A890" fontFamily="inherit">
              {fmtApy(v)}%
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path d={pathD} fill="none" stroke="#5BAF48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#5BAF48" />
      )}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x}
          y={H + 14}
          textAnchor="middle"
          fontSize="9"
          fill="#B0A890"
          fontFamily="inherit"
          fontWeight="700"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── SVG Bar Chart ───────────────────────────────────────────

function ProjectionBarChart({
  data,
  selectedBar,
  onBarSelect,
}: {
  data: { year: number; value: number }[];
  selectedBar: number | null;
  onBarSelect: (index: number | null) => void;
}) {
  const W = 280;
  const H = 160;
  const PX = 32;
  const PY = 32; // extra top space for tooltips
  const PB = 28;
  const chartW = W - PX * 2;
  const chartH = H - PY - PB;

  const maxVal = Math.max(...data.map((d) => d.value));
  const barCount = data.length;
  const gap = 3;
  const barW = Math.max(4, (chartW - gap * (barCount - 1)) / barCount);

  // Y-axis labels
  const yLabels = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  return (
    <svg
      width={W}
      height={H + 8}
      viewBox={`0 0 ${W} ${H + 8}`}
      style={{ width: "100%", height: "auto", cursor: "pointer" }}
      onClick={() => onBarSelect(null)}
    >
      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = PY + ((maxVal - v) / maxVal) * chartH;
        return (
          <g key={i}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#F0E8D8" strokeWidth="1" />
            <text x={PX - 4} y={y + 3} textAnchor="end" fontSize="7" fill="#B0A890" fontFamily="inherit">
              {fmtCurrency(v)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = PX + i * (barW + gap);
        const y = PY + chartH - barH;
        const isSelected = selectedBar === i;
        const opacity = selectedBar === null ? 0.3 + (i / barCount) * 0.7 : isSelected ? 1 : 0.25;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={Math.min(3, barW / 2)}
              fill="#5BAF48"
              opacity={opacity}
              onClick={(e) => {
                e.stopPropagation();
                onBarSelect(isSelected ? null : i);
              }}
            />

            {/* Tooltip */}
            {isSelected && (
              <g>
                <rect
                  x={Math.max(4, Math.min(W - 100, x + barW / 2 - 48))}
                  y={y - 26}
                  width={96}
                  height={22}
                  rx={6}
                  fill="#3D5A3A"
                />
                <text
                  x={Math.max(52, Math.min(W - 52, x + barW / 2))}
                  y={y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#FFFFFF"
                  fontWeight="800"
                  fontFamily="inherit"
                >
                  Yr {d.year}: {fmtCurrency(d.value)}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* X-axis labels (first and last) */}
      {data.length > 0 && (
        <>
          <text
            x={PX}
            y={H}
            textAnchor="start"
            fontSize="9"
            fill="#B0A890"
            fontFamily="inherit"
            fontWeight="700"
          >
            1Y
          </text>
          <text
            x={W - PX}
            y={H}
            textAnchor="end"
            fontSize="9"
            fill="#B0A890"
            fontFamily="inherit"
            fontWeight="700"
          >
            {data[data.length - 1].year}Y
          </text>
        </>
      )}
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function GrowthRateScreen({ onClose, onDeposit }: GrowthRateScreenProps) {
  const game = useGame();
  const hidden = !(game.balanceVisible ?? true);

  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");
  const [projectionRange, setProjectionRange] = useState<ProjectionRange>("5Y");
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const currentApy = game.depositBalance > 0
    ? (game.yieldPerDay / game.depositBalance) * 365 * 100
    : 0;

  const apyHistory = useMemo(
    () => generateApyHistory(currentApy, historyRange),
    [currentApy, historyRange]
  );

  const projectionYears = { "5Y": 5, "10Y": 10, "20Y": 20, "30Y": 30 }[projectionRange];
  const projection = useMemo(
    () => calculateProjection(game.depositBalance, currentApy, projectionYears),
    [game.depositBalance, currentApy, projectionYears]
  );

  const projectedValue = projection.length > 0 ? projection[projection.length - 1].value : game.depositBalance;
  const projectedEarnings = projectedValue - game.depositBalance;

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    boxShadow: "var(--shadow-card)",
  };

  const filterPillStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 10px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 800,
    fontFamily: "inherit",
    background: active ? "#5BAF48" : "#F0E8D8",
    color: active ? "#FFFFFF" : "#B0A890",
    transition: "background 150ms ease-out, color 150ms ease-out",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 72,
        zIndex: 95,
        background: "var(--modal-bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: "1.5px solid #E0D8C8",
          background: "#FFFFFF",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Header */}
      <div
        style={{
          padding: "20px 20px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="4" y="12" width="3" height="6" rx="1" fill="#4A90C4" opacity="0.5" />
          <rect x="9.5" y="8" width="3" height="10" rx="1" fill="#4A90C4" opacity="0.7" />
          <rect x="15" y="5" width="3" height="13" rx="1" fill="#4A90C4" />
        </svg>
        <span
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Growth Rate
        </span>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          padding: "16px 20px 32px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Current APY Card */}
          <div
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "24px 20px",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Current APY
            </div>
            <div
              onClick={() => game.toggleBalanceVisible()}
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.1,
                cursor: "pointer",
              }}
            >
              {hidden ? "••••" : `${fmtApy(currentApy)}%`}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              Stable yield. Updated hourly
            </div>
          </div>

          {/* APY History Card */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 16px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Growth Rate/APY History
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {(["1W", "1M", "3M", "ALL"] as HistoryRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setHistoryRange(r)}
                    style={filterPillStyle(historyRange === r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: "4px 8px 12px" }}>
              {hidden ? (
                <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-secondary)" }}>Hidden</span>
                </div>
              ) : (
                <ApyLineChart data={apyHistory} />
              )}
            </div>
          </div>

          {/* Future Projection Card */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 16px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Future Projection
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {(["5Y", "10Y", "20Y", "30Y"] as ProjectionRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setProjectionRange(r); setSelectedBar(null); }}
                    style={filterPillStyle(projectionRange === r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Projection hero */}
            <div style={{ padding: "8px 16px 4px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#5BAF48" }}>
                {hidden ? "••••" : `${fmtApy(currentApy)}% APY`}
              </div>
              <div
                onClick={() => game.toggleBalanceVisible()}
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#5BAF48",
                  lineHeight: 1.2,
                  cursor: "pointer",
                }}
              >
                {hidden ? "••••••" : fmtCurrency(projectedValue)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginTop: 2 }}>
                {hidden ? "••••" : `+${fmtCurrency(projectedEarnings)} PYUSD earned in ${projectionYears} years`}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ padding: "4px 8px 8px" }}>
              {hidden ? (
                <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-secondary)" }}>Hidden</span>
                </div>
              ) : (
                <ProjectionBarChart
                  data={projection}
                  selectedBar={selectedBar}
                  onBarSelect={setSelectedBar}
                />
              )}
            </div>

            {/* Footer note */}
            <div
              style={{
                padding: "2px 16px 12px",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: "#B0A890" }}>
                ~ estimates at {fmtApy(currentApy)}% APY · compounding monthly
              </span>
            </div>
          </div>

          {/* Deposit CTA */}
          <button
            onClick={onDeposit}
            style={{
              width: "100%",
              minHeight: 52,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(180deg, #8CD468 0%, #5BAF48 100%)",
              boxShadow: "0 4px 0px #3D7A30",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: 16,
              marginTop: 4,
              marginBottom: 4,
              flexShrink: 0,
              padding: "14px 0",
            }}
          >
            Deposit to Grow Faster
          </button>
        </div>
      </div>
    </div>
  );
}
