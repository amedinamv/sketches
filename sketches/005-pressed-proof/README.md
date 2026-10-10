# 005 · Pressed Proof

A case study of a lead form whose type carries the validation. Unfinished text stays light, like a proof that did not take the ink. A valid value settles into a much heavier cut, a thicker rule, and a deboss you can see. An error keeps the light type, turns the rule dashed, wobbles once, and writes the fix under the line.

The page puts a typical red-error form beside it, so the difference is the argument. The reference pass is [`RESEARCH.md`](RESEARCH.md).

The thing to keep is not this page. It is [`pressed-field.js`](pressed-field.js) and [`pressed-field.css`](pressed-field.css): one custom element, no build, safe to drop into plain HTML or Astro.

## Job

Form field. A lead form: email, name, and a WhatsApp number.

## User problem

Red error states scold and flash. Color-only feedback fails for anyone who cannot see that red. A field should say, in the type itself, whether the line is finished, and in one sentence how to fix it.

## Interaction idea

The value is printed as it is checked. Incomplete type is under-inked. A valid value is inked. The words under the field say what is wrong and how to fix it, so the state never depends on color alone. The page shows the red pattern next to this one.

## Signature behaviour

While a value is unfinished it sits at weight 360, a softer draw (the Fraunces `SOFT` axis, when the font has it), ink mixed to 64% so it stays above 4.5:1, and a 1px rule. When the check passes, the same letters go to weight 780, solid ink, a 2.5px rule, a deboss of about a pixel and a half, and a settle of under a pixel. The change takes `--pp-duration` (200ms in the proof room), on `cubic-bezier(0.23, 1, 0.32, 1)`. With motion paused, the two states still read.

## States

- **Idle.** Empty. The label stays. The placeholder is an example, not the name of the field. Helper text under a hairline. `data-state="idle"`.
- **Soft.** Something is typed and it does not pass yet. Lighter ink, softer letters, thin rule. If `when` is `blur`, the helper stays and `aria-invalid` stays false until the field is left or the form is submitted.
- **Inked.** The value passes. Heavy type, solid ink, thick rule, visible deboss. `data-state="inked"`.
- **Error.** The field has been committed (blur, input, or submit, depending on `when`) and still fails. The light type remains, the rule turns dashed, the helper is replaced by the error sentence, and the field wobbles once. A visually hidden “Error: ” prefixes the sentence. `aria-invalid="true"`. `data-state="error"`.
- **Focus.** A double ring: 2px of `--pp-paper`, then 2px of `--pp-accent`. Mouse click does not draw it; the keyboard does. The validity rule stays visible while focused.
- **Hover.** Only under `(hover: hover)` and `(pointer: fine)`. It darkens the hairline. It does not recolor validity.
- **Disabled.** The `disabled` attribute. The label stays full ink. The value stays readable. The field does not take a new edit.
- **Loading.** The `loading` attribute. The message reads “Checking…”. The input is read-only and stays focusable. `aria-busy="true"`. Nothing spins.
- **Touch.** The input is at least 48px tall and 22px type, so a phone does not zoom the page on focus.
- **Reduced motion.** No transition and no wobble. Weight, ink, the rule, and the message still change, instantly.
- **No JavaScript.** An `input` nested in the element stays a normal field and submits with the form. It just does not take the ink.

There is no WebGPU here, and nothing to fall back from.

## What I'd ship

The element, in a real lead form, with the three fields and the submit. Drop the before column, the preset switcher, and the knobs. Keep the weight, the rule, the deboss, the sentence, one wobble, and the instant cut when reduced motion is on.

## Art direction

### Type

- **Fraunces**, by Undercase Type, SIL Open Font License. [Google Fonts](https://fonts.google.com/specimen/Fraunces). The proof-room and night faces. Axes used: `wght` 300–900, `SOFT` 0–100, `opsz` pinned per size. `SOFT` is the under-inked cut. A font without that axis ignores it.
- **JetBrains Mono**, by JetBrains, SIL Open Font License. [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono). Labels, helpers, and the button in the proof room and at night.
- **Space Grotesk** and **DM Sans**, on the Captapage preset only. See below. The frame stays on Geist, light variant, and does not set the sketch's type.

### Palette

Proof room. The page is this palette. The other two presets are themes of the component, pulled on the same bench.

| Role | Hex | On paper `#f3efe6` |
| --- | --- | --- |
| Paper | `#f3efe6` | — |
| Ink | `#1c1a17` | 15.1:1 |
| Muted, helpers at 72% ink | mixed | about 6:1 |
| Accent, the submit and the focus ring | `#7a3328` | white-warm `#f7f3ec` on it is 9:1 |

The soft state mixes the ink to 64% against the paper. On the proof-room ground that is about 4.9:1, on Captapage about 5.1:1, at night about 7:1. Weight, the rule, and the deboss do the rest, so the state still reads in grayscale. Softness moves the `SOFT` axis only. It does not thin the ink further, so a knob cannot push the type under 4.5:1.

### Texture

None. A grain would sit on top of the deboss and make the cut look dirty.

### Motion

One move: the settle from soft type to inked type, 200ms, `cubic-bezier(0.23, 1, 0.32, 1)`. That is Emil Kowalski’s ease-out, chosen so the change arrives and then sits. CRAFT.md’s house curve is the quieter cousin `cubic-bezier(.2, .8, .2, 1)`. The error wobble is a single correction of about 2.5px, over the same duration, not a loop and not a flash. The button press is 120ms. Reduced motion cuts the tweens and the wobble. Layout does not animate: the rule’s thickness changes inside a reserved 3px slot.

### Captapage preset

Taken from the public CSS of [captapage.com](https://captapage.com) on 2026-10-10, not from a screenshot guess.

| Token | Value |
| --- | --- |
| Paper | `#f8f9ff` (`--paper`; `theme-color` is `#f7f8ff`) |
| Ink | `#171927` |
| Accent | `#2868ed` (`--blue`) |
| Accent ink | `#ffffff` (their primary button, 4.9:1) |
| Type | The site asks for **Hosk Grotesk**, then **Space Grotesk** and **DM Sans**, which are the faces it actually loads from Google Fonts. Hosk is not on Google Fonts, so this preset uses Space Grotesk for the value and DM Sans for the label. |

Space Grotesk has `wght` and no `SOFT` axis. The field falls back to weight and ink density. That is the degradation, on purpose.

### Night preset

Paper `#161513`, ink `#f3efe6` (15.9:1), accent `#e3a06a` with ink `#161513` on the button (8.3:1). Same Fraunces and JetBrains Mono as the proof room.

## Install

Copy `pressed-field.js` and `pressed-field.css` so they stay side by side. The script links the stylesheet if the page has not.

### Plain HTML

```html
<link rel="stylesheet" href="/pressed-field.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:SOFT,opsz,wght@0..100,9..144,300..900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

<form action="/lead" method="post">
  <pressed-field
    name="email"
    label="Email"
    validate="email"
    when="blur"
    autocomplete="email"
    placeholder="name@studio.com"
    helper="Where the proof should go."
    error="Enter a complete email address."
    required
  ></pressed-field>
  <button type="submit">Send</button>
</form>
<script type="module" src="/pressed-field.js"></script>
```

Nest a real `<input>` inside the element if the form should still post when JavaScript does not run. The element adopts that input.

### Astro

```astro
---
/* src/pages/contact.astro */
---
<html lang="en">
  <head>
    <link rel="stylesheet" href="/pressed-field.css" />
  </head>
  <body>
    <form method="post">
      <pressed-field name="email" label="Email" validate="email" required></pressed-field>
      <button type="submit">Send</button>
    </form>
    <script>
      import "../components/pressed-field.js";
    </script>
  </body>
</html>
```

Keep the CSS file next to the script, or add the `<link>` yourself. Astro only needs to ship the two files. There is no framework wrapper.

### A custom check

```js
const field = document.querySelector('pressed-field[name="name"]');
field.validator = (value) => value.includes('studio') || 'Mention the studio.';
field.addEventListener('pp:valid', (event) => {
  console.log(event.detail.value);
});
```

`validator` runs after the built-in check. Return `true` to pass, `false` for the `error` text, or a string to say something more specific.

## Attributes

| Attribute | Values | What it does |
| --- | --- | --- |
| `label` | text | Visible label. Wired to the input. |
| `name` | text | Submitted with the form. |
| `validate` | `email`, `text`, `phone`, `whatsapp`, `pattern` | Which check to run. `whatsapp` is `phone`. Default `text`. |
| `when` | `blur` (default), `input` | When a failure becomes an error. The ink updates as you type either way. |
| `helper` | text | Line under the field while it is not in error. |
| `error` | text | Message used for every failure. Defaults exist if you omit it. |
| `required` | boolean | Empty does not pass. |
| `minlength` | number | For `text`, and passed through to the input. |
| `maxlength` | number | Passed through. |
| `pattern` | regex source | Used when `validate="pattern"`. Also applied after any other check, if set. |
| `placeholder` | text | Passed through. |
| `autocomplete` | token | Passed through. |
| `type` | input type | Overrides the type chosen from `validate`. |
| `inputmode` | token | Overrides the inferred mode (`email`, `tel`, `text`). |
| `autocapitalize` | token | Default `off` for email and phone, `sentences` for text. |
| `enterkeyhint` | token | Passed through. |
| `spellcheck` | `true`, `false` | Default off for email and phone. |
| `form` | form id | Passed through, for a field outside the form. |
| `value` | text | Starting value. After that, set the `.value` property. |
| `disabled` | boolean | Disables the input. The label stays readable. |
| `loading` | boolean | Shows “Checking…”, sets `aria-busy`, and makes the input read-only. It stays focusable. |

Phone and WhatsApp accept a leading `+` or `00`, then 8 to 15 digits. Spaces, hyphens, dots, and parentheses are fine. A national number with no country code stays soft.

Email needs a local part, an `@`, and a dot in the domain. `ada@print` is unfinished. `ada@print.co` is inked.

## Properties and methods

| Name | |
| --- | --- |
| `.value` | Get or set the current text. Setting it rechecks. |
| `.validator` | `(value: string) => true \| false \| string`, or `null`. |
| `.state` | `idle`, `soft`, `inked`, or `error`. |
| `.checkValidity()` | Rechecks. False when the input would block submit. |
| `.reportValidity()` | Shows the error, wobbles if it is newly in error, and opens the browser message. |

The host also mirrors state on `data-state`, and `data-invalid` while the error is showing.

## Events

Both bubble and are composed. They fire when the value crosses between valid and invalid after the element is connected, including a programmatic `.value`. They do not fire for the initial paint.

| Event | When |
| --- | --- |
| `pp:valid` | The value passes. |
| `pp:invalid` | The value fails. |

`event.detail` is `{ name, value, valid, state, message }`. `message` is set when the error is on screen.

The element keeps native submit working. The input lives in light DOM, so `FormData` and constraint validation see it. `setCustomValidity` carries the same sentence as the line under the field. The component cancels the browser’s validation bubble, because that bubble cannot be styled, and writes the sentence itself. On a form that does not set `novalidate`, an invalid submit still does not fire `submit`. The case study sets `novalidate` so it can move focus to an error summary.

## CSS variables

Set them on the element or any ancestor. The field does not paint its own paper; `--pp-paper` should match the ground behind the type, because the soft ink mixes toward it.

| Variable | Default | What it does |
| --- | --- | --- |
| `--pp-ink` | `#1c1a17` | Type, rules, labels. |
| `--pp-paper` | `#f3efe6` | The ground the soft ink mixes toward. |
| `--pp-accent` | `#7a3328` | Focus ring only. Not the error, and not the valid state. |
| `--pp-font` | Fraunces, then Palatino | The value. Any family. Variable axes are optional. |
| `--pp-meta-font` | JetBrains Mono, then ui-monospace | Label, helper, error. |
| `--pp-weight-faint` | `360` | `wght` while idle, soft, or in error. |
| `--pp-weight-inked` | `780` | `wght` once the value passes. Keep this at 640 or above if the change should stay obvious. |
| `--pp-softness` | `0.6` | 0 to 1. Raises the `SOFT` axis only. Ink density stays at 64%. |
| `--pp-wobble` | `2.5` | Error travel, in pixels. `0` turns the wobble off. |
| `--pp-deboss-depth` | `1.65` | Scale of the inked bite. `1` is already visible. `0` is flat. |
| `--pp-duration` | `200ms` | Settle and wobble. A time, not a bare number. |
| `--pp-opsz` | `24` | Optical size, when the font has the axis. |
| `--pp-on-accent` | — | Not used by the field. The demo's submit button reads it. |

`--pp-live-wght` and `--pp-live-soft` are internal. They animate between the faint and inked settings. Browsers that cannot interpolate custom properties snap, which is the same result as reduced motion.

If the font has no `SOFT` axis, that setting is ignored. If it has no `wght` axis, `font-weight` still changes, and the ink mix still thins. Those two are the floor.

## Theming

```css
/* Proof room */
.form {
  --pp-ink: #1c1a17;
  --pp-paper: #f3efe6;
  --pp-accent: #7a3328;
  --pp-font: "Fraunces", Palatino, serif;
  --pp-meta-font: "JetBrains Mono", ui-monospace, monospace;
  --pp-weight-faint: 360;
  --pp-weight-inked: 780;
  --pp-softness: 0.6;
  --pp-deboss-depth: 1.65;
  --pp-duration: 200ms;
}

/* Captapage. Colors from the site. Space Grotesk stands in for Hosk Grotesk. */
.form-captapage {
  --pp-ink: #171927;
  --pp-paper: #f8f9ff;
  --pp-accent: #2868ed;
  --pp-font: "Space Grotesk", "DM Sans", system-ui, sans-serif;
  --pp-meta-font: "DM Sans", system-ui, sans-serif;
  --pp-weight-faint: 400;
  --pp-weight-inked: 700;
}

/* Night */
.form-night {
  --pp-ink: #f3efe6;
  --pp-paper: #161513;
  --pp-accent: #e3a06a;
  --pp-font: "Fraunces", Palatino, serif;
  --pp-meta-font: "JetBrains Mono", ui-monospace, monospace;
}
```

The demo's controls write ink pressure to `--pp-weight-inked`, and softness, wobble, deboss, and speed to the matching variables.

## Reduced motion

`prefers-reduced-motion: reduce` drops the transitions and the wobble animation inside the component stylesheet. The state still changes. The JS also refuses to add the wobble class when that media query matches, or when `--pp-wobble` is 0. The case study’s red specimen also skips its shake. The submit button’s “Sending…” wait collapses to zero.

## Performance

No canvas, no animation frame, no network inside the component. The stylesheet is one file. The demo loads four families because it has to show three themes; a product loads the one family it uses. Duration stays under 300ms. The rule’s box is reserved, so the settle does not move layout.

## How to graduate to kit/

Do not copy this folder into a product, and do not move it yet. `kit/` is for a piece some other surface is about to use.

When a lead form on Captapage, or a client page, actually needs it:

1. Move `pressed-field.js` and `pressed-field.css` to `kit/pressed-field/`.
2. Give that folder a README with the job, the attributes as the props, mobile, reduced motion, the no-JS input, the performance budget above, and a link back to `sketches/005-pressed-proof/`.
3. Call the kit files from the page that uses them. Leave the sketch as the study, or point the sketch at the kit files so there is one source.

Until then it stays here.
