/* ==========================================================================
   CUTTING BOARD — throwable items
   Fully responsive across all aspect ratios with touch & keyboard support.
   ========================================================================== */

import { gsap, Draggable } from '../motion.js';
import { showToast } from '../ui/toast.js';

let zFloor = 60;
let zCeiling = 79;
let topZ = zFloor;

export function initBoard() {
  const mat = document.querySelector('.cutting-mat');
  const items = gsap.utils.toArray('.draggable-item');
  if (!mat || !items.length) return;

  // Resolve z-index bounds dynamically from design tokens
  const style = getComputedStyle(document.documentElement);
  const tokenFloor = parseInt(style.getPropertyValue('--z-drag'), 10);
  const tokenCeiling = parseInt(style.getPropertyValue('--z-drag-active'), 10);
  if (!Number.isNaN(tokenFloor)) zFloor = tokenFloor;
  if (!Number.isNaN(tokenCeiling)) zCeiling = Math.max(zFloor + 1, tokenCeiling - 1);
  topZ = zFloor;

  items.forEach((item, index) => {
    const restRotation = index % 2 === 0 ? -4 : 4;
    item.dataset.restRotation = String(restRotation);
    gsap.set(item, { rotation: restRotation });

    // Keyboard accessibility for interactive board elements
    if (!item.hasAttribute('tabindex')) {
      item.setAttribute('tabindex', '0');
    }
    item.setAttribute('role', 'group');
    item.setAttribute('aria-label', describe(item));

    Draggable.create(item, {
      type: 'x,y',
      bounds: mat,
      inertia: true,
      edgeResistance: 0.75,
      dragResistance: 0.05,
      cursor: 'grab',
      activeCursor: 'grabbing',
      allowContextMenu: true,
      allowNativeTouchScrolling: true,
      minimumMovement: 6,
      dragClickables: true,
      onPress() {
        raise(this.target);
        this.target.classList.add('is-dragging');
      },
      onDragEnd() {
        // Small organic kick on release
        gsap.to(this.target, {
          rotation: restRotation + gsap.utils.random(-5, 5),
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => clampIntoMat(this.target, mat)
        });
      },
      onThrowComplete() {
        clampIntoMat(this.target, mat);
      },
      onRelease() {
        this.target.classList.remove('is-dragging');
      }
    });

    // Keyboard nudge interaction (Arrow keys)
    item.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 30 : 12;
      let dx = 0;
      let dy = 0;

      if (event.key === 'ArrowLeft') dx = -step;
      else if (event.key === 'ArrowRight') dx = step;
      else if (event.key === 'ArrowUp') dy = -step;
      else if (event.key === 'ArrowDown') dy = step;
      else return;

      event.preventDefault();
      raise(item);

      const curX = Number(gsap.getProperty(item, 'x')) || 0;
      const curY = Number(gsap.getProperty(item, 'y')) || 0;

      gsap.to(item, {
        x: curX + dx,
        y: curY + dy,
        duration: 0.2,
        ease: 'power1.out',
        onComplete: () => clampIntoMat(item, mat)
      });
    });
  });

  // Re-check bounds when mat dimensions adapt to viewport or orientation changes
  window.addEventListener('resize', () => {
    items.forEach((item) => {
      const dragInstance = Draggable.get(item);
      if (dragInstance) {
        dragInstance.applyBounds(mat);
        clampIntoMat(item, mat);
      }
    });
  }, { passive: true });

  bindControls(mat, items);
}

/**
 * A readable name for one board item.
 *
 * `innerText` was the obvious choice and the wrong one: scenes/board.js writes
 * autoAlpha:0 with immediateRender, so every item is visibility:hidden by the
 * time this runs, and innerText reports "" for anything not rendered. The
 * ternary guarding it therefore fell through on all seven items and gave them
 * the same label. textContent ignores rendering and returns the real text.
 */
function describe(el) {
  // Tag boundaries become spaces: textContent alone glues a <br> or </strong>
  // straight onto the next word ("Latency win:Retrieval latency down").
  const text = el.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 'Workbench item';
  if (text.length <= 60) return text;
  // Trim back to a word boundary so the label never ends mid-word.
  return text.slice(0, 60).replace(/\s+\S*$/, '') + '\u2026';
}

/** Keeps the dragged item on top without letting z-index grow without bound. */
function raise(target) {
  topZ = topZ >= zCeiling ? zFloor : topZ + 1;
  target.style.zIndex = String(topZ);
}

/** Axis-aligned extent of an element once rotated */
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

/** Where the element's untransformed layout box sits inside the mat. */
function restPosition(el) {
  let left = el.offsetLeft;
  let top = el.offsetTop;
  let parent = el.offsetParent;

  while (parent && !parent.classList.contains('cutting-mat')) {
    left += parent.offsetLeft;
    top += parent.offsetTop;
    parent = parent.offsetParent;
  }

  return { left, top };
}

/** Pulls an item fully back inside the mat bounds */
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
    const matWidth = mat.clientWidth;
    const matHeight = mat.clientHeight;

    items.forEach((item) => {
      const rotation = gsap.utils.random(-14, 14);
      const { width, height } = rotatedExtent(item, rotation);
      const rest = restPosition(item);

      const padX = (width - item.offsetWidth) / 2;
      const padY = (height - item.offsetHeight) / 2;

      const minLeft = padX + 8;
      const maxLeft = Math.max(minLeft, matWidth - item.offsetWidth - padX - 8);
      const minTop = padY + 8;
      const maxTop = Math.max(minTop, matHeight - item.offsetHeight - padY - 8);

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
