-- Seed investor funnel: data room docs, meeting slots, traction metrics

INSERT INTO public.data_room_documents (title, description, category, file_url, file_type, access_level, is_active, sort_order)
SELECT 'Pitch Deck', 'Company overview and product vision', 'pitch_deck', 'https://example.com/pitch.pdf', 'pdf', 'public', true, 0
WHERE NOT EXISTS (SELECT 1 FROM public.data_room_documents WHERE category = 'pitch_deck' AND title = 'Pitch Deck' LIMIT 1);
INSERT INTO public.data_room_documents (title, description, category, file_url, file_type, access_level, is_active, sort_order)
SELECT 'Traction Summary', 'Key metrics and growth', 'traction', 'https://example.com/traction.pdf', 'pdf', 'public', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.data_room_documents WHERE category = 'traction' AND title = 'Traction Summary' LIMIT 1);

-- Meeting slots: next 7 days, 9am-5pm ET, 30-min slots (example - adjust or add via admin)
DO $$
DECLARE
  d date;
  t time;
  i int;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 6, '1 day'::interval)::date
  LOOP
    FOR i IN 0..15 LOOP
      t := '09:00'::time + (i * 30 || ' minutes')::interval;
      INSERT INTO public.meeting_slots (slot_date, slot_time, duration_minutes, timezone, is_available)
      VALUES (d, t, 30, 'America/New_York', true);
    END LOOP;
  END LOOP;
END $$;

-- One row for traction_metrics so the dashboard has data
INSERT INTO public.traction_metrics (
  metric_date,
  total_signups,
  weekly_active_users,
  monthly_active_users,
  total_apis_listed,
  total_api_calls,
  mrr,
  arr,
  total_providers,
  total_investor_leads,
  meetings_scheduled,
  commitments_received,
  capital_committed
)
VALUES (
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
)
ON CONFLICT (metric_date) DO NOTHING;
