# Relic Runner — Prototype v0.1

Vertical mobile-first archaeological platformer prototype built with Phaser 3 + TypeScript + Vite.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

`vite.config.ts` uses `base: './'`, so the generated `dist/` works from a GitHub Pages project path. You can deploy `dist` with a Pages workflow or `gh-pages`.

## Prototype features
- Portrait 432×768 design, responsive scaling
- Male/female explorer selection
- Arcade physics: horizontal movement + vector velocity jump
- Keyboard and mobile touch controls
- Pause menu
- Four expeditions: Maya, Rome, Egypt, China
- Progressive world unlocking
- Relic at the end of every level
- Persistent museum collection via localStorage
- Music preference toggle placeholder
- Reset progress
- Pixel-art rendering enabled

## Next art/audio pass
Replace generated placeholder textures with sprite sheets in `public/assets/`, then define Phaser animations for idle/run/jump/action. Add ambience, footsteps, jump, relic and UI sounds. Each civilization should receive its own tileset, hazards, enemies and museum entry.
