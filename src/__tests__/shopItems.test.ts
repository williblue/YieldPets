import { describe, it, expect } from "vitest";
import {
  FOOD_ITEMS,
  FURNITURE_ITEMS,
  EXCLUSIVE_ITEMS,
  ALL_FURNITURE,
} from "@/data/shopItems";

describe("Shop Items — Data Integrity", () => {
  describe("FOOD_ITEMS", () => {
    it("has no duplicate IDs", () => {
      const ids = FOOD_ITEMS.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all items have required fields", () => {
      for (const item of FOOD_ITEMS) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.price).toBeGreaterThan(0);
        expect(item.heartRestore).toBeGreaterThanOrEqual(1);
      }
    });

    it("prices increase with heartRestore value", () => {
      const sorted = [...FOOD_ITEMS].sort(
        (a, b) => a.heartRestore - b.heartRestore
      );
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].price).toBeGreaterThan(sorted[i - 1].price);
      }
    });
  });

  describe("FURNITURE_ITEMS", () => {
    it("has no duplicate IDs", () => {
      const ids = FURNITURE_ITEMS.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all items have required fields", () => {
      for (const item of FURNITURE_ITEMS) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.price).toBeGreaterThan(0);
        expect(item.imageUrl).toBeTruthy();
        expect(item.thumbnailUrl).toBeTruthy();
      }
    });
  });

  describe("EXCLUSIVE_ITEMS", () => {
    it("all cost at least 150 nuggets", () => {
      for (const item of EXCLUSIVE_ITEMS) {
        expect(item.price).toBeGreaterThanOrEqual(150);
      }
    });

    it("has no duplicate IDs", () => {
      const ids = EXCLUSIVE_ITEMS.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("ALL_FURNITURE", () => {
    it("is the union of common + exclusive items", () => {
      expect(ALL_FURNITURE.length).toBe(
        FURNITURE_ITEMS.length + EXCLUSIVE_ITEMS.length
      );
    });

    it("has no duplicate IDs across categories", () => {
      const ids = ALL_FURNITURE.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
