# Code to Node 03: Text conversion

How Import HTML turns text in a pasted page into text nodes: when content becomes
a text node and when it stays blocks, how TipTap is used, the wrapper model that
keeps page CSS working, and how text colors are chosen. Structure (root, sections,
blocks, buttons, media) is in `02-structure-conversion.md`.

## 1. Purpose

Imported text must stay editable in the builder's rich-text editor and still look
as the original: the same tags (so `.about h2 {}` matches), the same inline
formatting, the same font size, line and color. The rich-text editor can only
hold a fixed set of tags and marks, so the importer has to decide, for each piece
of text, whether the editor can hold it without changing it. If not, the text is
split into separate nodes that keep their real tags.

## 2. Where it lives

| File | Key functions / constants | Role |
|---|---|---|
| `src/utils/htmlToCanvasNodes.ts` | `convertTreeElement`, `convertChildNodes`, `convertTextElement`, `textNode`, `toTextDoc`, `innerHtmlOf`, `isProse`, `isPhrasingOnly`, `hasOwnText`, `survivesTiptap`, `tiptapSafe`, `tiptapSafeList`, `inlinePieces`, `keepEdgeSpaces`, `styledInlineNode`, `matchesPageRule`, `markFriendlyStyle`, `listItemNode` | Text decisions and building text nodes |
| same file | `ownColor`, `inheritedColor`, `colorValue`, `isInactiveRootRule`, `rootVariableNames`, `collectCssVariables`, `resolveVarReferences` | Text color |
| same file | `IMPORTED_TEXT_CSS`, `TEXT_SOURCE_TAGS`, `alsoTargetTextWrappers`, `wrapEveryTextCompound`, `importedBaseCss`, `BASE_DEFAULTS` | CSS added so the wrapper model works |
| same file | `PHRASING_TAGS`, `TIPTAP_BLOCK_TAGS`, `TIPTAP_FORMATTING`, `TIPTAP_LINK_ATTRS`, `UNMARKED_INLINE`, `TAGGED_TEXT_TAGS`, `INLINE_TEXT_PARENTS`, `BLOCK_TAGS`, `SECTION_TAGS` | Tag sets that drive the decisions |
| `src/utils/nodeAttributes.ts` | `IMPORTED_TEXT_ATTR` (`data-lp-text`), `INLINE_PIECE_ATTR` (`data-lp-inline`), `keepsPageColor` | Marker attributes |
| `src/libs/tiptap/config.ts` | `extensions` | The TipTap schema used by `generateJSON` and the editor; `trailingNode: false` |
| `src/utils/unitConversion.ts` | `styleToEm`, `splitFontShorthand` | em conversion, font shorthand split |
| `src/components/EditorUI/NodeMap/Contents.tsx`, `src/components/PreviewUI/Elements.tsx` | Text renderers | Skip the `#000000` default for imported text (`keepsPageColor`) |

### Flags

| Flag | Effect on text |
|---|---|
| `enable_import_lossless_text` | TipTap only gets text it gives back unchanged; otherwise inline pieces. Also: tagged inline blocks, `data-lp-text="p"` on a `<p>` holding blocks, inline marking under inline parents |
| `enable_import_lists_as_blocks` | ul/ol/li are blocks; each item's text is a text node marked inline |
| `enable_import_raw_elements` | A `<br>` ending an inline piece becomes its own `br` block |

## 3. How it works

### 3.1 TipTap in one paragraph

TipTap is the rich-text editor library the builder uses for text nodes (built on
ProseMirror). A text node's `children` is a JSON string of a TipTap document:
block nodes (paragraph, heading, blockquote, list...) with text and marks (bold,
italic, link, textStyle...). `generateJSON(html, extensions)` from
`@tiptap/react` parses an HTML string with the schema from
`src/libs/tiptap/config.ts` and returns that JSON. Anything the schema has no rule
for is dropped or rewritten: unknown tags vanish (their text stays), classes and
ids on inline tags are lost, `<b>`/`<i>`/`<del>` come back as `<strong>`/`<em>`/`<s>`.
`toTextDoc` wraps the call and falls back to a plain paragraph (`buildTextDoc`)
when it throws or returns nothing.

### 3.2 Text node or blocks?

`convertTreeElement` decides per element, `convertChildNodes` per run of mixed
children. "Prose" (`isProse`) means: there is visible text, everything is phrasing
(`PHRASING_TAGS`: a, b, strong, em, small, code, time...; not span), every element
survives TipTap (`tiptapSafe`), and it is not just a row of links or buttons.

| Source | Result |
|---|---|
| div, span, header/section/footer/main | Always a block; text goes into text-node children |
| h1-h6, p, blockquote, pre with prose inside | `convertTextElement`: one text node, `data-lp-text="<tag>"` |
| Any of those holding non-prose (a span, a styled tag, a block) | A block. h1-h6 keep their tag; a `<p>` renders as div with `data-lp-text="p"` (lossless) |
| summary, dt, dd, figcaption, legend, label (`TAGGED_TEXT_TAGS`) with prose | A block with that tag holding one text node |
| li | Lists as blocks: `listItemNode` (block `li`, text marked inline). Flag off, lossless on: like `TAGGED_TEXT_TAGS` |
| Plain-text ul/ol (lists as blocks off, `tiptapSafeList`) | One TipTap list text node, `data-lp-text="ul"`/`"ol"` |
| Another tag with prose (small, strong, nav, my-badge...) | Lossless: `styledInlineNode` (block with that tag + text). Off: a text node, `data-lp-text="plain"` |
| a, button | Never text; see doc 02 (button node, linked image, linked block) |

Inside `convertChildNodes`, consecutive text and phrasing elements form a run.
`flushRun` handles a run in this order:
1. **No loose text, only inline elements, some matched by a page rule**
   (`matchesPageRule`, e.g. `<small>Days</small>` with `.item small {}`): each
   element becomes its own `styledInlineNode`, so the rule still matches it.
2. **Loose text with tags TipTap would change** (`Read <a id="t">terms</a>`,
   `<small class>`): `inlinePieces` (3.4).
3. **Prose**: one text node (`textNode`), or, when the run is a single element,
   that element converted on its own so it keeps its class and style.
4. Otherwise each element is converted separately (e.g. a row of links becomes
   button nodes).

### 3.3 Lossless text: `survivesTiptap`

With `enable_import_lossless_text`, TipTap only gets text whose every inline
element comes back unchanged (`survivesTiptap`, ported from frontend-editor's
`survivesQuill`):
- bare `TIPTAP_FORMATTING` tags (b, strong, i, em, u, s, del, strike, code, sub,
  sup, br, mark) with **no attributes at all**;
- `<a>` with only href, target, rel, title (`TIPTAP_LINK_ATTRS`).

Everything else fails. A class on a link fails too: page classes get an `lp-`
prefix (`scopePageClasses`), and that renaming doesn't reach inside the TipTap
JSON, so the link would lose its CSS. `tiptapSafe` applies the check to a whole
subtree; `tiptapSafeList` also needs the list to carry only class/id/style and
its items no attributes. With the flag off, both always return true (the old
behaviour: everything goes to TipTap).

### 3.4 Inline pieces: `inlinePieces` and `data-lp-inline`

For one line of text holding tags TipTap would change:
- each such tag becomes its own node via `convertTreeElement` (a link becomes a
  button node, `<strong class="price">` a block with tag `strong`);
- the text between them becomes text nodes (`flushText`);
- a whitespace-only gap between two tags becomes a text node holding `&nbsp;`, so
  the tags stay apart;
- with raw elements on, a `<br>` that ends a piece is moved out as its own `br`
  block: ProseMirror adds an extra line after a trailing hard break;
- every piece is marked `data-lp-inline` (`INLINE_PIECE_ATTR`).

`IMPORTED_TEXT_CSS` then shows them inline:
`:where([data-lp-inline]), :where([data-lp-inline]) :where(div, p) { display: inline; }`.
It has zero specificity, so a page `span { display: block }` still wins.

`data-lp-inline` is also set:
- by `convertChildNodes` when the parent has loose text next to a `<span>`
  (`inlineContext`): every text node and span block there is one line in the
  source;
- by `containerNode` on text children of inline-level parents
  (`INLINE_TEXT_PARENTS`: phrasing tags except `a`, plus span, label, button, li),
  so the text keeps the source's line box (the parent font's strut, a list
  marker's line, `li::before` bullets);
- by `listItemNode` when lists are blocks but lossless text is off.

### 3.5 Edge spaces: `keepEdgeSpaces`

TipTap trims spaces at a paragraph's edges. In `Secure your <span>deployment</span> now`,
the text pieces "Secure your " and " now" would lose the space that separates them
from the span. `keepEdgeSpaces` replaces that edge space with `&nbsp;` when a span
(or, in `inlinePieces`, another piece) sits on that side.

### 3.6 Styled inline tags: `styledInlineNode` and `markFriendlyStyle`

`styledInlineNode(el)` makes a block with the element's own tag (via
`containerNode`, so the tag must be in `CONTAINER_TAGS`) holding one text node of
its content. With lossless text, an element with no text (a CSS-drawn
`.brand-mark`) is an empty block instead, not an empty text node the editor would
size.

`markFriendlyStyle` handles a different case: a styled inline tag TipTap has no
mark for (`UNMARKED_INLINE`: small, time, cite, abbr, kbd, font...) that still
goes to TipTap inside prose. In `innerHtmlOf`, such an element with a `style`
attribute is replaced by a `<span style>`, which TipTap keeps as textStyle
(size, color, family, line height). Before that, `markFriendlyStyle`:
- expands a `font:` shorthand with `splitFontShorthand` into size, line-height,
  family and bold. TipTap read the weight inside `font:` as a line height;
- keeps `font-weight` only when it is bold (bold, bolder, 700-900) and writes
  `bold`. TipTap's bold mark takes any weight from 500 up, so 500/600 would turn
  into bold.

With lossless text on, a styled tag in loose text fails `survivesTiptap` and is
split out by `inlinePieces` first. So `markFriendlyStyle` mostly runs with the
flag off, or for tags nested inside an element taken by `flushRun` step 1.

### 3.7 The text wrapper model

Every imported text node is a wrapper standing for its source element:
- `textNode` stores the source's class, id, inline style (em) and attributes on the
  node, plus `data-lp-text="<tag>"` for h1-h6, p, blockquote, pre, ul, ol
  (`TEXT_SOURCE_TAGS`) or `"plain"` for any other source (a div's loose text, dt,
  label...).
- The editor and the renderers draw that node as a wrapper `<div>` with those
  attributes, holding TipTap's own `<h2>`/`<p>`/`<ul>`.

`IMPORTED_TEXT_CSS` (appended last to the page CSS) makes the inner element only
inherit:
- `[data-lp-text] :is(p, h1-h6, blockquote, pre)`: margin 0 and color, font-family,
  font-size, font-weight, font-style, line-height, letter-spacing, text-transform
  inherit, all `!important`. text-align is left out: the editor's align buttons set
  it on the inner element.
- Text lists: the inner ul/ol drops margin and padding and inherits `list-style`; an
  item's lone `<p>` is inline so `li::before` stays on its line.

Page rules for a text tag also target the wrapper: `alsoTargetTextWrappers` rewrites
`.about h2` to `.about h2, .about [data-lp-text="h2"]`, and for `h2 + p` also adds a
variant with every text compound pointed at a wrapper (`wrapEveryTextCompound`).
`importedBaseCss` adds the browser's tag defaults (h2 size and weight, p margins) for
the wrappers too, at zero specificity.

**Why the inner element must inherit:** the wrapper carries the class. With
`.title { font-size: 76px }` (converted to em) on the wrapper and an inner `<h2>`
that also got a font size (the h2 default `1.5em`, or a page `h2` rule), the size
was applied twice: the inner em multiplies the wrapper's. Same for margins and for
page `p` rules hitting the TipTap `<p>` inside text that came from a div.

`keepsPageColor` in `nodeAttributes.ts` sees `data-lp-text` and stops the renderers
writing their default `#000000` color on imported text.

### 3.8 A `<p>` holding blocks

A browser moves a `<div>` out of a `<p>` when it parses markup, and the sandbox
re-reads the editor's rendered markup. So a `<p>` that holds blocks (a span, a
styled tag) can't render as `<p>`. `convertTreeElement` makes it a block (renders
as div, `p` is not in `CONTAINER_TAGS`) marked `data-lp-text="p"` (lossless text
only). The page's `p` rules (through `alsoTargetTextWrappers`) and the p defaults
still reach it. h1-h6 holding blocks keep their real tag.

### 3.9 Text color

For every text node the importer decides a color:
1. **Own color.** `ownColor(el)` reads `style=""` and every desktop page rule whose
   selector matches the element (`el.matches`, so the full selector counts), skipping
   `:hover`, `::before` and similar. `!important` first, then specificity
   (`SELECTOR_SPECIFICITY`), then source order. If the element sets a color, the
   node gets none: the page CSS (or its inline style) applies it.
2. **Inherited.** Otherwise `inheritedColor` walks up the ancestors to the nearest
   own color (skipping inherit/currentColor/unset/initial). Loose text uses the
   parent's. If nothing is found: `#ffffff` (`DEFAULT_TEXT_COLOR`). Reason for white
   not recorded.
3. **Value.** `colorValue` keeps a value that only uses `:root` variables as is
   (`var(--ink)`, later renamed `var(--lp-ink)`): those are always defined where the
   page CSS is injected, and the page's dark-mode switch keeps working. Any other
   `var()` is resolved to its value with `resolveVarReferences`.
4. **Inactive theme rules.** `collectCssVariables` skips root rules that don't match
   the page as pasted (`isInactiveRootRule`: `:root[data-theme="dark"]`, `html.dark`),
   so resolved values come from the light (default) theme.

The color goes on the node's `style.color`, **not** on a TipTap textStyle mark. A mark
renders as an extra `<span>` inside the `<p>`, which page `span` rules would catch and
which changes the markup the CSS was written for. The test "span text wrapping"
asserts there are no marks.

### 3.10 `trailingNode` off

`src/libs/tiptap/config.ts` sets `StarterKit.configure({ trailingNode: false })`.
With it on, TipTap appends an empty paragraph on the first transaction (a click) into
any document that ends in a heading or list, which is the shape of most imported
text. `src/tests/tiptap/trailingNode.test.ts` checks both sides: our extensions keep
`['heading']`, plain StarterKit adds a paragraph. Tables carry their own trailing
paragraph.

## 4. Why this approach

**TipTap `generateJSON` instead of `textContent`.**
- Before 2026-09-25 the converter (`htmlToCanvasSections`, `TEXT_TAGS`,
  `buildTextDoc`) flattened text to `textContent`, losing bold, links and real
  heading tags. Replaced on 2026-09-25 with `generateJSON`, keeping h1-h6 and inline
  formatting.

**Lossless text (2026-10-01).**
- Before, all prose went to TipTap, which dropped classes and ids on inline tags,
  ids on links, and tags it has no node for. Ported from frontend-editor (which uses
  Quill and `survivesQuill`). A `<button>` holding tags became a real button block;
  a blockquote with `<cite>` stays a blockquote.
- Not tried: extending the TipTap schema to keep classes and arbitrary attributes on
  marks. The list extensions already have `keepAttributes: false` with a TODO saying
  marks weren't kept when attributes were.

**Wrapper model (2026-09-30).**
- Earlier (2026-09-29) only text from non-text tags was marked `data-lp-text="plain"`
  and its `<p>` made to inherit, after `.ticket p {}` hit text converted from a div.
  On 2026-09-30 the wrapper was made to stand for every source element, with the
  inner element inheriting and tag rules retargeted. This stopped class font sizes
  applying twice.
- Not tried: rendering imported text without a wrapper (TipTap's own element
  carrying the class). In the code, the text renderers always draw the node's
  element (`MotionWrapper` in the editor) around the TipTap content.

**Lists.**
- 2026-09-25: plain lists stayed one TipTap list. 2026-10-01: lists with attributes
  became blocks, then `enable_import_lists_as_blocks` made every list blocks, so items
  can be added, moved and styled one by one.

**Inline pieces and edge spaces (2026-09-30).**
- Spans became blocks on 2026-09-25 (div/span always containers), which broke lines
  like `Secure your <span>x</span>` into separate block lines. Marking the pieces
  inline and keeping edge spaces restored one line.
- Not ported from frontend-editor: whitespace between two inline siblings (it only
  matters outside flex/grid, which the importer can't tell).

**`markFriendlyStyle` (2026-09-30).** TipTap read the weight in `font:` as a line
height. Expanding the shorthand first was the fix.

**Text color.**
- The old `buildTextDoc` put color and font on a textStyle mark (its comment: without
  it, ProseMirror's base styling won and "every imported text renders white").
  The new path uses `style.color` because a mark renders as an extra span; the
  inner element now inherits from the wrapper instead.
- 2026-09-29: dark `:root[data-theme="dark"]` values overrode the defaults, giving
  near-invisible text. Fixed with `isInactiveRootRule` and keeping `:root` variables
  live. A second pass measured 54 of 165 text colors wrong in the editor; causes were
  variable clashes (fixed with the `--lp-` prefix), page `p` rules on converted text,
  and forced black. After the fixes: 0 mismatches.

**`trailingNode` off.** It added an empty `<p>` on click into imported text.

## 5. How to modify or extend

**Add a new inline tag X that TipTap keeps unchanged (it has a mark for it):**
1. Make sure the mark's extension is in `extensions` in `src/libs/tiptap/config.ts`.
2. Add `'x'` to `PHRASING_TAGS` (so it joins text runs) and to `TIPTAP_FORMATTING`
   (so `survivesTiptap` accepts it bare). Check what TipTap writes back: if it
   respells the tag, the page's `x {}` rules stop matching, so think twice.
3. Test in `src/tests/import/frontendEditorRules.test.ts` ("lossless text"): bare X
   stays inside one text node, X with a class becomes its own piece.

**Add a new inline tag X that TipTap has no mark for:**
1. Add it to `PHRASING_TAGS` (it then joins runs and becomes an inline-text parent
   through `INLINE_TEXT_PARENTS`).
2. Add it to `CONTAINER_TAGS` in `nodeAttributes.ts`, so its `styledInlineNode` block
   keeps the tag.
3. Add it to `UNMARKED_INLINE` if its inline style should survive as a `<span style>`
   when it does go to TipTap.
4. If the browser gives it a default look that Tailwind or the host resets, add a line
   to `BASE_DEFAULTS`.
5. Test the split case and the styled-by-page-rule case.

**Change what goes to TipTap:**
- The rule lives in `survivesTiptap` (per element), `tiptapSafe` (subtree),
  `tiptapSafeList` (lists) and `isProse` (whether a run is prose at all).
- Allowing an attribute (say `class` on links) means the class must also be renamed
  inside the TipTap JSON by `scopePageClasses`, or its CSS breaks.
- Adding a TipTap block tag (wrapper tag) means updating together: `TIPTAP_BLOCK_TAGS`,
  `TEXT_SOURCE_TAGS`, `TEXT_TAG_START`, the `:is(...)` list in `IMPORTED_TEXT_CSS`, and
  `BASE_DEFAULTS` if it has a default look.
- New behaviour goes behind a new `enable_import_*` flag with a comment
  (`feature-workflow` skill), and the flag-off path must keep working.

**Change the color rule:** `ownColor`, `inheritedColor`, `colorValue`. Tests in
`htmlToJsonTree.test.ts` ("text color fallback") and `fullPage.test.ts` ("themed
variables", "page variables and text").

After any change, check the result renders the same in the editor, Preview (sandbox
frame) and after export and re-import.

## 6. Gotchas and known limits

- **Tag CSS on tags that don't survive** (a bare `<strong>` or `<b>` inside a TipTap
  paragraph is respelled; `li` in a TipTap text list) has nothing exact to apply to.
  `::before`/`::after` rules live in `plainCss` only.
- **Weight 500/600 is dropped** by `markFriendlyStyle` (only real bold is kept), so a
  semibold styled `<small>` inside prose renders at the normal weight.
- **`flushRun` step 1 doesn't check `tiptapSafe`** on the element's children, so a
  nested tag with a class inside a page-styled inline tag can lose that class in
  TipTap.
- **`<p>` holding blocks is a div.** `.card p {}` reaches it only through the
  `data-lp-text="p"` variant that `alsoTargetTextWrappers` adds.
- **White fallback.** Text with no color anywhere up the tree gets `#ffffff`. On a
  page with no body color and a light background, that text is invisible. Reason for
  white not recorded.
- **Resolved colors freeze.** A color using a non-`:root` variable is resolved at
  import; a later theme switch won't change it.
- **The `!important` on `IMPORTED_TEXT_CSS`** means a page rule aimed at the inner
  TipTap element (rather than the wrapper) can't change those properties.
- **Comment drift:** `IMPORTED_TEXT_ATTR`'s comment in `nodeAttributes.ts` says the
  value is "block" or "plain"; the code writes the source tag (`h2`, `p`, `ul`) or
  `"plain"`.
- **Edge spaces** are only kept next to spans or pieces; spaces between two other
  inline siblings in the source are not (not ported).
- **Old pages** keep the text shape they were imported with until re-imported.

## 7. Tests

| File | Covers |
|---|---|
| `src/tests/import/frontendEditorRules.test.ts` | lossless text, inline pieces, br at the end of a piece, lists as blocks, buttons holding tags, text tag selectors |
| `src/tests/import/pageClasses.test.ts` | wrapper stands for the source element, retargeted tag rules, lists and inline pieces, edge spaces |
| `src/tests/import/htmlToJsonTree.test.ts` | text color fallback, span text wrapping (no marks), div/span as blocks |
| `src/tests/import/fullPage.test.ts` | themed variables, page variables and text, tagged text (summary, dt, label) |
| `src/tests/import/domFidelity.test.ts` | exact text |
| `src/tests/import/unitConversion.test.ts` | font shorthand, math font sizes |
| `src/tests/tiptap/trailingNode.test.ts` | trailingNode stays off |

Run `npx vitest run`.

**Live check:** measure, don't eyeball. Render the original page with Playwright
`setContent` at the editor's 1304px root width and compare every text node's color,
size, weight and family with the editor at 100% zoom and with Preview (see the
`code-to-node` and `run-editor-and-screenshot` skills, and work_history 2026-09-29/30).
Also click into an imported heading in the editor and check no empty paragraph
appears.
