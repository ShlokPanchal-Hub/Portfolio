/* ==========================================================================
   BIO MASK PEEL

   The mask is a real <button>, so the reveal has three routes: drag it aside
   with a pointer, click it, or press Enter/Space. Previously it was a div
   that only responded to dragging, which made the interaction a dead end for
   anyone on a keyboard.

   No confetti here. Firing the page's biggest reward gesture for a passive
   photo reveal spends it before the checklist's full-match moment, which is
   the one the reader actually worked for.
   ========================================================================== */

import { gsap, Draggable, prefersReducedMotion, BREAKPOINTS } from '../motion.js';
import { showToast } from '../ui/toast.js';

const PEEL_THRESHOLD = 70;

export function initBioMask() {
  const container = document.getElementById('bioPortraitContainer');
  const mask = document.getElementById('bioScratchMask');
  if (!container || !mask) return;

  let isRevealed = false;

  const reveal = (viaDrag) => {
    if (isRevealed) return;
    isRevealed = true;

    container.classList.add('revealed');
    mask.setAttribute('aria-expanded', 'true');

    if (!viaDrag) {
      gsap.to(mask, {
        autoAlpha: 0,
        scale: 1.05,
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: 'power2.out',
        onComplete: () => { mask.style.pointerEvents = 'none'; }
      });
    }

    showToast('Shlok revealed — "Everything you do, do it with care."');
  };

  // Click and keyboard both come through the button's native activation.
  mask.addEventListener('click', (event) => {
    // A click synthesised at the end of a drag shouldn't double-fire.
    if (mask.dataset.dragging === 'true') {
      event.preventDefault();
      return;
    }
    reveal(false);
  });

  // Dragging needs `touch-action: none`, which turns the whole portrait into a
  // dead zone for vertical page scrolling. The click/keyboard route above
  // already reveals the photo, so anything without a fine pointer keeps its
  // scroll instead — including a landscape phone, which is wide enough to pass
  // a width test while still being touch-only.
  if (prefersReducedMotion) return;
  if (!window.matchMedia(BREAKPOINTS.finePointer).matches) return;

  const getBounds = () => {
    const w = container.clientWidth || 260;
    const h = container.clientHeight || 300;
    return { minX: -w, maxX: w, minY: -h, maxY: h };
  };

  Draggable.create(mask, {
    type: 'x,y',
    bounds: getBounds(),
    edgeResistance: 0.2,
    allowNativeTouchScrolling: true,
    dragClickables: true,
    minimumMovement: 6,
    onDragStart() {
      mask.dataset.dragging = 'true';
    },
    onDrag() {
      if (Math.hypot(this.x, this.y) > PEEL_THRESHOLD) reveal(true);
    },
    onDragEnd() {
      const peeled = Math.hypot(this.x, this.y) > PEEL_THRESHOLD;
      const travel = (container.clientWidth || 260) * 1.25;

      if (peeled) {
        gsap.to(mask, {
          x: this.x > 0 ? travel : -travel,
          y: this.y + 100,
          autoAlpha: 0,
          rotation: 25,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => { mask.style.pointerEvents = 'none'; }
        });
      } else {
        gsap.to(mask, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.4,
          ease: 'back.out(2)'
        });
      }

      // Clear on the next frame so the synthetic click lands first.
      requestAnimationFrame(() => { mask.dataset.dragging = 'false'; });
    }
  });
}
