/* ==========================================================================
   ENTRY POINT

   Boot order matters:
   1. ScrollSmoother first — it restructures how scroll position is read, and
      every ScrollTrigger created afterwards needs that in place.
   2. Scenes in page order — ScrollTrigger refreshes in creation order, and
      creating them top-to-bottom keeps pin spacing correct without having to
      hand-assign refreshPriority.
   3. UI and interactive modules last; they do not affect layout.
   ========================================================================== */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components/header.css';
import './styles/components/craft.css';
import './styles/components/buttons.css';
import './styles/components/progress.css';
import './styles/components/toast.css';
import './styles/sections/hero.css';
import './styles/sections/work.css';
import './styles/sections/board.css';
import './styles/sections/bio.css';
import './styles/sections/checklist.css';
import './styles/sections/connect.css';

import { ScrollTrigger } from './js/motion.js';
import { initSmoother } from './js/scroll/smoother.js';
import { initProgressRail } from './js/scroll/progress.js';

import { initHeroScene } from './js/scroll/scenes/hero.js';
import { initWorkScene } from './js/scroll/scenes/work.js';
import { initBoardScene } from './js/scroll/scenes/board.js';
import { initBioScene } from './js/scroll/scenes/bio.js';
import { initChecklistScene, initConnectScene } from './js/scroll/scenes/connect.js';

import { initNav } from './js/ui/nav.js';
import { initClock } from './js/ui/clock.js';
import { initAudio } from './js/ui/audio.js';
import { initCounters } from './js/ui/counters.js';
import { initEmailCopy } from './js/ui/copy-email.js';

import { initBoard } from './js/interactive/board.js';
import { initBioMask } from './js/interactive/bio-mask.js';
import { initChecklist } from './js/interactive/checklist.js';

function boot() {
  initSmoother();

  const sections = Array.from(document.querySelectorAll('main section[id]'));

  // Page order, top to bottom.
  initHeroScene();
  initWorkScene();
  initBoardScene();
  initBioScene();
  initChecklistScene();
  initConnectScene();

  initCounters();
  initProgressRail(sections);

  initNav(sections);
  initClock();
  initAudio();
  initEmailCopy();

  initBoard();
  initBioMask();
  initChecklist();

  // Webfonts change every measured height once they swap in.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
