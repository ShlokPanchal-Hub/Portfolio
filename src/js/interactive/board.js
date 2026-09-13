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
          ease: 'power2.out',
          onComplete: () => clampIntoMat(this.target, mat)
        });
      },
      // With InertiaPlugin, onDragEnd fires the moment the pointer lifts and
      // the throw animates afterwards — so the clamp has to hang off the throw
      // completing, or it measures a position the item has not reached yet.
      onThrowComplete() {
        clampIntoMat(this.target, mat);
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

/**
 * Axis-aligned size of an element once rotated. A 190x120 note at 15 degrees
 * occupies roughly 215x172, and that extra 25px is exactly what used to let a
 * scattered item hang over the edge of the mat.
 */
function rotatedExtent(el, degrees) {
  const rad = Math.abs(degrees * Math.PI / 180);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w = el.offsetWidth;
  const h = el.offsetHeight;

  return {
    width: w * cos + h * sin,
    height: w * sin + h * cos
  };
}

/**
 * Where the element's untransformed layout box sits inside the mat. Read from
 * offsetLeft/offsetTop rather than getBoundingClientRect, which reports the
 * rotated bounding box and would fold the rotation into the origin.
 */
function restPosition(el) {
  let left = el.offsetLeft;
  let top = el.offsetTop;
  let parent = el.offsetParent;

  // Walk up to the mat in case an item is ever nested deeper than one level.
  while (parent && !parent.classList.contains('cutting-mat')) {
    left += parent.offsetLeft;
    top += parent.offsetTop;
    parent = parent.offsetParent;
  }

  return { left, top };
}

/** Pulls an item fully back inside the mat after a rotation moved a corner out. */
function clampIntoMat(el, mat) {
  const rotation = Number(gsap.getProperty(el, 'rotation')) || 0;
  const { width, height } = rotatedExtent(el, rotation);
  const rest = restPosition(el);

  const padX = (width - el.offsetWidth) / 2;
  const padY = (height - el.offsetHeight) / 2;

  const x = Number(gsap.getProperty(el, 'x')) || 0;
  const y = Number(gsap.getProperty(el, 'y')) || 0;

  const left = rest.left + x;
  const top = rest.top + y;

  const clampedLeft = gsap.utils.clamp(padX, Math.max(padX, mat.clientWidth - el.offsetWidth - padX), left);
  const clampedTop = gsap.utils.clamp(padY, Math.max(padY, mat.clientHeight - el.offsetHeight - padY), top);

  if (clampedLeft === left && clampedTop === top) return;

  gsap.to(el, {
    x: x + (clampedLeft - left),
    y: y + (clampedTop - top),
    duration: 0.3,
    ease: 'power2.out'
  });
}

function bindControls(mat, items) {
  const scatterBtn = document.getElementById('scatterBoardBtn');
  const resetBtn = document.getElementById('resetBoardBtn');

  scatterBtn?.addEventListener('click', () => {
    // clientWidth/clientHeight, not getBoundingClientRect: items are absolutely
    // positioned against the mat's padding box, and the mat has a 12px border.
    const matWidth = mat.clientWidth;
    const matHeight = mat.clientHeight;

    items.forEach((item) => {
      // Pick the rotation first: a rotated box needs more room than its layout
      // box, and how much more depends on the angle.
      const rotation = gsap.utils.random(-15, 15);
      const { width, height } = rotatedExtent(item, rotation);

      const rest = restPosition(item);

      // The rotated box is centred on the layout box, so the extra width sits
      // half on each side — that overhang is what used to push items off the mat.
      const padX = (width - item.offsetWidth) / 2;
      const padY = (height - item.offsetHeight) / 2;

      const minLeft = padX;
      const maxLeft = Math.max(minLeft, matWidth - item.offsetWidth - padX);
      const minTop = padY;
      const maxTop = Math.max(minTop, matHeight - item.offsetHeight - padY);

      gsap.to(item, {
        x: gsap.utils.random(minLeft, maxLeft) - rest.left,
        y: gsap.utils.random(minTop, maxTop) - rest.top,
        rotation,
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
