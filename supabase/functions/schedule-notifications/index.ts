// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

/*
 * schedule-notifications Edge Function (Phase 1)
 * --------------------------------------------------------
 * Runs via Supabase Scheduled Trigger every day at 08:00 UTC.
 * Logic:
 * 1. Select users with daily_focus notifications enabled.
 * 2. Exclude users who have already completed their focus today (progress_logs).
 * 3. Insert a reminder row into notification_queue to be dispatched ASAP.
 */

console.log('[schedule-notifications] Function starting');

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase env vars');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Fetch users with daily_focus enabled
    const { data: prefs, error: prefsErr } = await supabase
      .from('user_notification_prefs')
      .select('user_id')
      .eq('daily_focus', true);

    if (prefsErr) throw prefsErr;

    const userIds = prefs.map((p) => p.user_id);
    if (userIds.length === 0) {
      console.log('[schedule-notifications] No users with daily_focus enabled');
      return new Response('No users to notify', { status: 200 });
    }

    // Step 2: Identify users who already completed focus today
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const { data: completed, error: compErr } = await supabase
      .from('progress_logs')
      .select('user_id')
      .in('user_id', userIds)
      .eq('exercise_type', 'daily_focus')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (compErr) throw compErr;

    const completedUserIds = new Set(completed.map((c) => c.user_id));
    const usersToNotify = userIds.filter((id) => !completedUserIds.has(id));

    if (usersToNotify.length === 0) {
      console.log('[schedule-notifications] Everyone has completed focus today');
      return new Response('Nothing to schedule', { status: 200 });
    }

    // Step 3: Insert into notification_queue
    const inserts = usersToNotify.map((user_id) => ({
      user_id,
      title: 'Today\'s Focus Awaits!',
      body: 'Jump back in and complete your personalized Daily Focus. Tap to begin.',
      deep_link_route: 'DailyFocus',
      scheduled_at: new Date().toISOString(),
    }));

    const { error: insertErr, count } = await supabase
      .from('notification_queue')
      .insert(inserts, { count: 'exact' });

    if (insertErr) throw insertErr;

    console.log(`[schedule-notifications] Scheduled ${count || inserts.length} notifications`);

    return new Response('Notifications scheduled', { status: 200 });
  } catch (err) {
    console.error('[schedule-notifications] Error:', err.message);
    return new Response('Error', { status: 500 });
  }
}); 