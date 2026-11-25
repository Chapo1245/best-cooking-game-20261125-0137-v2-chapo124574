// state.js — ONE JOB: the rules of one shift at the satay stall.
// Holds orders, the plate, the grill, score and timers, and nothing visual.
// Every function here is pure over the state object except the clock.

import {
  INGREDIENTS, RECIPES, RECIPE_BY_ID, INGREDIENT_BY_ID,
  ORDER_SLOTS, PLATE_MAX, GRILL_SECONDS,
  ORDER_TIME_START, ORDER_TIME_MIN, ORDER_TIME_PER_300,
  WRONG_SERVE_PENALTY, EXPIRED_PENALTY, COMBO_BONUS_PER,
  SHIFT_SECONDS,
} from './config.js';
import { mulberry32, pick } from './random.js';

export function orderTimeFor(score) {
  const shaved = Math.floor(score / 300) * ORDER_TIME_PER_300;
  return Math.max(ORDER_TIME_MIN, ORDER_TIME_START - shaved);
}

export function createShift(seed) {
  const rng = mulberry32(seed);
  const state = {
    seed,
    rng,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    plate: [],          // ingredient ids on the plate, in added order
    grilling: 0,        // seconds left on the grill; 0 = not grilling
    grilled: false,     // true once the current plate finished grilling
    orders: [],         // { id, recipeId, timeLeft, total }
    nextOrderId: 1,
    lastServed: null,   // { recipeId, at } — the dish just served, shown on the pass
    message: 'Selamat datang di Sate Kencana! Rakit pesanan, panggang, sajikan.',
    messageAt: 0,
    over: false,
    elapsed: 0,
  };
  for (let i = 0; i < ORDER_SLOTS; i++) spawnOrder(state);
  return state;
}

export function spawnOrder(state) {
  const recipe = pick(state.rng, RECIPES);
  const total = orderTimeFor(state.score);
  state.orders.push({
    id: state.nextOrderId++,
    recipeId: recipe.id,
    timeLeft: total,
    total,
  });
}

export function addIngredient(state, ingredientId) {
  if (state.over) return false;
  if (state.grilling > 0) return false;
  if (state.plate.length >= PLATE_MAX) return false;
  if (!INGREDIENT_BY_ID[ingredientId]) return false;
  state.plate.push(ingredientId);
  state.message = INGREDIENT_BY_ID[ingredientId].name + ' masuk piring.';
  return true;
}

export function clearPlate(state) {
  if (state.over) return false;
  if (state.grilling > 0) return false;
  if (state.plate.length === 0) return false;
  state.plate = [];
  state.grilled = false;
  state.message = 'Piring dibuang. Rakit lagi dari awal.';
  return true;
}

export function startGrill(state) {
  if (state.over) return false;
  if (state.grilling > 0) return false;
  if (state.plate.length === 0) return false;
  if (state.grilled) return false;
  state.grilling = GRILL_SECONDS;
  state.message = 'Sate dipanggang... tunggu sampai matang!';
  return true;
}

// The plate matches an order when it holds exactly the recipe's three
// ingredients (order does not matter) and has finished grilling.
export function matchingOrder(state) {
  if (!state.grilled || state.plate.length !== PLATE_MAX) return null;
  const have = state.plate.slice().sort().join(',');
  for (const order of state.orders) {
    const want = RECIPE_BY_ID[order.recipeId].needs.slice().sort().join(',');
    if (have === want) return order;
  }
  return null;
}

export function serveOrder(state, orderId) {
  if (state.over) return false;
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (!state.grilled || state.plate.length !== PLATE_MAX) {
    state.message = 'Piring belum siap — rakit 3 bahan lalu panggang dulu.';
    return false;
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const have = state.plate.slice().sort().join(',');
  const want = recipe.needs.slice().sort().join(',');
  if (have !== want) {
    state.coins = Math.max(0, state.coins - WRONG_SERVE_PENALTY);
    state.score = state.coins;
    state.combo = 0;
    state.plate = [];
    state.grilled = false;
    state.message = 'Salah resep! Piring dibuang, kombo putus (-' + WRONG_SERVE_PENALTY + ').';
    return false;
  }
  const bonus = state.combo * COMBO_BONUS_PER;
  const earned = recipe.price + bonus;
  state.coins += earned;
  state.score = state.coins;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== orderId);
  spawnOrder(state);
  state.plate = [];
  state.grilled = false;
  state.lastServed = { recipeId: order.recipeId, at: state.elapsed };
  state.message = '+' + earned + ' ' + recipe.name + ' tersaji! Kombo x' + state.combo + '.';
  return true;
}

// Serve to the first order the plate matches, if any.
export function serveFirstMatch(state) {
  const order = matchingOrder(state);
  if (!order) {
    if (state.plate.length > 0 && !state.grilled) {
      state.message = 'Piring belum dipanggang — tekan Spasi dulu.';
    } else if (state.plate.length > 0) {
      state.message = 'Tidak ada pesanan yang cocok dengan piring ini.';
    }
    return false;
  }
  return serveOrder(state, order.id);
}

export function tick(state, dt) {
  if (state.over) return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.grilling > 0) {
    state.grilling = Math.max(0, state.grilling - dt);
    if (state.grilling === 0) {
      state.grilled = true;
      state.message = 'Matang! Sajikan ke pesanan yang cocok.';
    }
  }
  for (const order of state.orders) order.timeLeft -= dt;
  const expired = state.orders.filter((o) => o.timeLeft <= 0);
  if (expired.length > 0) {
    state.orders = state.orders.filter((o) => o.timeLeft > 0);
    for (const _e of expired) spawnOrder(state);
    state.coins = Math.max(0, state.coins - EXPIRED_PENALTY * expired.length);
    state.score = state.coins;
    state.combo = 0;
    state.message = 'Pesanan hangus! (-' + EXPIRED_PENALTY * expired.length + ')';
  }
  if (state.timeLeft <= 0) {
    state.over = true;
    state.message = 'Shift selesai! ' + state.served + ' piring tersaji, skor ' + state.score + '.';
  }
}

export { INGREDIENTS, RECIPES };
