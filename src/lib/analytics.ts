import { createClient } from '@/lib/supabase/client';

const CONSENT_PREFERENCES_KEY = 'cookie-preferences';
const CONSENT_GIVEN_KEY = 'cookie-consent-given';

export type ConsentPreferences = {
  essential?: boolean;
  functional?: boolean;
  analytics?: boolean;
  performance?: boolean;
  marketing?: boolean;
};

/** Respect Do Not Track (DNT) — do not track when user has DNT enabled */
function isDntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1' || (typeof window !== 'undefined' && (window as unknown as { doNotTrack?: string }).doNotTrack === '1');
}

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDntEnabled()) return false;
  const given = localStorage.getItem(CONSENT_GIVEN_KEY);
  if (!given) return false;
  const raw = localStorage.getItem(CONSENT_PREFERENCES_KEY);
  if (!raw) return false;
  try {
    const prefs: ConsentPreferences = JSON.parse(raw);
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

export async function trackPageView(data: {
  page_path: string;
  referrer?: string;
  scroll_depth?: number;
  time_on_page?: number;
}) {
  if (!hasAnalyticsConsent()) return;
  const supabase = createClient();
  const sessionId = getOrCreateSessionId();

  await supabase.from('page_views').insert({
    session_id: sessionId,
    page_path: data.page_path,
    referrer: data.referrer || (typeof document !== 'undefined' ? document.referrer : ''),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    scroll_depth: data.scroll_depth,
    time_on_page: data.time_on_page,
  });
}

export async function trackCTAClick(data: {
  cta_type: string;
  cta_location: string;
  metadata?: any;
}) {
  if (!hasAnalyticsConsent()) return;
  const supabase = createClient();
  const sessionId = getOrCreateSessionId();

  await supabase.from('cta_clicks').insert({
    session_id: sessionId,
    cta_type: data.cta_type,
    cta_location: data.cta_location,
    metadata: data.metadata,
  });
}

export async function trackFeatureDemo(data: {
  feature_id: number;
  feature_name: string;
  interaction_type: 'view' | 'hover' | 'click' | 'demo_open';
  duration_seconds?: number;
}) {
  if (!hasAnalyticsConsent()) return;
  const supabase = createClient();
  const sessionId = getOrCreateSessionId();

  await supabase.from('feature_demo_interactions').insert({
    session_id: sessionId,
    feature_id: data.feature_id,
    feature_name: data.feature_name,
    interaction_type: data.interaction_type,
    duration_seconds: data.duration_seconds,
  });
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
