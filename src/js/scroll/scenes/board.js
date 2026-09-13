/* ==========================================================================
   SCENE — CUTTING BOARD
   The mat arrives first and empty, then the items tumble onto it. Landing
   items on an already-visible surface reads as things being set down; fading
   the whole section in at once reads as a slide.
   ========================================================================== */

import { gsap, prefersReducedMotion, BREAKPOINTS } from '../../motion.js';

export function initBoardScene() {
  if (prefersReducedMotion) return;
  // Hidden below 861px (board.css) — ScrollTriggers on a display:none section
  // measure as zero and only pollute the refresh pass.
  if (!window.matchMedia(BREAKPOINTS.isDesktop).matches) return;

  const mat = document.querySelector('.cutting-mat');
  if (!mat) return;

  gsap.from(mat, {
    scaleY: 0.9,
    autoAlpha: 0,
    transformOrigin: 'center bottom',
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: mat, start: 'top 85%' }
  });

  const items = gsap.utils.toArray('.draggable-item');

  // fromTo, not from: a staggered `from` tween re-reads each target's
  // current value as its END on invalidation, and because immediateRender
  // already wrote the start value there, every target animated to its own
  // start and froze. Explicit end values cannot be re-derived.
  gsap.fromTo(items,
    {
      y: () => gsap.utils.random(-160, -90),
      rotation: () => gsap.utils.random(-25, 25),
      autoAlpha: 0
    },
    {
      // The rest rotation board.js gives each item, not a flat 0.
      y: 0,
      rotation: (i, el) => parseFloat(el.dataset.restRotation || '0'),
      autoAlpha: 1,
      duration: 0.9,
      ease: 'back.out(1.4)',
      stagger: { each: 0.07, from: 'random' },
      scrollTrigger: { trigger: mat, start: 'top 72%' }
    }
  );

  // fromTo, not from: a staggered `from` tween re-reads each target's
  // current value as its END on invalidation, and because immediateRender
  // already wrote the start value there, every target animated to its own
  // start and froze. Explicit end values cannot be re-derived.
  gsap.fromTo('.cutting-board-controls .board-btn',
    { y: 16, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: { trigger: '.cutting-board-controls', start: 'top 92%' }
    }
  );
}
