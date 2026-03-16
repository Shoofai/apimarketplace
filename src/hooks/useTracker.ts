'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const SESSION_ID_KEY = 'stakeholder_session_id';

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/**
 * Track a stakeholder interaction (page views, feature use, etc.).
 * Calls the track-interaction edge function. Never throws; errors are swallowed.
 */
export function useTracker() {
  const track = useCallback(
    (interactionType: string, data?: Record<string, unknown>) => {
      try {
        const supabase = createClient();
        const sessionId = getOrCreateSessionId();
        const body: {
          interaction_type: string;
          interaction_data?: Record<string, unknown>;
          page_url?: string;
          session_id?: string;
          stakeholder_id?: string;
          email?: string;
        } = {
          interaction_type: interactionType,
          session_id: sessionId,
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        };
        if (data && Object.keys(data).length > 0) body.interaction_data = data;
        supabase.functions.invoke('track-interaction', { body }).then(() => {}).catch(() => {});
      } catch {
        // Silent: never throw to caller
      }
    },
    []
  );

  /**
   * Track and optionally associate with a known stakeholder (e.g. after capture).
   */
  const trackWithStakeholder = useCallback(
    (
      interactionType: string,
      opts: { stakeholder_id?: string; email?: string; data?: Record<string, unknown> }
    ) => {
      try {
        const supabase = createClient();
        const sessionId = getOrCreateSessionId();
        const body: Record<string, unknown> = {
          interaction_type: interactionType,
          session_id: sessionId,
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        };
        if (opts.stakeholder_id) body.stakeholder_id = opts.stakeholder_id;
        if (opts.email) body.email = opts.email;
        if (opts.data && Object.keys(opts.data).length > 0) body.interaction_data = opts.data;
        supabase.functions.invoke('track-interaction', { body }).then(() => {}).catch(() => {});
      } catch {
        // Silent
      }
    },
    []
  );

  return { track, trackWithStakeholder, sessionId: typeof sessionStorage !== 'undefined' ? getOrCreateSessionId() : '' };
}
