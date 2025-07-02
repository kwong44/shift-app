# Notification System Implementation Plan

## Overview
This document outlines the end-to-end plan for implementing a respectful, AI-powered notification system in **Shift App** that nudges users to complete their Daily Focus while avoiding notification fatigue.

---

## Architecture Summary
1. **Edge Functions (Supabase)**
   - `schedule-notifications` – decides who should receive a push (Phase 1+).
   - `notification_dispatcher` – sends queued pushes via Expo (Phase 1+).
2. **Supabase Tables**
   - `user_devices` – device push tokens.
   - `user_notification_prefs` – per-user settings.
   - `notification_queue` – messages awaiting dispatch.
3. **Client**
   - `notificationService.js` – permission request, token registration, helpers.
   - In-app routing for deep links → specific exercise screens.
4. **Adaptive Logic** – frequency dampening, quiet hours, AI-generated copy (Phase 2+).

---

## Phase Roadmap
| Phase | Scope | Status |
|-------|-------|--------|
|0|Foundation – ask permission, register Expo push token, create `user_devices` & `user_notification_prefs` tables|✅ **Completed**|
|1|Daily Focus morning reminder via `notification_queue` + dispatcher|⏳ Pending|
|2|Adaptive logic (dismiss tracking, quiet hours, max/day)|⏳ Pending|
|3|AI-crafted nudges & weekly summary|⏳ Pending|
|4|A/B testing & metrics|⏳ Pending|

---

## Phase 0 Details (COMPLETED)
1. **Client‐side**
   - `src/services/notificationService.js` created.
   - Permission request on app start (in `App.js`).
   - Expo push token saved to `user_devices` table.
2. **Backend**
   - Supabase migration `20240630000000_create_notification_tables.sql` with:
     - `user_devices`
     - `user_notification_prefs`

Developers can now confirm tokens are being stored by querying `user_devices`.

---

> Next step: begin Phase 1 once backend scheduler logic is green-lit. 