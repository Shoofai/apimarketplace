'use client';

import Image from 'next/image';
import { usePlatformName } from '@/contexts/PlatformNameContext';

interface PlatformLogoProps {
  size?: number;
  className?: string;
  showName?: boolean;
  nameClassName?: string;
  /** Force a specific variant regardless of theme */
  variant?: 'light' | 'dark';
}

/**
 * Unified platform logo component with dark mode support.
 * Renders /logo.svg for light mode and /logo-dark.svg for dark mode.
 * Uses CSS-based visibility to avoid hydration mismatch and flash.
 */
export default function PlatformLogo({
  size = 32,
  className = '',
  showName = true,
  nameClassName = '',
  variant,
}: PlatformLogoProps) {
  const platformName = usePlatformName();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {variant === 'dark' ? (
        <Image
          src="/logo-dark.svg"
          alt={`${platformName} logo`}
          width={size}
          height={size}
          className="shrink-0"
          priority
        />
      ) : variant === 'light' ? (
        <Image
          src="/logo.svg"
          alt={`${platformName} logo`}
          width={size}
          height={size}
          className="shrink-0"
          priority
        />
      ) : (
        <>
          {/* Light mode logo — hidden in dark mode via Tailwind */}
          <Image
            src="/logo.svg"
            alt={`${platformName} logo`}
            width={size}
            height={size}
            className="shrink-0 dark:hidden"
            priority
          />
          {/* Dark mode logo — hidden in light mode via Tailwind */}
          <Image
            src="/logo-dark.svg"
            alt={`${platformName} logo`}
            width={size}
            height={size}
            className="hidden shrink-0 dark:block"
            priority
          />
        </>
      )}
      {showName && (
        <span className={`truncate font-heading font-bold ${nameClassName}`}>
          {platformName}
        </span>
      )}
    </span>
  );
}
