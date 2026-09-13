/* ==========================================================================
   COPY EMAIL
   ========================================================================== */

import { showToast } from './toast.js';

export function initEmailCopy() {
  document.querySelectorAll('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.preventDefault();

      const email = btn.dataset.copyEmail;
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        showToast(`Copied ${email}`);
      } catch {
        // Clipboard access is denied over plain HTTP and in some browsers.
        // Showing the address is still useful; failing silently is not.
        showToast(`Email: ${email}`);
      }
    });
  });
}
