# YieldPets

## Project Focus
All development work is in the `src/` folder (Next.js app with TypeScript + Tailwind CSS).

## Architecture
- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Custom CSS only. No UI component libraries (no MUI, Chakra, Shadcn, etc.)
- **Font:** Nunito from Google Fonts — no system font substitution
- **Target:** Mobile web (428x926px iPhone viewport), portrait only, centered on desktop
- **Design Spec:** See `/Users/wb/Downloads/yieldpets_isometric_room_spec.md` for the L3 deterministic spec

## Key Conventions
- All colors use exact hex values from design tokens — no Tailwind color names, no CSS keywords
- 8px spacing grid
- All transitions: CSS only (ease-out for enter, ease-in for exit). No spring/bounce.
- No UI libraries. All components are custom-built.
- Minimum text size: 12px
- No page scrolling — everything fixed within viewport

## Directory Structure (src/)
```
src/
  app/
    layout.tsx        — root layout, viewport meta, font loading
    page.tsx          — main isometric room screen
    globals.css       — design tokens + global styles
  components/
    HUDBar.tsx        — gold nuggets, hearts, shield display
    IsometricRoom.tsx — isometric room with pet + furniture
    ActionBar.tsx     — feed button
    BottomNavBar.tsx  — 5-tab navigation
    FurnitureModal.tsx — furniture inspect modal
  types/
    index.ts          — shared TypeScript types
```

## Commands
- `cd src && npm run dev` — start dev server
- `cd src && npm run build` — production build
