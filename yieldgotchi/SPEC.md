# YieldGotchi — Product Spec

## Overview
YieldGotchi is a gamified DeFi interface where users deposit USDC into a yield vault to grow a "Vault Guardian" NFT. Principal earns yield; yield unlocks cosmetic Armor upgrades. Withdrawing principal harms the Guardian.

---

## Core Screens

| Screen | Purpose |
|--------|---------|
| `/` (Dashboard) | Home view: Guardian status, vault summary, quick actions |
| `/mint` | First-time user mints their Guardian |
| `/vault` | Deposit/withdraw USDC, view yield details |
| `/armory` | Browse and equip Armor earned from yield |
| `/profile` | Activity history, settings, wallet info |

---

## Key User Actions

1. **Connect Wallet** — Mock wallet connection, stores address in localStorage
2. **Mint Guardian** — Creates new Guardian NFT (one per wallet)
3. **Deposit USDC** — Increases principal, triggers growth, rewards animation
4. **Withdraw USDC** — Reduces principal, shows penalty preview, scary confirmation
5. **Claim Yield → Buy Armor** — Converts accrued yield into Armor NFTs
6. **Equip Armor** — Attach armor pieces to Guardian (visual customization)

---

## State Model

### Where Data Lives
- **localStorage** — All state persisted client-side under `yieldgotchi_state`
- **React Context** — Global app state synced with localStorage

### Data Entities

```typescript
type Guardian = {
  id: string;
  owner: string;
  name: string;
  stage: 'egg' | 'baby' | 'teen' | 'adult' | 'legendary' | 'dead';
  mood: number; // 0-100
  createdAt: number; // timestamp
  lastFedAt: number; // last deposit timestamp
};

type Vault = {
  principal: number;
  apy: number; // e.g., 0.08 = 8%
  depositedAt: number;
  lastUpdatedAt: number;
  accruedYield: number;
  totalYieldClaimed: number;
};

type ArmorItem = {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  slot: 'head' | 'body' | 'weapon' | 'pet';
  equipped: boolean;
  unlockedAt: number;
};

type ActivityEvent = {
  id: string;
  type: 'deposit' | 'withdraw' | 'mint' | 'armor_unlock' | 'level_up' | 'level_down';
  amount?: number;
  timestamp: number;
  description: string;
};
```

---

## Game Logic

### Growth Score Formula
```
growthScore = log10(1 + principal) * timeLockedDays
```

### Stage Thresholds
| Stage | Growth Score |
|-------|-------------|
| Egg | 0 - 5 |
| Baby | 5 - 20 |
| Teen | 20 - 50 |
| Adult | 50 - 100 |
| Legendary | 100+ |

### Yield Calculation
```
accruedYield = principal * apy * (timeElapsedDays / 365)
```

### Mood Rules
- +5/day while principal > $100
- -20 on any withdrawal
- Capped 0-100

### Armor Unlock Milestones
- Every $5 yield accrued unlocks random Armor piece

---

## Failure States

| State | Trigger | Display |
|-------|---------|---------|
| Dead Guardian | principal = 0 after having deposited | Grayscale Guardian, "Revive" CTA |
| No Guardian | First visit, never minted | Redirect to /mint |
| Empty Vault | Guardian exists but principal = 0 | Empty state card, deposit CTA |
| No Armor | Zero armor pieces | Empty armory with "Earn yield to unlock" |

---

## Empty States

- **Dashboard (no guardian)**: "Your vault is empty. Mint a Guardian to begin."
- **Armory (no items)**: "No armor yet. Deposit USDC and earn yield to unlock gear."
- **Activity (no events)**: "No activity yet. Make your first deposit!"

---

# UI Sitemap & User Flows

## First-Time User Flow
```
Connect Wallet → Dashboard (empty) → /mint → Name Guardian → Mint Success → Dashboard → /vault → Deposit → Celebration → Dashboard (Guardian visible)
```

## Returning User Flow
```
Connect Wallet → Dashboard (Guardian + stats) → Any page
```

## Deposit Flow
```
/vault → Enter amount → Confirm Deposit → Animation + Confetti → Toast "Level Up!" (if applicable) → Updated stats
```

## Withdraw Flow
```
/vault → Enter amount → Warning Modal ("Your Guardian may de-level or die") → Preview shows projected stage → Confirm (scary button) → Sad animation → Updated stats
```

## Armor Upgrade Flow
```
Dashboard shows "Armor available!" → /armory → Claim → New armor revealed → Equip → Guardian visual updates
```

---

# Component Plan

## Component Tree

```
app/
├── layout.tsx (Server) — Root layout, providers
├── page.tsx (Client) — Dashboard
├── mint/page.tsx (Client) — Mint flow
├── vault/page.tsx (Client) — Deposit/Withdraw
├── armory/page.tsx (Client) — Armor management
├── profile/page.tsx (Client) — History & settings

components/
├── providers/
│   └── AppProvider.tsx (Client) — Context + localStorage sync
├── layout/
│   ├── TopNav.tsx (Client) — Nav + wallet status
│   └── PageContainer.tsx (Server) — Wrapper with padding
├── guardian/
│   ├── GuardianCard.tsx (Client) — Main guardian display
│   ├── GuardianSVG.tsx (Client) — SVG art by stage
│   ├── MoodMeter.tsx (Client) — Mood bar
│   └── StageIndicator.tsx (Client) — Stage badge
├── vault/
│   ├── VaultCard.tsx (Client) — Vault stats
│   ├── DepositForm.tsx (Client) — Deposit input + button
│   ├── WithdrawForm.tsx (Client) — Withdraw with warnings
│   └── YieldProgress.tsx (Client) — Next armor unlock progress
├── armory/
│   ├── ArmorGrid.tsx (Client) — Grid of armor items
│   ├── ArmorItem.tsx (Client) — Single armor piece
│   └── EquipSlots.tsx (Client) — Equipped slots display
├── activity/
│   └── ActivityTimeline.tsx (Client) — Event log
├── modals/
│   ├── DepositConfirmModal.tsx (Client)
│   ├── WithdrawWarningModal.tsx (Client)
│   └── ArmorUnlockModal.tsx (Client)
└── ui/
    ├── Button.tsx (Client)
    ├── Card.tsx (Client)
    ├── Input.tsx (Client)
    ├── Toast.tsx (Client)
    └── Confetti.tsx (Client)

lib/
├── mockChain.ts — All blockchain mock functions (REPLACE LATER)
├── gameLogic.ts — Growth score, stage calc, yield calc
├── types.ts — TypeScript interfaces
├── constants.ts — Thresholds, APY, armor data
└── utils.ts — Formatters, helpers

hooks/
├── useAppState.ts — Access global state
├── useYieldAccrual.ts — Real-time yield ticker
└── useConfetti.ts — Trigger confetti
```

## Props Summary

| Component | Key Props |
|-----------|-----------|
| GuardianCard | guardian, vault, showActions |
| GuardianSVG | stage, mood, equippedArmor |
| VaultCard | vault, onDeposit, onWithdraw |
| DepositForm | onSubmit, maxAmount |
| WithdrawForm | onSubmit, currentPrincipal, projectedStage |
| ArmorItem | item, onEquip, isEquipped |
| ActivityTimeline | events, limit |
| Toast | message, type, onClose |

---

# Folder Structure

```
yieldgotchi/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── mint/
│   │   └── page.tsx
│   ├── vault/
│   │   └── page.tsx
│   ├── armory/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
├── components/
│   ├── providers/
│   ├── layout/
│   ├── guardian/
│   ├── vault/
│   ├── armory/
│   ├── activity/
│   ├── modals/
│   └── ui/
├── lib/
├── hooks/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```
