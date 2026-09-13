/* ==========================================================================
   CUTTING BOARD — throwable items

   Two changes from the previous implementation:

   1. InertiaPlugin is now free, so items are genuinely throwable — flick one
      and it carries and settles instead of stopping dead under the cursor.

   2. The hand-rolled pointer-drag fallback is gone. GSAP is bundled now, so
      `typeof Draggable === 'undefined'` cannot happen; and that fallback was
      broken anyway — it wrote `item.style.transform` directly, which wiped
      the rotation GSAP had set on the same element.
   ========================================================================== */

import { gsap, Draggable } from '../motion.js';
import { showToast } from '../ui/toast.js';

const Z_FLOOR = 60;
const Z_CEILING = 79; // stays below --z-drag-active so the mat never escapes
let topZ = Z_FLOOR;

export function initBoard() {
  const mat = document.querySelector('.cutting-mat');
  const items = gsap.utils.toArray('.draggable-item');
  if (!mat || !items.length) return;

  items.forEach((item, index) => {
    const restRotation = index % 2 === 0 ? -4 : 4;
    item.dataset.restRotation = String(restRotation);
    gsap.set(item, { rotation: restRotation });

    Draggable.create(item, {
      type: 'x,y',
      bounds: mat,
      inertia: true,
      edgeResistance: 0.75,
      dragResistance: 0.05,
      cursor: 'grab',
      activeCursor: 'grabbing',
      allowContextMenu: true,
      onPress() {
        raise(this.target);
        this.target.classList.add('is-dragging');
      },
      onDragEnd() {
        // A small rotation kick on release sells the weight of the throw.
        gsap.to(this.target, {
          rotation: restRotation + gsap.utils.random(-6, 6),
          duration: 0.6,
          ease: 'power2.out'
        });
      },
      onRelease() {
        this.target.classList.remove('is-dragging');
      }
    });
  });

  bindControls(mat, items);
}

/** Keeps the dragged item on top without letting z-index grow without bound. */
function raise(target) {
  topZ = topZ >= Z_CEILING ? Z_FLOOR : topZ + 1;
  target.style.zIndex = String(topZ);
}

function bindControls(mat, items) {
  const scatterBtn = document.getElementById('scatterBoardBtn');
  const resetBtn = document.getElementById('resetBoardBtn');

  scatterBtn?.addEventListener('click', () => {
    // Measure against live geometry rather than trusting static offsets: the
    // items have arbitrary transforms on them by this point, and half of them
    // are positioned from the right edge rather than the left.
    const matRect = mat.getBoundingClientRect();

    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect();

      // Where the item's own layout box sits inside the mat, transforms
      // stripped out — the fixed origin the new offset is measured from.
      const restLeft = itemRect.left - matRect.left - (gsap.getProperty(item, 'x') || 0);
      const restTop = itemRect.top - matRect.top - (gsap.getProperty(item, 'y') || 0);

      const maxLeft = Math.max(0, matRect.width - itemRect.width);
      const maxTop = Math.max(0, matRect.height - itemRect.height);

      gsap.to(item, {
        x: gsap.utils.random(0, maxLeft) - restLeft,
        y: gsap.utils.random(0, maxTop) - restTop,
        rotation: gsap.utils.random(-15, 15),
        duration: 0.65,
        ease: 'back.out(1.4)'
      });
    });

    showToast('Scattered the board.');
  });

  resetBtn?.addEventListener('click', () => {
    items.forEach((item) => {
      gsap.to(item, {
        x: 0,
        y: 0,
        rotation: parseFloat(item.dataset.restRotation || '0'),
        duration: 0.6,
        ease: 'power3.out'
      });
    });

    showToast('Organized the workbench.');
  });
}
