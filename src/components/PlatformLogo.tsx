'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PlatformLogoProps {
  /** Height of the logo in pixels. Width auto-scales to aspect ratio. */
  height?: number;
  className?: string;
  /** Force a specific variant regardless of theme */
  variant?: 'light' | 'dark';
  /** Show only the favicon/icon mark instead of the full horizontal logo.
   *  Useful for collapsed sidebars and small spaces. */
  iconOnly?: boolean;
}

/**
 * Build the Supabase Storage public URL for a branding asset.
 * Returns the remote URL with a cache-busting `v` param so logo changes
 * appear immediately. Falls back handled by the `onError` handler on <Image>.
 */
function brandingUrl(filename: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return `/${filename}`;
  return `${supabaseUrl}/storage/v1/object/public/branding/${filename}`;
}

/**
 * Image wrapper that tries the Supabase Storage URL first and falls back
 * to the local `/public` asset if the remote fails (e.g. bucket not yet
 * created, file never uploaded, network hiccup).
 */
function BrandedImage({
  filename,
  alt,
  width,
  height,
  className,
  priority,
}: {
  filename: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const [src, setSrc] = useState(() => brandingUrl(filename));

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
      onError={() => {
        // Fall back to the local /public file
        const localPath = `/${filename}`;
        if (src !== localPath) setSrc(localPath);
      }}
    />
  );
}

/**
 * Unified platform logo component with dark mode support.
 *
 * Full logo: logo.svg (light) and logo-dark.svg (dark) — horizontal with icon + text
 * Icon only: favicon.svg — square mark for collapsed menus and small spaces
 *
 * Loads from Supabase Storage (branding bucket) with fallback to local /public files.
 * Uses CSS-based visibility to avoid hydration mismatch and flash.
 */
export default function PlatformLogo({
  height = 36,
  className = '',
  variant,
  iconOnly = false,
}: PlatformLogoProps) {
  // Icon-only mode uses the square favicon
  if (iconOnly) {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`}>
        <BrandedImage
          filename="favicon.svg"
          alt="Logo"
          width={height}
          height={height}
          className="shrink-0"
          priority
        />
      </span>
    );
  }

  // Full horizontal logo — SVG natural size 350x100 (3.5:1)
  const width = Math.round(height * 3.5);

  if (variant === 'dark') {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`}>
        <BrandedImage
          filename="logo-dark.svg"
          alt="Logo"
          width={width}
          height={height}
          className="shrink-0 object-contain"
          priority
        />
      </span>
    );
  }

  if (variant === 'light') {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`}>
        <BrandedImage
          filename="logo.svg"
          alt="Logo"
          width={width}
          height={height}
          className="shrink-0 object-contain"
          priority
        />
      </span>
    );
  }

  // Auto mode — swap based on theme via CSS
  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <BrandedImage
        filename="logo.svg"
        alt="Logo"
        width={width}
        height={height}
        className="shrink-0 object-contain dark:hidden"
        priority
      />
      <BrandedImage
        filename="logo-dark.svg"
        alt="Logo"
        width={width}
        height={height}
        className="hidden shrink-0 object-contain dark:block"
        priority
      />
    </span>
  );
}
