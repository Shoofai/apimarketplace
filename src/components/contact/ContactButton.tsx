'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export interface ContactButtonProps {
  /** Page or context where the button is shown (e.g. "security-page", "legal-terms") */
  source: string;
  /** Inquiry category for routing (e.g. "security", "legal", "support", "sales") */
  category?: string;
  /** Report type for CRM routing (e.g. "security_report", "aup_violation", "dmca_takedown") */
  reportType?: string;
  /** Button label */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  /** Additional class names */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
}

export function ContactButton({
  source,
  category,
  reportType,
  children,
  variant = 'outline',
  size = 'sm',
  className,
  showIcon = false,
}: ContactButtonProps) {
  const params = new URLSearchParams({ source });
  if (category) params.set('category', category);
  if (reportType) params.set('report_type', reportType);
  const href = `/contact?${params.toString()}`;

  return (
    <Link href={href}>
      <Button variant={variant} size={size} className={className}>
        {showIcon && <MessageCircle className="h-4 w-4" />}
        {children}
      </Button>
    </Link>
  );
}
