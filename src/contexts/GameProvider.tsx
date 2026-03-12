"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useSyncExternalStore,
} from "react";
import { HeartCount } from "@/types";
import { FOOD_ITEMS, ALL_FURNITURE, EXCLUSIVE_ITEMS } from "@/data/shopItems";

// ─── Constants ───────────────────────────────────────────────
const STORAGE_KEY = "yieldpets_game";
export const YIELD_PER_USD_PER_DAY = 0.10 / 365; // ~10% APY (PYUSD0)
export const USDC_YIELD_PER_USD_PER_DAY = 0.02 / 365; // ~2% APY (stgUSDC)
export const HEART_DECAY_MS = 8 * 60 * 60 * 1000; // 8 hours
const FEED_COOLDOWN_MS = 0; // no cooldown
export const FEED_BONUS = 5;
const TICK_INTERVAL_MS = 10_000; // 10 seconds
export const HEART_MULTIPLIERS: Record<HeartCount, number> = {
  4: 1.0,
  3: 0.75,
  2: 0.5,
  1: 0.25,
  0: 0,
};

export function dailyBonus(streak: number): number {
  return 50 + Math.min(streak, 15) * 10;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Transaction log ────────────────────────────────────────
export type TransactionType =
  | "yield"
  | "deposit"
  | "withdrawal"
  | "nuggets_collected"
  | "nuggets_spent";

export interface Transaction {
  id: string;
  type: TransactionType;
  label: string;
  amount: number;
  timestamp: number;
}

let txIdCounter = 0;
function makeTx(
  type: TransactionType,
  label: string,
  amount: number
): Transaction {
  return {
    id: `tx_${++txIdCounter}_${Date.now()}`,
    type,
    label,
    amount,
    timestamp: Date.now(),
  };
}

// ─── State shape ─────────────────────────────────────────────
export interface GameState {
  nuggets: number;
  nuggetsFloat: number;
  lastTickAt: number;
  depositBalance: number;
  usdcDepositBalance: number;
  hearts: HeartCount;
  lastFedAt: number;
  feedCooldownEnd: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  dailyBonusClaimed: boolean;
  foodInventory: Record<string, number>;
  ownedFurniture: string[];
  placedFurniture: string[];
  petName: string;
  trainerName: string;
  transactions: Transaction[];
  totalYieldEarned: number;
  sfxEnabled: boolean;
  balanceVisible: boolean;
  onChainMode: boolean;
  createdAt: number;
}

const INITIAL_STATE: GameState = {
  nuggets: 0,
  nuggetsFloat: 0,
  lastTickAt: Date.now(),
  depositBalance: 0,
  usdcDepositBalance: 0,
  hearts: 0,
  lastFedAt: Date.now(),
  feedCooldownEnd: 0,
  currentStreak: 1,
  longestStreak: 1,
  lastLoginDate: todayStr(),
  dailyBonusClaimed: false,
  foodInventory: {},
  ownedFurniture: [],
  placedFurniture: [],
  petName: "Sprout",
  trainerName: "Trainer",
  transactions: [],
  totalYieldEarned: 0,
  sfxEnabled: true,
  balanceVisible: true,
  onChainMode: false,
  createdAt: Date.now(),
};

// ─── Store (external, mutable, subscription-based) ───────────
type Listener = () => void;

export function createGameStore() {
  let state: GameState = INITIAL_STATE;
  const listeners = new Set<Listener>();

  function load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameState>;
        state = { ...INITIAL_STATE, ...parsed };
        // Clean up any seed transactions from development
        const hasSeeds = state.transactions?.some((tx) => tx.id?.startsWith("seed_"));
        if (hasSeeds) {
          state.transactions = state.transactions.filter((tx) => !tx.id?.startsWith("seed_"));
        }
      }
    } catch {
      // corrupt data — use defaults
    }
  }

  function save() {
    if (typeof window === "undefined") return;
    // Cap transactions to the most recent 200 to prevent storage bloat
    if (state.transactions.length > 200) {
      state = { ...state, transactions: state.transactions.slice(0, 200) };
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full — trim transactions further and retry once
      try {
        state = { ...state, transactions: state.transactions.slice(0, 50) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // still full — skip
      }
    }
  }

  function set(partial: Partial<GameState>) {
    state = { ...state, ...partial };
    save();
    listeners.forEach((l) => l());
  }

  function get() {
    return state;
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function pushTx(tx: Transaction) {
    state = { ...state, transactions: [tx, ...state.transactions] };
  }

  // ─── Heart decay ──────────────────────────────────
  function decayHearts(now: number): Partial<GameState> {
    if (state.hearts === 0) return {};
    const elapsed = now - state.lastFedAt;
    const decays = Math.floor(elapsed / HEART_DECAY_MS);
    if (decays <= 0) return {};
    const newHearts = Math.max(0, state.hearts - decays) as HeartCount;
    return { hearts: newHearts };
  }

  // ─── Yield accrual (adds to deposit balance) ─────
  let pendingYield = 0;
  function accrueYield(now: number): Partial<GameState> {
    const elapsed = (now - state.lastTickAt) / 1000; // seconds
    if (elapsed <= 0) return { lastTickAt: now };
    const mult = HEART_MULTIPLIERS[state.hearts];

    // PYUSD0 yield (~10% APY)
    const pyusdRate = state.depositBalance * YIELD_PER_USD_PER_DAY;
    const pyusdEarned = (pyusdRate / 86400) * elapsed * mult;

    // stgUSDC yield (~2% APY)
    const usdcBalance = state.usdcDepositBalance ?? 0;
    const usdcRate = usdcBalance * USDC_YIELD_PER_USD_PER_DAY;
    const usdcEarned = (usdcRate / 86400) * elapsed * mult;

    const totalEarned = pyusdEarned + usdcEarned;
    pendingYield += totalEarned;
    // Only log a transaction once pendingYield reaches $0.01
    if (pendingYield >= 0.01) {
      pushTx(makeTx("yield", "Yield harvested", pendingYield));
      pendingYield = 0;
    }
    return {
      depositBalance: state.depositBalance + pyusdEarned,
      usdcDepositBalance: usdcBalance + usdcEarned,
      totalYieldEarned: (state.totalYieldEarned ?? 0) + totalEarned,
      lastTickAt: now,
    };
  }

  // ─── Daily login / streak ─────────────────────────
  function checkDailyLogin(): { bonusAmount: number } | null {
    // Daily bonus requires at least $200 total deposit balance
    const totalDeposit = state.depositBalance + (state.usdcDepositBalance ?? 0);
    if (totalDeposit < 200) return null;

    const today = todayStr();
    if (state.lastLoginDate === today && state.dailyBonusClaimed) {
      return null; // already claimed
    }

    const yesterday = yesterdayStr();
    let newStreak = state.currentStreak;

    if (state.lastLoginDate === today) {
      // same day, not yet claimed (shouldn't happen but safe)
    } else if (state.lastLoginDate === yesterday) {
      newStreak = state.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const bonus = dailyBonus(newStreak);
    const longest = Math.max(state.longestStreak, newStreak);

    pushTx(makeTx("nuggets_collected", "Daily bonus", bonus));
    set({
      currentStreak: newStreak,
      longestStreak: longest,
      lastLoginDate: today,
      dailyBonusClaimed: true,
      nuggets: state.nuggets + bonus,
    });

    return { bonusAmount: bonus };
  }

  // ─── Tick (call periodically) ─────────────────────
  function tick() {
    const now = Date.now();
    const elapsed = (now - state.lastTickAt) / 1000;
    const heartChanges = decayHearts(now);
    // Apply heart changes first so accrual uses new heart count
    if (Object.keys(heartChanges).length > 0) {
      state = { ...state, ...heartChanges };
    }
    const yieldChanges = accrueYield(now);
    set({ ...heartChanges, ...yieldChanges });
  }

  // ─── Actions ──────────────────────────────────────
  function feed(foodId?: string) {
    const now = Date.now();
    if (now < state.feedCooldownEnd) return false;

    // Default feed (no foodId) is free — restores 1 heart + bonus nuggets
    if (!foodId) {
      const newHearts = Math.min(4, state.hearts + 1) as HeartCount;
      pushTx(makeTx("nuggets_collected", "Nuggets collected", FEED_BONUS));
      set({
        hearts: newHearts,
        lastFedAt: now,
        feedCooldownEnd: now + FEED_COOLDOWN_MS,
        nuggets: state.nuggets + FEED_BONUS,
      });
      return true;
    }

    const food = FOOD_ITEMS.find((f) => f.id === foodId);
    if (!food) return false;

    // Check if user has this food in inventory
    if (state.foodInventory[foodId] && state.foodInventory[foodId] > 0) {
      const newInventory = { ...state.foodInventory };
      newInventory[foodId] = (newInventory[foodId] || 0) - 1;
      if (newInventory[foodId] <= 0) delete newInventory[foodId];

      const newHearts = Math.min(4, state.hearts + food.heartRestore) as HeartCount;
      pushTx(makeTx("nuggets_collected", "Nuggets collected", FEED_BONUS));
      set({
        hearts: newHearts,
        lastFedAt: now,
        feedCooldownEnd: now + FEED_COOLDOWN_MS,
        nuggets: state.nuggets + FEED_BONUS,
        foodInventory: newInventory,
      });
      return true;
    }

    // Pay with nuggets directly
    if (state.nuggets < food.price) return false;
    const newHearts = Math.min(4, state.hearts + food.heartRestore) as HeartCount;
    pushTx(makeTx("nuggets_collected", "Nuggets collected", FEED_BONUS));
    set({
      hearts: newHearts,
      lastFedAt: now,
      feedCooldownEnd: now + FEED_COOLDOWN_MS,
      nuggets: state.nuggets - food.price + FEED_BONUS,
    });
    return true;
  }

  function buyFood(foodId: string) {
    const food = FOOD_ITEMS.find((f) => f.id === foodId);
    if (!food || state.nuggets < food.price) return false;
    const newInventory = { ...state.foodInventory };
    newInventory[foodId] = (newInventory[foodId] || 0) + 1;
    pushTx(makeTx("nuggets_spent", `Bought ${food.name}`, -food.price));
    set({
      nuggets: state.nuggets - food.price,
      foodInventory: newInventory,
    });
    return true;
  }

  function buyFurniture(furnitureId: string) {
    if (state.ownedFurniture.includes(furnitureId)) return false;
    const item = ALL_FURNITURE.find((f) => f.id === furnitureId);
    if (!item || state.nuggets < item.price) return false;
    // Exclusives require minimum $200 total deposit balance
    const totalDeposit = state.depositBalance + (state.usdcDepositBalance ?? 0);
    if (EXCLUSIVE_ITEMS.some((e) => e.id === furnitureId) && totalDeposit < 200) return false;
    pushTx(makeTx("nuggets_spent", `Bought ${item.name}`, -item.price));
    set({
      nuggets: state.nuggets - item.price,
      ownedFurniture: [...state.ownedFurniture, furnitureId],
      placedFurniture: [...state.placedFurniture, furnitureId],
    });
    return true;
  }

  function placeFurniture(furnitureId: string) {
    if (!state.ownedFurniture.includes(furnitureId)) return false;
    if (state.placedFurniture.includes(furnitureId)) return false;
    set({ placedFurniture: [...state.placedFurniture, furnitureId] });
    return true;
  }

  function removeFurniture(furnitureId: string) {
    set({
      placedFurniture: state.placedFurniture.filter((id) => id !== furnitureId),
    });
  }

  function deposit(amount: number) {
    if (amount <= 0) return;
    pushTx(makeTx("deposit", "Deposit", amount));
    set({ depositBalance: state.depositBalance + amount });
  }

  function withdraw(amount: number) {
    if (amount <= 0) return;
    const actual = Math.min(amount, state.depositBalance);
    pushTx(makeTx("withdrawal", "Withdrawal", actual));
    set({ depositBalance: Math.max(0, state.depositBalance - amount) });
  }

  function depositUsdc(amount: number) {
    if (amount <= 0) return;
    pushTx(makeTx("deposit", "USDC Deposit", amount));
    set({ usdcDepositBalance: (state.usdcDepositBalance ?? 0) + amount });
  }

  function withdrawUsdc(amount: number) {
    if (amount <= 0) return;
    const balance = state.usdcDepositBalance ?? 0;
    const actual = Math.min(amount, balance);
    pushTx(makeTx("withdrawal", "USDC Withdrawal", actual));
    set({ usdcDepositBalance: Math.max(0, balance - amount) });
  }

  function setPetName(name: string) {
    if (!name.trim()) return;
    set({ petName: name.trim() });
  }

  function setTrainerName(name: string) {
    if (!name.trim()) return;
    set({ trainerName: name.trim() });
  }

  function resetState() {
    set({ ...INITIAL_STATE, lastTickAt: Date.now() });
  }

  function toggleSfx() {
    set({ sfxEnabled: !(state.sfxEnabled ?? true) });
  }

  function toggleBalanceVisible() {
    set({ balanceVisible: !(state.balanceVisible ?? true) });
  }

  function setOnChainMode(enabled: boolean) {
    set({ onChainMode: enabled });
  }

  /** Overwrite local state with on-chain profile data */
  function loadFromChain(profileState: Partial<GameState>) {
    set({ ...profileState, lastTickAt: Date.now() });
  }

  return {
    get,
    set,
    subscribe,
    load,
    tick,
    checkDailyLogin,
    feed,
    buyFood,
    buyFurniture,
    placeFurniture,
    removeFurniture,
    deposit,
    withdraw,
    depositUsdc,
    withdrawUsdc,
    setPetName,
    setTrainerName,
    resetState,
    toggleSfx,
    toggleBalanceVisible,
    setOnChainMode,
    loadFromChain,
  };
}

type GameStore = ReturnType<typeof createGameStore>;

// ─── Context ─────────────────────────────────────────────────
interface GameContextValue {
  store: GameStore;
  dailyBonus: { amount: number } | null;
  dismissDailyBonus: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────
export function GameProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<GameStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createGameStore();
    storeRef.current.load(); // Load from localStorage synchronously so state is ready before child effects
  }
  const store = storeRef.current;

  const dailyBonusRef = useRef<{ amount: number } | null>(null);
  // Subscribe to store changes to trigger re-renders
  const snapshot = useSyncExternalStore(
    store.subscribe,
    () => store.get(),
    () => INITIAL_STATE
  );
  void snapshot; // keep subscription active

  useEffect(() => {
    store.tick(); // catch up on elapsed time

    const result = store.checkDailyLogin();
    if (result) {
      dailyBonusRef.current = { amount: result.bonusAmount };
    }

    const interval = setInterval(() => store.tick(), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [store]);

  const dismissDailyBonus = useCallback(() => {
    dailyBonusRef.current = null;
    // Trigger re-render
    store.set({});
  }, [store]);

  return (
    <GameContext.Provider
      value={{
        store,
        dailyBonus: dailyBonusRef.current,
        dismissDailyBonus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");

  const state = useSyncExternalStore(
    ctx.store.subscribe,
    ctx.store.get,
    () => INITIAL_STATE
  );

  const pyusdYieldPerDay =
    state.depositBalance *
    YIELD_PER_USD_PER_DAY *
    HEART_MULTIPLIERS[state.hearts];
  const usdcYieldPerDay =
    (state.usdcDepositBalance ?? 0) *
    USDC_YIELD_PER_USD_PER_DAY *
    HEART_MULTIPLIERS[state.hearts];
  const yieldPerDay = pyusdYieldPerDay + usdcYieldPerDay;
  const totalDepositBalance = state.depositBalance + (state.usdcDepositBalance ?? 0);

  const feedCooldownRemaining = Math.max(0, state.feedCooldownEnd - Date.now());
  const canFeed = feedCooldownRemaining === 0;

  return {
    ...state,
    yieldPerDay,
    totalDepositBalance,
    pyusdYieldPerDay,
    usdcYieldPerDay,
    feedCooldownRemaining,
    canFeed,
    feed: ctx.store.feed,
    buyFood: ctx.store.buyFood,
    buyFurniture: ctx.store.buyFurniture,
    placeFurniture: ctx.store.placeFurniture,
    removeFurniture: ctx.store.removeFurniture,
    deposit: ctx.store.deposit,
    withdraw: ctx.store.withdraw,
    depositUsdc: ctx.store.depositUsdc,
    withdrawUsdc: ctx.store.withdrawUsdc,
    setPetName: ctx.store.setPetName,
    setTrainerName: ctx.store.setTrainerName,
    resetState: ctx.store.resetState,
    toggleSfx: ctx.store.toggleSfx,
    toggleBalanceVisible: ctx.store.toggleBalanceVisible,
    setOnChainMode: ctx.store.setOnChainMode,
    loadFromChain: ctx.store.loadFromChain,
    dailyBonus: ctx.dailyBonus,
    dismissDailyBonus: ctx.dismissDailyBonus,
  };
}
