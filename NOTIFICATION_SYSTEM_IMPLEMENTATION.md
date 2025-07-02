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
|1|Daily Focus morning reminder via `notification_queue` + dispatcher|✅ **Completed**|
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

## Phase 1 Details (COMPLETED)
1. **Backend**
   - Migration `20240630000001_create_notification_queue.sql` (table + index)
   - Edge Function `schedule-notifications` (CRON: 08:00 UTC) – queues reminders for users without Daily Focus completion.
   - Edge Function `notification-dispatcher` (every 5 min) – sends Expo push, updates `sent_at`.
2. **Client**
   - Navigation ref hookup; taps on push navigate to route.
   - Listener added in `notificationService.js`.

> Phase 1 is live. Pending: Phase 2 adaptive logic.

---

## Phase 2 Details (Upcoming)
**Goal:** Make notifications adaptive & respectful.

1. **Dismiss/Open Analytics**
   - Add `notification_events` table (`id`, `notification_id`, `event`, `ts`).
   - Client: hook into `Notifications.addNotificationDismissedListener` & `addNotificationResponseReceivedListener` to log events.

2. **Frequency Dampening Logic (Edge Function: `adaptive-notification-engine`)**
   - Calculate 7-day dismiss/open rates per user.
   - If `dismiss_rate > 60%` ➔ set `max_per_day = 1`.
   - If `open_rate > 40%` ➔ allow up to `max_per_day = 3` (but never >3).
   - Update `user_notification_prefs` accordingly.

3. **Quiet Hours Enforcement**
   - Store `quiet_hours` as text range `'22-7'` (local time).
   - Dispatcher skips tokens if current time within range; reschedules for next allowed slot.

4. **Client Settings Screen**
   - Toggle categories (Daily Focus, Weekly Summary).
   - Time-picker for quiet hours.

---

## Phase 3 Details (Upcoming)
**Goal:** Personalize copy & add higher-value content.

1. **AI-Crafted Nudge Copy**
   - Extend `daily-focus-ai` to return `{ title, body }` tailored to user goals/mood.
   - `schedule-notifications` uses this dynamic copy for queued messages.

2. **Streak-Save Logic**
   - Edge Function checks `progress_logs` for streaks ≥3 days; queues special streak message at 19:00 local if focus incomplete.

3. **Weekly Summary Push (Sunday 18:00)**
   - Edge Function `weekly-summary` gathers stats (completed exercises, best streak, mood avg).
   - Generates summary & deep-links to a "Weekly Insights" screen.

4. **In-App Inbox (Optional)**
   - Store last 30 notifications client-side for later review.

---

## Phase 4 Details (Optional / Ongoing)
**Goal:** Validate impact & iterate.

1. **A/B Testing Framework**
   - `user_experiments` table: `id`, `user_id`, `experiment`, `variant`.
   - Randomly assign new users to Control vs AI-Nudge variant.

2. **Metrics Dashboard**
   - Supabase `pgdashboard` or external BI to track open rate, focus completion, retention by variant.

3. **Continuous Improvement Loop**
   - Every sprint, review metrics, adjust copy/frequency weights.

---

> With all phases outlined, future developers can jump directly into the next milestone without rediscovering context.

> Next step: begin Phase 2 once backend scheduler logic is green-lit. 