# Property panel behaviors

## 1. Purpose

The property panel (the right sidebar that edits the selected node) had three problems with
imported pages and with new users: fields showed blanks when the look came from page CSS, a
style that does nothing alone (a border width with no border style) seemed broken, and there was
no way to see or undo what you had changed. On 2026-09-29 "Phase 1" of the inspector behaviors
from the user's own app, frontend-editor, was ported (behaviors only, no redesign), together with
a new rotate control. This doc covers those behaviors, the `?` hint system, and how to add a
new panel control end to end.

## 2. Where it lives

| File | Key functions / components | Role |
|---|---|---|
| `src/utils/companionStyles.ts` | `companionStyles(patch, computed, contentType)` | Extra styles that make a patch visible. Pure function. |
| `src/context/EditorContext.tsx` | `updateNodeStyle`, `getFanOutPaths`, `applyStyleToNode`, `mergeStylePatch`, `syncClassStyle` | The one write path for panel style edits: companions, device scope, multi-select, class sync. |
| `src/hooks/usePanelStyle.ts` | `usePanelStyle()` → `value`, `isChanged`, `reset`; `useComputedNodeStyle`; `nodeElement` | Read/reset helper for panel fields; reads the canvas's computed style. |
| `src/components/PropertyPanelUI/ui.tsx` | `PanelRowContainer` (`props`, `hintKey`), `FieldReset`, `SectionContainer` | Row/section layout; the changed dot and reset button. |
| `src/components/PropertyPanelUI/index.tsx` | `PropertyPanel`, `EMPTY_TIPS` | Panel shell; the tips shown when nothing is selected. |
| `src/components/PropertyPanelUI/Sections/RotateSection.tsx` | `RotateSection`, `ROTATABLE` | Rotate control (slider, degree box, 90° turns). |
| `src/utils/rotate.utils.ts` | `parseRotate`, `normalizeDegrees` | Angle parsing and wrapping. |
| `src/components/PropertyPanelUI/Sections/LayoutSection.tsx` | gap, padding, margin rows | Use `panelStyle.value(...)` and declare `props`. |
| `src/components/PropertyPanelUI/Sections/relatedComponents/BorderRadiusController.tsx`, `Controllers.tsx` (`BorderController`) | corner radius fields | Use `panelStyle.value(...)`. |
| `src/components/PropertyPanelUI/PanelTypes/ContainerPanel.tsx`, `ImagePanel.tsx`, `ButtonPanel.tsx` | mount `RotateSection` | Block (Style tab), image and button panels. |
| `src/components/PropertyPanelUI/hints/registry.tsx` | `PROPERTY_HINTS`, `PropertyHintKey` | hintKey → demo component. |
| `src/components/PropertyPanelUI/hints/demos.tsx` | `Stage`, `RotateDemo`... | Small animated demos. |
| `src/components/PropertyPanelUI/hints/PropertyHint.tsx` | `PropertyHint` | The `?` button and popover. |
| `src/i18n/locales/<14 locales>/hints.json` | `title.<key>`, `description.<key>` | Hint text. |
| `src/i18n/locales/<14 locales>/propertyPanel.json` | `panel.fieldChanged`, `panel.resetField`, `panel.tips.*`, `controllers.angle`, `controllers.rotateLeft90/Right90` | Labels. |
| `.claude/skills/audit-property-hints/SKILL.md` | — | How to find copy-pasted hintKeys. |

Flags (all in `src/configs/editor.config.ts`, all `true`):

| Flag | Gates | Checked in |
|---|---|---|
| `enable_companion_styles` | adding companion styles on write | `updateNodeStyle` |
| `enable_panel_computed_values` | reading the canvas's computed style | `useComputedNodeStyle` |
| `enable_panel_field_reset` | changed dot + reset button | `FieldReset` |
| `enable_panel_empty_tips` | four tips when nothing is selected | `PropertyPanel` |
| `enable_rotate_control` | the rotate section | `RotateSection` |
| `enable_property_hints` | every `?` hint | `PropertyHint` |

## 3. How it works

### 3.1 Write path: `updateNodeStyle(patch)`

Every panel control writes through `canvas.updateNodeStyle(patch)`:

1. `getFanOutPaths()` picks the targets: the focused node, or (with
   `enable_multi_select_property_editing`) every selected node of the same content type.
2. **Companions** (`enable_companion_styles`): finds the focused node's canvas element
   (`[data-id="<id>"]`), reads its `getComputedStyle`, and builds
   `{ ...companionStyles(patch, read, contentType), ...patch }`. The patch's own keys always win.
3. `applyStyleUpdateAtPath` → `applyStyleToNode` merges it into `node.style` (desktop) or
   `node.responsiveStyle[tablet|mobile]` (device scope). `mergeStylePatch` **deletes** keys whose
   value is `undefined`/`null` - this is how a reset or a 0° rotation removes a style.
4. `syncClassStyle` copies the patch to nodes sharing the first class (skipped on imported pages,
   see [code-to-node/06](code-to-node/06-rendering-parity-and-event-widgets.md)).
5. One history entry is pushed (one undo step).

### 3.2 Companion styles (`companionStyles.ts`)

| Patch sets | Condition (computed on the element) | Added |
|---|---|---|
| any `border*Width` | `border-top-style` is `none`, patch has no `borderStyle` | `borderStyle: solid` |
| any `border*Color` | same | `borderStyle: solid`, plus `borderWidth: 0.125em` if no width in the patch and the computed width is `0px` |
| `flexDirection` | `display` isn't flex, patch has no `display` | `display: flex` |
| `alignItems`, `justifyContent` or `gap` | `display` isn't flex/grid, patch has no `display` | `display: flex`, and `flexDirection: column` if the patch has none |
| `width` | computed `max-width` isn't `none`, patch has no `maxWidth`, node isn't root/section | `maxWidth: none` |

Empty values (`undefined`, `null`, `''`) count as "not set", so a reset adds no companions.
Root and sections keep their max-width because it is a layout setting of its own (Size > Full width).

### 3.3 Computed values (`usePanelStyle().value`)

1. `useComputedNodeStyle` waits one animation frame after a change of focused id, zoom, content
   or device scope, so the canvas has laid out again.
2. It copies every computed property of the node's element, plus the shorthands `padding`,
   `margin`, `gap` and `border-radius`.
3. It undoes the canvas zoom: `lengthsToEm(value, rootPx * zoom, rootPx)` turns every px length
   into em at 100% zoom (`root_font_size` is 16). Panel fields read em.
4. `value(prop)` returns the node's own value (`focusedNode.style`, already resolved for the
   current device) when it has one; else the computed value, unless it is `0`, `0px` or `0em`
   (those show as blank).

Used today by the gap, padding and margin rows (`LayoutSection.tsx`), corner radius
(`BorderRadiusController.tsx`, `BorderController`) and the rotate control.

### 3.4 Changed dot and reset (`FieldReset`)

- A `PanelRowContainer` with `props={[...]}` renders `FieldReset` in its label.
- `isChanged(props)` checks the node's **own** style for the device being edited
  (`style` on desktop, `responsiveStyle[scope]` otherwise).
- Reset calls `updateNodeStyle({ prop: undefined, ... })`, which deletes those keys.
- Rows that declare `props` today: gap, padding (overall and four sides), margin (overall and four
  sides), rotate angle.

### 3.5 Empty tips

When nothing is selected, `PropertyPanel` shows `panel.tips.select`, `changed`, `copyPaste` and
`reorder` (`EMPTY_TIPS`) under the "no element selected" text.

### 3.6 Rotate control

- `RotateSection` renders only for `block`, `image` and `button` (`ROTATABLE`). It is mounted in
  the block panel's Style tab (`ContainerPanel.tsx`, which root and sections share - the section
  hides itself there), `ImagePanel.tsx` and `ButtonPanel.tsx`.
- Current angle: `parseRotate(panelStyle.value('rotate'))`. `parseRotate` reads a number with
  `deg`/`turn`/`rad`/`grad` (default deg) and rounds to 0.1°; `none` or anything else is 0.
- The slider (-180..180) keeps a `draft` while dragging and saves on pointer-up, key-up or blur,
  so one drag is one undo step. The number box saves on change. The 90° buttons save `current ± 90`.
- `save` runs `normalizeDegrees` (wraps into -180..180; +180 stays 180) and writes
  `{ rotate: '<n>deg' }`, or `{ rotate: undefined }` for 0°.
- Hint: the existing `rotate` hint ("Rotates the element around its center", turning-square demo)
  matches this control, so it is reused.

**Image wrapper vs `<img>`.** The image renderers (editor `Image` in `NodeMap/Contents.tsx`,
production `Image` in `PreviewUI/Elements.tsx`) put `node.style` on both the wrapper and the
`<img>`. The `<img>` gets `{ ...node.style, rotate: undefined }`, so the picture turns once (with
the wrapper) instead of twice.

### 3.7 PropertyHint system

- A row or section passes `hintKey` → `PropertyHint` shows a `?` button with a popover.
- `PROPERTY_HINTS[hintKey]` holds only the `Demo` component. The title and description come from
  i18n: `hints.json` `title.<hintKey>` and `description.<hintKey>`.
- `PropertyHintKey` is `keyof typeof PROPERTY_HINTS`, so an unknown key fails the typecheck.
- Demos (`hints/demos.tsx`) are a `Stage`-wrapped element animated with `useLoopToggle()`.

**The copy-paste bug.** A new row cloned from a neighbour keeps the neighbour's `hintKey`, so two
unrelated controls show the same tooltip (seen with Line Height vs Line Count, Font Size vs Stroke
Width). The `audit-property-hints` skill: grep every `hintKey="..."` under
`src/components/PropertyPanelUI`, group by key, read each `label`, and give mismatches their own
key. Legitimate reuse exists (`alignX` across alignment rows, `typographyGroup` for font sections,
multi-select panels reusing the single-node keys).

## 4. Why this approach

| Decision | Chosen | Alternatives | Why |
|---|---|---|---|
| Where companions are added | In `updateNodeStyle`, from the canvas's computed style | Not tried: per-control logic in each field. | One place covers every control, and the computed style knows about page CSS (an imported `.card` may already have a border style). |
| Patch keys win | `{ ...companions, ...patch }` | — | The user's explicit value must never be overwritten. |
| Computed values | Read the real canvas element, unzoom to em | Not tried: resolving the page CSS rules in JS. | The browser already did the cascade, including imported CSS. Verified live 2026-09-29: `.card { padding: 24px; margin: 8px }` showed 24/8. |
| Reset scope | Only the row's own props | Reset companions too. | Reason not recorded. Known effect: a companion `display: flex` added by gap stays after reset (log 2026-09-29). |
| Rotate property | CSS `rotate` | `transform: rotate()` | `rotate` adds to the editor's own transforms (dnd-kit drag, Motion layout animation) instead of fighting them over the one `transform` value. |
| Rotate on images | Wrapper turns, `<img>` drops `rotate` | Rotate both (the default from sharing `node.style`) | Both would add up to a double turn. |
| Slider save | On release | Save on every change | One drag = one undo step. |
| Flag defaults | `true` | `isDev` | Matched the most recent flags in the file (feature-workflow rule). `enable_rotate_control` was added after the control, to follow the checklist. |

## 5. How to modify or extend

### Recipe: add a new panel control end to end

1. **Flag.** Add `enable_<feature>` with a one-line comment to `src/configs/editor.config.ts`
   (default: match the most recently added flags; today `true`). Gate at the render site
   (`if (!editorConfig.enable_x) return null`).
2. **Component.** Put a section in `src/components/PropertyPanelUI/Sections/` (or a controller in
   `relatedComponents/`). Return `null` for content types it doesn't apply to, like `ROTATABLE`.
3. **Mount it** in the right `PanelTypes/*Panel.tsx`. If multi-select should edit it, mirror it in
   `MultiSelectPanel.tsx` with the same hintKey.
4. **Read** with `usePanelStyle().value('<cssProp>')`, so imported CSS shows instead of a blank.
   Convert with `CSSUtils.extractEmValue` like the layout fields if it is a length.
5. **Write** only through `canvas.updateNodeStyle({ ... })` - never `updateNode` for styles. You get
   device scope, multi-select, companions, class sync and undo for free. Write `undefined` to remove.
   Write lengths in em (the editor zooms by root font size).
6. **Companion?** If the property does nothing alone, add a rule to `companionStyles.ts` and a case
   to `src/tests/panel/companionStyles.test.ts`.
7. **Reset.** Wrap the field in `PanelRowContainer` with a non-empty `label` and
   `props={['<cssProp>', ...]}` listing every property the row writes.
8. **Hint.** Reuse a `hintKey` only if it describes the exact same property. Otherwise add
   `PROPERTY_HINTS.<key> = { Demo }` in `hints/registry.tsx`, the demo in `hints/demos.tsx`, and
   `title.<key>` / `description.<key>` in `hints.json` for all 14 locales.
9. **Labels.** Add keys to `propertyPanel.json` in all 14 locales (bn de en es fr hi it ko ms my pt
   ru zh-CN zh-TW). Check key parity with a script diff.
10. **Renderers.** A plain CSS property needs nothing: both renderers spread `node.style`. Anything
    else (a new node field) must be read in the editor renderer (`NodeMap/*`) and the production
    renderer (`PreviewUI/Elements.tsx`), and survive `sanitizeCanvasTree` (name URL fields
    `...href`, `...ImageUrl`, `src`, `url` or `link`).
11. **Tests.** Pure helpers (parsing, wrapping) go in a util with a test in `src/tests/panel/`
    (see `rotate.test.ts`).
12. **Verify.** `npx tsc --noEmit -p tsconfig.app.json` (count must not rise above the baseline),
    `npx vitest run`, run the `audit-property-hints` skill, then check live in the editor and Preview
    (see [code-to-node/09](code-to-node/09-testing-and-verification.md)).

### Other changes

- **New computed shorthand:** add it to the shorthand list in `useComputedNodeStyle`
  (`getComputedStyle` doesn't list shorthands when you loop over it).
- **Make another field computed-aware:** replace its `node.style.x` read with `panelStyle.value('x')`.
- **New rotatable type:** add it to `ROTATABLE` and mount `RotateSection` in its panel. If its
  renderer has an inner element that also gets `node.style`, strip `rotate` there.

## 6. Gotchas and known limits

- **Companions read the focused node only.** With multi-select, the companions computed for the
  focused node's element go to every target.
- **Companions need the canvas element.** If `[data-id]` isn't in the DOM, no companions are added.
- **The dot is per device.** On tablet, a value inherited from desktop shows in the field
  (`value` uses the effective style) but has no dot (`isChanged` reads only the tablet override).
- **No dot without a label.** `FieldReset` renders inside the label's `<legend>`, which only renders
  when `label` is non-empty.
- **Computed em is relative to the root font, not the element's.** `value()` divides by the
  16px root size. Node-style em is relative to the element's own font size, so on an element whose
  font is not 16px the shown number differs from the em you would need to write. Found by
  reading the code, not checked live.
- **`0` shows as blank** in computed values on purpose (no information).
- **Reset leaves companions behind** (for example `display: flex` from gap).
- **The animation `RotateController`** (hover/click effects) is a separate control and unchanged.
- **Stale skill text:** `feature-workflow` and `audit-property-hints` describe registry entries as
  `{ title, description, Demo }`; the code keeps only `Demo` there and reads the text from
  `hints.json`. `audit-property-hints` also says to typecheck with `npx tsc --noEmit -p .`, which
  `feature-workflow` notes checks nothing; use `-p tsconfig.app.json`.

## 7. Tests

| File | Covers |
|---|---|
| `src/tests/panel/companionStyles.test.ts` | Border width/color companions, flex for direction/align/gap, existing flex/grid kept, max-width lift except root/section, cleared values ignored |
| `src/tests/panel/rotate.test.ts` | `parseRotate` units and "none" as 0; `normalizeDegrees` keeps 90° turns in -180..180 |

`usePanelStyle`, `FieldReset` and `RotateSection` have no unit tests; they were checked live
(2026-09-29): imported `.card` padding/margin showed 24/8 from the CSS, gap made the block
flex/column and showed the dot, reset cleared it; block/button 20° and image +90° rotated on the
canvas and in Preview, with the inner `<img>` unrotated.

Live check: open the editor (`run-editor-and-screenshot` skill). Opening the property panel via
Playwright is unreliable (the skill's section 6), so allow for a manual check.
