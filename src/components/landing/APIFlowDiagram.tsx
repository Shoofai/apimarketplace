'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Code2, Server, Cloud, Check, Play, Pause, LucideIcon } from 'lucide-react';
import { usePlatformName } from '@/contexts/PlatformNameContext';

// ---------------------------------------------------------------------------
// Scene model: typed constants for nodes, connectors, and geometry
// ---------------------------------------------------------------------------

type NodeId = 'developer' | 'gateway' | 'provider' | 'done';

interface NodeTheme {
  fill: string;
  stroke: string;
  iconColor: string;
}

interface NodeDef {
  id: NodeId;
  label: string;
  subLabel: string;
  icon: LucideIcon;
  size: { w: number; h: number };
  position: { x: number; y: number };
  theme: NodeTheme;
  tooltip: string;
}

const NODES: NodeDef[] = [
  {
    id: 'developer',
    label: 'Developer',
    subLabel: 'Your Code',
    icon: Code2,
    size: { w: 110, h: 115 },
    position: { x: 80, y: 83 },
    theme: { fill: '#1e3a5f', stroke: '#3b82f6', iconColor: 'text-blue-400' },
    tooltip: 'Your app calls our unified SDK with a single line of code',
  },
  {
    id: 'gateway',
    label: '{{PLATFORM}}',
    subLabel: 'Routing · Auth · Analytics',
    icon: Server,
    size: { w: 140, h: 140 },
    position: { x: 275, y: 70 },
    theme: { fill: '#1e293b', stroke: '#8b5cf6', iconColor: 'text-purple-400' },
    tooltip: '{{PLATFORM}}: Auth, rate limiting, routing, caching, and analytics—handled automatically',
  },
  {
    id: 'provider',
    label: 'Provider APIs',
    subLabel: 'Stripe · OpenAI · etc.',
    icon: Cloud,
    size: { w: 110, h: 115 },
    position: { x: 505, y: 83 },
    theme: { fill: '#0f172a', stroke: '#06b6d4', iconColor: 'text-cyan-400' },
    tooltip: 'Upstream APIs (Stripe, OpenAI, etc.) receive the routed request',
  },
  {
    id: 'done',
    label: 'Done',
    subLabel: '~220ms',
    icon: Check,
    size: { w: 90, h: 115 },
    position: { x: 710, y: 83 },
    theme: { fill: '#052e16', stroke: '#22c55e', iconColor: 'text-green-400' },
    tooltip: 'Response returned in ~220ms. Cached when applicable for faster repeat calls',
  },
];

interface ConnectorDef {
  d: string;
}

/** Packet waypoints along curved path - sampled from bezier curves (stable arrays for animation) */
const PACKET_CX = [195, 222, 248, 275, 345, 415, 455, 488, 505, 558, 615, 660, 688, 710];
const PACKET_CY = [140, 128, 138, 140, 140, 140, 128, 138, 140, 140, 140, 128, 138, 140];

/** Workflow-style connectors: curved bezier paths (Well-Workflow-connectors inspired) */
const CONNECTORS_WORKFLOW: ConnectorDef[] = [
  { d: 'M 195 140 C 235 110, 250 170, 275 140' },   // Developer -> Gateway
  { d: 'M 415 140 C 455 110, 450 170, 505 140' },   // Gateway -> Provider
  { d: 'M 615 140 C 655 110, 660 170, 710 140' },   // Provider -> Done
];

// ---------------------------------------------------------------------------
// Animation timing tokens
// ---------------------------------------------------------------------------

const MOTION = {
  path: { duration: 1.5, ease: 'easeInOut' as const },
  nodeReveal: { duration: 0.4, ease: 'easeOut' as const },
  nodeStagger: 0.08,
  packet: { duration: 3, ease: 'linear' as const },
  pulse: { duration: 2.2, ease: 'easeOut' as const, stagger: 0.5 },
} as const;

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function FlowNode({
  node,
  isInView,
  reduceMotion,
  delayIndex,
  filterId = 'nodeShadow',
}: {
  node: NodeDef;
  isInView: boolean;
  reduceMotion: boolean;
  delayIndex: number;
  filterId?: string;
}) {
  const Icon = node.icon;
  const isGateway = node.id === 'gateway';

  const revealVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: MOTION.nodeReveal.duration,
        ease: MOTION.nodeReveal.ease,
        delay: MOTION.nodeStagger * delayIndex,
      },
    },
  };

  const contentVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: MOTION.nodeReveal.duration,
        delay: MOTION.nodeStagger * delayIndex + 0.15,
      },
    },
  };

  return (
    <g transform={`translate(${node.position.x}, ${node.position.y})`} className="cursor-pointer">
      <title>{node.tooltip}</title>

      {/* Concentric pulse (gateway only, respects reduced motion) */}
      {isGateway && !reduceMotion && (
        <PulseRings centerX={node.size.w / 2} centerY={node.size.h / 2} isInView={isInView} />
      )}

      {/* Node shape: circle for Apinery, rect for others */}
      {isGateway ? (
        <motion.circle
          cx={node.size.w / 2}
          cy={node.size.h / 2}
          r={node.size.w / 2}
          fill={node.theme.fill}
          stroke={node.theme.stroke}
          strokeWidth={2}
          filter={`url(#${filterId})`}
          variants={revealVariants}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
        />
      ) : (
        <motion.rect
          width={node.size.w}
          height={node.size.h}
          x={0}
          y={0}
          rx={14}
          fill={node.theme.fill}
          stroke={node.theme.stroke}
          strokeWidth={2}
          filter={`url(#${filterId})`}
          variants={revealVariants}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
        />
      )}

      {/* Icon */}
      <foreignObject
        x={(node.size.w - 32) / 2}
        y={16}
        width={32}
        height={32}
        className="flex items-center justify-center"
      >
        <div
          className={`flex h-8 w-8 items-center justify-center ${node.theme.iconColor}`}
          {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as React.HTMLAttributes<HTMLDivElement>)}
        >
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
      </foreignObject>

      {/* Content */}
      <motion.g variants={contentVariants} initial="initial" animate={isInView ? 'animate' : 'initial'}>
        <text
          x={node.size.w / 2}
          y={54}
          textAnchor="middle"
          fill="white"
          fontSize={isGateway ? 13 : 12}
          fontWeight="bold"
        >
          {node.label}
        </text>
        {node.id === 'developer' && (
          <>
            <text x={node.size.w / 2} y={80} textAnchor="middle" fill="#94a3b8" fontSize={10}>
              Your Code
            </text>
            <circle cx={node.size.w / 2} cy={96} r={12} fill="#3b82f6" opacity={0.3} />
            <text x={node.size.w / 2} y={100} textAnchor="middle" fill="white" fontSize={8}>
              SDK
            </text>
          </>
        )}
        {node.id === 'gateway' && (
          <text x={node.size.w / 2} y={85} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            Routing · Auth · Analytics
          </text>
        )}
        {node.id === 'provider' && (
          <>
            <text x={node.size.w / 2} y={80} textAnchor="middle" fill="#94a3b8" fontSize={10}>
              Stripe · OpenAI · etc.
            </text>
            <text x={node.size.w / 2} y={100} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight="600">
              Response
            </text>
          </>
        )}
        {node.id === 'done' && (
          <>
            <text x={node.size.w / 2} y={80} textAnchor="middle" fill="#4ade80" fontSize={12} fontWeight="bold">
              ~220ms
            </text>
            <text x={node.size.w / 2} y={100} textAnchor="middle" fill="#94a3b8" fontSize={9}>
              cached
            </text>
          </>
        )}
      </motion.g>
    </g>
  );
}

function PulseRings({
  centerX,
  centerY,
  isInView,
}: {
  centerX: number;
  centerY: number;
  isInView: boolean;
}) {
  const rings = [
    { stroke: '#8b5cf6', strokeWidth: 1.5, opacity: 0.35, delay: 0 },
    { stroke: '#8b5cf6', strokeWidth: 1.5, opacity: 0.25, delay: MOTION.pulse.stagger },
    { stroke: '#a78bfa', strokeWidth: 1, opacity: 0.2, delay: MOTION.pulse.stagger * 2 },
  ];
  const r = Math.max(centerX, centerY) + 8;

  return (
    <>
      {rings.map((ring, i) => (
        <motion.circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={r}
          fill="none"
          stroke={ring.stroke}
          strokeWidth={ring.strokeWidth}
          initial={{ opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: [ring.opacity, 0, ring.opacity],
                  scale: [0.95, 1.35, 0.95],
                  transition: {
                    duration: MOTION.pulse.duration,
                    repeat: Infinity,
                    ease: MOTION.pulse.ease,
                    delay: ring.delay,
                  },
                }
              : { opacity: 0 }
          }
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function APIFlowDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [packetPlaying, setPacketPlaying] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const platformName = usePlatformName();

  const nodes = useMemo(
    () =>
      NODES.map((node) =>
        node.id === 'gateway'
          ? {
              ...node,
              label: platformName,
              tooltip: `${platformName}: Auth, rate limiting, routing, caching, and analytics—handled automatically`,
            }
          : node
      ),
    [platformName]
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const pathVariants = useMemo(
    () => ({
      initial: { pathLength: 0, opacity: 0.5 },
      animate: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: MOTION.path.duration, ease: MOTION.path.ease },
      },
    }),
    []
  );

  const shouldAnimatePacket = isInView && packetPlaying && !reduceMotion;

  return (
    <section
      ref={ref}
      aria-labelledby="flow-diagram-title"
    >
      {/* Inner strip: always dark so heading/subheading/button and diagram stay legible when band forces section transparent (light mode) */}
      <div className="bg-gray-900 dark:bg-gray-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h2 id="flow-diagram-title" className="section-heading mb-6 text-white">
              How Requests Flow
            </h2>
            <p className="section-subheading mx-auto mb-6 max-w-3xl text-gray-300 dark:text-gray-400">
              From your code to provider APIs in ~220ms. Auth, routing, and caching handled for you.
            </p>

            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setPacketPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
                aria-label={packetPlaying ? 'Pause request flow animation' : 'Play request flow animation'}
              >
                {packetPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {packetPlaying ? 'Pause' : 'Play'}
              </button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-gray-600 bg-gradient-to-b from-gray-800/90 to-gray-800/50 p-8 shadow-[0_0_60px_-15px_rgba(139,92,246,0.15)] ring-1 ring-white/5 sm:p-12 dark:border-gray-700 dark:from-gray-800/80 dark:to-gray-800/40"
            role="img"
            aria-label={`API request flow: Developer code through ${platformName} to Provider APIs, returning response in ~220ms`}
          >
          <div className="relative mx-auto max-w-4xl">
            <svg
              viewBox="0 0 800 280"
              className="w-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="flowGradientWorkflow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
                <filter id="connectorGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="nodeShadowWorkflow" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
                </filter>
                <filter id="packetGlowShadowWorkflow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" result="shadowed" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="shadowed" />
                  </feMerge>
                </filter>
              </defs>

              {CONNECTORS_WORKFLOW.map((conn, i) => (
                <motion.path
                  key={i}
                  d={conn.d}
                  stroke="url(#flowGradientWorkflow)"
                  strokeWidth="2.5"
                  strokeDasharray="3 6"
                  strokeLinecap="round"
                  filter="url(#connectorGlow)"
                  variants={pathVariants}
                  initial="initial"
                  animate={isInView ? 'animate' : 'initial'}
                />
              ))}

              <motion.circle
                r="6"
                fill="#60a5fa"
                filter="url(#packetGlowShadowWorkflow)"
                initial={{ cx: PACKET_CX[0], cy: PACKET_CY[0] }}
                animate={
                  shouldAnimatePacket
                    ? {
                        cx: PACKET_CX,
                        cy: PACKET_CY,
                        transition: {
                          duration: MOTION.packet.duration,
                          repeat: Infinity,
                          ease: MOTION.packet.ease,
                        },
                      }
                    : { cx: PACKET_CX[0], cy: PACKET_CY[0] }
                }
              />

              {nodes.map((node, i) => (
                <FlowNode
                  key={node.id}
                  node={node}
                  isInView={isInView}
                  reduceMotion={reduceMotion}
                  delayIndex={i + 1}
                  filterId="nodeShadowWorkflow"
                />
              ))}
            </svg>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
