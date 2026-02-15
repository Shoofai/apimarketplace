'use client';

import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  className?: string;
  strokeColor?: string;
}

export function Sparkline({ data, className = '', strokeColor = 'currentColor' }: SparklineProps) {
  const width = 48;
  const height = 20;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padding + i * step;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <motion.svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      preserveAspectRatio="none"
    >
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}
