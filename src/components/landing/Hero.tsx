'use client';

import type { HeroVariant } from '@/lib/settings/hero-variant';
import HeroClassic from './hero/HeroClassic';
import HeroDeveloper from './hero/HeroDeveloper';
import HeroSplit from './hero/HeroSplit';

export default function Hero({ variant }: { variant: HeroVariant }) {
  if (variant === 'split') return <HeroSplit />;
  if (variant === 'classic') return <HeroClassic />;
  return <HeroDeveloper />;
}
