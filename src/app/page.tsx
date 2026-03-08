"use client";

import { useState, useEffect, useRef } from "react";
import HUDBar from "@/components/HUDBar";
import IsometricRoom from "@/components/IsometricRoom";
import ActionBar from "@/components/ActionBar";
import BottomNavBar from "@/components/BottomNavBar";
import FurnitureModal from "@/components/FurnitureModal";
import StartScreen from "@/components/StartScreen";
import LoginScreen from "@/components/LoginScreen";
import WalletScreen from "@/components/WalletScreen";
import DepositScreen from "@/components/DepositScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { HUDState, RoomState, FurnitureItem, NavTab } from "@/types";
import { PetAction } from "@/components/PetRadialMenu";

const MOCK_HUD: HUDState = {
  goldNuggets: 1380,
  hearts: 4,
  shieldScore: 0,
  loading: false,
};

const MOCK_ROOM: RoomState = {
  pet: {
    imageUrl: "/Subject.png",
    petName: "Sprout",
  },
  furniture: [],
  roomTheme: "default",
};

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const [showStart, setShowStart] = useState(true);
  const [startVisible, setStartVisible] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [hudState, setHudState] = useState<HUDState>({
    ...MOCK_HUD,
    loading: true,
  });
  const [roomState] = useState<RoomState>(MOCK_ROOM);
  const [activeTab, setActiveTab] = useState<NavTab>("pet");
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [piggyPressed, setPiggyPressed] = useState(false);
  const debounceRef = useRef(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHudState(MOCK_HUD);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // When login succeeds, hide the login screen
  useEffect(() => {
    if (isLoggedIn && showLogin) {
      setLoginVisible(false);
      setTimeout(() => setShowLogin(false), 200);
    }
  }, [isLoggedIn, showLogin]);

  // When user logs out, reset tab to pet (egg will show automatically)
  useEffect(() => {
    if (!isLoggedIn && !isLoading && !showStart) {
      setActiveTab("pet");
    }
  }, [isLoggedIn, isLoading, showStart]);

  const handlePlay = () => {
    // Fade out start screen
    setStartVisible(false);
    setTimeout(() => {
      setShowStart(false);
    }, 200);
  };

  const handleEggTap = () => {
    if (showLogin) return;
    setShowLogin(true);
    requestAnimationFrame(() => setLoginVisible(true));
  };

  const handleFurnitureTap = (item: FurnitureItem) => {
    if (debounceRef.current) return;
    debounceRef.current = true;
    setSelectedFurniture(item);
    setTimeout(() => {
      debounceRef.current = false;
    }, 300);
  };

  const handleModalClose = () => {
    setSelectedFurniture(null);
  };

  const handlePetMenuAction = (action: PetAction) => {
    if (action === "feed") {
      console.log("Feed tapped");
    } else if (action === "deposit") {
      setShowDeposit(true);
    } else if (action === "stats") {
      console.log("Stats tapped");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        background: "#BDD8EE",
      }}
    >
      <div
        style={{
          width: 428,
          maxWidth: "100%",
          height: "100dvh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Full-screen cloud background */}
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

        {activeTab === "pet" && !showDeposit && <HUDBar state={hudState} />}

        <div style={{ paddingTop: 52 }}>
          <IsometricRoom
            room={roomState}
            onFurnitureTap={handleFurnitureTap}
            showEgg={!isLoggedIn}
            onEggTap={handleEggTap}
            onPetMenuAction={handlePetMenuAction}
          />
        </div>

        <ActionBar
          onFeed={() => console.log("Feed tapped")}
        />

        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        <FurnitureModal item={selectedFurniture} onClose={handleModalClose} />

        {/* Floating piggy bank button */}
        {isLoggedIn && !showDeposit && activeTab !== "settings" && (
          <button
            onClick={() => setShowDeposit(true)}
            onMouseDown={() => setPiggyPressed(true)}
            onMouseUp={() => setPiggyPressed(false)}
            onMouseLeave={() => setPiggyPressed(false)}
            onTouchStart={() => setPiggyPressed(true)}
            onTouchEnd={() => setPiggyPressed(false)}
            style={{
              position: "fixed",
              bottom: 88,
              right: "calc(50% - 214px + 24px)",
              width: 52,
              height: 52,
              borderRadius: 999,
              border: "2px solid #ECD8A0",
              background: "#FFF8E8",
              boxShadow: piggyPressed
                ? "0 1px 4px rgba(0,0,0,0.1)"
                : "0 4px 12px rgba(0,0,0,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 75,
              transform: piggyPressed ? "scale(0.93)" : "scale(1)",
              transition: piggyPressed
                ? "transform 80ms ease-out, box-shadow 80ms ease-out"
                : "transform 120ms ease-out, box-shadow 120ms ease-out",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <ellipse cx="15" cy="16" rx="9" ry="7" fill="#F8B0B8"/>
              <ellipse cx="15" cy="16" rx="7" ry="5.5" fill="#F09098"/>
              <circle cx="8" cy="14" r="3" fill="#F8B0B8"/>
              <ellipse cx="15" cy="12" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.35"/>
              <rect x="11" y="21" width="2.5" height="3.5" rx="1" fill="#E08088"/>
              <rect x="16" y="21" width="2.5" height="3.5" rx="1" fill="#E08088"/>
              <circle cx="18" cy="14.5" r="1" fill="#3C3848"/>
              <ellipse cx="15" cy="10" rx="2" ry="1" fill="#F8B0B8"/>
              <rect x="13.5" y="8" width="3" height="3" rx="1.5" fill="#F5C030" stroke="#D4A020" strokeWidth="0.5"/>
            </svg>
          </button>
        )}

        {/* Deposit screen overlay */}
        {showDeposit && isLoggedIn && (
          <DepositScreen onClose={() => setShowDeposit(false)} petName={roomState.pet.petName} />
        )}

        {/* Wallet screen overlay (when settings tab active) */}
        {activeTab === "settings" && isLoggedIn && <WalletScreen />}

        {/* Login screen overlay */}
        {showLogin && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 250,
              opacity: loginVisible ? 1 : 0,
              pointerEvents: loginVisible ? "auto" : "none",
              transition: loginVisible
                ? "opacity 220ms ease-out"
                : "opacity 180ms ease-in",
            }}
          >
            <LoginScreen onBack={() => {
              setLoginVisible(false);
              setTimeout(() => setShowLogin(false), 200);
            }} />
          </div>
        )}

        {/* Start screen overlay */}
        {showStart && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 300,
              opacity: startVisible ? 1 : 0,
              pointerEvents: startVisible ? "auto" : "none",
              transition: startVisible
                ? "opacity 220ms ease-out"
                : "opacity 180ms ease-in",
            }}
          >
            <StartScreen onPlay={handlePlay} />
          </div>
        )}
      </div>
    </div>
  );
}
