# DocAlert Mobile — Project Status

**Read this file first.** Stay on `checkpoint/cursor-switch-2026-08-30`. Do not merge, rebase, or switch branches until the next task is decided.

| | |
|---|---|
| Latest checkpoint | `6cbdb5a` — chore: checkpoint DocAlert mobile before Cursor account switch |
| Source baseline | `development` `90b0d22` — chore: checkpoint DocAlert mobile development before Cursor migration |

## Identity

- Product: DocAlert Mobile only (this repository).
- Local: `D:\DocAlert Project\DocAlert Mobile\docalert-mobile-sdk54`
- GitHub: https://github.com/technaas/docalert-app
- DocAlert Web (do not edit from this handover): `D:\DocAlert Project\DocAlert Cursor\comply-chain-app` — https://github.com/technaas/comply-chain-app.git

## Architecture and local setup

- Expo SDK **~54.0.33**, React Native **0.81.5**, React **19.1.0**. New Architecture enabled; React Compiler experiment on (`app.json`).
- Entry: `expo/AppEntry` → `App.tsx`. React Navigation 7 (native stacks + bottom tabs), not file-based routing. `expo-router` remains a dependency but is unused.
- Data: TanStack Query; Supabase JS client with AsyncStorage session (`src/lib/supabase.ts`).
- Local: `npm install`, then `npx expo start`. npm scripts: `start`, `android`, `ios`, `web`, `lint`. No test or build script.
- `.env` is tracked and contains **only** `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (public anon client vars). Do not paste values. `.env*.local` is gitignored.

## Shared hosted backend

Hosted Supabase is **shared with DocAlert Web**. Mobile is a client; **RLS is the security boundary**. Schema, migrations, and edge deploys must stay compatible with web.

This repo includes `supabase/functions/send-mobile-expiry-notifications/` (expiry push). Client usage includes profiles, subscriptions, access mappings, documents, staff, vehicles, org, and `mobile_devices`.

## Completed screens, navigation, branding, notifications

**Screens:** Login, AccessGate, Dashboard, Alerts, Brands / BrandDetail, Branches / BranchDetail, Staff / StaffDetail, Salary, Documents / DocumentDetail, Vehicles / VehicleDetail, Settings.

**Navigation:** `RootNavigator` — session → profile → password gate → company assigned → subscription → `AppStack`. Tabs (`MainTabNavigator`): Home, Staff, Salary, Docs, Branch, Settings. Nested stacks for staff, documents, branches, vehicles; modal details. Routes gated by `routePermissions.ts`, `PermissionGate`, `AccessDenied`.

**Branding:** App name DocAlert; icons/splash/adaptive icons; `DocAlertLogo` (lockup + mark); `BrandedLoading`; theme in `src/constants/theme.ts`.

**Notifications:** `expo-notifications` plugin; `NotificationContext`; device token sync; tap routing (`notificationNavigation.ts`); Settings push status and logs. Remote push is **not** supported in Expo Go or web (`pushAvailability.ts`).

## Access scope, permissions, subscription, password

- Brand/branch scope: `useAccessScope` / `accessScope.ts` / `scopeCompanyData.ts`.
- Role permissions: client mirror of web in `permissions.ts` (UI gating only).
- Subscription: `status` active or trial **and** `end_date` not past (`subscription.ts`, `useSubscriptionGate`).
- Temporary password: `must_change_password` → AccessGate; set the new password **on the web app**, then sign in again.

## Feature notes in this checkpoint

- **Branches:** tab stack; Kuwait governorate/area master (`kuwait-locations.ts`).
- **Staff:** signed-URL portraits (`StaffPortrait`); shareable profile PDF (`staffProfilePdf.ts`).
- **Documents:** view/download via fresh signed URLs on `staff-documents` (`documentStorage.ts`, `DocumentFileActions`); company document types context.
- **Vehicles:** list/detail, daftar expiry, daftar and driver Civil ID files.

## Android / iOS / EAS

- Android: package `com.technaas.docalert`; adaptive icons; edge-to-edge.
- iOS: tablet + icon; **no `ios.bundleIdentifier` in `app.json`**.
- EAS: owner `technaasems`; `extra.eas.projectId` set. Profiles in `eas.json`: development (dev client, internal), preview (internal APK), production (`autoIncrement`). Submit profile is empty.
- Distribution: **internal EAS** only; no store listing in this repo. Native remote push needs an EAS / dev / production build, not Expo Go.

## Validation

- TypeScript passed.
- Expo lint: 0 errors, 11 warnings.
- No automated test or build npm script. No `*.test` / `*.spec` files (`kuwait-locations.ts` comments mention a missing test file).

## Pending work and known risks

- Mobile is **view-first**; create/edit/upload remain on web.
- Unused `expo-router`; root `README.md` still describes Expo Router.
- Duplicate Branch / Document / Vehicle routes on `AppStack` vs nested stacks.
- Push unavailable in Expo Go; iOS bundle id unset; Hermes + Supabase previously needed an EAS fix (`db13c9e`).
- Do not drift from the shared web API/schema contract.
- Confirm `git status` is clean on this checkpoint branch before starting new work.

## Exact next step

Remain on `checkpoint/cursor-switch-2026-08-30`, use this handover as the brief, and wait until the next task is decided. Do not merge into `development` until then.
