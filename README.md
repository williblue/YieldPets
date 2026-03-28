# YieldPets

A Tamagotchi-style DeFi pet game built on **[Flow](https://flow.com)**, where depositing stablecoins into a yield vault grows and evolves your pet.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Flow](https://img.shields.io/badge/Flow-Mainnet-00ef8b?style=flat-square&logo=flow)

## How It Works

Deposit stablecoins (PYUSD or USDC) into yield vaults powered by MoreMarkets (Aave V3 fork on Flow EVM). Your yield drives pet growth, unlocks items, and earns gold nuggets.

- **Deposit stablecoins** → Pet grows and levels up
- **Earn yield** → Collect gold nuggets, unlock furniture and food
- **Keep funds locked** → Pet mood improves, streak bonuses increase
- **Withdraw** → Pet may de-level or die

## Features

- **Pet Evolution** — Egg → Baby → Teen → Adult → Legendary (+ Dead state)
- **Isometric Room** — Animated pet sprite with walkable floor and placeable furniture
- **Dual Yield Vaults** — PYUSD and stgUSDC vaults via MoreMarkets on Flow EVM
- **Shop** — Buy food and furniture with gold nuggets
- **Pet Stats & Personality** — Dynamic personality traits based on deposit balance, streak, and care
- **Daily Bonuses** — Login streaks with escalating rewards
- **Passwordless Auth** — Email login via Magic SDK with automatic Flow wallet creation

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, custom CSS
- **Blockchain:** [Flow](https://flow.com) mainnet — Cadence smart contracts + Flow EVM
- **DeFi:** MoreMarkets (Aave V3 on Flow EVM) for stablecoin yield
- **Auth:** Magic SDK with Flow plugin
- **Payments:** Stripe for fiat on-ramp

## Mainnet Deployment

All contracts are deployed to Flow mainnet at **[0x73fa40543604c4aa](https://www.flowdiver.io/account/0x73fa40543604c4aa)**:

| Contract | Description |
|---|---|
| `YieldPetsUSDCVault` | Cadence vault that bridges deposits into MoreMarkets stgUSDC on Flow EVM |
| `YieldPetsProfile` | On-chain player profile and pet state |

## Smart Contracts

Written in [Cadence](https://cadence-lang.org/), Flow's resource-oriented smart contract language. The contracts use Flow's native EVM bridge to route deposits into MoreMarkets yield vaults on Flow EVM.

## Quick Start

```bash
cd src && npm install
npm run dev
# Open http://localhost:3000
```

## License

MIT
