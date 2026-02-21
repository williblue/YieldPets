"use client";

import { useState, useEffect, useRef } from "react";
import HUDBar from "@/components/HUDBar";
import IsometricRoom from "@/components/IsometricRoom";
import ActionBar from "@/components/ActionBar";
import BottomNavBar from "@/components/BottomNavBar";
import FurnitureModal from "@/components/FurnitureModal";
import StartScreen from "@/components/StartScreen";
import { HUDState, RoomState, FurnitureItem, NavTab } from "@/types";

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
  const [showStart, setShowStart] = useState(true);
  const [startVisible, setStartVisible] = useState(true);
  const [hudState, setHudState] = useState<HUDState>({
    ...MOCK_HUD,
    loading: true,
  });
  const [roomState] = useState<RoomState>(MOCK_ROOM);
  const [activeTab, setActiveTab] = useState<NavTab>("pet");
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const debounceRef = useRef(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHudState(MOCK_HUD);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    // Fade out start screen (ease-in 180ms), then unmount
    setStartVisible(false);
    setTimeout(() => setShowStart(false), 200);
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

        <HUDBar state={hudState} />

        <div style={{ paddingTop: 52 }}>
          <IsometricRoom room={roomState} onFurnitureTap={handleFurnitureTap} />
        </div>

        <ActionBar
          onFeed={() => console.log("Feed tapped")}
        />

        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        <FurnitureModal item={selectedFurniture} onClose={handleModalClose} />

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
