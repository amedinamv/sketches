# 002 · Magnetic Weight Nav

A vertical menu of six words. As the cursor or a finger approaches, each word gains weight and a little width in proportion to its distance. The row you are about to choose is already the heaviest thing on the page.

## Job

Menu or nav reveal. The piece is meant to graduate into a portfolio or landing navigation.

## User problem

A static list treats every destination as equally likely. The type gives no hint which row the pointer is heading for, so the choice only becomes visible after the click.

## Interaction idea

Each row measures the vertical distance from its centre to the pointer or the contact point. A smoothstep of that distance, inside a falloff radius, sets the variable font’s weight and width. The single nearest word is set in signal blue. Rows stay put: only the letterforms change.

## Signature behaviour

Approach a word and it thickens, then widens, before you land on it. Neighbours take a share of that weight based on how close they are. The further rows stay light and slightly condensed. Lift the finger, or leave the window, and the list eases back to rest. A mono column beside each word prints the live `wght` and `wdth` values, the way a type specimen would.

Distance is vertical, to the centre of the row, so the full width of a row is the thing you are about to tap. Targets ease with a lerp inside `requestAnimationFrame`. The loop runs only while a value is still moving, then stops.

## States

- **Rest.** No pointer and no keyboard focus. Every word sits at the minimum weight and width, ink on clay.
- **Approaching.** Pointer or finger inside the falloff. Weight and width rise together. Several words can be partly heavy. Only the nearest is blue.
- **Closest.** The pointer is on that row. Maximum weight and width, signal colour. The spec column shows the ceiling values.
- **Touch drag.** A finger on the list drives the same falloff. The contact is read from touch events: with `touch-action: pan-y` the browser may cancel the pointer stream in order to scroll, and the touch stream keeps reporting. The script never calls `preventDefault` on the touch, so a vertical drag is free to scroll when the page can. The list fits a portrait viewport, so the drag reads as the magnet. A tap still follows the `#` anchor. A drag past 12px stays on the page.
- **Keyboard focus.** Tabbing to an item makes that row the point the falloff is measured from, and draws a 2px ink outline. Pointer focus (a click or a tap) does not lock the magnet, so a finger can keep travelling down the list.
- **Reduced motion.** No lerp and no width shift. The nearest or focused word switches to bold (700) and signal immediately. The others sit at a regular 400.

## What I'd ship

Drop the spec column; it is the sketch’s teaching layer. Keep the knobs. Point the anchors at real routes, and add a current-page state that holds one word at the heavy setting with no pointer nearby. Pointer, touch, keyboard, and reduced motion are already in place, which is the part worth moving into `kit/`.

## Art direction

### Fonts

- **Bricolage Grotesque**, Mathieu Triay, SIL Open Font License. [Google Fonts](https://fonts.google.com/specimen/Bricolage+Grotesque). The latin variable file served for `opsz,wdth,wght@12..96,75..100,200..800` has three axes: `opsz` 12–96 (default 96), `wght` 200–800 (default 800), `wdth` 75–100 (default 100). Width is available, so the sketch uses it. Words set `font-weight`, `font-stretch`, and `font-variation-settings` (`opsz` pinned at 96 for display sizes).
- **IBM Plex Mono**, IBM, SIL Open Font License. [Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Mono). Spec column. The top bar is the shared frame, light variant, in Geist Mono.

### Palette

| Role | Hex | On clay `#E9E2D6` |
| --- | --- | --- |
| Clay, background | `#E9E2D6` | — |
| Ink, words at rest | `#1B1A17` | 13.5:1 |
| Signal, the single closest word | `#2F4BFF` | 4.6:1 |
| Muted, gallery swatch | `#8C857A` | 2.8:1 |
| Spec, mono labels | `#5D5850` | 5.5:1 |

`#8C857A` is the specified mute. On this clay it measures 2.84:1, short of WCAG AA for text (4.5:1) and for large text (3:1), so the page does not set type in it. The spec labels use `#5D5850`, the same warm grey darkened until the contrast is 5.5:1. The top rule belongs to the shared frame.

### Texture

An inline SVG tile of `feTurbulence` fractal noise (`stitchTiles`, two octaves). A colour matrix scales the tile’s alpha to 0.02, and the tile repeats across the viewport. The overlay does not receive the pointer.

### Motion

Frame lerp at `--ease` (default 0.14), which settles over roughly a third of a second. The animation frame loop starts on pointer, focus, or resize, and cancels once every word is within a fraction of its target. `prefers-reduced-motion: reduce` snaps. With JavaScript off, hover and keyboard focus still switch the word to the heavy signal setting, instantly under reduced motion.

## Knobs

Custom properties on `:root` in `index.html`. The script reads them back on each gesture.

| Property | Default | What it does |
| --- | --- | --- |
| `--falloff` | `280px` (`150px` under 560px of height) | Distance at which a word is fully at rest |
| `--weight-min` | `340` | Resting `wght` |
| `--weight-max` | `800` | `wght` at distance zero |
| `--width-min` | `80` | Resting `wdth` |
| `--width-max` | `100` | `wdth` at distance zero |
| `--ease` | `0.14` | Lerp amount per frame |
| `--signal` | `#2F4BFF` | Colour of the single closest word |

`--weight-bold` (700), `--weight-rest` (400), and `--width-rest` (100) are the reduced-motion pair. `--opsz` (96) pins optical size.
