'use client';

import { motion } from 'framer-motion';

const PARTICLE_COUNT = 12;

export function SparkleBurst() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
        const distance = 60 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-amber-400 shadow-lg"
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 0.8, 0],
              x: [0, x],
              y: [0, y],
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: i * 0.02,
            }}
          />
        );
      })}
    </div>
  );
}
