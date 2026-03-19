'use client';

import Image from 'next/image';
import { usePlatformName } from '@/contexts/PlatformNameContext';

interface PlatformLogoProps {
  size?: number;
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

/**
 * Unified platform logo component.
 * Renders the uploaded logo from /api/platform/logo, falling back to /logo.svg.
 * Used across nav, footer, auth pages, and email templates.
 */
export default function PlatformLogo({
  size = 32,
  className = '',
  showName = true,
  nameClassName = '',
}: PlatformLogoProps) {
  const platformName = usePlatformName();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt={`${platformName} logo`}
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showName && (
        <span className={`truncate font-heading font-bold ${nameClassName}`}>
          {platformName}
        </span>
      )}
    </span>
  );
}
