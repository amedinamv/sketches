# 004 · Material Picker

Rough preview. One twisted, five-lobed form and a small dock with three finishes: Prism glass, Gummy, and Flock. Each finish recolours the poster behind the object and spells its own name across it, so the glass has something to refract.

## Job

Material selector, for a product configurator.

## User problem

A material swatch is a flat chip. It cannot show how a finish bends light, glows, or eats it until you see it on a form.

## Interaction idea

Swap the finish and the whole frame changes with it: material, backdrop colour, word, and spec line.

## States

- **Idle.** Slow turn and a gentle bob.
- **Drag.** Pointer or finger turns and tilts the object, with inertia on release.
- **Switch.** The backdrop crossfades while the material swaps.
- **Reduced motion.** No idle turn, no bob, instant switch.
- **Loading.** "Loading light" until the HDRI arrives.

## What I'd ship

Load the real product mesh, keep the dock and the backdrop that recolours with the finish, and drop the poster word on small screens if it competes.

## Art direction

- **Type.** [Zodiak](https://www.fontshare.com/fonts/zodiak) (Fontshare) for the poster words and picker labels. [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) (Google Fonts) for the spec line.
- **Palette.** Per finish. Prism `#E7E3DC` / `#17161A`. Gummy `#F4D9CE` / `#3A0D18` / `#FF5A2A`. Flock `#E4E1EC` / `#14163A`.
- **Texture.** Fine grain baked into the poster canvas.
- **Technique.** three.js r186 `MeshPhysicalMaterial` on a hand-built twisted superformula mesh, lit by the Poly Haven `studio_small_09` HDRI. Glass: transmission, IOR 1.52, dispersion, thin-film iridescence. Gummy: transmission with attenuation colour, sheen, and a view-dependent thickness tweak. Flock: sheen plus a generated fibre normal map. Pixel ratio capped at 1.75.
