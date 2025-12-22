# Base Snake Mini App (Next.js 14 + Base MiniKit)

Daily Snake built for Base MiniKit with mobile-first UI, onboarding, sponsored transaction placeholders, and leaderboard-ready flows.

## Features
- **Native MiniKit auth**: automatic wallet connection in-app, no emails or redirects. Displays username and avatar initials only (no `0x` addresses).
- **Daily play loop**: canvas-based Snake with swipe + D-pad controls, pause/restart, game-over messaging, and local high score storage.
- **Engagement**: daily check-in and score submission wired to sponsored transaction placeholders (`dailyCheckIn()`, `submitScore(score)`).
- **Leaderboard-ready**: mock leaderboard that merges the signed-in user with sample data.
- **Onboarding**: first-time modal persisted in `localStorage`.
- **Theming**: light/dark via CSS variables; respects MiniKit theme preference with a pre-hydration script.
- **Mobile-first layout**: bottom navigation with four tabs and ≥44px touch targets.

## Quickstart
```bash
npm install
npm run dev
```

## Deploying to Vercel
1. Create a new Vercel project and import this repository.
2. Framework preset: **Next.js**. No environment variables are required.
3. Deploy. The repo is App Router-ready and uses static MiniKit config placeholders.

## Base MiniKit setup
- Update `minikit.config.ts` with your production values:
  - `homeUrl`
  - `iconUrl`
  - `splashImageUrl`
  - `accountAssociation` (object remains empty until configured)
- MiniKit is expected to be injected at runtime on `window.MiniKit` by the hosting client. The app calls `window.MiniKit?.ready?.()` after load and post-onboarding, and reads `window.MiniKit.user` (username/avatar) if provided.

## Assets (manual)
- Add `public/icon.png` and `public/splash.png` yourself. Binary assets are intentionally excluded; `public/README.txt` documents this requirement.

## Scripts
- `npm run dev` – local development
- `npm run build` – production build
- `npm run start` – run the production server
- `npm run lint` – lint the project

## Project structure
- `app/` – App Router pages, components, and global styles
- `app/components/` – UI pieces (Snake game, onboarding modal, navigation, loading button)
- `types/` – lightweight MiniKit typings
- `public/` – static assets (add your own icons/splash files)

## Notes
- Sponsored transaction handlers (`dailyCheckIn`, `submitScore`) are stubbed and ready for integration.
- The app avoids Farcaster-specific text and is client-agnostic for Base experiences.
