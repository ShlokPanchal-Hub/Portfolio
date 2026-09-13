/* ==========================================================================
   SCENE — WORK JOURNEY

   The rule this file exists to enforce: no two artefacts arrive the same way.
   Previously all four shared one `y: 60, opacity: 0` fade, which the reader
   can predict after seeing two of them — and a predicted reveal is a reason
   to stop scrolling.

   1. Luggage tag   — swings down from its grommet like a real hanging tag
   2. Boarding pass — assembles from two halves meeting at the perforation
   3. Wristband     — pins and reveals line by line: the deliberate slow-down
   4. Postcards     — batch in from the edges, postmarks stamped down on top
   ========================================================================== */

import { gsap, ScrollTrigger, mm, BREAKPOINTS, prefersReducedMotion } from '../../motion.js';

export function initWorkScene() {
  if (prefersReducedMotion) return;

  drawSectionUnderlines();
  luggageTag();
  boardingPass();
  wristband();
  postcards();
}

/* --------------------------------------------------------------------------
   Section title underlines draw themselves on entry.
   -------------------------------------------------------------------------- */
function drawSectionUnderlines() {
  document.querySelectorAll('.title-underline path').forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: path.closest('.section-header') || path,
        start: 'top 78%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/* --------------------------------------------------------------------------
   1. LUGGAGE TAG — hangs from the grommet, so it swings rather than fades.
   -------------------------------------------------------------------------- */
function luggageTag() {
  const tag = document.querySelector('.artefact-luggage-tag');
  if (!tag) return;

  // Pivot at the grommet (left: 62px + half its 20px width, top: 14px + half)
  gsap.set(tag, { transformOrigin: '72px 24px' });

  gsap.from(tag, {
    rotation: -7,
    y: -40,
    autoAlpha: 0,
    duration: 1.3,
    ease: 'elastic.out(1, 0.55)',
    scrollTrigger: {
      trigger: tag,
      start: 'top 82%',
      toggleActions: 'play none none reverse'
    }
  });

  const string = tag.querySelector('.tag-string-loop');
  if (string) {
    gsap.from(string, {
      scaleY: 0,
      transformOrigin: 'bottom center',
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: tag, start: 'top 82%' }
    });
  }
}

/* --------------------------------------------------------------------------
   2. BOARDING PASS — the two halves slide together as you scroll, so the
   card finishes assembling exactly as it reaches reading position.
   -------------------------------------------------------------------------- */
function boardingPass() {
  const pass = document.querySelector('.artefact-boarding-pass');
  if (!pass) return;

  mm.add(BREAKPOINTS.isDesktop, () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pass,
        start: 'top 90%',
        end: 'top 45%',
        scrub: 0.8
      }
    });

    tl.from('.pass-main-stub', { xPercent: -12, autoAlpha: 0, ease: 'none' }, 0)
      .from('.pass-tear-stub', { xPercent: 18, autoAlpha: 0, ease: 'none' }, 0);
  });

  mm.add(BREAKPOINTS.isMobile, () => {
    gsap.from(pass, {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      scrollTrigger: { trigger: pass, start: 'top 85%' }
    });
  });

  // The flight-info cells tick in like a departures board.
  gsap.from('.pass-info-cell', {
    y: 14,
    autoAlpha: 0,
    duration: 0.5,
    stagger: 0.08,
    scrollTrigger: {
      trigger: '.pass-flight-info-grid',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
}

/* --------------------------------------------------------------------------
   3. WRISTBAND — the one pinned moment on the page. Pinning is a strong
   device and loses its force if repeated, so exactly one section gets it.
   Disabled on short viewports, where a pin traps the reader.
   -------------------------------------------------------------------------- */
function wristband() {
  const band = document.querySelector('.artefact-wristband');
  if (!band) return;

  const bullets = band.querySelectorAll('.wristband-bullets li');
  const preview = band.querySelector('.wristband-preview');

  mm.add(BREAKPOINTS.hasRoomToPin, () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: band,
        start: 'center center',
        end: '+=900',
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        anticipatePin: 1
      }
    });

    tl.from('.wristband-title', { y: 24, autoAlpha: 0, ease: 'none' }, 0)
      .from(bullets, {
        x: -28,
        autoAlpha: 0,
        stagger: 0.6,
        ease: 'none'
      }, 0.2)
      .from('.wristband-tech-row .tag-tech-badge', {
        scale: 0.6,
        autoAlpha: 0,
        stagger: 0.12,
        ease: 'none'
      }, '>-0.3');

    if (preview) {
      // Counter-motion against the text keeps the pinned frame alive.
      gsap.fromTo(preview,
        { y: 40, rotation: -4 },
        {
          y: -40,
          rotation: 2,
          ease: 'none',
          scrollTrigger: {
            trigger: band,
            start: 'center center',
            end: '+=900',
            scrub: 0.7
          }
        }
      );
    }

    return () => gsap.set([band, bullets, preview], { clearProps: 'all' });
  });

  // No pin where there is no room for one.
  mm.add(`(max-width: 860px), (max-height: 699px)`, () => {
    gsap.from(band, {
      y: 48,
      autoAlpha: 0,
      duration: 0.8,
      scrollTrigger: { trigger: band, start: 'top 85%' }
    });

    gsap.from(bullets, {
      x: -20,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.12,
      scrollTrigger: { trigger: band, start: 'top 70%' }
    });
  });
}

/* --------------------------------------------------------------------------
   4. POSTCARDS — batched in from the edges, then the postmark thumps down
   the way a rubber stamp actually lands.
   -------------------------------------------------------------------------- */
function postcards() {
  const cards = gsap.utils.toArray('.postcard-card');
  if (!cards.length) return;

  ScrollTrigger.batch(cards, {
    start: 'top 86%',
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 56,
        rotation: (i) => (i % 2 === 0 ? -2.5 : 2.5),
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: { each: 0.14, from: 'edges' },
        overwrite: true
      });
    }
  });

  document.querySelectorAll('.postmark-circle').forEach((mark) => {
    gsap.from(mark, {
      scale: 2.4,
      autoAlpha: 0,
      rotation: -60,
      duration: 0.45,
      ease: 'back.out(2.2)',
      scrollTrigger: {
        trigger: mark.closest('.postcard-card'),
        start: 'top 70%'
      }
    });
  });

  document.querySelectorAll('.postage-stamp').forEach((stamp) => {
    gsap.from(stamp, {
      scale: 0.4,
      autoAlpha: 0,
      duration: 0.4,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: stamp.closest('.postcard-card'),
        start: 'top 74%'
      }
    });
  });
}
