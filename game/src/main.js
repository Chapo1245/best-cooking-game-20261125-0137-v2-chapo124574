// main.js — ONE JOB: boot the game and run its loop.
// In normal play it starts a shift and ticks it with requestAnimationFrame.
// With ?shot=<name> it paints one deterministic preset frame and stops, so a
// headless screenshot is a reproducible render of the game's own code.

import { createShift, tick } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { shotState } from './shots.js';

const params = new URLSearchParams(window.location.search);
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const shotName = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '20261125', 10) || 20261125;

let state;
if (shotName) {
  state = shotState(shotName);
  render(ctx, state);
  // Re-paint once web fonts settle so text metrics are identical on every run.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => render(ctx, state));
  }
  document.title = 'Sate Kencana — ' + shotName;
  window.__shotDone = true;
} else {
  state = createShift(seed);
  attachInput(canvas, state, () => render(ctx, state));
  render(ctx, state);
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    tick(state, dt);
    render(ctx, state);
    if (!state.over) {
      requestAnimationFrame(loop);
    } else {
      render(ctx, state);
    }
  };
  requestAnimationFrame(loop);
}

// Exposed for headless play-tests: window.__game.state is the live shift.
window.__game = { state };
