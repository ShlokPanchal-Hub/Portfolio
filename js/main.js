/* ==========================================================================
   MAIN JAVASCRIPT: Clock, Audio Synthesizer, Routing & Toast Helpers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMumbaiClock();
  initAudioPlayer();
  initEmailCopy();
  initSmoothNav();
});

/**
 * 1. Live Mumbai Clock (GMT +5:30)
 */
function initMumbaiClock() {
  const clockEl = document.getElementById('liveMumbaiTime');
  if (!clockEl) return;

  function updateTime() {
    const now = new Date();
    // Format for Asia/Kolkata timezone
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
    clockEl.textContent = `Mumbai • ${timeStr}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/**
 * 2. Lo-Fi Ambient Audio Synthesizer (Zero External MP3 Dependency)
 * Plays relaxing lo-fi chord progressions with gentle pentatonic sparkle on Web Audio API
 */
let audioCtx = null;
let isPlaying = false;
let chordInterval = null;

function initAudioPlayer() {
  const toggleBtn = document.getElementById('musicToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
      toggleBtn.classList.add('playing');
      toggleBtn.setAttribute('title', 'Pause relaxing lo-fi soundtrack');
      showToast('Lo-fi vibes playing (ambient sunset chords)');
      startLofiMusic();
    } else {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('title', 'Play relaxing lo-fi soundtrack');
      showToast('Audio paused');
      stopLofiMusic();
    }
  });
}

function startLofiMusic() {
  if (!audioCtx) return;

  // Pentatonic warm chord roots (A major, F#m, D major, E major)
  const chords = [
    [220.0, 277.18, 329.63, 440.0], // A Major
    [185.0, 220.0, 277.18, 369.99], // F# Minor
    [146.83, 220.0, 293.66, 369.99], // D Major
    [164.81, 246.94, 329.63, 493.88]  // E Major
  ];

  let chordIndex = 0;

  function playChordStep() {
    if (!isPlaying || !audioCtx) return;

    const currentChord = chords[chordIndex % chords.length];
    chordIndex++;

    const now = audioCtx.currentTime;

    // Play pad synth notes
    currentChord.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 3.4);
    });

    // Random acoustic sparkle bell note
    if (Math.random() > 0.3) {
      setTimeout(() => {
        if (!isPlaying || !audioCtx) return;
        const bellOsc = audioCtx.createOscillator();
        const bellGain = audioCtx.createGain();
        const bellTime = audioCtx.currentTime;

        const bellFreqs = [554.37, 659.25, 880.0, 987.77, 1108.73];
        const randomFreq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(randomFreq, bellTime);

        bellGain.gain.setValueAtTime(0.02, bellTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 1.2);

        bellOsc.connect(bellGain);
        bellGain.connect(audioCtx.destination);

        bellOsc.start(bellTime);
        bellOsc.stop(bellTime + 1.3);
      }, 700);
    }
  }

  playChordStep();
  chordInterval = setInterval(playChordStep, 3500);
}

function stopLofiMusic() {
  if (chordInterval) {
    clearInterval(chordInterval);
    chordInterval = null;
  }
}

/**
 * 3. Copy Email to Clipboard with Toast Notification
 */
function initEmailCopy() {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'shlokpanchal2@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Copied "${email}" to clipboard.`);
      }).catch(() => {
        showToast(`Email: ${email}`);
      });
    });
  });
}

/**
 * 4. Toast Notification Utility
 */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('scrapbookToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'scrapbookToast';
    toast.className = 'scrapbook-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * 5. Smooth Navigation Active Highlight
 */
function initSmoothNav() {
  const navLinks = document.querySelectorAll('.header-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

window.showToast = showToast;
