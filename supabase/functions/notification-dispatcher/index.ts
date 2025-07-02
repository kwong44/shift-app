// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log('[notification-dispatcher] Function starting');

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase env vars');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending notifications
    const { data: pending, error: pendErr } = await supabase
      .from('notification_queue')
      .select('*')
      .lte('scheduled_at', new Date().toISOString())
      .is('sent_at', null)
      .limit(100);

    if (pendErr) throw pendErr;

    if (pending.length === 0) {
      console.log('[notification-dispatcher] No pending notifications');
      return new Response('Nothing to send', { status: 200 });
    }

    // Map user_id to tokens
    const userIds = [...new Set(pending.map((n) => n.user_id))];

    const { data: devices, error: devErr } = await supabase
      .from('user_devices')
      .select('user_id, expo_push_token')
      .in('user_id', userIds);

    if (devErr) throw devErr;

    const tokenMap = devices.reduce((acc, cur) => {
      if (!acc[cur.user_id]) acc[cur.user_id] = [];
      acc[cur.user_id].push(cur.expo_push_token);
      return acc;
    }, {} as Record<string, string[]>);

    // Prepare Expo push messages
    const messages = [] as { to: string; title: string; body: string; data: Record<string, unknown> }[];
    const notificationIds: string[] = [];

    pending.forEach((n) => {
      const tokens = tokenMap[n.user_id] || [];
      tokens.forEach((token) => {
        messages.push({
          to: token,
          title: n.title,
          body: n.body,
          data: { deep_link_route: n.deep_link_route, notification_id: n.id },
        });
      });
      notificationIds.push(n.id);
    });

    if (messages.length === 0) {
      console.log('[notification-dispatcher] No valid tokens');
      return new Response('No tokens', { status: 200 });
    }

    // Send push via Expo
    const chunks = [];
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    const expoResponses: unknown[] = [];

    for (const chunk of chunks) {
      const resp = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });
      const json = await resp.json();
      expoResponses.push(json);
    }

    // Update notifications as sent
    const { error: upErr } = await supabase
      .from('notification_queue')
      .update({ sent_at: new Date().toISOString(), push_response: expoResponses })
      .in('id', notificationIds);

    if (upErr) throw upErr;

    console.log(`[notification-dispatcher] Dispatched ${notificationIds.length} notifications`);

    return new Response('Sent', { status: 200 });
  } catch (err) {
    console.error('[notification-dispatcher] Error:', err.message);
    return new Response('Error', { status: 500 });
  }
}); 