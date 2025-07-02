-- 20240630000001_create_notification_queue.sql
-- Migration: Create notification_queue table for phase 1

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  deep_link_route text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  push_response jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index to quickly fetch pending notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue (scheduled_at) WHERE sent_at IS NULL; 