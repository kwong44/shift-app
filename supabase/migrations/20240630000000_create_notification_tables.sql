-- 20240630000000_create_notification_tables.sql
-- Migration: Create tables for push notification foundation

-- 1. user_devices: stores Expo push tokens per device
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token text NOT NULL,
  platform text CHECK (platform IN ('ios','android','web')),
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (expo_push_token)
);

-- 2. user_notification_prefs: per-user notification settings
CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_focus boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  max_per_day int DEFAULT 2 CHECK (max_per_day >= 0),
  quiet_hours int4range DEFAULT tstzrange(now(), now()), -- stored as int range of hours 0-23? Using text simpler
  muted_until timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_notification_prefs ON public.user_notification_prefs;
CREATE TRIGGER set_updated_at_user_notification_prefs
BEFORE UPDATE ON public.user_notification_prefs
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at(); 