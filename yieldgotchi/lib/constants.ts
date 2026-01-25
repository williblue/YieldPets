import { ArmorRarity, ArmorSlot, GuardianStage, StageThreshold } from './types';

// Stage thresholds based on growth score
export const STAGE_THRESHOLDS: StageThreshold[] = [
  { stage: 'egg', minScore: 0, maxScore: 5 },
  { stage: 'baby', minScore: 5, maxScore: 20 },
  { stage: 'teen', minScore: 20, maxScore: 50 },
  { stage: 'adult', minScore: 50, maxScore: 100 },
  { stage: 'legendary', minScore: 100, maxScore: Infinity },
];

// Default APY (8%)
export const DEFAULT_APY = 0.08;

// Armor unlock every $5 yield
export const ARMOR_UNLOCK_THRESHOLD = 5;

// Minimum principal to maintain mood
export const MIN_PRINCIPAL_FOR_MOOD = 100;

// Mood changes
export const MOOD_DAILY_INCREASE = 5;
export const MOOD_WITHDRAWAL_PENALTY = 20;

// Armor catalog - items that can be unlocked
export const ARMOR_CATALOG: {
  name: string;
  rarity: ArmorRarity;
  slot: ArmorSlot;
}[] = [
  // Common items
  { name: 'Rusty Helmet', rarity: 'common', slot: 'head' },
  { name: 'Leather Cap', rarity: 'common', slot: 'head' },
  { name: 'Wool Tunic', rarity: 'common', slot: 'body' },
  { name: 'Cloth Robe', rarity: 'common', slot: 'body' },
  { name: 'Wooden Sword', rarity: 'common', slot: 'weapon' },
  { name: 'Training Staff', rarity: 'common', slot: 'weapon' },
  { name: 'Baby Slime', rarity: 'common', slot: 'pet' },
  { name: 'Tiny Moth', rarity: 'common', slot: 'pet' },
  
  // Rare items
  { name: 'Iron Crown', rarity: 'rare', slot: 'head' },
  { name: 'Mystic Hood', rarity: 'rare', slot: 'head' },
  { name: 'Chain Mail', rarity: 'rare', slot: 'body' },
  { name: 'Enchanted Vest', rarity: 'rare', slot: 'body' },
  { name: 'Steel Blade', rarity: 'rare', slot: 'weapon' },
  { name: 'Crystal Wand', rarity: 'rare', slot: 'weapon' },
  { name: 'Fire Fox', rarity: 'rare', slot: 'pet' },
  { name: 'Ice Sprite', rarity: 'rare', slot: 'pet' },
  
  // Epic items
  { name: 'Dragon Helm', rarity: 'epic', slot: 'head' },
  { name: 'Phoenix Crown', rarity: 'epic', slot: 'head' },
  { name: 'Void Armor', rarity: 'epic', slot: 'body' },
  { name: 'Celestial Robe', rarity: 'epic', slot: 'body' },
  { name: 'Thunder Axe', rarity: 'epic', slot: 'weapon' },
  { name: 'Shadow Dagger', rarity: 'epic', slot: 'weapon' },
  { name: 'Storm Drake', rarity: 'epic', slot: 'pet' },
  { name: 'Moon Owl', rarity: 'epic', slot: 'pet' },
  
  // Legendary items
  { name: 'Crown of Ages', rarity: 'legendary', slot: 'head' },
  { name: 'Astral Plate', rarity: 'legendary', slot: 'body' },
  { name: 'Blade of Infinity', rarity: 'legendary', slot: 'weapon' },
  { name: 'Cosmic Dragon', rarity: 'legendary', slot: 'pet' },
];

// Rarity colors
export const RARITY_COLORS: Record<ArmorRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

// Stage display names
export const STAGE_NAMES: Record<GuardianStage, string> = {
  egg: 'Egg',
  baby: 'Baby',
  teen: 'Teen',
  adult: 'Adult',
  legendary: 'Legendary',
  dead: 'Deceased',
};

// Stage colors
export const STAGE_COLORS: Record<GuardianStage, string> = {
  egg: '#9ca3af',
  baby: '#34d399',
  teen: '#60a5fa',
  adult: '#a78bfa',
  legendary: '#fbbf24',
  dead: '#4b5563',
};

// Local storage key
export const STORAGE_KEY = 'yieldgotchi_state';
