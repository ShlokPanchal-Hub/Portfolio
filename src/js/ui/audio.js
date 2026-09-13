/* ==========================================================================
   LO-FI AMBIENT SYNTH
   Generated with the Web Audio API rather than shipping an MP3.

   Everything routes through one master gain so pausing can fade out instead
   of cutting off mid-chord, and so no oscillator outlives the toggle.
   ========================================================================== */

import { showToast } from './toast.js';

const CHORDS = [
  [220.0, 277.18, 329.63, 440.0],   // A major
  [185.0, 220.0, 277.18, 369.99],   // F# minor
  [146.83, 220.0, 293.66, 369.99],  // D major
  [164.81, 246.94, 329.63, 493.88]  // E major
];

const BELL_FREQS = [554.37, 659.25, 880.0, 987.77, 1108.73];
const CHORD_INTERVAL_MS = 3500;

let audioCtx = null;
let masterGain = null;
let chordTimer = null;
let bellTimer = null;
let isPlaying = false;
let chordIndex = 0;

export function initAudio() {
  const toggleBtn = document.getElementById('musicToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    isPlaying ? stop(toggleBtn) : start(toggleBtn);
  });

  // Browsers suspend audio contexts on tab hide; stopping cleanly avoids a
  // burst of queued chords when the reader comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) stop(toggleBtn);
  });
}

function start(toggleBtn) {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      showToast('Audio is not supported in this browser.');
      return;
    }
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') audioCtx.resume();

  isPlaying = true;
  toggleBtn.classList.add('playing');
  toggleBtn.setAttribute('aria-pressed', 'true');
  toggleBtn.setAttribute('title', 'Pause the lo-fi soundtrack');

  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.4);

  showToast('Lo-fi vibes playing');

  playChord();
  chordTimer = setInterval(playChord, CHORD_INTERVAL_MS);
}

function stop(toggleBtn) {
  isPlaying = false;
  toggleBtn.classList.remove('playing');
  toggleBtn.setAttribute('aria-pressed', 'false');
  toggleBtn.setAttribute('title', 'Play the lo-fi soundtrack');

  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.25);
  }

  clearInterval(chordTimer);
  clearTimeout(bellTimer);
  chordTimer = null;
  bellTimer = null;

  showToast('Audio paused');
}

function playChord() {
  if (!isPlaying || !audioCtx) return;

  const chord = CHORDS[chordIndex % CHORDS.length];
  chordIndex += 1;

  const now = audioCtx.currentTime;

  chord.forEach((freq, i) => {
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
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 3.4);
  });

  // An occasional bell keeps the loop from becoming metronomic.
  if (Math.random() > 0.3) {
    bellTimer = setTimeout(playBell, 700);
  }
}

function playBell() {
  if (!isPlaying || !audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(BELL_FREQS[Math.floor(Math.random() * BELL_FREQS.length)], now);

  gain.gain.setValueAtTime(0.02, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 1.3);
}
