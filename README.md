# YieldPets

A Tamagotchi-style DeFi pet game built on **[Flow](https://flow.com)**, where depositing stablecoins into a yield vault grows and evolves your pet.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Flow](https://img.shields.io/badge/Flow-Mainnet-00ef8b?style=flat-square&logo=flow)

## How It Works

Deposit stablecoins (PYUSD or USDC) into yield vaults powered by MoreMarkets (Aave V3 fork on Flow EVM). Your yield drives pet growth, unlocks items, and earns gold nuggets.


## Features

- **Passwordless onboarding** — Email login via Magic SDK, automatic Flow wallet creation, zero crypto setup
- **Credit card deposits** — Stripe checkout, five seconds, your mom could do this
- **Crypto deposits** — Send stgUSDC to your COA address, auto-deposited into MoreMarkets
- **Real yield** — Stablecoin lending via MoreMarkets (Aave V3 on Flow EVM)
- **Heart system** — Feed your pet to boost growth rate (hearts decay over 8 hours of inactivity)
- **Gold nuggets** — In-game currency earned by caring for your pet, spent on furniture and food
- **Isometric room** — Animated pet sprite, placeable furniture, the room fills up as you save
- **Furniture shop** — Common items plus exclusives that unlock at higher deposit tiers
- **Compound projections** — See what $100 becomes over 5, 10, 20, 30 years
- **Opportunity cost withdrawal** — Sad pet + missed yield calculations discourage withdrawing
- **"Just take the yield" button** — Withdraw only your earned interest, keep the principal
- **Daily login streaks** — Escalating nugget bonuses for consecutive days
- **Pet personality** — Dynamic traits based on deposit balance, streak, and care
- **Balance privacy** — Toggle to hide your balance on screen

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, custom CSS (no UI libraries) |
| **Blockchain** | [Flow](https://flow.com) mainnet — Cadence smart contracts + Flow EVM |
| **DeFi** | [MoreMarkets](https://moremarkets.com) (Aave V3 on Flow EVM) for stablecoin yield |
| **Auth** | [Magic SDK](https://magic.link) with Flow plugin — email OTP, invisible wallet |
| **Payments** | [Stripe](https://stripe.com) for credit card deposits |
| **State** | External store pattern with localStorage persistence |

## How the Yield Works

Deposits flow into MoreMarkets lending pools on Flow EVM via Cadence smart contracts that use Flow's native EVM bridge.

- **stgUSDC vault** — Cadence contract bridges USDC deposits into MoreMarkets, receives aStgUSDC (interest-bearing tokens)
- **Heart multiplier** — 4 hearts = full yield rate, 0 hearts = zero yield. Feed your pet to keep earning
- **Auto-deposit** — Crypto deposits are detected every 10 seconds and automatically routed into the lending pool

## Mainnet Contracts

Deployed to Flow mainnet at **[0x73fa40543604c4aa](https://www.flowdiver.io/account/0x73fa40543604c4aa)**:

| Contract | Purpose |
|---|---|
| `YieldPetsUSDCVault` | Bridges stgUSDC deposits into MoreMarkets lending pool on Flow EVM |
| `YieldPetsProfile` | On-chain pet state, inventory, deposit history, and game stats |

Written in [Cadence](https://cadence-lang.org/), Flow's resource-oriented smart contract language.

## Quick Start

```bash
cd src && npm install
npm run dev
# Open http://localhost:3000
```

## License

MIT
