/* ==========================================================================
   LIVE MUMBAI CLOCK
   ========================================================================== */

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
});

export function initClock() {
  const clockEl = document.getElementById('liveMumbaiTime');
  if (!clockEl) return;

  const update = () => {
    clockEl.textContent = `Mumbai • ${FORMATTER.format(new Date())}`;
  };

  update();
  const timer = setInterval(update, 1000);

  // A background tab does not need a running clock.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });

  window.addEventListener('pagehide', () => clearInterval(timer));
}
