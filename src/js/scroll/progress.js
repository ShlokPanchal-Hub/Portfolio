/* ==========================================================================
   READING PROGRESS RAIL
   A drawn ink line down the left edge that fills with page progress, with a
   dot per section. Progress feedback is the cheapest, strongest signal that
   there is more worth scrolling to — and an inked line fits the handmade
   vocabulary better than a flat browser-style bar would.
   ========================================================================== */

import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion.js';

const RAIL_HEIGHT = 400;

export function initProgressRail(sections) {
  if (prefersReducedMotion) return;
  if (window.matchMedia('(max-width: 1180px)').matches) return;

  const rail = buildRail(sections.length);
  document.body.appendChild(rail);

  const fill = rail.querySelector('.rail-fill');
  const marks = Array.from(rail.querySelectorAll('.rail-mark'));
  const label = rail.querySelector('.rail-label');

  const length = fill.getTotalLength();
  gsap.set(fill, { strokeDasharray: length, strokeDashoffset: length });

  // Fade the rail in once the reader has committed to scrolling — showing it
  // at rest on the hero would just be furniture.
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top-=120',
    onEnter: () => rail.classList.add('is-visible'),
    onLeaveBack: () => rail.classList.remove('is-visible')
  });

  // Measured against the document's own scroll range rather than an element.
  // Triggering off #smooth-content made the rail saturate at 100% while ~10%
  // of the page was still below the fold, because the pinned section's
  // pin-spacer is not accounted for in that element's measured bottom.
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    scrub: 0.4,
    onUpdate: (self) => {
      gsap.set(fill, { strokeDashoffset: length * (1 - self.progress) });
      if (label) label.textContent = `${Math.round(self.progress * 100)}%`;
    }
  });

  // Light the dot for whichever section currently owns the viewport.
  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => marks[index]?.classList.toggle('is-active', self.isActive)
    });
  });
}

function buildRail(markCount) {
  const rail = document.createElement('div');
  rail.className = 'reading-progress';
  rail.setAttribute('aria-hidden', 'true');

  // A slightly wavering line rather than a ruler-straight one, so it reads as
  // drawn by hand like the rest of the page furniture.
  const path = `M 7 0 C 4 ${RAIL_HEIGHT * 0.15}, 10 ${RAIL_HEIGHT * 0.3}, 7 ${RAIL_HEIGHT * 0.45} C 4 ${RAIL_HEIGHT * 0.6}, 10 ${RAIL_HEIGHT * 0.78}, 7 ${RAIL_HEIGHT}`;

  rail.innerHTML = `
    <div style="position:relative">
      <svg viewBox="0 0 14 ${RAIL_HEIGHT}" preserveAspectRatio="none">
        <path class="rail-track" d="${path}" />
        <path class="rail-fill" d="${path}" />
      </svg>
      <div class="rail-marks">
        ${Array.from({ length: markCount }, () => '<span class="rail-mark"></span>').join('')}
      </div>
    </div>
    <span class="rail-label">0%</span>
  `;

  return rail;
}
