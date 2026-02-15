import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  Cloud,
  Zap,
  MessageSquare,
  ShoppingCart,
  Code2,
  Users,
  MapPin,
  Mail,
  Shield,
  BarChart3,
  Image,
  Music,
  Gamepad2,
  FileText,
  Globe,
  Cpu,
  Database,
  Lock,
  type LucideProps,
} from 'lucide-react';

const slugToIcon: Record<string, LucideIcon> = {
  finance: DollarSign,
  financial: DollarSign,
  payments: DollarSign,
  payment: DollarSign,
  banking: DollarSign,
  weather: Cloud,
  weather_: Cloud,
  geo: MapPin,
  mapping: MapPin,
  maps: MapPin,
  location: MapPin,
  ai: Zap,
  artificial: Zap,
  machine: Zap,
  ml: Zap,
  communication: MessageSquare,
  messaging: MessageSquare,
  chat: MessageSquare,
  email: Mail,
  commerce: ShoppingCart,
  ecommerce: ShoppingCart,
  shopping: ShoppingCart,
  development: Code2,
  developer: Code2,
  tools: Code2,
  dev: Code2,
  social: Users,
  social_media: Users,
  analytics: BarChart3,
  data: Database,
  database: Database,
  storage: Database,
  media: Image,
  image: Image,
  photos: Image,
  music: Music,
  audio: Music,
  gaming: Gamepad2,
  games: Gamepad2,
  documentation: FileText,
  docs: FileText,
  web: Globe,
  internet: Globe,
  computing: Cpu,
  security: Shield,
  auth: Lock,
  identity: Lock,
};

const defaultIcon = Code2;

/**
 * Returns the Lucide icon component for a category by slug or name.
 * Uses slug first (lowercased, normalized), then name.
 */
export function getCategoryIcon(slug: string | undefined, name?: string): LucideIcon {
  const key = slug?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  if (key && slugToIcon[key]) return slugToIcon[key];
  const nameKey = name?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  if (nameKey) {
    for (const [k, icon] of Object.entries(slugToIcon)) {
      if (nameKey.includes(k) || k.includes(nameKey)) return icon;
    }
  }
  return defaultIcon;
}

/**
 * Renders the category icon with optional size/className.
 */
export function CategoryIcon(
  props: { slug?: string; name?: string } & LucideProps
) {
  const { slug, name, size = 16, className, ...rest } = props;
  const Icon = getCategoryIcon(slug, name);
  return React.createElement(Icon, { size, className, ...rest });
}
