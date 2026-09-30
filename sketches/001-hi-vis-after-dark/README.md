# 001 · Hi-Vis After Dark

A pitch-black scene where the cursor is a headlamp. The word **HI-VIS**, the chevron safety tape, the cone bands, and the warning sign stay dull grey until the lamp sits next to the camera, then they throw the beam back into your eye the way a cyclist's jacket does in headlights.

## Technique

three.js r186 adds physically based retroreflection to `MeshPhysicalNodeMaterial` through the `retroreflectivity` parameter (0–1). The pull request called the parameter `retroreflective`; it was renamed before the release. The model is the [Minimal Retroreflective Microfacet Model](https://jcgt.org/published/0015/01/04/): the specular lobe is evaluated with the view direction reflected about the normal, which folds the highlight back toward the light. It only really fires when the light direction and the view direction line up, so the headlamp is kept on the camera and the **headlamp offset** slider slides it sideways. The pool of light can still hit the letters. The return should collapse. That is the whole lesson.

The sketch runs on `WebGPURenderer` and the node material pipeline (`three/webgpu`, `three/tsl`, three.js 0.186.1 from jsDelivr). Bloom is `BloomNode` from the WebGPU post-processing addons, added in a `RenderPipeline` before tone mapping. There is no build step.

The wordmark is `TextGeometry` set in Helvetiker Bold, the typeface shipped with the three.js examples. The font file is bundled in this folder. It is Magenta's Helvetiker Bold (2004); the license notice is inside the JSON.

## Controls

- Move the pointer to steer the camera a little and aim the beam.
- Click (or tap) away from the panel to fire a camera flash. Intensity spikes for 80ms, then fades.
- **Retroreflectivity** mixes the retro lobe in. At 0 the tape is ordinary dull plastic.
- **Headlamp offset** slides the lamp off the camera axis, in metres. This is the control that kills the glow.
- **Bloom** is the glare around the return.

Add `?webgl` to force the WebGL2 backend (`WebGPURenderer({ forceWebGL: true })`). Retroreflection lives in the node lighting model, which that backend runs, and in the classic physical GLSL chunk (`USE_RETROREFLECTION`). The HUD reports `webgpu` or `webgl2`. If the renderer cannot start at all, a notice is shown, same pattern as sketch 000.

Pixel ratio is capped at 2, and the view resizes with the window.

## References

- Example: https://threejs.org/examples/webgpu_materials_retroreflection.html
- Source: https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_materials_retroreflection.html
- Pull request: https://github.com/mrdoob/three.js/pull/33949
- Rename before r186: https://github.com/mrdoob/three.js/pull/34079
- Paper: https://jcgt.org/published/0015/01/04/
