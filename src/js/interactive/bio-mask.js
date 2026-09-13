/* ==========================================================================
   BIO MASK PEEL

   The mask is a real <button>, so the reveal has three routes: drag it aside
   with a pointer, click it, or press Enter/Space. Previously it was a div
   that only responded to dragging, which made the interaction a dead end for
   anyone on a keyboard.
   ========================================================================== */

import { gsap, Draggable, prefersReducedMotion } from '../motion.js';
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

    celebrate();
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

  if (prefersReducedMotion) return;

  Draggable.create(mask, {
    type: 'x,y',
    edgeResistance: 0.2,
    onDragStart() {
      mask.dataset.dragging = 'true';
    },
    onDrag() {
      if (Math.hypot(this.x, this.y) > PEEL_THRESHOLD) reveal(true);
    },
    onDragEnd() {
      const peeled = Math.hypot(this.x, this.y) > PEEL_THRESHOLD;

      if (peeled) {
        gsap.to(mask, {
          x: this.x > 0 ? 320 : -320,
          y: this.y + 120,
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

async function celebrate() {
  if (prefersReducedMotion) return;

  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 }, disableForReducedMotion: true });
}
