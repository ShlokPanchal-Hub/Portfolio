/* ==========================================================================
   NAVIGATION
   Replaces the previous unthrottled `scroll` listener, which read offsetTop
   and offsetHeight for every section on every scroll event — layout thrashing
   that competed with ScrollTrigger for the same frame budget.

   Active state is now a ScrollTrigger per section, and the header responds to
   scroll direction via ScrollTrigger's own update pass. Zero extra listeners.
   ========================================================================== */

import { ScrollTrigger } from '../motion.js';
import { scrollToTarget } from '../scroll/smoother.js';

export function initNav(sections) {
  const links = Array.from(document.querySelectorAll('.header-nav .nav-link'));
  if (!links.length) return;

  bindAnchors();
  bindActiveState(links, sections);
  bindHeaderCondense();
}

/** Anchor clicks route through the smoother so both scroll paths agree. */
function bindAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);
    });
  });
}

/**
 * Activation is "last section to claim the viewport centre wins", set on
 * enter in both directions and never cleared on leave.
 *
 * Toggling per-section on both enter and leave leaves dead zones — between
 * one section's bottom passing centre and the next section's top reaching it,
 * nothing is highlighted. The pinned wristband widens that gap enough to be
 * obvious. Only ever promoting a new winner means exactly one link is lit at
 * all times once the reader is past the hero.
 */
function bindActiveState(links, sections) {
  const linkFor = (id) => links.find((link) => link.getAttribute('href') === `#${id}`);

  const setActive = (link) => {
    links.forEach((other) => {
      const isTarget = other === link;
      other.classList.toggle('active', isTarget);
      if (isTarget) {
        other.setAttribute('aria-current', 'true');
      } else {
        other.removeAttribute('aria-current');
      }
    });
  };

  sections.forEach((section) => {
    const link = linkFor(section.id);
    if (!link) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(link),
      onEnterBack: () => setActive(link)
    });
  });
}

/**
 * Scrolling down condenses the header away; scrolling up brings it back.
 * Kept out of the hero so the header never vanishes before the reader has
 * committed to the page.
 */
function bindHeaderCondense() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  ScrollTrigger.create({
    start: 'top top-=300',
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-condensed', self.direction === 1);
    },
    onLeaveBack: () => header.classList.remove('is-condensed')
  });
}
