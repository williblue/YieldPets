# 🐣 YieldGotchi

A Tamagotchi-style NFT "Yield Guardian" that grows when you deposit USDC into a yield vault. Built for hackathons.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

## 🎮 Concept

Your **YieldGotchi** is an NFT that evolves based on your DeFi activity:
- **Deposit USDC** → Gotchi grows and levels up
- **Keep funds locked** → Gotchi mood improves
- **Earn yield** → Unlock armor/accessories for your Gotchi
- **Withdraw** → Gotchi may de-level or die ☠️

## 🌟 Features

- **6 Evolution Stages**: Egg → Baby → Teen → Adult → Legendary (+ Dead state)
- **Mood System**: Gotchi expressions change based on mood (0-100)
- **Real-time Yield Ticker**: Watch your yield accrue in real-time
- **Armor System**: 4 slots (head, body, weapon, pet) with 4 rarity tiers
- **Scary Withdrawals**: Warnings show projected stage after withdrawal
- **Activity Timeline**: Track all your vault interactions
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
yieldgotchi/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (home)
│   ├── mint/page.tsx      # Mint gotchi flow
│   ├── vault/page.tsx     # Deposit/withdraw
│   ├── armory/page.tsx    # Armor management
│   └── profile/page.tsx   # Settings & history
├── components/
│   ├── guardian/          # Gotchi display components
│   ├── vault/             # Vault interaction forms
│   ├── armory/            # Armor grid & slots
│   ├── activity/          # Activity timeline
│   ├── layout/            # Navigation
│   ├── providers/         # App context & state
│   └── ui/                # Reusable UI components
└── lib/
    ├── types.ts           # TypeScript interfaces
    ├── constants.ts       # Game constants & thresholds
    ├── gameLogic.ts       # Calculations & formulas
    └── mockChain.ts       # 🔴 REPLACE WITH REAL CHAIN
```

## 🎯 Game Mechanics

### Growth Formula
```
growthScore = log10(1 + principal) * timeLockedDays
```

### Stage Thresholds
| Stage | Growth Score |
|-------|-------------|
| Egg | 0-5 |
| Baby | 5-20 |
| Teen | 20-50 |
| Adult | 50-100 |
| Legendary | 100+ |
| Dead | principal = 0 |

### Yield Calculation
```
accruedYield = principal * APY * (timeElapsedDays / 365)
```
Default APY: 8%

### Mood System
- +5/day when principal > $100
- -20 on any withdrawal
- Capped at 0-100

### Armor Unlocks
- Every $5 yield accrued unlocks a random armor piece
- Rarities: Common (50%), Rare (30%), Epic (15%), Legendary (5%)

## 🔧 Blockchain Integration

All blockchain functions are in `lib/mockChain.ts` marked with `// REPLACE LATER`.

Functions to implement:
- `connectWallet()` - Wallet connection
- `mintGuardian()` - NFT minting
- `depositUSDC()` - Vault deposits
- `withdrawUSDC()` - Vault withdrawals
- `claimYieldAndBuyArmor()` - Yield claim + armor mint
- `getFullState()` - Fetch on-chain state

Currently uses localStorage for persistence.

## 🎨 Design System

- **Theme**: Dark cyberpunk vault aesthetic
- **Primary Color**: Cyan (#06b6d4)
- **Fonts**: Outfit (display), Space Grotesk (body)
- **Animations**: Float, pulse, shake, confetti

## 📝 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: CSS + canvas-confetti
- **State**: React Context + localStorage

## 🏗️ TODO for Production

- [ ] Replace mock functions with Flow/Cadence smart contracts
- [ ] Add wallet adapter (FCL for Flow)
- [ ] Implement real yield vault integration
- [ ] Add NFT metadata storage (IPFS)
- [ ] Armor as actual NFT attachments
- [ ] Leaderboard system
- [ ] Social sharing

## 📄 License

MIT

---

Built with 💜 for hackathons
