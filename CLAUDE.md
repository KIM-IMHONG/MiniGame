# Mini Game Monorepo

## Architecture
- Monorepo: Yarn Workspaces + Turborepo
- Shared packages: @shared/core, @shared/ui, @shared/game-engine
- Apps: app-bubble-shooter, app-sudoku, app-dodge-poop
- Each app is deployed independently to app stores

## Rules
- @shared/* packages NEVER import from app-* packages
- All shared modules must have 80%+ test coverage
- Game-specific customization via config objects, NOT hardcoding
- TypeScript strict mode everywhere

## Tech Stack
- Expo SDK 53+, TypeScript, expo-router
- react-native-game-engine + matter-js (physics)
- @shopify/react-native-skia (rendering)
- react-native-reanimated (animation)
- react-native-google-mobile-ads (AdMob)
- zustand + AsyncStorage (state)

## AdMob Rules
- Banner: bottom of non-game screens only
- Interstitial: after game over, frequency-controlled
- Rewarded: user-initiated only (hint/revive/bonus)
- Grace period: first 2 plays NO ads
- Min interval: 60 seconds between interstitials

## Development Order
1. @shared/core → test → verify
2. @shared/ui → test → verify
3. @shared/game-engine → test → verify
4. app-template (integration test)
5. app-bubble-shooter
6. app-sudoku
7. app-dodge-poop

## Git
- Remote: git@github-dongle:KIM-IMHONG/MiniGame.git
- SSH key: ~/.ssh/dongle (personal account: KIM-IMHONG)
