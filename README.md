# YieldPets

A Tamagotchi-style DeFi pet game on **Flow**, where depositing **PYUSD** into a yield vault grows and evolves your pet.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Flow](https://img.shields.io/badge/Flow-Mainnet-00ef8b?style=flat-square)

## How It Works

Deposit PYUSD (PayPal USD) into a yield vault powered by MoreMarkets (Aave V3 fork on Flow EVM). Your yield drives pet growth, unlocks items, and earns gold nuggets.

- **Deposit PYUSD** → Pet grows and levels up
- **Earn yield** → Collect gold nuggets, unlock furniture and food
- **Keep funds locked** → Pet mood improves, streak bonuses increase
- **Withdraw** → Pet may de-level or die

## Features

- **Pet Evolution** — Egg → Baby → Teen → Adult → Legendary (+ Dead state)
- **Isometric Room** — Animated pet sprite with walkable floor and placeable furniture
- **Yield-Driven Economy** — Real-time yield accrual from PYUSD deposits feeds the in-game economy
- **Shop** — Buy food and furniture with gold nuggets
- **Pet Stats & Personality** — Dynamic personality traits based on deposit balance, streak, and care
- **Daily Bonuses** — Login streaks with escalating rewards
- **Passwordless Auth** — Email login via Magic SDK with automatic Flow wallet creation

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, custom CSS
- **Blockchain:** Flow mainnet, Cadence smart contracts
- **DeFi:** MoreMarkets (Aave V3 on Flow EVM) for PYUSD yield
- **Auth:** Magic SDK with Flow plugin
- **Contracts:** Cadence — vault management, pet NFTs, armor NFTs

## Quick Start

```bash
cd src && npm install
npm run dev
# Open http://localhost:3000
```

## License

MIT

---

Built for hackathons
