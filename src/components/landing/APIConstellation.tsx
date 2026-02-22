'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export interface APIConstellationProps {
  /** Normalized mouse position -0.5 to 0.5 from parent */
  mouseX?: number;
  mouseY?: number;
}

const NODES = [
  { id: 'payments', label: 'Payments', angle: 0 },
  { id: 'ai', label: 'AI', angle: 60 },
  { id: 'maps', label: 'Maps', angle: 120 },
  { id: 'weather', label: 'Weather', angle: 180 },
  { id: 'finance', label: 'Finance', angle: 240 },
  { id: 'social', label: 'Social', angle: 300 },
];

const ORBIT_RADIUS = 140;
const CENTER_X = 200;
const CENTER_Y = 200;
const SVG_SIZE = 400;

/** Round and format so server and client produce identical SVG attributes (avoids hydration mismatch). */
const COORD_DECIMALS = 10;
function roundCoord(n: number): number {
  const p = 10 ** COORD_DECIMALS;
  return Math.round(n * p) / p;
}
function coordStr(n: number): string {
  return roundCoord(n).toFixed(COORD_DECIMALS);
}

function getNodePosition(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: roundCoord(CENTER_X + Math.cos(rad) * radius),
    y: roundCoord(CENTER_Y + Math.sin(rad) * radius),
  };
}

export function APIConstellation({ mouseX: propMouseX = 0, mouseY: propMouseY = 0 }: APIConstellationProps = {}) {
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    motionX.set(propMouseX);
    motionY.set(propMouseY);
  }, [propMouseX, propMouseY, motionX, motionY]);

  const parallaxX = useTransform(motionX, [-0.5, 0.5], [-15, 15]);
  const parallaxY = useTransform(motionY, [-0.5, 0.5], [-15, 15]);

  const nodePositions = useMemo(
    () =>
      NODES.map((node) => ({
        ...node,
        ...getNodePosition(node.angle, ORBIT_RADIUS),
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute opacity-30 dark:opacity-25"
        style={{
          x: reducedMotion ? 0 : parallaxX,
          y: reducedMotion ? 0 : parallaxY,
        }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(167, 139, 250)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="hubGrad">
            <stop offset="0%" stopColor="rgb(167, 139, 250)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgb(124, 58, 237)" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Connection lines from center to nodes */}
        {nodePositions.map((node, i) => {
          const pathD = `M ${coordStr(CENTER_X)} ${coordStr(CENTER_Y)} L ${coordStr(node.x)} ${coordStr(node.y)}`;
          return (
            <g key={node.id}>
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="0.5"
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 0.6,
                }}
                transition={{
                  pathLength: {
                    duration: reducedMotion ? 0 : 1.2,
                    delay: i * 0.1,
                  },
                  opacity: { duration: 0.5 },
                }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="0.5"
                strokeDasharray="4 6"
                initial={{ strokeDashoffset: 0 }}
                animate={{
                  strokeDashoffset: reducedMotion ? 0 : -20,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: i * 0.3,
                }}
              />
            </g>
          );
        })}

        {/* Central hub */}
        <motion.circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={24}
          fill="url(#hubGrad)"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={20}
          fill="none"
          stroke="rgba(167, 139, 250, 0.5)"
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: reducedMotion ? 0 : 2,
            repeat: Infinity,
          }}
        />

        {/* Orbiting nodes */}
        {nodePositions.map((node, i) => (
          <g key={node.id}>
            <motion.circle
              cx={coordStr(node.x)}
              cy={coordStr(node.y)}
              r={8}
              fill="rgba(139, 92, 246, 0.4)"
              stroke="rgba(167, 139, 250, 0.6)"
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + i * 0.08,
              }}
            />
            <motion.circle
              cx={coordStr(node.x)}
              cy={coordStr(node.y)}
              r={6}
              fill="rgba(167, 139, 250, 0.6)"
              initial={{ scale: 0 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 0.4, 0.8],
              }}
              transition={{
                duration: reducedMotion ? 0 : 2.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          </g>
        ))}
      </motion.svg>
    </div>
  );
}
