# 04 - CSS scoping and units

## Purpose

An imported page keeps its own `<style>` as one raw string on the root node (`root.plainCss`). That CSS is injected into the editor's own document, and into Preview and the published page, next to Judgify's Bootstrap/Metronic and the builder's Tailwind. This doc covers how the CSS is made safe to live there: the page's class, id and custom-property names get a private prefix, and rules written for bare tags are limited to the imported root. It also covers how every px/rem/vw/vh length becomes `em`, so the page follows the editor's zoom, and how the page's breakpoints work in the editor's tablet/mobile views.

## Where it lives

| File | Key functions / constants | Role |
|---|---|---|
| `src/utils/htmlToCanvasNodes.ts` | `htmlToJsonTree`, `buildRoot`, `bodyStyle`, `importedBaseCss`, `BASE_DEFAULTS`, `alsoTargetTextWrappers`, `IMPORTED_TEXT_CSS`, `LEADING_IMPORTS` | Runs the whole CSS pipeline in order and assembles the final `plainCss` |
| `src/utils/unitConversion.ts` | `buildUnitContext`, `convertCssUnits`, `styleToEm`, `lengthsToEm`, `evalMath`, `splitFontShorthand`, `convertFontShorthand`, `indexOutsideQuotes`, `VIEWPORT_PX` | px/rem/vw/vh to em, using a font-size cascade over the pasted page |
| `src/utils/pageClasses.ts` | `scopePageClasses`, `pageClassNames`, `mapSelectors`, `splitSelectorList`, `mapSvgDataUri` | `lp-` prefix on class names (CSS, node classes, SVG markup, JS strings). Also the shared selector walkers |
| `src/utils/pageIds.ts` | `scopePageIds`, `pageIdNames`, `ID_FALLBACK_SCRIPT` | `lp-` prefix on ids and every reference to them |
| `src/utils/pageVariables.ts` | `scopePageVariables` | `--lp-` prefix on the page's custom properties |
| `src/utils/pageScope.ts` | `scopePageCss`, `isImportedPage` | Limits tag-only selectors to `:where([data-lp-page])` |
| `src/utils/nodeAttributes.ts` | `IMPORTED_PAGE_ATTR` (`data-lp-page`), `retargetFormSelectors`, `FORM_ATTR` | Marker attribute; `form` selectors to `[data-lp-form]` |
| `src/utils/editorBreakpoints.ts` | `editorBreakpoints`, `PAGE_CONTAINER` (`lp-page`) | Editor only: width `@media` to `@container lp-page` |
| `src/pages/Editor.page.tsx`, `Preview.page.tsx`, `RenderPage.page.tsx` | the `style[css-class]` effects | Inject class CSS + page CSS at the end of `<body>`, re-running `scopePageCss` |
| `src/components/EditorUI/EditorWrapper.tsx` | `#editor-wrapper` style | Zoom: `fontSize = root_font_size * zoomLevel` px |
| `src/components/EditorUI/Canvas.tsx` | root width per view | 81.5em desktop, 41.5em tablet, 21.5em mobile |
| `src/utils/security/sanitizeCss.ts` | `sanitizeCss` | Last step on every CSS string (see doc 05) |

## How it works

### Pipeline order inside `htmlToJsonTree`

The order matters. Anything that runs selectors against the pasted page must see the original names, so units come first and prefixing after.

1. `DomExtractor` returns the raw `css` (all `<style>` blocks plus allowlisted `<link>`s as `@import`).
2. `parseStyleRules(css)` splits it into rules. `buildUnitContext(doc, rules, resolveVars)` builds the font-size cascade over the pasted (inert) document.
3. `convertHtmlToJsonTree(body, css, skipped, units)` builds the node tree. Node styles go through `styleToEm`. The root gets `width: 81.5em` plus `bodyStyle` (see below).
4. `convertCssUnits(css, units)` rewrites the page CSS to em. While writing each rule it also calls `retargetFormSelectors` on the selector.
5. `scopePageVariables` then `scopePageClasses` then `scopePageIds` on (tree, CSS, classic JS). Module scripts in `pageScripts` get the same three renames.
6. `alsoTargetTextWrappers` adds wrapper variants for text-tag selectors.
7. The final string is assembled: leading `@import`s, then `importedBaseCss(rules)`, then the page rules, then `IMPORTED_TEXT_CSS`.
8. `scopePageCss` on the whole string, then `sanitizeCss`.

At render time, Editor, Preview and RenderPage run `scopePageCss` again on `plainCss` when `isImportedPage(root)` is true. The editor also runs `editorBreakpoints` when `enable_editor_page_breakpoints` is on.

### Name prefixing

All three renames use the same idea: collect the names the page itself defines, then rename only those, everywhere the page refers to them. Names that already start with `lp-` / `--lp-` are skipped, so a re-import of our own output is unchanged.

**Classes** (`scopePageClasses` in `src/utils/pageClasses.ts`)
- The set of names comes from the CSS selectors only (`pageClassNames`). A class no rule uses is left alone in markup and JS alike.
- CSS: `mapSelectors` walks rule preludes (skipping at-rule preludes, comments and quoted strings). Quoted parts of a selector (`[href$=".pdf"]`) are masked so `.pdf` isn't read as a class.
- Nodes: every `attributes.className` in the tree. For image nodes made from an inline `<svg>`, the `class="..."` attributes inside the SVG data URI are renamed too, through `mapSvgDataUri` (non-base64 `data:image/svg+xml` only). Without this, `.dial-hand` shapes lost their `transform-origin` (2026-09-30, test3 kitchen timer).
- The `<html>` element's class rides along as a holder node, so `html.dark` rules and `root.htmlAttributes.class` stay in step.
- JS: only string literals (`'...'`, `"..."`, `` `...` ``). The rules in `renameInJsString`:
  - A string containing `://` is a URL: left alone.
  - A plain word list (`"open"`, `"tab active"`) is renamed only if every word is a page class.
  - A string containing `.` is treated as a selector, and every `.name` that is a page class is renamed (`'.tab.active'`).
  - Code outside strings is never touched.

**Ids** (`scopePageIds` in `src/utils/pageIds.ts`)
- The set comes from the markup (`pageIdNames`: every `[id]` in the pasted body).
- Renamed: node `id`s; id-reference attributes (`htmlFor`, `list`, `headers`, `form`, `popovertarget`, `aria-controls`, `aria-labelledby`... see `ID_REF_ATTRS`); `#anchor` hrefs on nodes and inside TipTap link JSON; `id=`, `href="#x"`, `xlink:href` and `url(#x)` inside SVG data URIs; CSS `#id`, `[href="#id"]` and `url(#id)`; JS strings that are exactly an id (`'nav'`) or a selector naming one (`'#nav a'`).
- **Runtime-built ids** (`id + '-err'`) can't be found by text search. `ID_FALLBACK_SCRIPT` patches `Document.prototype.getElementById` so `getElementById('x')` falls back to `lp-x`. It is installed once (guarded by `__lpFallback`) and runs before the page JS in: the sandbox document (`src/utils/security/sandboxDocument.ts`), `buildImportedScript` (Custom Code JS run on the canvas), and Export HTML (`buildExportHtml`).

**Custom properties** (`scopePageVariables` in `src/utils/pageVariables.ts`)
- The set: every `--name:` declared in the CSS, plus `--` keys set in node `style`/`responsiveStyle`.
- Renamed in the CSS, in the whole node tree (it renames the JSON text of the tree), and inside JS string literals (`'var(--ink)'`, `setProperty('--r', ...)`). `--i` decrements in code are outside strings and stay.

**Why prefix at all:** the page lives inside other people's CSS.
- Judgify's Bootstrap/Metronic and the builder's Tailwind have `.container`, `.btn`, `.hidden`... which restyled the page differently in the editor and in Preview (2026-09-30).
- Judgify's page and the builder have their own `#app`, `#nav`, `#modal`. Duplicate ids break `getElementById`, CSS and `#anchor` links.
- The page's `--muted`, `--bg`, `--surface` fought the builder's theme variables of the same name. The builder's dark theme sets `--muted: 43 54 49`, which isn't a color, so text colors broke: 54 of 165 text nodes differed in the editor (2026-09-29).

### Tag-rule scoping (`scopePageCss` in `src/utils/pageScope.ts`)

Prefixing fixes names, but a rule like `section { padding: 80px }` or `* { box-sizing }` names no class. Injected into the editor document, it styled the property panel and toolbar (2026-09-30). `scopePageCss` rewrites each selector in each rule (via `mapSelectors` + `splitSelectorList`):

- **Left alone:** a selector that already has a private token (`.lp-`, `#lp-`, `[data-lp-`), ignoring anything inside `:not(...)` (excluding a page element doesn't select one). Keyframe steps (`from`, `50%`).
- **`html` / `:root` alone:** left on the document (variables, `scroll-behavior`). `html .x` keeps `html` and scopes what follows: `html :where([data-lp-page]) .x`.
- **`body`:** becomes the root itself: `body.dark main` becomes `:where([data-lp-page]).dark main`.
- **A tag selector** (`section`, `a:hover`): prefixed, `:where([data-lp-page]) section`.
- **No tag in front** (`*`, `::selection`, `[hidden]`): two variants, one for descendants and one for the root itself, because in the original page the root element matched too.

```css
/* in */  * { box-sizing: border-box }  section { padding: 5em }
/* out */ :where([data-lp-page]) *, :where([data-lp-page]){ box-sizing: border-box }
          :where([data-lp-page]) section { padding: 5em }
```

`:where()` has zero specificity, so a scoped `section {}` still loses to the page's own `.hero {}` exactly as before. The function is safe to run more than once (the second pass finds `[data-lp-` and stops). That is why it runs both at import and at render: pages imported before the rule existed get it at render too.

### Base CSS, wrappers and root style

**`importedBaseCss(rules)`** puts back the browser defaults that Tailwind's reset and Judgify's site CSS take away, inside imported pages only:
- `BASE_DEFAULTS`: h1-h6 size/weight/margin and `color: inherit`; p/dl/blockquote/figure/ul/ol margins; list styles (disc, decimal, nested circle/square, `li { list-style: inherit }` against a builder `li { list-style: none }`); `b/strong` bolder; `small` smaller; dt/dd/label against Bootstrap; `button` ButtonText/ButtonFace against Tailwind.
- Each is written as `:where([data-lp-page]) h1`, so it sits at plain tag weight. A second copy targets the text wrapper (`[data-lp-page] [data-lp-text="h1"]`) inside `:where()`.
- **The page's `*` reset wins:** in the original, `* { margin: 0 }` beats the browser default. Here the defaults are tag rules, so they would beat `*`. `importedBaseCss` collects the property families the page's `*` rule sets (`propFamilies`: margin-top counts as margin, `font` as font-size + font-weight) and leaves those out.
- Root rule: `color-scheme: light` (the editor runs dark, which darkens system colors like ButtonFace), and `line-height: normal` unless the `*` reset sets line-height (Tailwind sets 1.5 on `<html>`).

**`alsoTargetTextWrappers`**: an imported heading or paragraph renders as a wrapper div marked `data-lp-text="h2"` around TipTap's own element (see doc 03). A rule whose last compound starts with a text tag gets extra selectors: `.about h2` also becomes `.about [data-lp-text="h2"]`, and `.story p + p` also becomes `.story [data-lp-text="p"] + [data-lp-text="p"]` (every text-tag compound).

**`retargetFormSelectors`** (`src/utils/nodeAttributes.ts`, called from `convertCssUnits`): a `<form>` becomes a block marked `data-lp-form` (a real form would reload the editor on submit), so `form .btn` becomes `[data-lp-form] .btn`. It matches the type selector only, not `.form`, `#form` or `my-form`.

**`bodyStyle` onto the root:** the page's `body {}` rule now targets the root (via `scopePageCss`), but at import time `buildRoot` also copies `background*`, `color`, `font-family`, `font-size`, `line-height` and `letter-spacing` from the winning desktop `body` rules into the root's inline style. This was added on 2026-09-29, when the CSS was still unscoped and `body {}` styled the editor's own `<body>`, not the canvas. Inline root styles override this.

**Root width `81.5em`:** set on every imported root (no min-height). 81.5em is the desktop canvas width in `Canvas.tsx` (1304px at 16px), and the unit converter treats 100vw as that width.

### CSS injection order

Editor, Preview and RenderPage each keep one `<style css-class>` element holding class CSS plus page CSS, and append it **at the end of `<body>`**, after the builder's and the site's stylesheets. Equal-specificity rules then go to the page: its `h1 {}` beats Tailwind's reset. Export HTML writes `plainCss` in its own `<style>` so its `@import`s stay first in that sheet; inside `plainCss` the importer keeps `@import`s first (`LEADING_IMPORTS`), because a browser ignores an `@import` after any other rule.

### Units: everything becomes em (`src/utils/unitConversion.ts`)

**Why em:** the editor zooms by changing the font size of `#editor-wrapper` (`editorConfig.root_font_size * canvas.zoomLevel`, in `EditorWrapper.tsx`). Only em follows that. px is fixed, rem follows `<html>` (which the editor does not change), and vw/vh follow the browser window.

**The font-size cascade** (`buildUnitContext`)
1. For each desktop rule (`rule.breakpoint` is null) with `font-size`, or a size inside a `font:` shorthand (`splitFontShorthand`), match its selectors against the pasted document. Selectors with `:hover`, `::before` etc. are skipped.
2. Add the element's inline `font-size`.
3. Sort as the browser does: `!important`, then inline, then specificity, then source order. Take the last value that resolves (`resolveFontSize`).
4. Walk the document top-down. `html` is computed against 16px; its size is `rootPx` (what the page's rem meant). The body's size is `basePx`.

`resolveFontSize` handles keywords (`small`, `larger`), em/% of the parent, px/rem/viewport units through `toPx`, and math through `evalMath`: `clamp()`, `min()`, `max()` and `calc()` (`evalCalc`, a small + - * / parser). If a value can't be worked out, the next candidate is tried, else the parent's size is used.

**What each length divides by**
- `font-size` divides by the **parent's** font size (em in font-size is relative to the parent).
- Every other property divides by the element's **own** font size.
- `font:` shorthand (`convertFontShorthand`): the size part divides by the parent, a `/line-height` length by the element's own size.
- Custom properties (`--x`) and `@keyframes` values divide by `basePx` (they are used elsewhere; the base size is the best guess).

**Node styles vs CSS rules**
- Node styles (`styleToEm`) know their element, so they use `ownPx(el)` / `parentPx(el)`.
- A CSS rule can match many elements. `contextFor(selector, isFontSize)` takes the **most common** size among the matched elements (rounded to 0.01px). A rule that matches nothing uses `basePx`.

**Other rules in `convertCssUnits` / `convertDeclarations`**
- `@media` conditions stay in px (they are about the screen). Rules inside `@media`, `@supports`, `@container`, `@layer`, `@scope` are converted. `@font-face`, `@page` and statement at-rules (`@import`) are copied as they are.
- `html {}` / `:root {}` `font-size` is dropped: it would resize the editor's rem-based UI, and the page no longer needs it once rem is converted.
- `VIEWPORT_PX`: 100vw = 81.5em × 16 = 1304px, 100vh = 900px (a typical laptop screen). vmin/vmax and the d/s/l variants use the same numbers.
- `insideSvgOnly`: a rule whose every match is a shape inside an `<svg>` keeps its px (except font-size). Those px are viewBox units: `transform-origin: 200px 200px` on a dial hand would move if converted (2026-09-30).
- `lengthsToEm` skips `url(...)` and quoted strings, needs a non-word character before the number (so identifiers containing "px" survive), writes `0` for zero and rounds to 4 decimals.
- **Every scanner skips quoted strings.** Google Fonts URLs contain `;` (`wght@400;700`), which cut the `@import` in half (2026-09-29). `indexOutsideQuotes` does this in `convertCssUnits`; `sanitizeCss` and the rule parser do the same.

### Editor breakpoints (`src/utils/editorBreakpoints.ts`)

The editor's tablet and mobile views narrow the canvas root to 41.5em / 21.5em; the browser window stays wide. So `@media (max-width: 992px)` never matches in the editor. With `enable_editor_page_breakpoints` on, Editor.page.tsx passes the (scoped) page CSS through `editorBreakpoints`:
- A media query made only of `min-width` / `max-width` features (joined by `and`, with an optional `only screen and` / `screen and` / `all and` in front) becomes `@container lp-page (max-width: 62em)`. px divides by a fixed 16 (`BASE_PX`), em/rem are kept as em.
- Anything else (a comma list, print, hover, orientation, height) stays `@media`.
- It appends `[data-lp-page] { container: lp-page / inline-size; }`, making the imported root the container.

em in a container condition is relative to the container's font size, so the breakpoint follows zoom as well. Preview and the published page keep the real `@media` rules: their frame is the page's viewport.

## Why this approach

**Raw CSS string, not node styles.**
- Chosen: keep the `<style>` as `plainCss` and let it style the nodes, which keep their classes and ids. The user wanted this: preserve structure and class/id, and let the page's own stylesheet do the styling (2026-09-25).
- Tried on 2026-09-25, reverted at the user's request: resolving each node's class rules into `node.style`/`responsiveStyle` with a real cascade, turning `:hover`/`:active` into Animation-panel effects, a migration for saved pages, and a version dropping `plainCss` entirely with every rule (tag/id/`*`/`body`, `var()` resolved) folded into node styles. All discarded. The log records the revert, not a detailed reason.
- The older `htmlToCanvasSections` (CSS resolved into inline styles) still exists for the action-menu "import into node" path.

**Prefix names instead of isolating the page.**
- Chosen: `lp-` / `--lp-` prefixes plus `:where([data-lp-page])` for tag rules. The page stays in the same DOM as the editor, so the editor's selection, drag and panels work on it normally.
- Tried and rejected by the user (2026-09-25): an `lp-imported-root` scoping class. Reason not recorded. For a while after that the CSS was injected fully unscoped, and `body {}` / `h1 {}` reached the editor chrome (flagged in that log). The `data-lp-page` attribute with `:where()` came on 2026-09-30.
- Not tried / not recorded: Shadow DOM or an iframe for the editor canvas. The sandbox iframe is used for Preview and the published page (for JS security, doc 05), and a frameless Preview was tried and reverted on 2026-09-29, but isolating the **editor** canvas is not discussed in any log.

**Why `:where()`.** It adds zero specificity, so the scoped rule competes with the page's other rules exactly as it did in the original. A plain `[data-lp-page] section` would add attribute weight and start beating the page's own class rules.

**em with a real cascade, not a flat `px / 16`.**
- Chosen: divide by the right font size for each element (parent for font-size, own for the rest).
- Rejected: flat `px / 16`. The skill states it as a rule ("Never convert with a flat px / 16"). The reason follows from how em works: in an element with `font-size: 24px`, `padding: 24px` must be `1em`, not `1.5em`. The work logs don't record this being tried.
- Not chosen: CSS `zoom` or `transform: scale` for editor zoom. The editor already zoomed by font size before Import HTML existed (2026-06-09); the converter follows that.

**Viewport numbers.** 100vw = the root width so a full-width element fills the canvas. 100vh = 900px is a fixed guess; the measured test pages show a 100px gap against a 1000px-tall test window (2026-09-30/10-01). Accepted as is.

**Container queries only in the editor.** The real viewport is right for Preview and the published page. In the editor only the root narrows, so only a container query can see it (2026-10-01, added for the AI prompt's "one max-width per @media" rule).

## How to modify or extend

### Add a new CSS rewrite step

1. Write it as a pure `(css: string) => string`, using `mapSelectors` / `splitSelectorList` from `pageClasses.ts` so quotes, comments and at-rule preludes are handled. Make it **idempotent**: running it twice must give the same result (it may run at render on CSS it already rewrote).
2. Decide its place in `htmlToJsonTree`:
   - If it must match selectors against the pasted page, it runs before the prefixing (on original names), like `convertCssUnits`.
   - If it outputs `data-lp-*` or `lp-` tokens, remember `scopePageCss` will then leave those selectors alone.
   - It must run before `sanitizeCss`.
3. If older imported pages need it too, also run it where page CSS is injected: the `style[css-class]` effects in `Editor.page.tsx`, `Preview.page.tsx` and `RenderPage.page.tsx`, next to `scopePageCss`, behind `isImportedPage(root)`. If it is editor-only, put it in Editor.page.tsx only, like `editorBreakpoints`.
4. Check Export: `Preview.page.tsx` passes `content.plainCss` to `exportHTML` as stored, without the render-time steps. Add it there if the exported file needs it.
5. The sandbox snapshot copies the tagged `<style>` elements, so a render-time step reaches the frame without extra work.
6. Add a flag in `src/configs/editor.config.ts` (`enable_...`, with a one-line comment, default `true`), per the `feature-workflow` skill.
7. Add tests to `src/tests/import/pageScope.test.ts` (scoping-style steps) or `fullPage.test.ts` (whole-page result), including a "safe to run twice" case.
8. Add a line to `.claude/skills/code-to-node/SKILL.md` and to this doc.

### Add a new unit

Example: converting `cqw` or `ch`.
1. Add it to `CONVERTED_UNITS` in `unitConversion.ts` (a regex alternation; put longer names first if one is a prefix of another).
2. Add a case to `toPx` returning px. If it needs more context than `rootPx` and `VIEWPORT_PX` (e.g. `ch` depends on the font), pass it in; keep a `null` return for "can't tell".
3. `resolveFontSize`, `evalCalc` and `lengthsToEm` all go through `toPx`, so font-size cascade and math pick it up.
4. If media queries can use it, decide whether `editorBreakpoints` should accept it (`WIDTH_FEATURE` takes px/em/rem only).
5. Add cases to `src/tests/import/unitConversion.test.ts`: plain value, inside `calc()`, as a font-size in the cascade.

### Change the root width

`81.5em` appears in `buildRoot` (htmlToCanvasNodes.ts), `VIEWPORT_PX` (unitConversion.ts), `Canvas.tsx`, `CaptureRender.page.tsx` and the comment in `editorBreakpoints.ts`. Change them together.

## Gotchas and known limits

- **Third-party libraries look up original class names.** Swiper, the Tailwind CDN, Font Awesome and similar scripts expect `.swiper` or `.fa-*`, but the markup now says `lp-swiper` (2026-10-01, known). Only the page's own CSS-named classes are renamed, so a class that no page rule uses keeps its name.
- **JS renaming is text-based.** Any string literal containing `.name` where `name` is a page class is renamed, even `'config.title'` if `.title` is a page class. Any string exactly equal to a page id is renamed, even if it is a dictionary key or prose. Classes built at runtime (`'is-' + state`) are not renamed. The AI prompt asks for complete class/id literals in JS for this reason.
- **`ID_FALLBACK_SCRIPT` covers `getElementById` only.** `querySelector('#' + id)` with a runtime-built id won't find the `lp-` element.
- **`scopePageVariables` renames the whole tree's JSON text**, not just style keys. A declared name like `--bg` written in prose would also get the prefix.
- **`html {}` rules stay on the editor document.** `html { scroll-behavior: smooth }` or `:root` variables apply to the builder page while the imported page is open (variables are `--lp-` prefixed, so they are harmless).
- **Breakpoint font sizes.** The cascade uses desktop rules only. A rule inside `@media (max-width: 600px)` is converted with the desktop font sizes of the elements it matches, so its em values are off where the mobile font size differs.
- **Base defaults keep px.** `importedBaseCss` is added after unit conversion, so `margin: 1em 40px` (blockquote, figure) and `padding-inline-start: 40px` (lists) stay px and don't follow zoom. (Code observation; not in the logs.)
- **`editorBreakpoints` assumes 16px.** px breakpoints divide by 16, whatever the page's `rootPx` was.
- **Most-common size is a guess.** A rule matching elements of different sizes gets one em value; the minority elements end up a little off.
- **`html { font-size: 62.5% }` pages:** the font-size is dropped and rem is converted against the page's own `rootPx`, so it works; but `editorBreakpoints` still divides px by 16.
- **Pages imported before a rule existed** keep their old `plainCss` until re-imported. Only `scopePageCss` is re-applied at render.
- **Selector walkers must skip quotes.** Any new scanner that splits on `;`, `,` or `{` without skipping quoted strings will break Google Fonts `@import`s.

## Tests

| Test file | Covers |
|---|---|
| `src/tests/import/unitConversion.test.ts` | px/rem/vw/vh to em, parent vs own size, cascade from CSS, most-common size, root font-size drop, `@media` kept px, `VIEWPORT_PX`, `clamp()`/`calc()`, `font:` shorthand |
| `src/tests/import/pageScope.test.ts` | `scopePageCss` (tags, private tokens, `:not()`, `body`/`html`/`:root`, `*`, `@media`, keyframes, run twice), SVG class prefix and viewBox px, live SVG variables |
| `src/tests/import/pageClasses.test.ts` | class and id prefixing in CSS/nodes/JS, `ID_FALLBACK_SCRIPT` |
| `src/tests/import/fullPage.test.ts` | themed full page: `--lp-` variables, `data-lp-page`, base CSS |
| `src/tests/import/htmlToJsonTree.test.ts` | variables and root marker in the full pipeline |
| `src/tests/import/promptRules.test.ts` | `editorBreakpoints`, runtime id lookups |

Run `npx vitest run`, and typecheck with `npx tsc --noEmit -p tsconfig.app.json` against the baseline (226 as of 2026-10-01/02).

**Live check:** import a test page from `codeToNodeTestCodeFiles/`, then measure rather than eyeball: render the original with Playwright `setContent` at 1304px wide, and compare every text node's computed color/size/weight/family and the section heights with the editor at 100% zoom and with Preview. Then change the zoom and check the page scales as one piece, open a property panel to check page tag rules don't reach it, and switch to the tablet view to check the page's breakpoints apply. See the `run-editor-and-screenshot` skill and doc 09.
