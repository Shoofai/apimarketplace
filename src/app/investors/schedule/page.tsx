'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const INVESTOR_SID_KEY = 'investor_stakeholder_id';

function useInvestorSid() {
  const [sid, setSid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('sid');
    if (fromUrl) {
      try {
        sessionStorage.setItem(INVESTOR_SID_KEY, fromUrl);
      } catch {}
      setSid(fromUrl);
      return;
    }
    try {
      setSid(sessionStorage.getItem(INVESTOR_SID_KEY));
    } catch {
      setSid(null);
    }
  }, []);

  return sid;
}

interface SlotRow {
  id: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
}

export default function InvestorScheduler() {
  const sid = useInvestorSid();
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<{
    date: string;
    time: string;
    duration: number;
    video_link: string | null;
  } | null>(null);
  const [showGate, setShowGate] = useState(true);
  const [gateEmail, setGateEmail] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (sid) setShowGate(false);
  }, [sid]);

  useEffect(() => {
    if (!sid) return;
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('meeting_slots')
      .select('id, slot_date, slot_time, duration_minutes')
      .eq('is_available', true)
      .gte('slot_date', today)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (data) setSlots(data as SlotRow[]);
      });
  }, [sid]);

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = gateEmail.trim();
    if (!email) return;
    setGateSubmitting(true);
    setGateError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('classify-stakeholder', {
        body: {
          email,
          capture_source: 'landing_page',
          landing_page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      });
      if (error) throw new Error(error.message || 'Request failed');
      if (data?.error) throw new Error(data.error);
      const newSid = data?.stakeholder_id;
      if (newSid) {
        try {
          sessionStorage.setItem(INVESTOR_SID_KEY, newSid);
        } catch {}
        window.location.href = `/investors/schedule?sid=${newSid}`;
        return;
      }
      throw new Error('Could not create session');
    } catch (err) {
      setGateError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGateSubmitting(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !sid) return;
    setBooking(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('book-investor-meeting', {
        body: {
          stakeholder_id: sid,
          slot_id: selectedSlot,
          meeting_type: 'intro_call',
          notes: notes.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMeetingDetails(data?.meeting ?? null);
      setBooked(true);
    } catch {
      alert('That slot was just taken. Please select another.');
      window.location.reload();
    } finally {
      setBooking(false);
    }
  };

  if (showGate && !sid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-bold">Schedule a Meeting</h2>
          <p className="mb-4 text-sm text-white/60">Enter your email to see available times.</p>
          <form onSubmit={handleGateSubmit} className="space-y-3">
            <input
              type="email"
              value={gateEmail}
              onChange={(e) => setGateEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none"
            />
            {gateError && <p className="text-sm text-red-400">{gateError}</p>}
            <button
              type="submit"
              disabled={gateSubmitting}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {gateSubmitting ? 'Continuing...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (booked && meetingDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-2 text-2xl font-bold">Meeting Confirmed!</h2>
          <p className="mb-6 text-white/60">
            {new Date(meetingDetails.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at {meetingDetails.time} ({meetingDetails.duration}min)
          </p>
          {meetingDetails.video_link && (
            <a
              href={meetingDetails.video_link}
              className="mb-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
            >
              Add to Calendar
            </a>
          )}
          <p className="text-sm text-white/30">
            You will receive a confirmation email with the meeting link and agenda.
          </p>
        </div>
      </div>
    );
  }

  const slotsByDate = slots.reduce<Record<string, SlotRow[]>>((acc, slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
    acc[slot.slot_date].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold">Schedule a Meeting</h1>
        <p className="mb-8 text-white/60">30-minute intro call with the founder</p>

        {Object.entries(slotsByDate).map(([date, daySlots]) => (
          <div key={date} className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-white/40">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedSlot === slot.id
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  {slot.slot_time.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        ))}

        {selectedSlot && (
          <div className="mt-8 space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you would like to discuss? (optional)"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleBook}
              disabled={booking}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {booking ? 'Booking...' : 'Confirm Meeting →'}
            </button>
          </div>
        )}

        {slots.length === 0 && sid && (
          <p className="py-8 text-center text-white/40">
            No available slots right now. Please check back or email the team directly.
          </p>
        )}
      </div>
    </div>
  );
}
