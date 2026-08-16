/* ==========================================================================
   GSAP & SCROLLTRIGGER ANIMATIONS
   Includes Hero Scrapbook Convergence, SVG Scribble Draw-in, and Parallax
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  initHeroEntrance();
  initScrapbookScrollConvergence();
  initScrollTriggerScribbles();
  initParallaxArtefacts();
});

/**
 * 1. Hero Initial Entrance Animation
 */
function initHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

  tl.from('.site-header', {
    y: -40,
    opacity: 0,
    duration: 0.8
  })
  .from('.hero-supertitle', {
    scale: 0.8,
    opacity: 0,
    rotation: -10,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.4')
  .from('.hero-title', {
    y: 35,
    opacity: 0,
    duration: 0.9
  }, '-=0.4')
  .from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.8
  }, '-=0.6')
  .from('.hero-cta-group', {
    y: 20,
    opacity: 0,
    duration: 0.7
  }, '-=0.5')
  .from('.hero-floating-elements .float-card', {
    scale: 0,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'back.out(1.5)'
  }, '-=0.6');
}

/**
 * 2. Natural Layered Scrapbook Parallax on Scroll
 * Floating polaroids, post-its, and stamps drift smoothly with organic depth as the page scrolls.
 * No awkward pinning or blank dead space.
 */
function initScrapbookScrollConvergence() {
  const mm = gsap.matchMedia();

  mm.add('(min-width: 860px)', () => {
    // Subtle organic parallax depth on scroll
    gsap.to('.card-polaroid-faiss', {
      y: 60,
      rotation: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    gsap.to('.card-polaroid-rl', {
      y: 80,
      rotation: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    gsap.to('.card-postit-beliefs', {
      y: -40,
      rotation: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4
      }
    });

    gsap.to('.card-stamp-tech', {
      y: -50,
      rotation: -5,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    return () => {
      gsap.set(['.card-polaroid-faiss', '.card-polaroid-rl', '.card-postit-beliefs', '.card-stamp-tech'], { clearProps: 'all' });
    };
  });
}

/**
 * 3. Hand-Drawn SVG Scribble Draw-In on Scroll
 */
function initScrollTriggerScribbles() {
  // Animate any SVG paths with class .scribble-draw on scroll
  const scribbles = document.querySelectorAll('.scribble-draw');
  scribbles.forEach(path => {
    const length = path.getTotalLength ? path.getTotalLength() : 300;
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: path,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/**
 * 4. Parallax Floating Cards in Work Journey
 */
function initParallaxArtefacts() {
  const artefacts = document.querySelectorAll('.journey-artefacts-list > *');
  
  artefacts.forEach((artefact, idx) => {
    gsap.from(artefact, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: artefact,
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    });
  });
}
