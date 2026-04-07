import { supabase } from '../supabaseClient';

export async function track(eventData) {
  try {
    const sessionId = sessionStorage.getItem('lokaly_session_id');

    const payload = {
      event_name: eventData.event_name,
      location_id: eventData.location_id ?? null,
      user_id: eventData.user_id ?? null,
      page: eventData.page ?? null,
      session_id: sessionId ?? null,
      meta: eventData.meta || {},
    };

    console.log('[LOKALY DEBUG] Tracking event:', payload);

    const { error } = await supabase.from('analytics_events').insert(payload);

    if (error) {
      console.error('[LOKALY ERROR] Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('[LOKALY ERROR] Failed to track event:', eventData.event_name, error);
  }
}
