/* ==========================================================================
   DRAGGABLE CUTTING BOARD WORKBENCH (GSAP Draggable Physics)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCuttingBoardDraggables();
});

let highestZ = 20;

function initCuttingBoardDraggables() {
  const container = document.querySelector('.cutting-mat');
  const items = document.querySelectorAll('.draggable-item');

  if (!container || items.length === 0) return;

  // Check if GSAP Draggable is loaded
  if (typeof Draggable !== 'undefined') {
    items.forEach((item, index) => {
      const initialRotation = index % 2 === 0 ? -4 : 4;
      item.dataset.defaultRot = initialRotation;
      gsap.set(item, { rotation: initialRotation });

      Draggable.create(item, {
        bounds: container,
        edgeResistance: 0.75,
        type: 'x,y',
        cursor: 'grab',
        activeCursor: 'grabbing',
        allowContextMenu: true,
        zIndexBoost: true,
        onPress: function() {
          highestZ += 5;
          this.target.style.zIndex = highestZ;
          this.target.classList.add('is-dragging');
        },
        onRelease: function() {
          this.target.classList.remove('is-dragging');
        }
      });
    });
  } else {
    // Fallback Native Pointer Drag if Draggable plugin isn't loaded
    initNativeDragFallback(items, container);
  }

  // Setup Scatter & Organize Buttons
  initBoardButtons(items, container);
}

function initNativeDragFallback(items, container) {
  items.forEach(item => {
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;

    item.addEventListener('pointerdown', (e) => {
      isDragging = true;
      item.setPointerCapture(e.pointerId);
      highestZ++;
      item.style.zIndex = highestZ;
      item.classList.add('is-dragging');

      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
    });

    item.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // Soft clamp
      currentX = Math.max(-200, Math.min(container.clientWidth - item.clientWidth, currentX));
      currentY = Math.max(-100, Math.min(container.clientHeight - item.clientHeight, currentY));

      item.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.05)`;
    });

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      item.classList.remove('is-dragging');
      item.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1)`;
    };

    item.addEventListener('pointerup', stopDrag);
    item.addEventListener('pointercancel', stopDrag);
  });
}

function initBoardButtons(items, container) {
  const scatterBtn = document.getElementById('scatterBoardBtn');
  const resetBtn = document.getElementById('resetBoardBtn');

  if (scatterBtn) {
    scatterBtn.addEventListener('click', () => {
      const matW = container.clientWidth;
      const matH = container.clientHeight;

      items.forEach(item => {
        const randomX = Math.random() * (matW - item.clientWidth - 40) - (item.offsetLeft || 0);
        const randomY = Math.random() * (matH - item.clientHeight - 40) - (item.offsetTop || 0);
        const randomRot = Math.random() * 30 - 15;

        if (typeof gsap !== 'undefined') {
          gsap.to(item, {
            x: randomX,
            y: randomY,
            rotation: randomRot,
            duration: 0.65,
            ease: 'back.out(1.4)'
          });
        }
      });

      if (window.showToast) {
        window.showToast('Scattered board items.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      items.forEach(item => {
        if (typeof gsap !== 'undefined') {
          gsap.to(item, {
            x: 0,
            y: 0,
            rotation: parseFloat(item.dataset.defaultRot || 0),
            duration: 0.6,
            ease: 'power3.out'
          });
        } else {
          item.style.transform = '';
        }
      });

      if (window.showToast) {
        window.showToast('Organized workbench.');
      }
    });
  }
}
