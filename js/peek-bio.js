/* ==========================================================================
   PEEK-OUT BIO CARD & DRAGGABLE MASK REVEAL ("What's his deal?")
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBioMaskPeel();
});

function initBioMaskPeel() {
  const container = document.getElementById('bioPortraitContainer');
  const mask = document.getElementById('bioScratchMask');
  if (!container || !mask) return;

  let isRevealed = false;

  // Use GSAP Draggable on the mask if available
  if (typeof Draggable !== 'undefined') {
    Draggable.create(mask, {
      type: 'x,y',
      edgeResistance: 0.2,
      onDrag: function() {
        const dist = Math.hypot(this.x, this.y);
        if (dist > 70 && !isRevealed) {
          triggerPhotoReveal();
        }
      },
      onRelease: function() {
        const dist = Math.hypot(this.x, this.y);
        if (dist > 70) {
          // Slide mask completely off screen
          gsap.to(mask, {
            x: this.x > 0 ? 300 : -300,
            y: this.y + 100,
            opacity: 0,
            rotation: 25,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              mask.style.pointerEvents = 'none';
            }
          });
        } else {
          // Snap back if barely moved
          gsap.to(mask, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: 'back.out(2)'
          });
        }
      }
    });
  } else {
    // Pointer Drag Fallback
    let startX = 0, startY = 0;
    let currX = 0, currY = 0;
    let dragging = false;

    mask.addEventListener('pointerdown', (e) => {
      dragging = true;
      mask.setPointerCapture(e.pointerId);
      startX = e.clientX - currX;
      startY = e.clientY - currY;
    });

    mask.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      currX = e.clientX - startX;
      currY = e.clientY - startY;
      mask.style.transform = `translate(${currX}px, ${currY}px) rotate(${currX * 0.05}deg)`;

      if (Math.hypot(currX, currY) > 80 && !isRevealed) {
        triggerPhotoReveal();
      }
    });

    const stop = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.hypot(currX, currY) > 80) {
        mask.style.opacity = '0';
        mask.style.pointerEvents = 'none';
      } else {
        mask.style.transform = 'translate(0px, 0px)';
      }
    };

    mask.addEventListener('pointerup', stop);
    mask.addEventListener('pointercancel', stop);
  }

  function triggerPhotoReveal() {
    isRevealed = true;
    container.classList.add('revealed');

    // Confetti celebration
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 }
      });
    }

    if (window.showToast) {
      window.showToast('Shlok revealed: "Everything you do, do it with care."');
    }
  }
}
