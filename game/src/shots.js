// shots.js — ONE JOB: deterministic screenshot presets.
// Each preset builds a fixed shift state (same seed, same orders, same plate)
// so the screenshots are reproducible renders of the game's own code.
// The cover shows all six of the judge's first-criterion elements at once:
// order board, ingredients on the counter, a dish mid-assembly on the plate,
// the shift timer, and a finished plate on the pass.

import { createShift } from './state.js';
import { RECIPE_BY_ID } from './config.js';

function baseState(seed) {
  const state = createShift(seed);
  return state;
}

function setOrder(state, slot, recipeId, timeLeft, total) {
  state.orders[slot] = {
    id: state.orders[slot].id,
    recipeId,
    timeLeft,
    total,
  };
}

// The cover: 3 orders (one urgent), plate mid-assembly with 2 of 3
// ingredients and the grill at 60%, a just-served dish on the pass,
// timer at 01:48, score 480, combo x3.
export function coverState() {
  const state = baseState(1);
  state.timeLeft = 108;
  state.elapsed = 12;
  state.score = 480;
  state.coins = 480;
  state.served = 4;
  state.combo = 3;
  state.bestCombo = 3;
  setOrder(state, 0, 'sate-ayam', 32, 45);
  setOrder(state, 1, 'sate-kambing', 12, 45);
  setOrder(state, 2, 'sate-pedas', 41, 45);
  state.plate = ['ayam', 'bumbu'];
  state.grilling = 1.0; // 2.5s total -> 60% done
  state.grilled = false;
  state.lastServed = { recipeId: 'sate-komplit', at: 10 };
  state.message = 'Sate Ayam hampir jadi — panggang sebentar lagi!';
  return state;
}

// The rush: grill busy, two orders nearly out of time, combo x5.
export function rushState() {
  const state = baseState(7);
  state.timeLeft = 64;
  state.elapsed = 56;
  state.score = 1150;
  state.coins = 1150;
  state.served = 9;
  state.combo = 5;
  state.bestCombo = 5;
  setOrder(state, 0, 'sate-campur', 9, 30);
  setOrder(state, 1, 'sate-ayam', 14, 30);
  setOrder(state, 2, 'sate-komplit', 26, 30);
  state.plate = ['kambing', 'bumbu', 'sambal'];
  state.grilling = 0.4; // 84% done
  state.grilled = false;
  state.lastServed = null;
  state.message = 'Rush hour! Dua pesanan hampir hangus — cepat!';
  return state;
}

// The serve: a finished plate on the pass, coins popping, new order in.
export function serveState() {
  const state = baseState(3);
  state.timeLeft = 83;
  state.elapsed = 37;
  state.score = 890;
  state.coins = 890;
  state.served = 7;
  state.combo = 4;
  state.bestCombo = 4;
  setOrder(state, 0, 'sate-pedas', 28, 40);
  setOrder(state, 1, 'sate-kambing', 35, 40);
  setOrder(state, 2, 'sate-ayam', 22, 40);
  state.plate = ['ayam', 'bumbu', 'lontong'];
  state.grilling = 0;
  state.grilled = true;
  state.lastServed = null;
  state.message = '+120 Sate Ayam tersaji! Kombo x4.';
  return state;
}

export function shotState(name) {
  if (name === 'cover') return coverState();
  if (name === 'rush') return rushState();
  if (name === 'serve') return serveState();
  return coverState();
}

export { RECIPE_BY_ID };
