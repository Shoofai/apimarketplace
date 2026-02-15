'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Code2, Server, Cloud, Check, Play, Pause, LucideIcon } from 'lucide-react';

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
  /** Extra content for technical view (gateway only) */
  technicalContent?: { badge?: string; detail?: string };
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
    label: 'Apinery',
    subLabel: 'Routing · Auth · Analytics',
    icon: Server,
    size: { w: 140, h: 140 },
    position: { x: 275, y: 70 },
    theme: { fill: '#1e293b', stroke: '#8b5cf6', iconColor: 'text-purple-400' },
    tooltip: 'Apinery: Auth, rate limiting, routing, caching, and analytics—handled automatically',
    technicalContent: {
      badge: 'Rate Limit · Auth · Cache',
      detail: 'REST · GraphQL · WebSocket',
    },
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

const CONNECTORS: ConnectorDef[] = [
  { d: 'M 195 140 L 275 140' },  // Developer -> Gateway
  { d: 'M 415 140 L 500 140' },  // Gateway -> Provider
  { d: 'M 615 140 L 705 140' },  // Provider -> Done
];

/** Packet path waypoints (x positions at y=140) - ball runs along dotted line */
const PACKET_WAYPOINTS = [130, 275, 345, 500, 558, 705, 755];

// ---------------------------------------------------------------------------
// Animation timing tokens
// ---------------------------------------------------------------------------

const MOTION = {
  path: { duration: 1.5, ease: 'easeInOut' as const },
  nodeReveal: { duration: 0.4, ease: 'easeOut' as const },
  nodeStagger: 0.08,
  packet: { duration: 3, ease: 'linear' as const },
  pulse: { duration: 2.2, ease: 'easeOut' as const, stagger: 0.5 },
  modeSwitch: { duration: 0.2 },
} as const;

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function FlowNode({
  node,
  viewMode,
  isInView,
  reduceMotion,
  delayIndex,
}: {
  node: NodeDef;
  viewMode: 'simple' | 'technical';
  isInView: boolean;
  reduceMotion: boolean;
  delayIndex: number;
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

  const showTechnical = viewMode === 'technical' && node.technicalContent;

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
          filter="url(#nodeShadow)"
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
          filter="url(#nodeShadow)"
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
        <AnimatePresence mode="wait">
          {showTechnical ? (
            <motion.g
              key="technical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.modeSwitch.duration }}
            >
              <rect
                x={16}
                y={isGateway ? 62 : 68}
                width={node.size.w - 32}
                height={22}
                rx={6}
                fill="#334155"
              />
              <text x={node.size.w / 2} y={isGateway ? 77 : 84} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                {node.technicalContent!.badge}
              </text>
              <rect
                x={24}
                y={isGateway ? 90 : 96}
                width={node.size.w - 48}
                height={18}
                rx={6}
                fill="#475569"
              />
              <text x={node.size.w / 2} y={isGateway ? 104 : 110} textAnchor="middle" fill="#64748b" fontSize={8}>
                {node.technicalContent!.detail}
              </text>
            </motion.g>
          ) : (
            <motion.g
              key="simple"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.modeSwitch.duration }}
            >
              {node.id === 'developer' && (
                <>
                  <text x={node.size.w / 2} y={80} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                    Your Code
                  </text>
                  <circle
                    cx={node.size.w / 2}
                    cy={96}
                    r={12}
                    fill="#3b82f6"
                    opacity={0.3}
                  />
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
          )}
        </AnimatePresence>
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

const PROTOCOLS = [
  { id: 'rest', name: 'REST', label: 'REST (HTTP)', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { id: 'graphql', name: 'GraphQL', label: 'GraphQL', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
  { id: 'ws', name: 'WebSocket', label: 'WebSocket', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300' },
] as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function APIFlowDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [viewMode, setViewMode] = useState<'simple' | 'technical'>('simple');
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [packetPlaying, setPacketPlaying] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

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
      className="bg-gray-900 py-24 dark:bg-gray-950 sm:py-32"
      aria-labelledby="flow-diagram-title"
    >
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
          <p className="section-subheading mx-auto mb-8 max-w-3xl text-gray-300 dark:text-gray-400">
            From your code to provider APIs in ~220ms. Auth, routing, and caching handled for you—see the journey.
          </p>

          {/* View mode toggle */}
          <div className="mb-4 inline-flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/60 p-1.5">
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              aria-pressed={viewMode === 'simple'}
              aria-label="Switch to Simple View"
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === 'simple'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Simple View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('technical')}
              aria-pressed={viewMode === 'technical'}
              aria-label="Switch to Technical View"
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === 'technical'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Technical View
            </button>
          </div>

          {/* Play/Pause packet animation */}
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
          className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-800/80 to-gray-800/40 p-8 shadow-[0_0_60px_-15px_rgba(59,130,246,0.12)] sm:p-12 dark:border-gray-800"
          role="img"
          aria-label="API request flow: Developer code through Apinery to Provider APIs, returning response in ~220ms"
        >
          <div className="relative mx-auto max-w-4xl">
            <svg
              viewBox="0 0 800 280"
              className="w-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                </linearGradient>
                <filter id="nodeShadow" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
                </filter>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="packetGlowShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" result="shadowed" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="shadowed" />
                  </feMerge>
                </filter>
              </defs>

              {/* Layer 1: Connectors - dotted line, ball runs along path */}
              {CONNECTORS.map((conn, i) => (
                <motion.path
                  key={i}
                  d={conn.d}
                  stroke="url(#flowGradient)"
                  strokeWidth="2"
                  strokeDasharray="2 6"
                  strokeLinecap="round"
                  variants={pathVariants}
                  initial="initial"
                  animate={isInView ? 'animate' : 'initial'}
                />
              ))}

              {/* Layer 2: Packet - runs along dotted line with glow and shadow */}
              <motion.circle
                r="6"
                fill="#60a5fa"
                filter="url(#packetGlowShadow)"
                cy={140}
                initial={{ cx: PACKET_WAYPOINTS[0] }}
                animate={
                  shouldAnimatePacket
                    ? {
                        cx: PACKET_WAYPOINTS,
                        transition: {
                          duration: MOTION.packet.duration,
                          repeat: Infinity,
                          ease: MOTION.packet.ease,
                        },
                      }
                    : { cx: PACKET_WAYPOINTS[0] }
                }
              />

              {/* Layer 3: Nodes */}
              {NODES.map((node, i) => (
                <FlowNode
                  key={node.id}
                  node={node}
                  viewMode={viewMode}
                  isInView={isInView}
                  reduceMotion={reduceMotion}
                  delayIndex={i + 1}
                />
              ))}
            </svg>
          </div>

          {/* Protocol badges - interactive */}
          {viewMode === 'technical' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              {PROTOCOLS.map((proto, i) => (
                <motion.button
                  key={proto.id}
                  type="button"
                  onClick={() => setSelectedProtocol(selectedProtocol === proto.id ? null : proto.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  aria-pressed={selectedProtocol === proto.id}
                  aria-label={`${proto.label} - Click to highlight`}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedProtocol === proto.id
                      ? `${proto.color} ring-2 ring-white/40 ring-offset-2 ring-offset-gray-900`
                      : 'border-gray-600 bg-gray-800/80 text-gray-300 hover:border-gray-500 hover:bg-gray-700/80 hover:text-white'
                  }`}
                >
                  {proto.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
