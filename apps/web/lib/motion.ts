/**
 * Lustre Motion Configuration
 *
 * Motion v12 (formerly Framer Motion) — React integration.
 * Import `m` from 'motion/react' and wrap your app in <LazyMotion>.
 *
 * The `domAnimation` feature bundle from 'motion/react' covers:
 * HTML/SVG animations, transforms, spring physics, variants, AnimatePresence.
 * Use `domMax` if you need layout animations or advanced projection.
 *
 * Usage:
 *   import { LazyMotion, domAnimation } from 'motion/react'
 *   <LazyMotion features={domAnimation} strict>
 *     <App />
 *   </LazyMotion>
 *
 *   // In components — use `m` not `motion` for tree-shaking:
 *   import { m } from 'motion/react'
 *   <m.div variants={slideUp} initial="initial" animate="animate" />
 */

export { domAnimation as loadMotionFeatures } from 'motion/react'

/* ----------------------------------------------------------
   Spring configs
   Pass these to the `transition` prop on any Motion element.

   Example:
     <m.div
       animate={{ scale: 1.05 }}
       transition={springs.bouncy}
     />
   ---------------------------------------------------------- */
export const springs = {
  /** Default — snappy and responsive. Buttons, toggles, hover states. */
  default: { type: 'spring' as const, stiffness: 300, damping: 20 },

  /** Soft — gentle entrance. Page content, cards, images loading in. */
  soft: { type: 'spring' as const, stiffness: 200, damping: 25 },

  /** Bouncy — playful overshoot. Likes, matches, badges, celebrations. */
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },

  /** Snappy — authoritative, immediate. Menus, dropdowns, command palette. */
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
} as const

/* ----------------------------------------------------------
   Common animation variants
   Use with initial / animate / exit props.

   Example (entrance only):
     <m.section variants={slideUp} initial="initial" animate="animate" />

   Example (with AnimatePresence for exit):
     <AnimatePresence>
       {visible && (
         <m.div
           key="modal"
           variants={scaleIn}
           initial="initial"
           animate="animate"
           exit="initial"
           transition={springs.soft}
         />
       )}
     </AnimatePresence>
   ---------------------------------------------------------- */

/** Fade — opacity only. Overlays, tooltips, subtle reveals. */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
} as const

/** Slide up — content enters from slight below. Cards, modals, sheets. */
export const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} as const

/** Slide down — content enters from slight above. Dropdowns, menus. */
export const slideDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
} as const

/** Scale in — grows from 95% to full size. Modals, popovers, toasts. */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
} as const

/** Slide in from left — drawers, panels, staggered list items. */
export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
} as const

/** Slide in from right — back navigation, secondary panels. */
export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
} as const

/* ----------------------------------------------------------
   Stagger container
   Apply to a parent wrapping multiple `m.` children to
   stagger their entrances automatically.

   Example:
     <m.ul variants={staggerContainer} initial="initial" animate="animate">
       {items.map(item => (
         <m.li key={item.id} variants={slideUp} transition={springs.soft} />
       ))}
     </m.ul>
   ---------------------------------------------------------- */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const
