'use client';

import Image from 'next/image';

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
 * Unified platform logo component with dark mode support.
 *
 * Full logo: /logo.svg (light) and /logo-dark.svg (dark) — horizontal with icon + text
 * Icon only: /favicon.svg — square mark for collapsed menus and small spaces
 *
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
        <Image
          src="/favicon.svg"
          alt="Logo"
          width={height}
          height={height}
          className="shrink-0"
          priority
        />
      </span>
    );
  }

  // Full horizontal logo — aspect ratio 225:60 = 3.75:1
  const width = Math.round(height * 3.75);

  if (variant === 'dark') {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`}>
        <Image
          src="/logo-dark.svg"
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
        <Image
          src="/logo.svg"
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
      <Image
        src="/logo.svg"
        alt="Logo"
        width={width}
        height={height}
        className="shrink-0 object-contain dark:hidden"
        priority
      />
      <Image
        src="/logo-dark.svg"
        alt="Logo"
        width={width}
        height={height}
        className="hidden shrink-0 object-contain dark:block"
        priority
      />
    </span>
  );
}
