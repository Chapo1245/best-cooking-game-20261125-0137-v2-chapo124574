// render.js — ONE JOB: draw the whole stall on the canvas.
// Every pixel the judge sees comes from here. No game logic lives here;
// it only reads the state and paints it, big and readable at small sizes.

import { CANVAS_W, CANVAS_H, INGREDIENTS, INGREDIENT_BY_ID, RECIPE_BY_ID, RECIPES, LAYOUT, PALETTE, GRILL_SECONDS } from './config.js';
import { matchingOrder } from './state.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// One ingredient's icon, drawn as vector shapes (no emoji, no images, so the
// render is identical on every machine). cx, cy is the centre, r the radius.
export function drawIngredientIcon(ctx, id, cx, cy, r) {
  const ing = INGREDIENT_BY_ID[id];
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'ayam') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, 2, r, r * 0.72, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5efe0'; ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.5); ctx.lineTo(r * 1.25, -r * 1.05); ctx.stroke();
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath(); ctx.arc(r * 1.3, -r * 1.1, r * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 1.05, -r * 1.25, r * 0.24, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'kambing') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.8, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b48a';
    ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.1, r * 0.5, r * 0.38, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5efe0'; ctx.lineWidth = r * 0.2;
    ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 0.6); ctx.lineTo(r * 1.3, -r * 1.1); ctx.stroke();
  } else if (id === 'lontong') {
    ctx.fillStyle = ing.color;
    rr(ctx, -r, -r * 0.7, r * 2, r * 1.4, r * 0.3); ctx.fill();
    ctx.strokeStyle = '#3f7d4e'; ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.moveTo(-r, -r * 0.15); ctx.lineTo(r, -r * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r, r * 0.3); ctx.lineTo(r, r * 0.3); ctx.stroke();
  } else if (id === 'bumbu') {
    ctx.fillStyle = '#6b4423';
    ctx.beginPath(); ctx.arc(0, r * 0.2, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.85, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8c07a';
    for (const [dx, dy] of [[-0.4, 0.05], [0.1, -0.1], [0.45, 0.15]]) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.16, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'kecap') {
    ctx.fillStyle = ing.color;
    rr(ctx, -r * 0.55, -r * 0.5, r * 1.1, r * 1.4, r * 0.2); ctx.fill();
    ctx.fillStyle = '#d7263d';
    rr(ctx, -r * 0.55, -r * 0.5, r * 1.1, r * 0.45, r * 0.2); ctx.fill();
    ctx.fillStyle = '#f5efe0';
    ctx.font = 'bold ' + Math.round(r * 0.7) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('K', 0, r * 0.45);
  } else if (id === 'sambal') {
    ctx.fillStyle = '#6b4423';
    ctx.beginPath(); ctx.arc(0, r * 0.2, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.85, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.1, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.3, r * 0.2, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7bc043';
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBackground(ctx) {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = PALETTE.bgEdge;
  ctx.fillRect(0, 0, CANVAS_W, 8);
  // Warm counter band behind the bins and grill.
  ctx.fillStyle = '#2a3f3a';
  ctx.fillRect(0, 176, CANVAS_W, 292);
  ctx.fillStyle = '#31483f';
  ctx.fillRect(0, 176, CANVAS_W, 6);
  // Stall awning stripes at the very top edge.
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.orange : PALETTE.amber;
    ctx.fillRect(i * 80, 0, 80, 8);
  }
}

function drawTopBar(ctx, state) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(b.x, b.y + 8, b.w, b.h - 8);
  text(ctx, 'SATE KENCANA', 24, 46, 30, PALETTE.amber, 'bold');
  text(ctx, 'warung sate malam', 250, 46, 16, '#c9bfa8', 'normal');
  // Shift timer: the big countdown, centre.
  const low = state.timeLeft <= 20;
  ctx.fillStyle = low ? PALETTE.red : PALETTE.cream;
  rr(ctx, 520, 16, 240, 40, 20); ctx.fill();
  text(ctx, mmss(state.timeLeft), 640, 46, 28, low ? '#ffffff' : PALETTE.ink, 'bold', 'center');
  text(ctx, 'SHIFT', 500, 46, 14, '#c9bfa8', 'bold', 'right');
  // Score and combo, right.
  text(ctx, state.score + ' koin', 1256, 34, 26, PALETTE.white, 'bold', 'right');
  text(ctx, 'kombo x' + state.combo + '  •  tersaji ' + state.served, 1256, 52, 14, '#c9bfa8', 'normal', 'right');
}

function drawOrders(ctx, state) {
  const o = LAYOUT.orders;
  text(ctx, 'PESANAN', o.x, o.y - 6, 15, PALETTE.amber, 'bold');
  state.orders.forEach((order, i) => {
    const recipe = RECIPE_BY_ID[order.recipeId];
    const x = o.x + i * (o.w + o.gap);
    const y = o.y;
    const frac = Math.max(0, order.timeLeft / order.total);
    const urgent = frac < 0.35;
    ctx.fillStyle = PALETTE.cream;
    rr(ctx, x, y, o.w, o.h, 12); ctx.fill();
    ctx.strokeStyle = urgent ? PALETTE.red : '#d8c9a8';
    ctx.lineWidth = urgent ? 4 : 2;
    rr(ctx, x, y, o.w, o.h, 12); ctx.stroke();
    text(ctx, recipe.name, x + 14, y + 30, 22, PALETTE.ink, 'bold');
    text(ctx, recipe.price + ' koin', x + o.w - 14, y + 30, 18, '#7a5a17', 'bold', 'right');
    recipe.needs.forEach((id, j) => {
      const cx = x + 34 + j * 62;
      drawIngredientIcon(ctx, id, cx, y + 58, 15);
      text(ctx, INGREDIENT_BY_ID[id].short, cx, y + 80, 11, '#6b6252', 'bold', 'center');
    });
    // Per-order timer bar, with the seconds on the same line as the labels.
    text(ctx, Math.ceil(order.timeLeft) + ' dtk', x + o.w - 14, y + 80, 12, urgent ? PALETTE.red : '#6b6252', 'bold', 'right');
    ctx.fillStyle = '#e5dcc4';
    rr(ctx, x + 14, y + o.h - 14, o.w - 28, 8, 4); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? PALETTE.greenBright : frac > 0.25 ? PALETTE.amber : PALETTE.red;
    if (frac > 0) { rr(ctx, x + 14, y + o.h - 14, (o.w - 28) * frac, 8, 4); ctx.fill(); }
  });
}

function drawBins(ctx, state) {
  const b = LAYOUT.bins;
  text(ctx, 'BAHAN DI COUNTER — klik atau tekan 1-6', b.x, b.y - 6, 15, PALETTE.amber, 'bold');
  INGREDIENTS.forEach((ing, i) => {
    const x = b.x + i * (b.w + b.gap);
    const y = b.y;
    ctx.fillStyle = ing.color;
    rr(ctx, x, y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    rr(ctx, x, y, b.w, b.h, 12); ctx.stroke();
    drawIngredientIcon(ctx, ing.id, x + b.w / 2, y + 34, 20);
    const dark = ing.id === 'kecap' || ing.id === 'sambal' || ing.id === 'bumbu';
    text(ctx, ing.name, x + b.w / 2, y + 74, 14, dark ? '#ffffff' : PALETTE.ink, 'bold', 'center');
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    rr(ctx, x + 6, y + 6, 22, 22, 6); ctx.fill();
    text(ctx, ing.key, x + 17, y + 22, 14, '#ffffff', 'bold', 'center');
  });
}

function drawGrill(ctx, state) {
  const g = LAYOUT.grill;
  ctx.fillStyle = '#3a2e26';
  rr(ctx, g.x, g.y, g.w, g.h, 12); ctx.fill();
  ctx.strokeStyle = '#57453a';
  ctx.lineWidth = 2;
  rr(ctx, g.x, g.y, g.w, g.h, 12); ctx.stroke();
  text(ctx, 'PANGGANG', g.x + 16, g.y + 28, 18, PALETTE.orange, 'bold');
  text(ctx, 'Spasi', g.x + g.w - 16, g.y + 28, 14, '#c9bfa8', 'bold', 'right');
  // Three skewer slots with glowing coals.
  for (let i = 0; i < 3; i++) {
    const sx = g.x + 40 + i * 120;
    ctx.fillStyle = '#241c17';
    rr(ctx, sx, g.y + 40, 100, 36, 8); ctx.fill();
    ctx.fillStyle = '#ff7a1a';
    for (let c = 0; c < 5; c++) {
      ctx.beginPath(); ctx.arc(sx + 14 + c * 18, g.y + 66, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (state.grilling > 0) {
      ctx.fillStyle = '#f2b705';
      ctx.beginPath(); ctx.arc(sx + 50, g.y + 52, 12, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (state.grilling > 0) {
    const frac = 1 - state.grilling / GRILL_SECONDS;
    ctx.fillStyle = '#241c17';
    rr(ctx, g.x + 16, g.y + g.h - 14, g.w - 32, 8, 4); ctx.fill();
    ctx.fillStyle = PALETTE.amber;
    rr(ctx, g.x + 16, g.y + g.h - 14, (g.w - 32) * frac, 8, 4); ctx.fill();
  }
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#31483f';
  rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  text(ctx, 'PIRING — rakitanmu', p.x + 16, p.y + 28, 17, PALETTE.cream, 'bold');
  const status = state.grilled ? 'MATANG!' : state.grilling > 0 ? 'DIPANGGANG...' : state.plate.length + '/3 bahan';
  text(ctx, status, p.x + p.w - 16, p.y + 28, 15, state.grilled ? PALETTE.amber : '#c9bfa8', 'bold', 'right');
  // The plate itself: a big white ellipse.
  ctx.fillStyle = PALETTE.white;
  ctx.beginPath(); ctx.ellipse(p.x + 150, p.y + 96, 130, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(p.x + 150, p.y + 96, 130, 44, 0, 0, Math.PI * 2); ctx.stroke();
  state.plate.forEach((id, i) => {
    drawIngredientIcon(ctx, id, p.x + 80 + i * 70, p.y + 92, 22);
  });
  if (state.plate.length === 0) {
    text(ctx, 'kosong — klik bahan di atas', p.x + 150, p.y + 100, 15, '#9a8f7a', 'normal', 'center');
  }
  if (state.grilled) {
    ctx.fillStyle = PALETTE.amber;
    ctx.beginPath(); ctx.arc(p.x + 150, p.y + 52, 16, 0, Math.PI * 2); ctx.fill();
    text(ctx, '✓', p.x + 150, p.y + 58, 18, PALETTE.ink, 'bold', 'center');
  }
  // Clear button.
  ctx.fillStyle = '#5a4a3a';
  rr(ctx, p.x + p.w - 120, p.y + p.h - 40, 104, 28, 8); ctx.fill();
  text(ctx, 'Buang (C)', p.x + p.w - 68, p.y + p.h - 21, 14, '#ffffff', 'bold', 'center');
  // Arrow toward the pass.
  text(ctx, '→', p.x + p.w + 8, p.y + 84, 44, PALETTE.amber, 'bold');
}

function drawPass(ctx, state) {
  const p = LAYOUT.pass;
  const match = matchingOrder(state);
  ctx.fillStyle = match ? PALETTE.green : '#2a3f3a';
  rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  ctx.strokeStyle = match ? PALETTE.greenBright : '#3f5a50';
  ctx.lineWidth = match ? 4 : 2;
  rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.stroke();
  text(ctx, 'MEJA SAJI', p.x + 16, p.y + 28, 17, PALETTE.cream, 'bold');
  if (match) {
    text(ctx, 'SIAP SAJI!', p.x + p.w - 16, p.y + 28, 17, PALETTE.amber, 'bold', 'right');
    // The finished plate, served on the pass.
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.ellipse(p.x + 120, p.y + 96, 105, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(p.x + 120, p.y + 96, 105, 40, 0, 0, Math.PI * 2); ctx.stroke();
    const recipe = RECIPE_BY_ID[match.recipeId];
    recipe.needs.forEach((id, i) => {
      drawIngredientIcon(ctx, id, p.x + 60 + i * 55, p.y + 92, 19);
    });
    text(ctx, recipe.name, p.x + 250, p.y + 86, 16, PALETTE.white, 'bold');
    text(ctx, recipe.price + ' koin', p.x + 250, p.y + 110, 16, PALETTE.amber, 'bold');
    ctx.fillStyle = PALETTE.amber;
    rr(ctx, p.x + p.w - 150, p.y + p.h - 40, 134, 28, 8); ctx.fill();
    text(ctx, 'SAJIKAN (Enter)', p.x + p.w - 83, p.y + p.h - 21, 14, PALETTE.ink, 'bold', 'center');
  } else if (state.lastServed && state.elapsed - state.lastServed.at < 6) {
    // The dish just served, still on the pass: a plate ready to serve.
    const recipe = RECIPE_BY_ID[state.lastServed.recipeId];
    text(ctx, 'TERSAJI!', p.x + p.w - 16, p.y + 28, 17, PALETTE.greenBright, 'bold', 'right');
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.ellipse(p.x + 120, p.y + 96, 105, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(p.x + 120, p.y + 96, 105, 40, 0, 0, Math.PI * 2); ctx.stroke();
    recipe.needs.forEach((id, i) => {
      drawIngredientIcon(ctx, id, p.x + 60 + i * 55, p.y + 92, 19);
    });
    text(ctx, recipe.name, p.x + 250, p.y + 86, 16, PALETTE.white, 'bold');
    text(ctx, 'sudah diantar', p.x + 250, p.y + 110, 15, '#c9bfa8', 'bold');
  } else {
    text(ctx, 'Belum ada piring yang cocok.', p.x + 150, p.y + 96, 15, '#9a8f7a', 'normal', 'center');
    text(ctx, 'Rakit 3 bahan → panggang → sajikan.', p.x + 150, p.y + 122, 14, '#7a8f88', 'normal', 'center');
  }
}

function drawMiddle(ctx, state) {
  // The strip between plate and pass: grill progress or a serving hint.
  const x = 476;
  const y = 300;
  const w = 328;
  if (state.grilling > 0) {
    const frac = 1 - state.grilling / GRILL_SECONDS;
    ctx.fillStyle = '#241c17';
    rr(ctx, x, y + 40, w, 72, 12); ctx.fill();
    text(ctx, 'MEMANGGANG...', x + w / 2, y + 70, 20, PALETTE.amber, 'bold', 'center');
    ctx.fillStyle = '#3a2e26';
    rr(ctx, x + 16, y + 84, w - 32, 12, 6); ctx.fill();
    ctx.fillStyle = PALETTE.orange;
    rr(ctx, x + 16, y + 84, (w - 32) * frac, 12, 6); ctx.fill();
  } else if (state.grilled) {
    text(ctx, 'MATANG!', x + w / 2, y + 70, 26, PALETTE.amber, 'bold', 'center');
    text(ctx, 'klik pesanan yang cocok', x + w / 2, y + 100, 15, '#c9bfa8', 'normal', 'center');
  } else {
    text(ctx, '1-6  →  Spasi  →  Enter', x + w / 2, y + 70, 20, '#8a9a93', 'bold', 'center');
    text(ctx, 'pilih bahan, panggang, sajikan', x + w / 2, y + 100, 15, '#7a8f88', 'normal', 'center');
  }
}

function drawMessage(ctx, state) {
  const m = LAYOUT.message;
  text(ctx, state.message, m.x + m.w / 2, m.y + 26, 22, PALETTE.cream, 'bold', 'center');
}

function drawRecipes(ctx) {
  const r = LAYOUT.recipes;
  text(ctx, 'RESEP WARUNG', r.x, r.y - 6, 15, PALETTE.amber, 'bold');
  RECIPES.forEach((recipe, i) => {
    const x = r.x + i * (r.w + r.gap);
    const y = r.y;
    ctx.fillStyle = '#243832';
    rr(ctx, x, y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = '#3f5a50';
    ctx.lineWidth = 2;
    rr(ctx, x, y, r.w, r.h, 10); ctx.stroke();
    text(ctx, recipe.name, x + 12, y + 24, 16, PALETTE.cream, 'bold');
    text(ctx, recipe.price + ' koin', x + r.w - 12, y + 24, 14, PALETTE.amber, 'bold', 'right');
    recipe.needs.forEach((id, j) => {
      drawIngredientIcon(ctx, id, x + 26 + j * 44, y + 56, 14);
    });
  });
}

function drawHelp(ctx) {
  const h = LAYOUT.help;
  ctx.fillStyle = '#243832';
  rr(ctx, h.x, h.y, h.w, h.h, 10); ctx.fill();
  text(ctx, 'Cara main:  klik bahan (1-6)  •  Spasi = panggang  •  Enter = sajikan  •  C = buang piring  •  Sajikan sebelum timer pesanan habis!', h.x + h.w / 2, h.y + 26, 16, '#c9bfa8', 'bold', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(10, 16, 15, 0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = PALETTE.cream;
  rr(ctx, 340, 200, 600, 320, 16); ctx.fill();
  text(ctx, 'SHIFT SELESAI!', 640, 270, 40, PALETTE.ink, 'bold', 'center');
  text(ctx, state.served + ' piring tersaji', 640, 330, 24, PALETTE.ink, 'normal', 'center');
  text(ctx, 'Skor akhir: ' + state.score + ' koin', 640, 370, 24, PALETTE.ink, 'normal', 'center');
  text(ctx, 'Kombo terbaik: x' + state.bestCombo, 640, 410, 24, PALETTE.ink, 'normal', 'center');
  text(ctx, 'Tekan R untuk shift baru', 640, 470, 18, '#7a5a17', 'bold', 'center');
}

export function render(ctx, state) {
  drawBackground(ctx);
  drawTopBar(ctx, state);
  drawOrders(ctx, state);
  drawBins(ctx, state);
  drawGrill(ctx, state);
  drawPlate(ctx, state);
  drawMiddle(ctx, state);
  drawPass(ctx, state);
  drawMessage(ctx, state);
  drawRecipes(ctx, state);
  drawHelp(ctx, state);
  if (state.over) drawGameOver(ctx, state);
}
