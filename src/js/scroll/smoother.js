/* ==========================================================================
   SCROLLSMOOTHER
   Decouples scrolling from the browser so the page carries weight and so
   data-speed parallax becomes available to the scenes.

   Not initialised at all for reduced-motion visitors — for them the page
   scrolls natively, which is exactly what they asked for.
   ========================================================================== */

import { ScrollSmoother, ScrollTrigger, prefersReducedMotion } from '../motion.js';

let smoother = null;

export function initSmoother() {
  if (prefersReducedMotion) return null;
  if (!document.getElementById('smooth-wrapper')) return null;

  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.1,
    effects: true,          // enables data-speed / data-lag on any element
    smoothTouch: false,     // touch devices already have native momentum
    normalizeScroll: true,  // keeps Draggable coordinates honest inside the
                            // transformed content wrapper
    ignoreMobileResize: true
  });

  // Images finish decoding after first paint and change every trigger
  // position below them. Without this the scenes fire at the wrong scroll.
  window.addEventListener('load', () => ScrollTrigger.refresh());

  return smoother;
}

export function getSmoother() {
  return smoother;
}

/**
 * Single entry point for anchor navigation. Routes through ScrollSmoother
 * when it is running and falls back to native smooth scrolling when it is
 * not (reduced motion), so both paths behave the same from the caller's view.
 */
export function scrollToTarget(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (smoother) {
    smoother.scrollTo(el, true, 'top 80px');
  } else {
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }
}
