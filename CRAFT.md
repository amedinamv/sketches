# Craft

The gallery and the bar at the top of a sketch are one object. The sketches are not.

Each sketch has its own type, palette, texture, and mood. A shader study and a layout study do not have to look related, and neither has to match a personal site. What stays the same is the frame: this index, and the thin bar a sketch can include. There is no house style inside that frame.

## Frame

The index (`index.html`, `sketches.json`) is a ledger. A number, a title, the UI job, a palette swatch, a status (`sketch` or `kit`), and a date. Hairlines, weight, and space do the hierarchy. The accent marks only the newest sketch.

`shared/frame.js` is the only include. Every sketch gets the same bar: `NNN · title · job · Notes · ← index`, and, when the manifest has notes, a drawer. The bar is in a shadow root. It uses Geist and Geist Mono, the same faces as the index. It does not set fonts or colors on the sketch.

The frame has two variants, the same pair as the gallery. Light is warm paper (`#f3efe6`, ink `#1c1a17`). Dark is warm near-black (`#141311`, ink `#f3efe6`). A sketch picks one with `data-frame` on `<html>`, so the chrome matches the sketch instead of the operating system.

```html
<html lang="en" data-frame="dark">
  ...
  <script src="/shared/frame.js"></script>
</html>
```

`data-frame` is `light` or `dark`. If it is missing, the frame is light.

| Sketch | Variant | Why |
| --- | --- | --- |
| 000 Hello WebGPU | dark | The picture is a black field. |
| 001 Hi-Vis After Dark | dark | The scene is pitch black. |
| 002 Magnetic Weight Nav | light | Clay paper. |
| 003 Flute Clear | light | Bone ground. |
| 004 Material Picker | light | Every finish is a light ground. |

On a narrow screen the job drops out of the bar so the title, Notes, and the way back still fit. `?poster=1` skips the bar and leaves any controls hidden. That is how `poster.png` is shot.

A sketch that flows down the page, rather than painting a full-bleed canvas, clears the bar with `var(--frame-offset)` on its top padding. The frame sets that length to the bar, plus the controls band when it is open. Safe areas are included.

The drawer reads four optional fields: `problem`, `interaction` (shown as Idea), `technique`, and `ship` (shown as What I'd ship). Missing fields are skipped. Escape closes it. Focus is a 1px ink outline.

### Controls

Knobs, toggles, and interaction hints sit in one band under the bar. Same type, same ground, same hairline, on desktop and on a phone. Omit the element when the sketch has nothing to add.

```html
<div id="frame-controls" data-frame-controls hidden>
  <p data-frame-hint>
    <span data-when="fine">Hover a card</span>
    <span data-when="coarse">Scroll or tap a card</span>
    to clear the pane.
  </p>
  <div class="fields">
    <label>
      <span>bloom <output id="bloom-out">0.08</output></span>
      <input id="bloom" type="range" min="0" max="1.5" step="0.01" value="0.08" />
    </label>
  </div>
</div>
```

`hidden` stays until the frame takes the element. `data-when="fine"` is the mouse line. `data-when="coarse"` is the touch line. A hint with no `.fields` stays on screen. Fields collapse behind a Controls button below 720px, so a 375px portrait keeps the picture; the hint stays. Opening the band is instant. It does not animate, including when `prefers-reduced-motion` is on.

A control that is the thing being studied stays in the sketch. The material dock in 004 is that case: the job is the picker, so the picker keeps its own type and shape. "Drag to turn" is only a hint, so it lives in the band. 001's sliders and aim hint live in the band. 003's hover line does too. The page title under it ("Fresh cans, behind glass") is the sketch, and stays.

## Per-sketch UX contract

Put this at the top of the sketch README, in this order.

- **Job.** The UI job, in a few words. `hero background`. `reveal-on-alignment hero`.
- **User problem.** What is hard for a person, before any technique.
- **Interaction idea.** The move you are trying.
- **Signature behaviour.** The one behaviour that makes the job obvious.
- **States.** Idle, hover, focus, active, touch, error, no WebGPU, reduced motion. Whichever the piece actually has.
- **What I'd ship.** The version you would put in a product. It is often quieter than the study.

It runs is not done.

## Art direction

Every sketch README states its own art direction. This is not a shared palette. Write the decisions down so the next pass does not drift into a default.

- **Type.** The pairing, and where it comes from. A link, or the folder you self-hosted.
- **Palette.** A name, and the hex values.
- **Texture.** Grain, dither, halftone, paper, or none. Say which.
- **Signature motion.** What moves, why it moves, and how long it takes.

## Checklist

Before a sketch is finished:

- **Typography.** A pairing you chose. Hierarchy from weight and space. No face left on the page because it was the first one in the list.
- **Color and contrast.** Text at least 4.5:1 against its ground. One accent, doing one job.
- **Motion that communicates.** If it does not explain state, it does not move. One signature behaviour. Durations under 400ms. Easing around `cubic-bezier(.2, .8, .2, 1)` when the motion is UI, not a shader's own clock.
- **Mobile.** Touch, portrait, no overflow at 375px.
- **Reduced motion.** A still, or a calm state. No flashes. Pause loops that are only there to be watched.
- **WebGPU fallback.** A WebGL or static path when `navigator.gpu` is missing or only partial. Say so on the page.
- **Performance.** A budget: a DPR cap, a target frame rate, and what you will not load.
- **Poster.** `sketches/NNN-slug/poster.png`, a still of the sketch, linked from `sketches.json` as `poster`.

The index itself stays a document. No WebGL on that page. Posters are images.

## Tells

These read as unset art direction. Don't reach for them by default.

- Inter, because it was the first font in the list
- Acid green on near-black
- Purple gradients
- Extruded type in a default 3D font, plus bloom
- A stack of effects that don't each have a job: grain, gradient, bloom, vignette, and a noise warp all at once

A sketch may still use a loud green, or a 3D word, if that is the idea and the README says why.

## References

1. [Rauno](https://rauno.me/craft). One interaction per piece, and a written reason.
2. [Emil Kowalski](https://emilkowal.ski) and [animations.dev](https://animations.dev). Easing and duration.
3. [Paco](https://paco.me). A ledger index.
4. [Linear, how we redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui). Neutrals tuned by value.
5. [Vercel Design](https://vercel.com/design). A grotesque and a mono as one system.
6. [Teenage Engineering](https://teenage.engineering). One orange, mono labels, spec sheets.
7. [Nothing](https://nothing.tech). A monochrome field plus one red.
8. [Daylight](https://daylightcomputer.com). Warm paper in a technical product.
9. [Family](https://family.co). Small interactions that explain state.
10. [basement](https://basement.studio). WebGL with type that was actually chosen.
11. [Paper shaders](https://shaders.paper.design). Dither, grain, halftone.
12. [Cosmos](https://www.cosmos.so). A curated visual index.

## Graduating to kit/

A sketch moves to [`kit/`](kit/README.md) only when some other surface would actually use it. The kit note is the bar: a UI job, a few props, mobile, a fallback, reduced motion, a performance budget, and a link back to the sketch. Call the kit piece from there. Don't copy the sketch folder into a product.

## Checking the work

Optional, and not vendored into this repo. From a checkout of [amedinamv/projects](https://github.com/amedinamv/projects), point the ai-design-bench scripts at a sketch:

```sh
python path/to/projects/scripts/lint.py sketches/NNN-slug
node path/to/projects/scripts/probe.mjs sketches/NNN-slug
```

Call them from that repo. Don't copy the scripts here.

Caveats:

- They fetch over the network, so `file://` fails. Serve the folder.
- They write `probe/` and `shots/` next to the sketch. Don't commit those by accident.
- A canvas loop is invisible to the reduced-motion check. Watch the sketch with `prefers-reduced-motion` yourself.
- Fonts loaded from Fontshare get flagged. Self-host them.

The bench is a floor. It will not tell you if the piece has taste.
