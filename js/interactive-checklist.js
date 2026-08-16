/* ==========================================================================
   INTERACTIVE CHECKLIST & DYNAMIC SKETCH COLOR FILL ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveChecklist();
});

function initInteractiveChecklist() {
  const checkItems = document.querySelectorAll('.check-item');
  const progressPill = document.getElementById('checklistProgress');
  const matchMsg = document.getElementById('checklistMatchMsg');
  const sketchLayers = document.querySelectorAll('.sketch-layer');

  if (checkItems.length === 0) return;

  const matchPhrases = [
    'Select criteria to check compatibility...',
    'Good start: 25% aligned',
    'Getting closer: 50% match',
    'Strong synergy: 75% match',
    '100% Perfect Match! Ready to build together.'
  ];

  checkItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      updateChecklistState();
    });
  });

  function updateChecklistState() {
    const checkedCount = document.querySelectorAll('.check-item.checked').length;
    const total = checkItems.length;
    const percentage = Math.round((checkedCount / total) * 100);

    if (progressPill) {
      progressPill.textContent = `${percentage}% Match`;
      progressPill.style.color = percentage === 100 ? 'var(--color-primary)' : 'var(--color-ink-muted)';
    }

    if (matchMsg) {
      matchMsg.textContent = matchPhrases[checkedCount] || '';
      matchMsg.style.transform = 'scale(1.05)';
      setTimeout(() => {
        matchMsg.style.transform = 'scale(1)';
      }, 200);
    }

    // Progressively reveal colored sketch layers
    sketchLayers.forEach((layer, idx) => {
      if (idx < checkedCount) {
        layer.style.opacity = '1';
        layer.style.transform = 'scale(1)';
      } else {
        layer.style.opacity = '0.08';
        layer.style.transform = 'scale(0.96)';
      }
    });

    // 100% Full Match Celebration
    if (checkedCount === total) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.7 }
        });
      }
      if (window.showToast) {
        window.showToast('100% Match! Let\'s connect below.');
      }
    }
  }

  // Set initial state
  updateChecklistState();
}
