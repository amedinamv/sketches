# kit/

Graduated sketches: reusable, drop-in pieces harvested from `sketches/`.

A sketch moves here only when it earns it. Each kit piece:

- Lives in `kit/<name>/` with its own README (what UI job it serves, where it's been used).
- Is self-contained, with a small set of props/knobs (color, speed, intensity, ...).
- Works on mobile (touch, portrait) and falls back when WebGPU is missing.
- Respects `prefers-reduced-motion` with a calm static or low-motion version.
- States a performance budget (target fps, DPR cap, bundle size).
- Links back to the sketch it came from.

Consumers (Meridian, Captapage, cinnamon landings, client sites) call pieces from here rather than copying them.
