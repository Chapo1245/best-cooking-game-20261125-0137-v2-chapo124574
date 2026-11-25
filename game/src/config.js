// Sate Kencana — night-market satay grill.
// config.js — ONE JOB: every tunable constant of the game.
// Recipes, ingredients, timings, layout and palette live here and nowhere else.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const SHIFT_SECONDS = 120;

// Six ingredients the player picks from. Each has a stable key, a display
// name, a short label for chips, and a fill colour used by the renderer.
export const INGREDIENTS = [
  { id: 'ayam',    name: 'Ayam',        short: 'AYM', key: '1', color: '#f2b705', dark: '#8a6d00' },
  { id: 'kambing', name: 'Kambing',     short: 'KMB', key: '2', color: '#c96f2e', dark: '#6e3410' },
  { id: 'lontong', name: 'Lontong',     short: 'LNT', key: '3', color: '#f5efe0', dark: '#6b6252' },
  { id: 'bumbu',   name: 'Bumbu Kacang', short: 'BMU', key: '4', color: '#8a5a2b', dark: '#4a2c12' },
  { id: 'kecap',   name: 'Kecap Manis', short: 'KCP', key: '5', color: '#2e2a26', dark: '#000000' },
  { id: 'sambal',  name: 'Sambal',      short: 'SBL', key: '6', color: '#d7263d', dark: '#6e0f1e' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// Five dishes. An order is one dish: the plate must hold exactly its three
// ingredients, then be grilled, then served. Prices are the coins earned.
export const RECIPES = [
  { id: 'sate-ayam',    name: 'Sate Ayam',     needs: ['ayam', 'bumbu', 'lontong'], price: 120 },
  { id: 'sate-kambing', name: 'Sate Kambing',  needs: ['kambing', 'kecap', 'lontong'], price: 150 },
  { id: 'sate-pedas',   name: 'Sate Pedas',    needs: ['ayam', 'sambal', 'kecap'],    price: 140 },
  { id: 'sate-campur',  name: 'Sate Campur',   needs: ['ayam', 'kambing', 'bumbu'],   price: 170 },
  { id: 'sate-komplit', name: 'Sate Komplit',  needs: ['kambing', 'bumbu', 'sambal'],  price: 180 },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// Difficulty: order timers shrink and new orders arrive sooner as the score grows.
export const ORDER_SLOTS = 3;
export const PLATE_MAX = 3;
export const GRILL_SECONDS = 2.5;
export const ORDER_TIME_START = 45; // seconds for a fresh order at score 0
export const ORDER_TIME_MIN = 18;   // floor as the rush builds
export const ORDER_TIME_PER_300 = 4; // seconds shaved per 300 coins earned
export const WRONG_SERVE_PENALTY = 25; // coins lost on a wrong plate
export const EXPIRED_PENALTY = 15;     // coins lost when an order times out
export const COMBO_BONUS_PER = 10;     // extra coins per combo step

export const PALETTE = {
  bg: '#1d2b2a',
  bgEdge: '#15201f',
  panel: '#243832',
  cream: '#fff7e6',
  ink: '#2b2118',
  muted: '#8a7f6d',
  amber: '#ffb703',
  orange: '#fb8500',
  green: '#2f6f5e',
  greenBright: '#43aa8b',
  red: '#d7263d',
  white: '#ffffff',
};

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  orders: { x: 24, y: 64, w: 380, h: 104, gap: 48 },
  bins: { x: 24, y: 184, w: 120, h: 92, gap: 16 },
  grill: { x: 856, y: 184, w: 400, h: 92 },
  plate: { x: 24, y: 300, w: 436, h: 152 },
  pass: { x: 820, y: 300, w: 436, h: 152 },
  message: { x: 24, y: 464, w: 1232, h: 36 },
  recipes: { x: 24, y: 512, w: 240, h: 84, gap: 16 },
  help: { x: 24, y: 620, w: 1232, h: 40 },
};
