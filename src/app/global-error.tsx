'use client';

/**
 * Catches unhandled runtime errors (e.g. ChunkLoadError from stale cache).
 * Encourages a full reload to fetch fresh chunks.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkLoad = error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk');

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
        {isChunkLoad ? (
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            A script failed to load. This often happens after a restart or when the app was updated. Reload the page to get the latest version.
          </p>
        ) : (
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error?.message || 'An unexpected error occurred.'}</p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
          }}
        >
          Reload page
        </button>
      </body>
    </html>
  );
}
