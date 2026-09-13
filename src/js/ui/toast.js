/* ==========================================================================
   TOAST
   ========================================================================== */

const TOAST_DURATION = 3200;

let toastTimeout = null;

export function showToast(message) {
  const toast = document.getElementById('scrapbookToast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION);
}
