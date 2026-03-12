import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createGameStore,
  dailyBonus,
  YIELD_PER_USD_PER_DAY,
  USDC_YIELD_PER_USD_PER_DAY,
  HEART_DECAY_MS,
  HEART_MULTIPLIERS,
  FEED_BONUS,
} from "@/contexts/GameProvider";

// Mock localStorage for Node environment
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => {
    storage[key] = val;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
});

function freshStore() {
  // Clear storage between tests
  Object.keys(storage).forEach((k) => delete storage[k]);
  return createGameStore();
}

// ─── dailyBonus (pure function) ────────────────────────────────
describe("dailyBonus", () => {
  it("returns 60 for streak 1", () => {
    expect(dailyBonus(1)).toBe(60);
  });

  it("returns 50 for streak 0", () => {
    expect(dailyBonus(0)).toBe(50);
  });

  it("returns 200 for streak 15", () => {
    expect(dailyBonus(15)).toBe(200);
  });

  it("caps at streak 15 (streak 100 still returns 200)", () => {
    expect(dailyBonus(100)).toBe(200);
  });

  it("scales linearly between 1 and 15", () => {
    for (let s = 0; s <= 15; s++) {
      expect(dailyBonus(s)).toBe(50 + s * 10);
    }
  });
});

// ─── Heart decay ──────────────────────────────────────────────
describe("Heart decay", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("does not decay within 8 hours", () => {
    const now = Date.now();
    store.set({ hearts: 4, lastFedAt: now });
    // Simulate time passing less than 8 hours
    vi.setSystemTime(now + HEART_DECAY_MS - 1000);
    store.tick();
    expect(store.get().hearts).toBe(4);
  });

  it("decays 1 heart after 8 hours", () => {
    const now = Date.now();
    store.set({ hearts: 4, lastFedAt: now, lastTickAt: now });
    vi.setSystemTime(now + HEART_DECAY_MS + 1000);
    store.tick();
    expect(store.get().hearts).toBe(3);
  });

  it("decays 2 hearts after 16 hours", () => {
    const now = Date.now();
    store.set({ hearts: 4, lastFedAt: now, lastTickAt: now });
    vi.setSystemTime(now + HEART_DECAY_MS * 2 + 1000);
    store.tick();
    expect(store.get().hearts).toBe(2);
  });

  it("never goes below 0", () => {
    const now = Date.now();
    store.set({ hearts: 1, lastFedAt: now, lastTickAt: now });
    vi.setSystemTime(now + HEART_DECAY_MS * 10);
    store.tick();
    expect(store.get().hearts).toBe(0);
  });
});

// ─── Yield accrual ────────────────────────────────────────────
describe("Yield accrual", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
    vi.useRealTimers();
  });

  it("accrues ~10% APY on PYUSD0 with 4 hearts", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 4,
      depositBalance: 1000,
      usdcDepositBalance: 0,
      lastTickAt: now,
      lastFedAt: now + oneDay * 2, // prevent heart decay
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    const expected = 1000 * YIELD_PER_USD_PER_DAY * HEART_MULTIPLIERS[4];
    const actual = store.get().depositBalance - 1000;
    expect(actual).toBeCloseTo(expected, 4);
  });

  it("accrues ~2% APY on stgUSDC with 4 hearts", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 4,
      depositBalance: 0,
      usdcDepositBalance: 1000,
      lastTickAt: now,
      lastFedAt: now + oneDay * 2,
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    const expected = 1000 * USDC_YIELD_PER_USD_PER_DAY * HEART_MULTIPLIERS[4];
    const actual = store.get().usdcDepositBalance - 1000;
    expect(actual).toBeCloseTo(expected, 4);
  });

  it("applies heart multiplier (3 hearts = 75%)", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 3,
      depositBalance: 1000,
      usdcDepositBalance: 0,
      lastTickAt: now,
      lastFedAt: now + oneDay * 2,
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    const expected = 1000 * YIELD_PER_USD_PER_DAY * HEART_MULTIPLIERS[3];
    const actual = store.get().depositBalance - 1000;
    expect(actual).toBeCloseTo(expected, 4);
  });

  it("zero hearts = zero yield", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 0,
      depositBalance: 1000,
      usdcDepositBalance: 500,
      lastTickAt: now,
      lastFedAt: now,
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    expect(store.get().depositBalance).toBe(1000);
    expect(store.get().usdcDepositBalance).toBe(500);
  });

  it("zero balance = zero yield", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 4,
      depositBalance: 0,
      usdcDepositBalance: 0,
      lastTickAt: now,
      lastFedAt: now + oneDay * 2,
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    expect(store.get().depositBalance).toBe(0);
    expect(store.get().usdcDepositBalance).toBe(0);
  });

  it("tracks totalYieldEarned", () => {
    const now = Date.now();
    const oneDay = 86400 * 1000;
    store.set({
      hearts: 4,
      depositBalance: 10000,
      usdcDepositBalance: 0,
      lastTickAt: now,
      lastFedAt: now + oneDay * 2,
      totalYieldEarned: 0,
    });

    vi.setSystemTime(now + oneDay);
    store.tick();

    expect(store.get().totalYieldEarned).toBeGreaterThan(0);
  });
});

// ─── Feed ─────────────────────────────────────────────────────
describe("Feed", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("free feed restores 1 heart", () => {
    store.set({ hearts: 2 });
    store.feed();
    expect(store.get().hearts).toBe(3);
  });

  it("free feed caps at 4 hearts", () => {
    store.set({ hearts: 4 });
    store.feed();
    expect(store.get().hearts).toBe(4);
  });

  it("free feed gives bonus nuggets", () => {
    store.set({ nuggets: 10 });
    store.feed();
    expect(store.get().nuggets).toBe(10 + FEED_BONUS);
  });

  it("feeding with food from inventory uses inventory", () => {
    store.set({ hearts: 0, nuggets: 0, foodInventory: { kibble: 2 } });
    const result = store.feed("kibble");
    expect(result).toBe(true);
    expect(store.get().hearts).toBe(1);
    expect(store.get().foodInventory.kibble).toBe(1);
  });

  it("feeding with food pays nuggets if not in inventory", () => {
    store.set({ hearts: 0, nuggets: 100, foodInventory: {} });
    const result = store.feed("kibble"); // kibble costs 10
    expect(result).toBe(true);
    expect(store.get().hearts).toBe(1);
    expect(store.get().nuggets).toBe(100 - 10 + FEED_BONUS);
  });

  it("feeding with food fails if insufficient nuggets and no inventory", () => {
    store.set({ hearts: 0, nuggets: 0, foodInventory: {} });
    const result = store.feed("kibble");
    expect(result).toBe(false);
    expect(store.get().hearts).toBe(0);
  });

  it("feast restores 4 hearts", () => {
    store.set({ hearts: 0, nuggets: 0, foodInventory: { feast: 1 } });
    store.feed("feast");
    expect(store.get().hearts).toBe(4);
  });
});

// ─── Buy food ─────────────────────────────────────────────────
describe("Buy food", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("deducts nuggets and adds to inventory", () => {
    store.set({ nuggets: 100, foodInventory: {} });
    const result = store.buyFood("kibble");
    expect(result).toBe(true);
    expect(store.get().nuggets).toBe(90); // kibble costs 10
    expect(store.get().foodInventory.kibble).toBe(1);
  });

  it("stacks inventory when buying multiple", () => {
    store.set({ nuggets: 200, foodInventory: {} });
    store.buyFood("kibble");
    store.buyFood("kibble");
    expect(store.get().foodInventory.kibble).toBe(2);
  });

  it("fails if insufficient nuggets", () => {
    store.set({ nuggets: 5, foodInventory: {} });
    const result = store.buyFood("kibble");
    expect(result).toBe(false);
  });

  it("fails for invalid food ID", () => {
    store.set({ nuggets: 1000 });
    const result = store.buyFood("nonexistent");
    expect(result).toBe(false);
  });
});

// ─── Buy furniture ────────────────────────────────────────────
describe("Buy furniture", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("deducts nuggets and adds to owned list", () => {
    store.set({ nuggets: 100, ownedFurniture: [], placedFurniture: [] });
    const result = store.buyFurniture("bone"); // costs 20
    expect(result).toBe(true);
    expect(store.get().nuggets).toBe(80);
    expect(store.get().ownedFurniture).toContain("bone");
  });

  it("auto-places furniture on purchase", () => {
    store.set({ nuggets: 100, ownedFurniture: [], placedFurniture: [] });
    store.buyFurniture("bone");
    expect(store.get().placedFurniture).toContain("bone");
  });

  it("cannot buy same furniture twice", () => {
    store.set({
      nuggets: 200,
      ownedFurniture: ["bone"],
      placedFurniture: ["bone"],
    });
    const result = store.buyFurniture("bone");
    expect(result).toBe(false);
    expect(store.get().nuggets).toBe(200); // no deduction
  });

  it("fails if insufficient nuggets", () => {
    store.set({ nuggets: 5, ownedFurniture: [], placedFurniture: [] });
    const result = store.buyFurniture("bone");
    expect(result).toBe(false);
  });

  it("exclusive items require $200+ deposit", () => {
    store.set({
      nuggets: 500,
      depositBalance: 50,
      usdcDepositBalance: 0,
      ownedFurniture: [],
      placedFurniture: [],
    });
    const result = store.buyFurniture("bear_frame"); // exclusive, costs 180
    expect(result).toBe(false);
  });

  it("exclusive items succeed with $200+ deposit", () => {
    store.set({
      nuggets: 500,
      depositBalance: 200,
      usdcDepositBalance: 0,
      ownedFurniture: [],
      placedFurniture: [],
    });
    const result = store.buyFurniture("bear_frame");
    expect(result).toBe(true);
  });
});

// ─── Place / remove furniture ─────────────────────────────────
describe("Furniture placement", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("can place owned furniture", () => {
    store.set({ ownedFurniture: ["bone"], placedFurniture: [] });
    const result = store.placeFurniture("bone");
    expect(result).toBe(true);
    expect(store.get().placedFurniture).toContain("bone");
  });

  it("cannot place unowned furniture", () => {
    store.set({ ownedFurniture: [], placedFurniture: [] });
    const result = store.placeFurniture("bone");
    expect(result).toBe(false);
  });

  it("cannot place already-placed furniture", () => {
    store.set({ ownedFurniture: ["bone"], placedFurniture: ["bone"] });
    const result = store.placeFurniture("bone");
    expect(result).toBe(false);
  });

  it("can remove placed furniture", () => {
    store.set({ ownedFurniture: ["bone"], placedFurniture: ["bone"] });
    store.removeFurniture("bone");
    expect(store.get().placedFurniture).not.toContain("bone");
    expect(store.get().ownedFurniture).toContain("bone"); // still owned
  });
});

// ─── Deposit / withdraw ───────────────────────────────────────
describe("Deposit & withdraw", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("deposit increases balance", () => {
    store.set({ depositBalance: 0 });
    store.deposit(100);
    expect(store.get().depositBalance).toBe(100);
  });

  it("deposit ignores zero or negative amounts", () => {
    store.set({ depositBalance: 50 });
    store.deposit(0);
    store.deposit(-10);
    expect(store.get().depositBalance).toBe(50);
  });

  it("withdraw decreases balance", () => {
    store.set({ depositBalance: 100 });
    store.withdraw(40);
    expect(store.get().depositBalance).toBe(60);
  });

  it("withdraw clamps to zero", () => {
    store.set({ depositBalance: 50 });
    store.withdraw(100);
    expect(store.get().depositBalance).toBe(0);
  });

  it("USDC deposit increases usdcDepositBalance", () => {
    store.set({ usdcDepositBalance: 0 });
    store.depositUsdc(500);
    expect(store.get().usdcDepositBalance).toBe(500);
  });

  it("USDC withdraw clamps to zero", () => {
    store.set({ usdcDepositBalance: 100 });
    store.withdrawUsdc(200);
    expect(store.get().usdcDepositBalance).toBe(0);
  });
});

// ─── Transaction log ──────────────────────────────────────────
describe("Transaction log", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("deposit creates a transaction record", () => {
    store.deposit(100);
    const txs = store.get().transactions;
    expect(txs.length).toBe(1);
    expect(txs[0].type).toBe("deposit");
    expect(txs[0].amount).toBe(100);
  });

  it("feed creates a nuggets_collected transaction", () => {
    store.set({ hearts: 2, nuggets: 0 });
    store.feed();
    const txs = store.get().transactions;
    expect(txs.some((tx) => tx.type === "nuggets_collected")).toBe(true);
  });

  it("buyFood creates a nuggets_spent transaction", () => {
    store.set({ nuggets: 100, foodInventory: {} });
    store.buyFood("kibble");
    const txs = store.get().transactions;
    expect(txs.some((tx) => tx.type === "nuggets_spent")).toBe(true);
  });

  it("transactions are newest-first", () => {
    store.deposit(10);
    store.deposit(20);
    const txs = store.get().transactions;
    expect(txs[0].amount).toBe(20);
    expect(txs[1].amount).toBe(10);
  });
});

// ─── Pet name / trainer name ──────────────────────────────────
describe("Names", () => {
  let store: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    store = freshStore();
  });

  it("setPetName updates the name", () => {
    store.setPetName("Fluffy");
    expect(store.get().petName).toBe("Fluffy");
  });

  it("setPetName trims whitespace", () => {
    store.setPetName("  Buddy  ");
    expect(store.get().petName).toBe("Buddy");
  });

  it("setPetName rejects empty string", () => {
    store.setPetName("Original");
    store.setPetName("   ");
    expect(store.get().petName).toBe("Original");
  });

  it("setTrainerName updates the name", () => {
    store.setTrainerName("Ash");
    expect(store.get().trainerName).toBe("Ash");
  });
});

// ─── Heart multipliers ───────────────────────────────────────
describe("Heart multipliers", () => {
  it("4 hearts = 100%", () => expect(HEART_MULTIPLIERS[4]).toBe(1.0));
  it("3 hearts = 75%", () => expect(HEART_MULTIPLIERS[3]).toBe(0.75));
  it("2 hearts = 50%", () => expect(HEART_MULTIPLIERS[2]).toBe(0.5));
  it("1 heart = 25%", () => expect(HEART_MULTIPLIERS[1]).toBe(0.25));
  it("0 hearts = 0%", () => expect(HEART_MULTIPLIERS[0]).toBe(0));
});

// ─── Reset ────────────────────────────────────────────────────
describe("resetState", () => {
  it("clears all state back to defaults", () => {
    const store = freshStore();
    store.deposit(1000);
    store.set({ nuggets: 500, hearts: 4 });
    store.resetState();
    expect(store.get().depositBalance).toBe(0);
    expect(store.get().nuggets).toBe(0);
    expect(store.get().hearts).toBe(0);
  });
});
