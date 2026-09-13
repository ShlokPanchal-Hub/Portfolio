/* ==========================================================================
   COMPATIBILITY CHECKLIST

   The items are real checkboxes now: role, tabindex and aria-checked live on
   the element and Space/Enter toggle them. They were previously divs with
   click handlers, which meant keyboard users could not reach the section's
   only interaction at all.

   The sketch layers are driven by GSAP rather than inline style writes, so
   the reveal has easing and overshoot instead of a linear opacity flip.
   ========================================================================== */

import { gsap, prefersReducedMotion } from '../motion.js';
import { showToast } from '../ui/toast.js';

const MATCH_PHRASES = [
  'Pick the criteria that matter to your team.',
  'Good start — 25% aligned.',
  'Getting closer — 50% match.',
  'Strong synergy — 75% match.',
  'Full match. Let\'s build something.'
];

export function initChecklist() {
  const items = Array.from(document.querySelectorAll('.check-item'));
  if (!items.length) return;

  const progressPill = document.getElementById('checklistProgress');
  const matchMsg = document.getElementById('checklistMatchMsg');
  const layers = gsap.utils.toArray('.sketch-layer');

  let hasCelebrated = false;

  const toggle = (item) => {
    const next = item.getAttribute('aria-checked') !== 'true';
    item.setAttribute('aria-checked', String(next));
    update();
  };

  items.forEach((item) => {
    item.addEventListener('click', () => toggle(item));

    item.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggle(item);
      }
    });
  });

  function update() {
    const checked = items.filter((item) => item.getAttribute('aria-checked') === 'true').length;
    const total = items.length;
    const percentage = Math.round((checked / total) * 100);

    if (progressPill) {
      progressPill.textContent = `${percentage}% Match`;
      progressPill.classList.toggle('is-complete', checked === total);
    }

    if (matchMsg) {
      matchMsg.textContent = MATCH_PHRASES[checked] || '';

      if (!prefersReducedMotion) {
        gsap.fromTo(matchMsg,
          { scale: 1.06 },
          { scale: 1, duration: 0.35, ease: 'back.out(2)', overwrite: true }
        );
      }
    }

    // Each layer of the illustration inks in as another box is ticked.
    layers.forEach((layer, index) => {
      const isOn = index < checked;

      gsap.to(layer, {
        opacity: isOn ? 1 : 0.08,
        scale: isOn ? 1 : 0.96,
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: 'back.out(1.6)',
        overwrite: true
      });
    });

    // Fires once. Confetti on every re-check turns a reward into noise.
    if (checked === total && !hasCelebrated) {
      hasCelebrated = true;
      celebrate();
      showToast('Full match — let\'s connect below.');
    }
  }

  update();
}

async function celebrate() {
  if (prefersReducedMotion) return;

  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 110, spread: 85, origin: { y: 0.7 }, disableForReducedMotion: true });
}
