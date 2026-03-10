"use client";

import { useEffect } from "react";

// All images used across the app — preload on mount so screens feel instant
const PRELOAD_IMAGES = [
  "/cloud_bg_mobile.png",
  "/Subject.png",
  "/happy_face.png",
  "/piggy_bank.png",
  "/pet_sad.png",
  "/pet_money_bag.png",
  "/yield_icon.png",
  "/streak_icon.png",
  "/paw_icon.png",
  "/iso_room.png",
  "/egg_without_bush.png",
  "/yieldpets_logo.png",
  "/yieldpets_stamp.png",
  "/pet_click_sheet.png",
  "/pet_walk_sheet.png",
  "/furniture/bed_cloud.png",
  "/furniture/bookshelf.png",
  "/furniture/fountain.png",
  "/furniture/lamp_star.png",
  "/furniture/plant_pot.png",
  "/furniture/rug_pink.png",
];

export default function ImagePreloader() {
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
}
