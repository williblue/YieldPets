import { GuardianStage, Vault } from './types';
import { STAGE_THRESHOLDS, MIN_PRINCIPAL_FOR_MOOD, MOOD_DAILY_INCREASE, ARMOR_UNLOCK_THRESHOLD } from './constants';

/**
 * Calculate days elapsed between two timestamps
 */
export function daysBetween(start: number, end: number): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, (end - start) / msPerDay);
}

/**
 * Calculate accrued yield based on principal, APY, and time
 * Formula: principal * apy * (timeElapsedDays / 365)
 */
export function calculateAccruedYield(
  principal: number,
  apy: number,
  depositedAt: number,
  currentTime: number = Date.now()
): number {
  if (principal <= 0) return 0;
  const daysElapsed = daysBetween(depositedAt, currentTime);
  return principal * apy * (daysElapsed / 365);
}

/**
 * Calculate growth score
 * Formula: log10(1 + principal) * timeLockedDays
 */
export function calculateGrowthScore(
  principal: number,
  depositedAt: number,
  currentTime: number = Date.now()
): number {
  if (principal <= 0) return 0;
  const daysLocked = daysBetween(depositedAt, currentTime);
  return Math.log10(1 + principal) * daysLocked;
}

/**
 * Determine guardian stage from growth score
 */
export function getStageFromScore(score: number): GuardianStage {
  for (const threshold of STAGE_THRESHOLDS) {
    if (score >= threshold.minScore && score < threshold.maxScore) {
      return threshold.stage;
    }
  }
  return 'egg';
}

/**
 * Calculate stage after a withdrawal
 */
export function getStageAfterWithdrawal(
  currentPrincipal: number,
  withdrawAmount: number,
  depositedAt: number,
  currentTime: number = Date.now()
): GuardianStage {
  const newPrincipal = currentPrincipal - withdrawAmount;
  
  if (newPrincipal <= 0) {
    return 'dead';
  }
  
  const newScore = calculateGrowthScore(newPrincipal, depositedAt, currentTime);
  return getStageFromScore(newScore);
}

/**
 * Calculate mood based on principal and time
 */
export function calculateMood(
  currentMood: number,
  principal: number,
  lastUpdatedAt: number,
  currentTime: number = Date.now()
): number {
  const daysElapsed = daysBetween(lastUpdatedAt, currentTime);
  
  let newMood = currentMood;
  
  if (principal >= MIN_PRINCIPAL_FOR_MOOD) {
    newMood += MOOD_DAILY_INCREASE * Math.floor(daysElapsed);
  }
  
  return Math.min(100, Math.max(0, newMood));
}

/**
 * Calculate number of armor unlocks available
 */
export function calculateArmorUnlocks(totalYieldClaimed: number, currentArmorCount: number): number {
  const totalUnlocks = Math.floor(totalYieldClaimed / ARMOR_UNLOCK_THRESHOLD);
  return Math.max(0, totalUnlocks - currentArmorCount);
}

/**
 * Calculate progress to next armor unlock (0-100)
 */
export function getArmorUnlockProgress(totalYieldClaimed: number): number {
  const remainder = totalYieldClaimed % ARMOR_UNLOCK_THRESHOLD;
  return (remainder / ARMOR_UNLOCK_THRESHOLD) * 100;
}

/**
 * Get yield needed for next armor unlock
 */
export function getYieldToNextArmor(totalYieldClaimed: number): number {
  const remainder = totalYieldClaimed % ARMOR_UNLOCK_THRESHOLD;
  return ARMOR_UNLOCK_THRESHOLD - remainder;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format time duration
 */
export function formatDuration(days: number): string {
  if (days < 1) {
    const hours = Math.floor(days * 24);
    if (hours < 1) {
      const minutes = Math.floor(days * 24 * 60);
      return `${minutes}m`;
    }
    return `${hours}h`;
  }
  if (days < 30) {
    return `${Math.floor(days)}d`;
  }
  if (days < 365) {
    return `${Math.floor(days / 30)}mo`;
  }
  return `${(days / 365).toFixed(1)}y`;
}

/**
 * Get real-time vault state with calculated yield
 */
export function getRealTimeVaultState(vault: Vault): Vault & { realTimeYield: number } {
  const realTimeYield = vault.accruedYield + calculateAccruedYield(
    vault.principal,
    vault.apy,
    vault.lastUpdatedAt,
    Date.now()
  );
  
  return {
    ...vault,
    realTimeYield,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
