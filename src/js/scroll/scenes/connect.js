/* ==========================================================================
   SCENE — CHECKLIST + CONNECT

   The connect heading scrub-scales up on approach so the page arrives rather
   than simply stopping. An ending that grows is the last reason to keep
   scrolling instead of bailing out at the checklist.
   ========================================================================== */

import { gsap, mm, BREAKPOINTS, prefersReducedMotion } from '../../motion.js';

export function initChecklistScene() {
  if (prefersReducedMotion) return;

  const box = document.querySelector('.checklist-card-box');
  if (!box) return;

  gsap.from('.check-item', {
    x: -30,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: box, start: 'top 80%' }
  });

  gsap.from('.sketch-reveal-box', {
    scale: 0.88,
    rotation: 3,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: { trigger: box, start: 'top 78%' }
  });
}

export function initConnectScene() {
  if (prefersReducedMotion) return;

  const banner = document.querySelector('.connect-hero-banner');
  if (!banner) return;

  mm.add(BREAKPOINTS.isDesktop, () => {
    gsap.fromTo('.connect-heading',
      { scale: 0.82, y: 30 },
      {
        scale: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: banner,
          start: 'top 95%',
          end: 'center 62%',
          scrub: 0.6
        }
      }
    );
  });

  gsap.from(banner, {
    y: 50,
    autoAlpha: 0,
    duration: 0.85,
    ease: 'power3.out',
    scrollTrigger: { trigger: banner, start: 'top 88%' }
  });

  gsap.from('.social-btn', {
    y: 18,
    autoAlpha: 0,
    duration: 0.45,
    stagger: 0.07,
    scrollTrigger: { trigger: '.social-links-grid', start: 'top 92%' }
  });

  gsap.from('.footer-bottom-notes', {
    autoAlpha: 0,
    y: 20,
    duration: 0.6,
    scrollTrigger: { trigger: '.footer-bottom-notes', start: 'top 95%' }
  });
}
