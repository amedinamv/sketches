# 003 · Flute Clear

Rough preview. A 2×2 grid of craft beer cans, each photo behind ribbed glass so only stripes of colour show. Hover, focus, or scroll a card into the middle of a phone screen and the ribs clear, then the price and CTA fade in.

## Job

Card hover.

## User problem

A product grid shows every card at full volume, so nothing tells you which one you are looking at.

## Interaction idea

Colour first, label on intent. The fluted pane hides detail but keeps each can's colour. Intent (hover, keyboard focus, or the centred card on touch) clears it.

## States

- **Rest.** All cards fluted. Price and CTA hidden.
- **Hover / focus.** The ribs ease out, the photo snaps sharp, price and CTA fade in. Leaving eases the ribs back in.
- **Touch.** No hover. An IntersectionObserver clears the card closest to the vertical centre of the viewport as you scroll. A tap toggles it as a backup.
- **Reduced motion.** The swap is instant.

## What I'd ship

One shared canvas or a CSS fallback for long grids, and product photos shot on consistent backdrops so the stripes read as one family.

## Art direction

- **Type.** [Panchang](https://www.fontshare.com/fonts/panchang) (Fontshare) for titles. [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (Google Fonts) for price and meta. The frame is the light variant. "Hover a card" / "Scroll or tap a card" is the frame hint. The title and the line under it stay on the page.
- **Palette.** Gallery Soft: bone `#F7F4EF`, warm grey `#E8E2D8`, ink `#2A2723`, secondary `#6F6A63`, slate `#3D5A80`, brass `#C9A227` (highlight only).
- **Texture.** Faint SVG grain over the page.
- **Technique.** [Paper Shaders](https://shaders.paper.design/fluted-glass) `FlutedGlass` from `@paper-design/shaders` via esm.sh, one WebGL canvas per card.
- **Photos.** Unsplash, see [`img/CREDITS.txt`](img/CREDITS.txt).
