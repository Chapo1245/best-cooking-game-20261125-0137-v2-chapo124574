// audio.js — ONE JOB: tiny synthesized sound effects, no audio files.
// WebAudio oscillators only, created lazily on the first user gesture so the
// page never needs autoplay permission. Every call is guarded: silence is
// always better than a thrown error.

let ctx = null;

function ac() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch (_e) {
    return null;
  }
}

function tone(freq, dur, type, gain) {
  const c = ac();
  if (!c) return;
  try {
    if (c.state === 'suspended') void c.resume();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  } catch (_e) {
    // Stay silent rather than break the game.
  }
}

export function playClick() {
  tone(660, 0.07, 'triangle', 0.06);
}

export function playGrill() {
  tone(180, 0.25, 'sawtooth', 0.05);
  setTimeout(() => tone(240, 0.2, 'sawtooth', 0.04), 90);
}

export function playServe() {
  tone(523, 0.12, 'sine', 0.09);
  setTimeout(() => tone(784, 0.18, 'sine', 0.09), 110);
}

export function playBad() {
  tone(160, 0.18, 'square', 0.05);
}
