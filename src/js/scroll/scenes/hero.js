/* ==========================================================================
   SCENE — HERO
   Lines rise out of their own baseline, the scrapbook cards settle in, then
   the whole stack recedes as the work section takes over. The four cards
   carry different data-speed values so they separate in depth on the way out.
   ========================================================================== */

import { gsap, ScrollTrigger, SplitText, mm, BREAKPOINTS, prefersReducedMotion } from '../../motion.js';

export function initHeroScene() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  if (prefersReducedMotion) {
    gsap.set('.hero-floating-elements .float-card', { autoAlpha: 1 });
    return;
  }

  // Splitting before webfonts land measures the fallback font and puts the
  // line breaks in the wrong places.
  document.fonts.ready.then(() => {
    buildEntrance(title);
    buildScrollOut();
    buildScrollCue();
  });
}

function buildEntrance(title) {
  const split = new SplitText(title, {
    type: 'lines',
    linesClass: 'split-line',
    mask: 'lines',
    // Without this the line masks keep the boundaries measured at load, so
    // rotating a phone reflows the title inside stale masks and clips it.
    autoSplit: true
  });

  // SplitText's mask wrappers are what we animate against; if the browser
  // cannot produce them, fall back to animating the lines directly.
  const lines = split.lines;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.site-header', { y: -40, autoAlpha: 0, duration: 0.8 })
    .from('.hero-supertitle', {
      scale: 0.8,
      autoAlpha: 0,
      rotation: -10,
      duration: 0.6,
      ease: 'expo.out'
    }, '-=0.4')
    .from(lines, {
      yPercent: 115,
      duration: 0.9,
      stagger: 0.11,
      ease: 'power4.out'
    }, '-=0.3')
    .from('.hero-subtitle', { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.55')
    .from('.hero-cta-group', { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.5')
    .from('.hero-floating-elements .float-card', {
      scale: 0,
      autoAlpha: 0,
      duration: 0.8,
      stagger: { each: 0.1, from: 'random' },
      ease: 'power4.out'
    }, '-=0.65')
    .from('.scroll-cue', { autoAlpha: 0, y: -10, duration: 0.6 }, '-=0.2');

  // A refresh once the split settles keeps every downstream trigger honest.
  ScrollTrigger.refresh();
}

/**
 * The hero does not simply scroll away — it recedes, which reads as the page
 * moving underneath a fixed camera rather than content sliding past.
 */
function buildScrollOut() {
  mm.add(BREAKPOINTS.isDesktop, () => {
    gsap.to('.hero-main-stack', {
      y: 80,
      scale: 0.94,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    // Each card also rotates slightly on the way out so the group does not
    // move as one rigid plane.
    const drift = [
      ['.card-polaroid-faiss', -9],
      ['.card-polaroid-rl', 8],
      ['.card-postit-beliefs', 4],
      ['.card-stamp-tech', -6]
    ];

    drift.forEach(([selector, rotation]) => {
      gsap.to(selector, {
        rotation,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    });
  });
}

function buildScrollCue() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;

  gsap.to(cue.querySelector('svg'), {
    y: 6,
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // Once they have started scrolling, the instruction has done its job.
  gsap.to(cue, {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'top top-=160',
      scrub: true
    }
  });
}
