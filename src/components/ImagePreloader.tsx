"use client";

import { useEffect, useState, createContext, useContext } from "react";

// Critical images that must load before Start screen fades
const CRITICAL_IMAGES = [
  "/cloud_bg_mobile.png",
  "/iso_room.png",
  "/happy_face.png",
  "/piggy_bank.png",
  "/egg_without_bush.png",
  "/pet_walk_sheet.png",
  "/pet_click_sheet.png",
];

// Secondary images preloaded in background for other screens
const SECONDARY_IMAGES = [
  "/Subject.png",
  "/pet_sad.png",
  "/pet_money_bag.png",
  "/yield_icon.png",
  "/streak_icon.png",
  "/paw_icon.png",
  "/yieldpets_logo.png",
  "/yieldpets_stamp.png",
];

const ImageReadyContext = createContext(false);

export function useImagesReady() {
  return useContext(ImageReadyContext);
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // don't block on failures
    img.src = src;
  });
}

export default function ImagePreloader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load critical images first, then mark ready
    Promise.all(CRITICAL_IMAGES.map(preloadImage)).then(() => {
      setReady(true);
      // Then preload secondary images in background
      SECONDARY_IMAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  return (
    <ImageReadyContext.Provider value={ready}>
      {children}
    </ImageReadyContext.Provider>
  );
}
