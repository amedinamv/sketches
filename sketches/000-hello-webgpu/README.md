# 000 · Hello WebGPU

A full-screen animated fragment shader on WebGPU, with the same picture on WebGL2 when WebGPU is missing.

## Job

Hero background.

## User problem

A full-bleed hero background has to keep running on machines that do not have WebGPU.

## Interaction idea

Nothing to steer. The shader plays on its own, and the page switches to WebGL2 when WebGPU is missing or fails to start.

## Signature behaviour

The colour loop on a single full-screen triangle. The behaviour that matters for the job is the fallback, not the palette.

## States

- Idle: the shader is running.
- No WebGPU: the WebGL2 fallback, with a notice.
- Error: a notice when neither backend can draw.
- Reduced motion: not yet. The loop still runs.

## What I'd ship

Behind real content, with the loop paused for reduced motion, and the WebGL2 path treated as the one phones will hit.

## Art direction

- **Type.** None in the picture. The sketch's own notice uses the system mono. The frame is the dark variant and does not set this page's type.
- **Palette.** Night garden. Ground `#000000`. The loop passes through `#a7e758`, `#ca8002`, `#063546`, `#ffe7e7`.
- **Texture.** A vignette in the shader. No grain.
- **Signature motion.** The palette drifts on its own. It does not ease against a pointer.
