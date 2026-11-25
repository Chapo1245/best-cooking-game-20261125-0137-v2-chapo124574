// input.js — ONE JOB: turn mouse clicks and keys into state actions.
// Hit-testing lives here: bins, grill, plate-clear, order tickets, the pass.
// The renderer owns the layout constants; this file only reads them.

import { INGREDIENTS, LAYOUT, ORDER_SLOTS } from './config.js';
import { addIngredient, clearPlate, startGrill, serveOrder, serveFirstMatch } from './state.js';
import { playClick, playGrill, playServe, playBad } from './audio.js';

function inside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

export function attachInput(canvas, state, onAction) {
  function refresh() {
    if (onAction) onAction();
  }

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    handleClick(state, x, y);
    refresh();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    handleKey(state, event.key);
    refresh();
  });
}

export function handleClick(state, x, y) {
  if (state.over) return;
  // Ingredient bins.
  const b = LAYOUT.bins;
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const box = { x: b.x + i * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
    if (inside(x, y, box)) {
      if (addIngredient(state, INGREDIENTS[i].id)) playClick();
      return;
    }
  }
  // Grill box starts grilling.
  if (inside(x, y, LAYOUT.grill)) {
    if (startGrill(state)) playGrill();
    return;
  }
  // Clear-plate button on the plate panel.
  const p = LAYOUT.plate;
  const clearBox = { x: p.x + p.w - 120, y: p.y + p.h - 40, w: 104, h: 28 };
  if (inside(x, y, clearBox)) {
    if (clearPlate(state)) playBad();
    return;
  }
  // Order tickets: serve the plate to the clicked order.
  const o = LAYOUT.orders;
  for (let i = 0; i < ORDER_SLOTS; i++) {
    const box = { x: o.x + i * (o.w + o.gap), y: o.y, w: o.w, h: o.h };
    if (inside(x, y, box)) {
      const order = state.orders[i];
      if (order && serveOrder(state, order.id)) playServe();
      return;
    }
  }
  // Serve button on the pass.
  const pass = LAYOUT.pass;
  const serveBox = { x: pass.x + pass.w - 150, y: pass.y + pass.h - 40, w: 134, h: 28 };
  if (inside(x, y, serveBox)) {
    if (serveFirstMatch(state)) playServe();
  }
}

export function handleKey(state, key) {
  if (state.over) {
    if (key === 'r' || key === 'R') window.location.reload();
    return;
  }
  const lower = key.toLowerCase();
  const ing = INGREDIENTS.find((g) => g.key === lower);
  if (ing) {
    if (addIngredient(state, ing.id)) playClick();
    return;
  }
  if (key === ' ') {
    if (startGrill(state)) playGrill();
  } else if (key === 'Enter') {
    if (serveFirstMatch(state)) playServe();
  } else if (lower === 'c' || key === 'Backspace') {
    if (clearPlate(state)) playBad();
  }
}
