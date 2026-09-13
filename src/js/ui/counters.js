/* ==========================================================================
   METRIC COUNTERS
   The numbers are the strongest content on the page and they were sitting
   inert inside <strong> tags. Counting them up on entry turns each one into
   a small event, and they are cheap: one tween per number.

   Markup contract:
     <span class="metric" data-count-to="70" data-suffix="%">70%</span>
     <span class="metric" data-count-to="600" data-suffix="K+">600K+</span>
   ========================================================================== */

import { gsap, prefersReducedMotion } from '../motion.js';

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

    gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      snap: { value: decimals > 0 ? 10 ** -decimals : 1 },
      // The markup already holds the final number. Zeroing it at init would
      // leave every metric below the fold reading "0%" until its trigger
      // fires — and stranded at 0 entirely if a tween never runs.
      onStart: () => render(0),
      onUpdate: () => render(counter.value),
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });
}
