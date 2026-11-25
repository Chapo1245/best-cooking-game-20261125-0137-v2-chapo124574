# Sate Kencana — warung sate malam

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Chapo1245/best-cooking-game-20261125-0137-v2-chapo124574/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Chapo1245/best-cooking-game-20261125-0137-v2-chapo124574/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A night-market satay grill game, built for the [make.fun bounty "Best Cooking Game"](https://make.fun/bounty/best-cooking-game-20261125-0137).

## How to play

You run a satay stall for one 120-second shift. Three order tickets hang
above the counter, each with its own timer. Build the dish on the plate,
grill it, and serve it before its ticket runs out.

- **Click a bin (or press 1–6)** — add one of six ingredients to the plate
  (ayam, kambing, lontong, bumbu kacang, kecap manis, sambal).
- **Space** — grill the plate (2.5 s on the coals).
- **Enter (or click the matching ticket)** — serve the grilled plate.
- **C** — clear the plate. **R** — new shift after game over.

Five recipes pay 120–180 coins; a wrong serve costs 25, an expired order
costs 15. Serving in a row builds a combo (+10 coins per step), and as your
score grows the order timers shrink — the rush hour really does rush.

## Run it

Open `game/index.html` in a browser (or serve `game/` over HTTP). No build
step, no dependencies, no external resources — plain HTML, CSS-free canvas,
and ES modules.

```sh
cd game && python3 -m http.server 8000
# open http://localhost:8000/
```

## Screenshots

Deterministic single-frame renders (`?shot=cover|rush|serve&seed=1`):

| shot | moment |
| --- | --- |
| `1-cover.png` | mid-shift: two ingredients on the plate, grill at 60%, a dish just served on the pass |
| `2-rush.png` | rush hour: combo x5, an order at 9 seconds |
| `3-serve.png` | a grilled plate ready to serve, "SIAP SAJI!" |

## Layout

One job per file, names match jobs:

| file | job |
| --- | --- |
| `game/src/config.js` | recipes, ingredients, timings, layout, palette |
| `game/src/random.js` | seeded RNG (mulberry32) |
| `game/src/state.js` | shift rules: orders, plate, grill, serve, combo |
| `game/src/render.js` | everything drawn on the canvas |
| `game/src/input.js` | mouse hit-testing and keyboard |
| `game/src/audio.js` | WebAudio synth (sizzle, ding, thud) |
| `game/src/shots.js` | deterministic screenshot presets |
| `game/src/main.js` | boot, animation loop, `?shot=` single-frame mode |
| `main.ts` | hand-in program: copies `game/` + `screenshots/` and writes `dossier.json` |

## Hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/dossier.json (game + screenshots + source text)
```

---

Built for [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137) — referral code `wtacm6ft`.
