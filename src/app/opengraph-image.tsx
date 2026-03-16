import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'APIMarketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.15) 0%, transparent 50%)',
          }}
        />
        {/* Logo / icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 24,
            lineHeight: 1,
          }}
        >
          🚀
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          API Marketplace
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(199,210,254,0.85)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Discover, integrate &amp; monetize APIs at scale
        </div>
        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          {['10,000+ APIs', 'Built for Teams', 'Free to Start'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(99,102,241,0.25)',
                border: '1px solid rgba(99,102,241,0.5)',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#c7d2fe',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
