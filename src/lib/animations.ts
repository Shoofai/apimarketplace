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
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
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
