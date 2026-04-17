'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

const CATEGORY_ORDER = [
  'pitch_deck',
  'traction',
  'financials',
  'market_analysis',
  'product_demo',
  'term_sheet',
  'legal',
];
const CATEGORY_LABELS: Record<string, string> = {
  pitch_deck: 'Pitch Deck',
  traction: 'Traction & Metrics',
  financials: 'Financial Model',
  market_analysis: 'Market Analysis',
  product_demo: 'Product Demo',
  term_sheet: 'Term Sheet',
  legal: 'Legal',
};

interface DocumentRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string | null;
  access_level: string;
}

export default function DataRoom() {
  const sid = useInvestorSid();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('data_room_documents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setDocuments(data as DocumentRow[]);
      });
  }, []);

  useEffect(() => {
    if (!sid) return;
    const supabase = createClient();
    supabase.functions
      .invoke('track-interaction', {
        body: {
          stakeholder_id: sid,
          interaction_type: 'data_room_access',
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      })
      .catch(() => {});
  }, [sid]);

  const logView = (documentId: string, title: string) => {
    if (!sid) return;
    fetch('/api/investors/data-room/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stakeholder_id: sid,
        document_id: documentId,
        action: 'viewed',
      }),
    }).catch(() => {});
    const supabase = createClient();
    supabase.functions
      .invoke('track-interaction', {
        body: {
          stakeholder_id: sid,
          interaction_type: 'doc_view',
          page_url: window.location.href,
          interaction_data: { document_id: documentId, document_title: title },
        },
      })
      .catch(() => {});
  };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    docs: documents.filter((d) => d.category === cat),
  })).filter((g) => g.docs.length > 0);

  const scheduleHref = sid ? `/investors/schedule?sid=${sid}` : '/investors/schedule';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-3 text-4xl font-bold">Investor Data Room</h1>
        <p className="mb-12 text-white/60">
          Everything you need to evaluate LukeAPI as an investment opportunity.
        </p>

        {grouped.map((group) => (
          <div key={group.category} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">{group.label}</h2>
            <div className="space-y-3">
              {group.docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-blue-500/50 group"
                  onClick={() => logView(doc.id, doc.title)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium transition-colors group-hover:text-blue-400">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div className="mt-1 text-sm text-white/40">{doc.description}</div>
                      )}
                    </div>
                    <div className="text-sm uppercase text-white/20">{doc.file_type ?? '—'}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 text-center">
          <Link
            href={scheduleHref}
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 font-medium text-white transition-colors hover:bg-blue-500"
          >
            Schedule a Meeting →
          </Link>
        </div>
      </div>
    </div>
  );
}
