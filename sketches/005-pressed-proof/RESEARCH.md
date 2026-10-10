# Pressed Proof — reference pass

Read before the redesign. The first version was quiet in the wrong way: a weight step of 450 to 660, a subpixel deboss, and a 1px rule. Measured in pixels it was there. At a glance it was not. This note is what the next version is allowed to steal, and the rules that follow from it.

## Stripe Checkout and Elements

- [Elements appearance API](https://docs.stripe.com/elements/appearance-api) and the [element container classes](https://docs.stripe.com/js/element/the_element_container)
- [Elements product page](https://stripe.com/payments/elements)

Stripe treats an input as a matrix of states, not a single “invalid” color. The container carries `.StripeElement--empty`, `--complete`, `--focus`, `--invalid`. The appearance API styles `.Input`, `.Input--empty`, `.Input--invalid`, `:hover`, `:focus`, `:disabled`, `:autofill`, `::placeholder`, `::selection`, `.Label`, `.Label--invalid`, and `.Error` as separate rules. Labels sit above the field or float. Validation runs as you type and the `change` event reports the error object. Autofill, masking, localized errors, and built-in ARIA are part of the control, not a page-level patch.

**Steal:** the state matrix. Empty, incomplete, complete, focus, hover, disabled, and autofill are different channels. Focus is not a recolor of invalid. Autofill has to be restyled or the browser paints a yellow box over the type.

**Leave:** the red invalid box-shadow. That is the pattern this component exists to replace. Also leave “show an error on every keystroke from the first character.” A half-written email is unfinished, not a scolding.

## Linear

- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)

Linear’s essay is about neutrals tuned by value, not by hue, and about one accent doing one job. Hierarchy comes from weight, contrast, and space. There is no separate Linear form specification worth inventing from.

**Steal:** one accent, and only for focus and the primary action. Validity is value and weight (light face against heavy face), never a second hue.

## Vercel Geist

- [Geist Input](https://vercel.com/geist/input) and [Geist Label](https://vercel.com/geist/label)
- Third-party notes on the focus ring and the input metrics: [design-bites / vercel.com](https://github.com/educlopez/design-bites/blob/main/design-mds/vercel.com/DESIGN.md), [designmd.cc benchmark](https://designmd.cc/benchmarks/vercel)

Geist validates on blur, not on every keystroke, and passes the error as a string. Whitespace is trimmed. A field that is saving stays focusable; `disabled` is paired with a spinner only when input is actually impossible. Labels are short nouns. Placeholders are examples (`example.com`), never “Enter your…”. Helper text is one sentence with a period, on an element wired with `aria-describedby`. Error copy names the field and the constraint and skips “please” (“Project name is required.”, “Code must be 6 digits.”). A string label requires an `id` so the accessible name is not lost.

The focus ring is a double ring: `0 0 0 2px` of the background, then `0 0 0 4px` of the focus color. Inputs are about 40px tall, labels 14px, 8px under the label, a 6px radius, 12px of horizontal padding. The border darkens on hover. Motion is 150–200ms, ease-out. The accent is for focus, not for every state.

**Steal:** blur-then-commit, example placeholders, one-sentence helpers, error copy with no “please”, the double ring, hover that only darkens the rule, and a saving state that stays focusable. Our touch target stays at least 48px, taller than Geist’s 40px, because this field is typed on a phone.

**Leave:** the rounded gray box. A letterpress line sits on a rule, not in a chip.

## Apple

- [Human Interface Guidelines: text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)
- Concrete restatements: [text fields](https://appguidelines.com/human-interface-guidelines/version/29/text-fields/) and [entering data](https://appguidelines.com/human-interface-guidelines/version/29/entering-data/)

A placeholder disappears as soon as someone types, so it cannot be the name of the field. A separate label has to remain. The placeholder is a hint, like `username@company.com`. Validate when it makes sense: an email when the field is left, a constraint that can be checked before that when the check is real. People should be able to fix a long form without waiting until the end. The leading end of the field says what it is. The trailing end is for extra actions.

**Steal:** a label that never floats away, a placeholder that is only an example, and validation that commits when the person leaves the field, then updates as they fix it.

## GOV.UK Design System

- [Validation pattern](https://design-system.service.gov.uk/patterns/validation/)
- [Error message](https://design-system.service.gov.uk/components/error-message/)
- [Error summary](https://design-system.service.gov.uk/components/error-summary/)
- [Text input](https://design-system.service.gov.uk/components/text-input/)

On a failed submit, GOV.UK shows the page again with the values intact, prefixes the title with “Error: ”, puts an error summary at the top, moves focus to that summary, and repeats the message next to each bad field. The summary’s heading is “There is a problem”, even for one error. Each link uses the same words as the message beside the field. They do not validate on blur; they wait for continue. They turn off HTML5 validation (`novalidate`) because the browser bubble cannot match the pattern.

The message component puts a visually hidden “Error: ” in front of the sentence so a screen reader hears it. Copy is specific, plain, and says how to fix the problem. It uses the field’s own words and includes an example of the format. Empty is “Enter [thing]”. Too short is “[thing] must be [n] characters or more”.

**Steal:** the summary, the focus move, the hidden “Error: ” prefix, and the copy rules (specific, how to fix, an example, no “please”, no bare “invalid”). The same sentence appears in the summary and under the field.

**Leave:** “never validate on blur.” The ink here updates while typing, and the error chrome waits for a commit (blur or submit). Also leave `novalidate` as a rule for the component. The element keeps `setCustomValidity`, so a normal form still blocks submit. The case-study page suppresses the browser bubble because it cannot be styled, which is the reason GOV.UK gives, and writes the summary itself.

## Radix, Ark, React Aria

- [React Aria TextField](https://react-aria.adobe.com/TextField) and [Forms](https://react-aria.adobe.com/forms)
- [Ark UI Field](https://ark-ui.com/react/docs/components/field)

React Aria associates the label, the description, and `FieldError` for you (`aria-describedby`, `aria-errormessage`). A custom `validate` runs after commit, on blur, so a partial value is not nagged on every key. Realtime validation is opt-in, for something like a password rule. After a bad submit, the first invalid field is focused unless `onInvalid` calls `preventDefault`, in which case you focus an alert. Server errors arrive through `validationErrors`. Their example CSS hides the description while the field is invalid, so the error occupies the same slot and the form does not jump.

Ark’s Field exposes label, helper text, error text, and invalid as data attributes (`data-invalid`, `data-disabled`, `data-required`).

**Steal:** one slot shared by helper and error, commit-then-show, native validation with custom UI, and explicit `data-state` / `data-invalid` so CSS does not have to guess. After the first commit, recheck on input so a correction is visible without leaving the field again.

## Rauno Freiberg

- [Web Interface Guidelines](https://interfaces.rauno.me/) and the [repo](https://github.com/raunofreiberg/interfaces)
- [Notes](https://rauno.me/notes/4), [craft](https://rauno.me/craft), [invisible details](https://rauno.me/craft/interaction-design)

Clicking the label focuses the input. Inputs live in a form so Enter submits. The type is the real type. Font size is at least 16px or iOS zooms the page. Do not autofocus on touch; the keyboard covers the screen. Hover styles apply only under `@media (hover: hover)`. If the tap highlight is removed, something else has to mark the press. A focus ring should follow the radius; he prefers `box-shadow` to `outline` when the shape is custom. Ghost inputs need room, because a focus ring that is clipped or that nudges the neighbors looks unfinished. Scroll the field into view when it is focused. His earlier error treatment was a red tooltip.

**Steal:** label hit area, 16px floor (we use 22px so the weight is obvious), hover only for a fine pointer, a ring that has room around the line, no autofocus. The tap highlight is cleared on the page and replaced by the focus ring and the active press on the button.

**Leave:** the red tooltip.

## Emil Kowalski

- [animations.dev](https://animations.dev/)
- [Animate skill](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) (the same rules live in the emil-design-eng and review-animations notes)

Interface motion stays under 300ms. Enter and exit use ease-out, never ease-in: ease-in starts slow at the moment the person is watching. The strong curve is `cubic-bezier(0.23, 1, 0.32, 1)`. A button press is 100–160ms. Specify the properties that move. Do not use `transition: all`, and do not animate layout. Asymmetric timing: slow where the person is deciding, fast where the system answers. Reduced motion is a cut to the still, not a slower version of the same tween.

**Steal:** 200ms, that ease-out, a 120ms press on the button, and a reduced-motion cut with no wobble. The settle may move the letters by under a pixel. It may not change the height of the field. CRAFT.md’s house curve is `cubic-bezier(.2, .8, .2, 1)`. This component uses Emil’s stronger ease-out on purpose: the state change has to arrive, then sit still.

## Letterpress

- [Print Peppermint, minimum line weight and type size](https://www.printpeppermint.com/guides/file-setup/minimum-line-weight-and-type-size) and [letterpress file setup](https://www.printpeppermint.com/guides/file-setup/letterpress-file-setup)
- [Peterkin, what blind letterpress is](https://helpcentre.peterkin.com.au/hc/en-gb/articles/218832377-What-is-Blind-Letterpress-or-Debossing)
- [Mandate Press, five tips for type in letterpress](https://www.themandatepress.com/2016/12/5-tips-for-type-in-letterpress/)
- [Briar Press, on a good impression](https://briarpress.org/13607)

Deboss and emboss need medium or bold type. Hairlines and thin strokes disappear. Print Peppermint’s floor is about 0.5mm of stroke and 10pt type. A blind impression is read by shadow alone, and detail that holds in ink can vanish when the ink is removed. Peterkin and Mandate Press both say not to put important text in a blind deboss: use a bold face, and keep the impression for large type that is not the only copy. Briar Press: a good impression is clean ink on the face of the letter, not ink smashed down the sides. A deep smash looks bad.

**Steal:** under-inking is visibly starved (light face, thin rule). A proper impression is medium-to-bold, with a bite you can see. The deboss is added to ink. It is never a replacement for it. That is why the first version failed. The bite was blind, and the weight gap was a hairline.

## Craft rules

These are the contract for the component and the page.

1. **The two states differ in a still.** With motion paused, soft and inked are obvious. Combine a real weight jump (about 360 against about 780), ink density that stays at or above 4.5:1, a rule that changes thickness inside a reserved slot, and a deboss you can see. The settle is confirmation. It is not the signal.

2. **Do not scold, and do not use color as the error.** Say what is wrong and how to fix it, in the field’s words, with an example. No “please”. No bare “invalid”. The error is the light type, the dashed rule, and the sentence. One small wobble, not a flash. A visually hidden “Error: ” prefixes the sentence for screen readers.

3. **Commit late, clear as soon as it is fixed.** Show the error on blur or submit. After that, recheck on input so the correction is visible without leaving the field again. The ink itself updates while typing, either way.

4. **The label stays.** It does not float. The placeholder is an example, not the name of the field. Helper and error share one line, so the field does not jump. The same sentence is repeated in the error summary.

5. **Focus, hover, press, disabled, and loading are their own states.** They are not recolors of validity. Focus is a paper-gapped accent ring. Hover applies only for a fine pointer, and it only darkens the rule. Disabled stays readable. Loading is the still word “Checking…”, the field stays focusable, and nothing spins.

6. **Space is a scale.** Label to value, value to rule, rule to message, then a larger gap between fields. The rule is the baseline the type sits on. The value is large enough that weight is obvious, and at least 16px so a phone does not zoom.

7. **Motion is under 300ms, ease-out, and it does not move layout.** The curve is `cubic-bezier(0.23, 1, 0.32, 1)`. Reduced motion is an instant cut with no wobble. The still of each state remains.

8. **The page teaches the job.** Problem first: red error states scold and flash, and color-only feedback fails. Then a before and an after you can type in. Then what changed, and how to use the element. Knobs stay collapsed. The before is allowed to be red and to shake, because that is the pattern being replaced.
