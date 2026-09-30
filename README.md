# sketches

Weekly creative-coding sketches: WebGPU, shaders, WebGL, motion and layout.

Every push to `main` deploys to Vercel automatically. The site is plain static files: no framework and no build step.

## Structure

```
.
├── index.html            # gallery, reads sketches.json on the client
├── sketches.json         # manifest of published sketches
├── vercel.json           # cleanUrls + trailingSlash
└── sketches/
    └── 000-hello-webgpu/
        └── index.html    # each sketch is self-contained
```

## Convention

- Each sketch lives in `sketches/NNN-slug/`, e.g. `sketches/001-flow-field/`.
  - `NNN` is a zero-padded running number (`000`, `001`, …) so folders sort chronologically.
  - `slug` is short and kebab-case.
- Each sketch has its own `index.html` as the entry point. Prefer a single self-contained file with no dependencies.
  - If a sketch outgrows one file, it can be its own Vite (or similar) project inside its folder. Commit the built output (e.g. build with `base: './'` into the sketch folder), or add a build step to Vercel at that point.
- Link back to the gallery with `<a href="/">`.

## Adding a sketch

1. Create `sketches/NNN-slug/index.html`.
2. Add an entry to `sketches.json`:

   ```json
   {
     "slug": "001-flow-field",
     "title": "Flow Field",
     "date": "2026-10-07",
     "tags": ["canvas", "noise"],
     "description": "Particles advected through curl noise."
   }
   ```

   Only `slug` is required. The gallery sorts entries newest-first by slug.
3. Commit and push to `main`, and Vercel deploys it. It will be at `/sketches/NNN-slug/`.

## Run locally

```sh
npx serve .
```

Then open http://localhost:3000. You need a server rather than `file://` because the gallery `fetch`es `sketches.json`, and WebGPU requires a secure context (`localhost` counts).
