# sketches

Weekly creative-coding sketches: WebGPU, shaders, WebGL, motion and layout.

The frame, the per-sketch contract, and the checklist live in [CRAFT.md](CRAFT.md). Sketches do not share a house style. The index and the frame around a sketch — the bar, the notes, and the optional controls band — are the only consistent pieces.

Live: https://sketches-ochre.vercel.app

Every push to `main` deploys to Vercel automatically. The site is plain static files: no framework and no build step.

## Structure

```
.
├── CRAFT.md              # frame, contract, checklist
├── index.html            # gallery, reads sketches.json on the client
├── sketches.json         # manifest of published sketches
├── vercel.json           # cleanUrls + trailingSlash
├── shared/
│   ├── frame.js          # top bar, notes drawer, optional controls band
│   ├── frame.css
│   └── fonts/            # Geist and Geist Mono, latin, OFL
└── sketches/
    └── 000-hello-webgpu/
        ├── index.html    # each sketch is self-contained
        └── poster.png    # still, shown by the gallery
```

## Convention

- Each sketch lives in `sketches/NNN-slug/`, e.g. `sketches/001-flow-field/`.
  - `NNN` is a zero-padded running number (`000`, `001`, …) so folders sort chronologically.
  - `slug` is short and kebab-case.
- Each sketch has its own `index.html` as the entry point. Prefer a single self-contained file with no dependencies.
  - If a sketch outgrows one file, it can be its own Vite (or similar) project inside its folder. Commit the built output (e.g. build with `base: './'` into the sketch folder), or add a build step to Vercel at that point.
- Include the frame once, at the end of `<body>`: `<script src="/shared/frame.js"></script>`. On `<html>`, set `data-frame="light"` or `data-frame="dark"` so the bar matches the sketch. The frame does not set the sketch's fonts or colors.
- If the sketch needs knobs or an interaction hint, add them in `[data-frame-controls]`. The markup is in [CRAFT.md](CRAFT.md). A control that is the experience itself stays in the sketch.
- Add `poster.png` in the sketch folder (a still) and point `poster` at it.
- The sentence at the top of the gallery is `#header-line` in `index.html`. Replace that text; the layout does not depend on it.

## Adding a sketch

1. Create `sketches/NNN-slug/index.html`.
2. Add an entry to `sketches.json`:

   ```json
   {
     "slug": "001-flow-field",
     "title": "Flow Field",
     "date": "2026-10-07",
     "tags": ["canvas", "noise"],
     "description": "Particles advected through curl noise.",
     "job": "hero background",
     "problem": "What is hard for the person, before the technique.",
     "interaction": "The move the sketch is trying.",
     "technique": "Optional. Shown in the sketch bar's notes.",
     "ship": "Optional. The version you would actually ship.",
     "palette": ["#141816", "#d9d4c8", "#2f6f4e"],
     "status": "sketch",
     "poster": "/sketches/001-flow-field/poster.png"
   }
   ```

   Only `slug` is required. Older entries, with just `slug`, `title`, `date`, `tags`, and `description`, still list. The gallery sorts entries newest-first by slug. `status` is `sketch` or `kit`. `technique` and `ship` are optional notes for the bar.
3. Set `data-frame="light"` or `data-frame="dark"` on `<html>`. Before `</body>`, add `<script src="/shared/frame.js"></script>`. Pad the top of a scrolling sketch with `var(--frame-offset)` so the bar does not cover the first line. Full-bleed canvases can sit under the bar.
4. Save a still as `poster.png` in the sketch folder.
5. Commit and push to `main`, and Vercel deploys it. It will be at `/sketches/NNN-slug/`.

## Run locally

```sh
npx serve .
```

Then open http://localhost:3000. You need a server rather than `file://` because the gallery `fetch`es `sketches.json`, and WebGPU requires a secure context (`localhost` counts).
