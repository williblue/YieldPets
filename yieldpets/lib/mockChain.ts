/**
 * ============================================
 * MOCK BLOCKCHAIN FUNCTIONS - REPLACE LATER
 * ============================================
 * 
 * This file contains mock implementations of all blockchain interactions.
 * Replace these with real Flow/Cadence code when integrating with the blockchain.
 * 
 * All functions simulate network delay and return mock data.
 * State is persisted in localStorage.
 */

import { Guardian, Vault, ArmorItem, ActivityEvent, AppState, WalletState } from './types';
import { 
  STORAGE_KEY, 
  DEFAULT_APY, 
  ARMOR_CATALOG, 
  MOOD_WITHDRAWAL_PENALTY,
  ARMOR_UNLOCK_THRESHOLD 
} from './constants';
import { 
  generateId, 
  calculateGrowthScore, 
  getStageFromScore, 
  calculateAccruedYield,
  calculateArmorUnlocks
} from './gameLogic';

// Simulated network delay (ms)
const MOCK_DELAY = 500;

/**
 * Helper to simulate network delay
 */
async function simulateDelay(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

/**
 * Helper to get state from localStorage
 */
function getStoredState(): AppState {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultState();
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultState();
  }
}

/**
 * Helper to save state to localStorage
 */
function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Get default empty state
 */
function getDefaultState(): AppState {
  return {
    wallet: { connected: false, address: null },
    guardian: null,
    vault: null,
    armor: [],
    activity: [],
  };
}

/**
 * Add activity event
 */
function addActivity(
  state: AppState,
  type: ActivityEvent['type'],
  description: string,
  amount?: number
): AppState {
  const event: ActivityEvent = {
    id: generateId(),
    type,
    amount,
    timestamp: Date.now(),
    description,
  };
  
  return {
    ...state,
    activity: [event, ...state.activity].slice(0, 50), // Keep last 50 events
  };
}

// ============================================
// MOCK BLOCKCHAIN FUNCTIONS - REPLACE LATER
// ============================================

/**
 * REPLACE LATER: Connect to Flow wallet
 * Currently returns a mock wallet address
 */
export async function connectWallet(): Promise<WalletState> {
  await simulateDelay();
  
  // Mock: Generate a fake wallet address
  const address = `0x${Math.random().toString(16).substr(2, 16)}`;
  
  const state = getStoredState();
  state.wallet = { connected: true, address };
  saveState(state);
  
  return state.wallet;
}

/**
 * REPLACE LATER: Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  await simulateDelay();
  
  const state = getStoredState();
  state.wallet = { connected: false, address: null };
  saveState(state);
}

/**
 * REPLACE LATER: Get guardian state from chain
 */
export async function getGuardianState(address: string): Promise<Guardian | null> {
  await simulateDelay();
  
  const state = getStoredState();
  
  if (state.guardian && state.guardian.owner === address) {
    // Update stage based on current growth score
    if (state.vault && state.guardian.stage !== 'dead') {
      const score = calculateGrowthScore(state.vault.principal, state.vault.depositedAt);
      state.guardian.stage = state.vault.principal <= 0 ? 'dead' : getStageFromScore(score);
      saveState(state);
    }
    return state.guardian;
  }
  
  return null;
}

/**
 * REPLACE LATER: Mint new guardian NFT
 */
export async function mintGuardian(address: string, name: string): Promise<Guardian> {
  await simulateDelay();
  
  const state = getStoredState();
  
  const guardian: Guardian = {
    id: generateId(),
    owner: address,
    name,
    stage: 'egg',
    mood: 50,
    createdAt: Date.now(),
    lastFedAt: Date.now(),
  };
  
  state.guardian = guardian;
  
  // Initialize empty vault
  state.vault = {
    principal: 0,
    apy: DEFAULT_APY,
    depositedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    accruedYield: 0,
    totalYieldClaimed: 0,
  };
  
  const updatedState = addActivity(state, 'mint', `Guardian "${name}" was born!`);
  saveState(updatedState);
  
  return guardian;
}

/**
 * REPLACE LATER: Deposit USDC into vault
 */
export async function depositUSDC(
  address: string, 
  amount: number
): Promise<{ vault: Vault; guardian: Guardian; leveledUp: boolean }> {
  await simulateDelay();
  
  const state = getStoredState();
  
  if (!state.vault || !state.guardian) {
    throw new Error('No vault or guardian found');
  }
  
  // Calculate and add any pending yield before deposit
  const pendingYield = calculateAccruedYield(
    state.vault.principal,
    state.vault.apy,
    state.vault.lastUpdatedAt
  );
  
  const previousStage = state.guardian.stage;
  
  // Update vault
  state.vault.accruedYield += pendingYield;
  state.vault.principal += amount;
  state.vault.lastUpdatedAt = Date.now();
  
  if (state.vault.depositedAt === 0 || state.vault.principal === amount) {
    state.vault.depositedAt = Date.now();
  }
  
  // Update guardian
  const newScore = calculateGrowthScore(state.vault.principal, state.vault.depositedAt);
  const newStage = getStageFromScore(newScore);
  const leveledUp = newStage !== previousStage && state.guardian.stage !== 'dead';
  
  if (state.guardian.stage === 'dead' && amount > 0) {
    // Revive!
    state.guardian.stage = 'egg';
    state.guardian.mood = 30;
  } else {
    state.guardian.stage = newStage;
    state.guardian.mood = Math.min(100, state.guardian.mood + 10);
  }
  
  state.guardian.lastFedAt = Date.now();
  
  let updatedState = addActivity(
    state, 
    'deposit', 
    `Deposited $${amount.toFixed(2)} into vault`,
    amount
  );
  
  if (leveledUp) {
    updatedState = addActivity(
      updatedState, 
      'level_up', 
      `Guardian evolved to ${newStage}!`
    );
  }
  
  saveState(updatedState);
  
  return {
    vault: updatedState.vault!,
    guardian: updatedState.guardian!,
    leveledUp,
  };
}

/**
 * REPLACE LATER: Withdraw USDC from vault
 */
export async function withdrawUSDC(
  address: string, 
  amount: number
): Promise<{ vault: Vault; guardian: Guardian; leveledDown: boolean; died: boolean }> {
  await simulateDelay();
  
  const state = getStoredState();
  
  if (!state.vault || !state.guardian) {
    throw new Error('No vault or guardian found');
  }
  
  if (amount > state.vault.principal) {
    throw new Error('Insufficient principal');
  }
  
  // Calculate and add any pending yield before withdrawal
  const pendingYield = calculateAccruedYield(
    state.vault.principal,
    state.vault.apy,
    state.vault.lastUpdatedAt
  );
  
  const previousStage = state.guardian.stage;
  
  // Update vault
  state.vault.accruedYield += pendingYield;
  state.vault.principal -= amount;
  state.vault.lastUpdatedAt = Date.now();
  
  // Update guardian
  let died = false;
  let leveledDown = false;
  
  if (state.vault.principal <= 0) {
    state.guardian.stage = 'dead';
    state.guardian.mood = 0;
    died = true;
  } else {
    const newScore = calculateGrowthScore(state.vault.principal, state.vault.depositedAt);
    const newStage = getStageFromScore(newScore);
    leveledDown = newStage !== previousStage;
    state.guardian.stage = newStage;
    state.guardian.mood = Math.max(0, state.guardian.mood - MOOD_WITHDRAWAL_PENALTY);
  }
  
  let updatedState = addActivity(
    state,
    'withdraw',
    `Withdrew $${amount.toFixed(2)} from vault`,
    amount
  );
  
  if (leveledDown && !died) {
    updatedState = addActivity(
      updatedState,
      'level_down',
      `Guardian regressed to ${state.guardian.stage}`
    );
  }
  
  saveState(updatedState);
  
  return {
    vault: updatedState.vault!,
    guardian: updatedState.guardian!,
    leveledDown,
    died,
  };
}

/**
 * REPLACE LATER: Get vault state from chain
 */
export async function getVaultState(address: string): Promise<Vault | null> {
  await simulateDelay();
  
  const state = getStoredState();
  return state.vault;
}

/**
 * REPLACE LATER: Claim yield and buy armor
 */
export async function claimYieldAndBuyArmor(
  address: string
): Promise<{ armor: ArmorItem | null; totalYieldClaimed: number }> {
  await simulateDelay();
  
  const state = getStoredState();
  
  if (!state.vault) {
    throw new Error('No vault found');
  }
  
  // Calculate current yield
  const pendingYield = calculateAccruedYield(
    state.vault.principal,
    state.vault.apy,
    state.vault.lastUpdatedAt
  );
  
  const totalAvailableYield = state.vault.accruedYield + pendingYield;
  
  // Check if we can unlock armor
  const armorUnlocks = calculateArmorUnlocks(
    state.vault.totalYieldClaimed + totalAvailableYield,
    state.armor.length
  );
  
  if (armorUnlocks <= 0) {
    return { armor: null, totalYieldClaimed: state.vault.totalYieldClaimed };
  }
  
  // Pick a random armor from catalog
  const availableArmor = ARMOR_CATALOG.filter(
    item => !state.armor.some(a => a.name === item.name)
  );
  
  if (availableArmor.length === 0) {
    return { armor: null, totalYieldClaimed: state.vault.totalYieldClaimed };
  }
  
  // Weight by rarity (common more likely)
  const rarityWeights = { common: 50, rare: 30, epic: 15, legendary: 5 };
  const weighted = availableArmor.flatMap(item => 
    Array(rarityWeights[item.rarity]).fill(item)
  );
  const selectedTemplate = weighted[Math.floor(Math.random() * weighted.length)];
  
  const newArmor: ArmorItem = {
    id: generateId(),
    name: selectedTemplate.name,
    rarity: selectedTemplate.rarity,
    slot: selectedTemplate.slot,
    equipped: false,
    unlockedAt: Date.now(),
  };
  
  // Update state
  state.armor.push(newArmor);
  state.vault.accruedYield = 0;
  state.vault.totalYieldClaimed += totalAvailableYield;
  state.vault.lastUpdatedAt = Date.now();
  
  const updatedState = addActivity(
    state,
    'armor_unlock',
    `Unlocked ${newArmor.rarity} ${newArmor.name}!`
  );
  
  saveState(updatedState);
  
  return { 
    armor: newArmor, 
    totalYieldClaimed: updatedState.vault!.totalYieldClaimed 
  };
}

/**
 * REPLACE LATER: Get armor inventory from chain
 */
export async function getArmorInventory(address: string): Promise<ArmorItem[]> {
  await simulateDelay();
  
  const state = getStoredState();
  return state.armor;
}

/**
 * REPLACE LATER: Equip/unequip armor
 */
export async function toggleArmorEquip(
  address: string, 
  armorId: string
): Promise<ArmorItem[]> {
  await simulateDelay();
  
  const state = getStoredState();
  
  const armorIndex = state.armor.findIndex(a => a.id === armorId);
  if (armorIndex === -1) {
    throw new Error('Armor not found');
  }
  
  const armor = state.armor[armorIndex];
  const newEquipped = !armor.equipped;
  
  // If equipping, unequip other items in same slot
  if (newEquipped) {
    state.armor = state.armor.map(a => 
      a.slot === armor.slot ? { ...a, equipped: false } : a
    );
  }
  
  state.armor[armorIndex] = { ...armor, equipped: newEquipped };
  
  saveState(state);
  
  return state.armor;
}

/**
 * Get full app state (for hydration)
 */
export async function getFullState(): Promise<AppState> {
  await simulateDelay();
  return getStoredState();
}

/**
 * Reset all state (for testing)
 */
export async function resetState(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
