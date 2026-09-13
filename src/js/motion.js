/* ==========================================================================
   MOTION CORE
   The only place in the codebase that registers a GSAP plugin, and the only
   place that decides what "reduced motion" means. Every scene imports from
   here so there is exactly one source of truth for both.
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, InertiaPlugin, Observer);

gsap.defaults({
  duration: 0.6,
  ease: 'power2.out'
});

/** True when the visitor has asked their OS for less motion. */
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Breakpoints shared by every scene, so "desktop" means the same thing
 * everywhere and a single revert tears the whole system down cleanly.
 *
 * `hasRoomToPin` guards the one pinned section: pinning inside a short
 * viewport traps the reader in a scroll region they cannot see the end of.
 */
export const BREAKPOINTS = {
  isDesktop: '(min-width: 861px)',
  isMobile: '(max-width: 860px)',
  hasRoomToPin: '(min-width: 861px) and (min-height: 700px)',
  // The exact inverse of hasRoomToPin. Kept next to it so the pinned scene and
  // its fallback cannot drift apart the way two hand-typed strings would.
  noRoomToPin: '(max-width: 860px), (max-height: 699px)',
  reduceMotion: '(prefers-reduced-motion: reduce)'
};

/** One shared matchMedia context for the whole site. */
export const mm = gsap.matchMedia();

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Draggable, InertiaPlugin, Observer };
