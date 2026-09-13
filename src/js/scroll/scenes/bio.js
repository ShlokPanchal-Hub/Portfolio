/* ==========================================================================
   SCENE — BIO DOSSIER
   The card is pulled up out of its folder tab rather than faded in, so the
   folder metaphor does something instead of just sitting there as decoration.
   ========================================================================== */

import { gsap, prefersReducedMotion } from '../../motion.js';

export function initBioScene() {
  if (prefersReducedMotion) return;

  const card = document.querySelector('.bio-folder-card');
  if (!card) return;

  const tab = card.querySelector('.folder-tab');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.bio-card-wrapper',
      start: 'top 80%'
    }
  });

  if (tab) {
    tl.from(tab, {
      y: 18,
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power2.out'
    });
  }

  tl.from(card, {
    y: 60,
    scaleY: 0.96,
    autoAlpha: 0,
    transformOrigin: 'top center',
    duration: 0.85,
    ease: 'power3.out'
  }, tab ? '-=0.2' : 0)
    .from('.bio-portrait-container', {
      scale: 0.9,
      rotation: -3,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'back.out(1.3)'
    }, '-=0.5')
    .from('.bio-pillar-box', {
      y: 24,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.12
    }, '-=0.4');
}
