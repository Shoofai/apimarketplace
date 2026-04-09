import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LukeAPI — The AI-Powered API Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 40%, #eef2ff 100%)',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative orb top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Decorative orb bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* ── NAV BAR ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 56px',
            height: 68,
            background: 'rgba(255,255,255,0.85)',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              L
            </div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>
              <span>Luke</span>
              <span style={{ color: '#6366f1' }}>API</span>
            </div>
          </div>
          {/* Nav links */}
          <div style={{ display: 'flex', gap: 36, color: '#6b7280', fontSize: 15, fontWeight: 500 }}>
            <span>Marketplace</span>
            <span>Docs</span>
            <span>Pricing</span>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>Sign in →</span>
          </div>
        </div>

        {/* ── HERO BODY ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px 40px',
          }}
        >
          {/* Pill badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 999,
              padding: '6px 20px',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'flex',
              }}
            />
            <span style={{ fontSize: 15, color: '#4f46e5', fontWeight: 600 }}>
              500+ APIs live · 11 language SDKs · Free to start
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 62,
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: 22,
              letterSpacing: '-2px',
              color: '#1e1b4b',
            }}
          >
            <span>The Only API Platform</span>
            <span style={{ color: '#4f46e5' }}>Where Providers &amp; Devs Both Win</span>
          </div>

          {/* Subheadline */}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: 760,
              lineHeight: 1.5,
              marginBottom: 36,
            }}
          >
            From API discovery to production in 2 minutes. AI-generated code, one-click monetization, and enterprise governance — all in one place.
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                borderRadius: 10,
                padding: '14px 32px',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}
            >
              Start Building →
            </div>
            <div
              style={{
                display: 'flex',
                background: 'transparent',
                color: '#4f46e5',
                border: '2px solid rgba(99,102,241,0.4)',
                borderRadius: 10,
                padding: '14px 32px',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              ▶ Watch 2-min Demo
            </div>
          </div>

          {/* Trust line */}
          <div style={{ display: 'flex', fontSize: 13, color: '#9ca3af', letterSpacing: '0.02em' }}>
            No credit card required · Free tier included · Start building in minutes
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
