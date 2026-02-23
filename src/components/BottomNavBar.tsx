"use client";

import { NavTab } from "@/types";

interface NavItem {
  key: NavTab;
  label: string;
}

const disabledTabs: NavTab[] = ["build", "shop", "friends"];

const navItems: NavItem[] = [
  { key: "pet", label: "Pet" },
  { key: "build", label: "Build" },
  { key: "shop", label: "Shop" },
  { key: "friends", label: "Friends" },
  { key: "settings", label: "Settings" },
];

function PetIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="18" rx="10" ry="7" fill="currentColor" opacity="0.3" />
      <circle cx="10" cy="12" r="3" fill="currentColor" />
      <circle cx="18" cy="12" r="3" fill="currentColor" />
      <circle cx="6" cy="16" r="2.5" fill="currentColor" />
      <circle cx="22" cy="16" r="2.5" fill="currentColor" />
      <ellipse cx="14" cy="20" rx="5" ry="4" fill="currentColor" />
    </svg>
  );
}

function BuildIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="12" width="16" height="12" rx="2" fill="currentColor" opacity="0.3" />
      <path d="M8 12V8a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 18l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
      <rect x="11" y="6" width="6" height="8" rx="1" fill="currentColor" opacity="0.5" />
      <path d="M14 22l-4-6h8z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="12" width="16" height="12" rx="2" fill="currentColor" opacity="0.4" />
      <path d="M4 12h20l-2-6H6z" fill="currentColor" opacity="0.6" />
      <ellipse cx="14" cy="12" rx="4" ry="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="10" cy="10" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="10" r="4" fill="currentColor" opacity="0.5" />
      <ellipse cx="14" cy="22" rx="10" ry="5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="13"
          y="3"
          width="2"
          height="5"
          rx="1"
          fill="currentColor"
          transform={`rotate(${deg} 14 14)`}
        />
      ))}
    </svg>
  );
}

const iconMap: Record<NavTab, React.FC> = {
  pet: PetIcon,
  build: BuildIcon,
  shop: ShopIcon,
  friends: FriendsIcon,
  settings: SettingsIcon,
};

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const columnWidth = 428 / 5;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 428,
        height: 72,
        zIndex: 100,
        background: "var(--nav-bar-bg)",
        borderTop: "1.5px solid var(--nav-bar-border)",
        boxShadow: "var(--shadow-nav)",
        display: "flex",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        const isDisabled = disabledTabs.includes(item.key);
        const Icon = iconMap[item.key];

        return (
          <button
            key={item.key}
            onClick={() => !isDisabled && onTabChange(item.key)}
            disabled={isDisabled}
            style={{
              width: columnWidth,
              height: 72,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: isDisabled ? "default" : "pointer",
              padding: 0,
              gap: 2,
              color: isDisabled
                ? "var(--nav-icon-inactive)"
                : isActive
                  ? "var(--nav-icon-active)"
                  : "var(--nav-icon-inactive)",
              opacity: isDisabled ? 0.35 : 1,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive && !isDisabled ? "rgba(240, 144, 152, 0.15)" : "transparent",
                transition: "background 120ms ease-out",
              }}
            >
              <Icon />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isDisabled
                  ? "var(--nav-label)"
                  : isActive
                    ? "var(--nav-label-active)"
                    : "var(--nav-label)",
                marginTop: 2,
                lineHeight: 1,
              }}
            >
              {isDisabled ? "Soon" : item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
