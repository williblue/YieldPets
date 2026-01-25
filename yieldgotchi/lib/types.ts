// Core data types for YieldGotchi

export type GuardianStage = 'egg' | 'baby' | 'teen' | 'adult' | 'legendary' | 'dead';

export type ArmorSlot = 'head' | 'body' | 'weapon' | 'pet';

export type ArmorRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ActivityType = 'deposit' | 'withdraw' | 'mint' | 'armor_unlock' | 'level_up' | 'level_down';

export interface Guardian {
  id: string;
  owner: string;
  name: string;
  stage: GuardianStage;
  mood: number; // 0-100
  createdAt: number;
  lastFedAt: number;
}

export interface Vault {
  principal: number;
  apy: number;
  depositedAt: number;
  lastUpdatedAt: number;
  accruedYield: number;
  totalYieldClaimed: number;
}

export interface ArmorItem {
  id: string;
  name: string;
  rarity: ArmorRarity;
  slot: ArmorSlot;
  equipped: boolean;
  unlockedAt: number;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  amount?: number;
  timestamp: number;
  description: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
}

export interface AppState {
  wallet: WalletState;
  guardian: Guardian | null;
  vault: Vault | null;
  armor: ArmorItem[];
  activity: ActivityEvent[];
}

export interface StageThreshold {
  stage: GuardianStage;
  minScore: number;
  maxScore: number;
}
