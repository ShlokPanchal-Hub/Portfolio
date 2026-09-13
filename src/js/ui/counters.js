/* ==========================================================================
   METRIC COUNTERS
   The numbers are the strongest content on the page and they were sitting
   inert inside <strong> tags. Counting them up on entry turns each one into
   a small event, and they are cheap: one tween per number.

   Markup contract:
     <span class="metric" data-count-to="70" data-suffix="%">70%</span>
     <span class="metric" data-count-to="600" data-suffix="K+">600K+</span>

   Scroll position alone is the wrong gate. A counter triggered purely on
   "this span reached 85% of the viewport" can finish its whole count while
   the card around it is still transparent — measured at three of eight
   metrics: both postcard numbers counted at card opacity 0 and 0.12, and the
   wristband number counted while its bullet was still at opacity 0, because
   that bullet is revealed by a pinned scrub rather than by scroll position.

   So the viewport is only the first gate; the count does not start until the
   number is actually painted.
   ========================================================================== */

import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion.js';

const VISIBLE_ENOUGH = 0.9;
const MAX_WAIT_FRAMES = 240; // ~4s, so a never-revealed element still resolves

export function initCounters() {
  const metrics = gsap.utils.toArray('[data-count-to]');
  if (!metrics.length) return;

  metrics.forEach((el) => {
    const target = parseFloat(el.dataset.countTo);
    if (Number.isNaN(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);

    // Large counts need thousands separators or "50000" reads as noise.
    const format = (value) => value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    const render = (value) => {
      el.textContent = `${prefix}${format(value)}${suffix}`;
    };

    // Reduced motion still gets the number, just without the count.
    if (prefersReducedMotion) {
      render(target);
      return;
    }

    const counter = { value: 0 };

    const tween = gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      snap: { value: decimals > 0 ? 10 ** -decimals : 1 },
      paused: true,
      // The markup already holds the final number. Zeroing it at init would
      // leave every metric below the fold reading "0%" until its trigger
      // fires — and stranded at 0 entirely if a tween never runs.
      onStart: () => render(0),
      onUpdate: () => render(counter.value)
    });

    gsap.set(el, { display: 'inline-block' }); // so opacity is measurable

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => whenPainted(el, () => tween.play())
    });
  });
}

/**
 * Waits until the element is genuinely on screen and opaque before running
 * `start`. Covers both the fade-in cards and the pinned wristband, whose
 * bullets are revealed by scrub progress rather than by scroll position.
 */
function whenPainted(el, start) {
  let frames = 0;

  const check = () => {
    frames += 1;

    const rect = el.getBoundingClientRect();
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    const opaque = effectiveOpacity(el) >= VISIBLE_ENOUGH;

    if ((onScreen && opaque) || frames > MAX_WAIT_FRAMES) {
      start();
      return;
    }

    requestAnimationFrame(check);
  };

  requestAnimationFrame(check);
}

/** Opacity is inherited multiplicatively, so an opaque span inside a fading
 *  card is still invisible. Walk up and multiply. */
function effectiveOpacity(el) {
  let opacity = 1;
  let node = el;

  while (node && node !== document.body) {
    opacity *= parseFloat(getComputedStyle(node).opacity) || 0;
    if (opacity < VISIBLE_ENOUGH) return opacity;
    node = node.parentElement;
  }

  return opacity;
}
