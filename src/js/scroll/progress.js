/* ==========================================================================
   READING PROGRESS RAIL & MOBILE INK INDICATOR
   A drawn ink rail on desktop and a sleek top bar on mobile/tablet viewports.
   ========================================================================== */

import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion.js';

const RAIL_HEIGHT = 400;

/**
 * Reading position is information, not decoration, so this runs for
 * reduced-motion visitors too. What they lose is the 0.3s scrub smoothing on
 * the fill, not the indicator itself — the rail still tracks scroll, it just
 * snaps to the true value each update instead of easing toward it.
 */
export function initProgressRail(sections) {

  // 1. Build desktop vertical rail
  const rail = buildRail(sections.length);
  document.body.appendChild(rail);

  // 2. Build mobile horizontal top indicator
  const mobileRail = document.createElement('div');
  mobileRail.className = 'mobile-reading-progress';
  mobileRail.setAttribute('aria-hidden', 'true');
  const mobileFill = document.createElement('div');
  mobileFill.className = 'mobile-reading-progress-bar';
  mobileRail.appendChild(mobileFill);
  document.body.appendChild(mobileRail);

  const fill = rail.querySelector('.rail-fill');
  const marks = Array.from(rail.querySelectorAll('.rail-mark'));
  const label = rail.querySelector('.rail-label');

  const length = fill.getTotalLength();
  gsap.set(fill, { strokeDasharray: length, strokeDashoffset: length });

  // Fade progress indicators in once the visitor scrolls past the hero
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top-=100',
    onEnter: () => {
      rail.classList.add('is-visible');
      mobileRail.style.opacity = '1';
    },
    onLeaveBack: () => {
      rail.classList.remove('is-visible');
      mobileRail.style.opacity = '0';
    }
  });

  // Smooth scroll sync across all viewports
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    // Smoothing is the only part of this that is motion for its own sake.
    scrub: prefersReducedMotion ? false : 0.3,
    onUpdate: (self) => {
      gsap.set(fill, { strokeDashoffset: length * (1 - self.progress) });
      if (label) label.textContent = `${Math.round(self.progress * 100)}%`;
      gsap.set(mobileFill, { scaleX: self.progress });
    }
  });

  // Section chapter dot activation
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
