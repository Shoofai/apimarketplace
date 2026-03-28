import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.1,
    },
  },
};

/** Hero stagger: first 2 children (badge + headline) appear instantly */
export const heroStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.1,
    },
  },
};

/** Variant that starts visible (no animation delay for critical content) */
export const noDelay: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
};

export const scaleOnHover: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const defaultTransition = {
  duration: 0.5,
  ease: 'easeOut',
};

export const cardFlip: Variants = {
  initial: { rotateY: 0 },
  flipped: { rotateY: 180 },
};

export const sparkleBurst = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/** Card scale-in: subtle grow + fade for grid items */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.95 },
};

/** Faster stagger for snappier grid reveals */
export const staggerFast: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/** Refined hover: subtle scale for buttons/cards */
export const hoverLift: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.3, ease: 'easeOut' } },
  tap: { scale: 0.98 },
};
