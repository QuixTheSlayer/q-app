# Code to Node 02: Structure conversion

How Import HTML turns the elements of a pasted page into the builder's node tree:
which element becomes the root, the sections, blocks, buttons, images, form fields
and so on. Text (what becomes a text node and how TipTap handles it) is covered in
`03-text-conversion.md`. CSS renaming and units (px to em) are in
`04-css-scoping-and-units.md`; scripts, the sandbox and security in
`05-scripts-sandbox-and-security.md`.

## 1. Purpose

A user pastes a full web page (or a fragment, or an AI chat reply) into the Import
HTML dialog. The importer must rebuild it as editable `CanvasNode`s (the builder's
JSON node tree, typed in `src/types/node.type.ts`) while the page's own `<style>`
and `<script>` keep styling and driving it. So structure must survive closely:
real tags, classes, ids and attributes, because the page CSS and JS select on them.
The aim the user chose is fidelity: the imported page should look and behave as the
original.

## 2. Where it lives

| File | Key functions / constants | Role |
|---|---|---|
| `src/utils/htmlToCanvasNodes.ts` | `htmlToJsonTree`, `DomExtractor`, `convertHtmlToJsonTree`, `buildRoot`, `expandWrapper`, `toSection`, `convertTreeElement`, `convertChildNodes`, `containerNode`, `convertInteractive`, `buttonNode`, `imageNode`, `convertSvg`, `convertVideo`, `convertIframe`, `convertImportedTable`, `convertFormField`, `rawElementNode`, `listItemNode` | The whole pipeline and every structure rule |
| `src/utils/nodeAttributes.ts` | `CONTAINER_TAGS`, `isContainerTag`, `VOID_TAGS`, `keptAttributeName`, `passthroughAttributes`, `REACT_NAMES`, `DROPPED_ATTRIBUTE`, `PAGE_ONLY_PROPS`, `retargetFormSelectors`, the `data-lp-*` names | Which tags and attributes survive, shared by the importer and the renderers |
| `src/types/node.type.ts` | `LayoutNode.tag`, `ButtonNode.tag`, `FormFieldNode`, `PageScript`, root `plainCss`/`plainJS`/`pageScripts`/`htmlAttributes` | The node shapes the importer produces |
| `src/utils/inlineSvg.ts` | `inlineSvgMarkup` | Turns an SVG data URI back into DOMPurify-cleaned `<svg>` markup |
| `src/utils/exportHTML.ts` | `readEmbeddedPageData` | Reads the node tree a builder export embeds |
| `src/utils/security/sanitizeCanvasTree.ts`, `sanitizeCss.ts` | `sanitizeCanvasTree`, `sanitizeCss` | Last step of every import |
| `src/components/EditorUI/ImportHtmlDialog.tsx` | calls `htmlToJsonTree` | The dialog (flag `enable_import_html`) |
| `src/pages/Editor.page.tsx` | `handleImportHtmlReplace` | Replaces the page with the result |
| `src/components/EditorUI/NodeMap/Container.tsx`, `Contents.tsx`, `MotionWrapper.tsx` | `as={node.tag}`, `FormField` | Editor renderers for tagged blocks and fields |
| `src/components/PreviewUI/Elements.tsx` | Root / Section / Block / FormField | Preview and published renderers |
| `src/components/PropertyPanelUI/PanelTypes/FormFieldPanel.tsx` | `FormFieldPanel` | Edits placeholder, name, options of a field |
| `src/configs/editor.config.ts` | the `enable_import_*` flags | Turns each rule on or off |

### Flags that change structure

All default `true`.

| Flag | What it changes here |
|---|---|
| `enable_import_html` | Shows the Import HTML dialog at all |
| `enable_import_code_fences` | `stripCodeFences` runs first, so an AI reply's ```html/```css/```js fences become the page |
| `enable_import_all_attributes` | Every safe attribute is kept, not only data-/aria-/a short list |
| `enable_import_raw_elements` | br, canvas, audio, dialog, template... become blocks with their real tag instead of being dropped; custom elements keep their tag |
| `enable_import_lists_as_blocks` | Every ul/ol/li is a block, never one TipTap list |
| `enable_import_lossless_text` | Affects buttons and links too (see section 3.8) |
| `enable_form_field_import` | input/select/textarea become `formField` nodes |
| `enable_import_page_scripts` | https `<script src>`, modules and typed scripts go to `root.pageScripts` |
| `enable_import_html_attributes` | `<html>` attributes go to `root.htmlAttributes` |

## 3. How it works

### 3.1 Pipeline entry: `htmlToJsonTree(source)`

In pipeline order:

1. **Code fences.** With `enable_import_code_fences`, `stripCodeFences` pulls the code
   out of ```` ``` ```` fences. Input that already starts with `<` is left alone.
2. **Export restore path first.** `readEmbeddedPageData` (in `exportHTML.ts`) looks
   for `<script type="application/json" id="judgify-page-data">`. A file exported
   by this builder carries its exact node tree there. If found, that tree is run
   through `sanitizeCanvasTree` and returned as is. No markup conversion happens.
3. **`DomExtractor(html)`** parses the source with `DOMParser` (an inert document:
   nothing in it loads or runs) and collects:
   - `css`: all `<style>` text plus `<link rel="stylesheet">` as `@import`, with
     every `@import` hoisted to the top (`extractCssFromDoc`);
   - `js`: inline classic scripts only (`extractJsFromDoc`);
   - `external`: stylesheets that won't load and `src` scripts that aren't kept;
   - `scripts`: `pageScriptsFromDoc` (flag `enable_import_page_scripts`);
   - `htmlAttributes`: `htmlAttributesFromDoc` (flag `enable_import_html_attributes`);
   - then it removes `NON_CONTENT_TAGS` (style, script, link, meta, title, base,
     noscript, and template unless raw elements are on) and returns `doc.body`.
4. **Font-size cascade.** `parseStyleRules(css)` plus `buildUnitContext` build one
   cascade, used for node styles and for the page CSS.
5. **`convertHtmlToJsonTree(body, css, skipped, units)`** builds the root node.
   It sets two module-level variables for the call (`unitContext`, `pageRules`) and
   clears them in a `finally`. The real work is `buildRoot`.
6. **Renaming and CSS post-processing.** `convertCssUnits`, then
   `scopePageVariables` (`--lp-` prefix), `scopePageClasses` and `scopePageIds`
   (`lp-` prefix) over the tree, CSS and JS; `alsoTargetTextWrappers`;
   `importedBaseCss` (browser defaults) and `IMPORTED_TEXT_CSS` are added around
   the page CSS. `convertCssUnits` is also where `form` type selectors become
   `[data-lp-form]` (`retargetFormSelectors`).
7. **Sanitize.** `sanitizeCanvasTree(root)` and `sanitizeCss(scopePageCss(css))`.
   The JS is returned unsanitized: it only ever runs in the sandbox frame (see the
   skill, "Rendering and security").

Result: `{ root, css, js, skipped, external }`. `ImportHtmlDialog` passes it to
`handleImportHtmlReplace` in `Editor.page.tsx`, which replaces the page, keeps the
current root id, and stores `css`/`js` as `root.plainCss`/`root.plainJS`.

### 3.2 Root selection: lone wrapper vs `<body>`

`buildRoot`:

- `topElements` = body's element children, minus `SKIP_TAGS`.
- If there is exactly one, no loose text in body, and it is a `div`, `main` or
  `article` (`ROOT_WRAPPER_TAGS`), that element is the root (**lone wrapper**).
  Its children become sections, and its class, id, attributes and inline style go
  on the root.
- Otherwise `<body>` is the root. Each top-level element becomes a section.
- Anything else in body next to a lone wrapper is kept as extra sections.

The root node always gets:
- `style.width: '81.5em'`, plus what a `body {}` rule sets for background, color,
  font, font-size, line-height, letter-spacing (`bodyStyle`, `BODY_PROPS`). The
  page CSS for `body` styles the editor's own `<body>`, not the canvas, so the root
  has to carry it.
- `data-lp-page` (`IMPORTED_PAGE_ATTR`). This marks an imported page:
  `isImportedPage` in `src/utils/pageScope.ts` checks it, and the tag defaults and
  `:where([data-lp-page])` scoping hang on it.
- `tag` when the lone wrapper is not a `div` (e.g. `main`).

### 3.3 Sections

`addSections` in `buildRoot` walks the root element's child nodes:

- Loose text and phrasing elements (`PHRASING_TAGS`) are collected into a run.
  `flushLoose` copies them into a holder `<div>` made in the pasted document
  (`body.ownerDocument`), converts it with `convertChildNodes`, and makes each
  result a section.
- Every other element goes through **`expandWrapper`** first. An element that is
  not a section tag (or is `<main>`), is not `a`/`button`, and has a
  header/section/footer/main child is a wrapper. If `isStyledByCss` says no style
  attribute and no class or id the CSS mentions, it is unwrapped (recursively) and
  its children become sections. A wrapper the CSS targets is kept whole, so its
  CSS still applies.
- Each converted element becomes a section through **`toSection`**: a block is
  turned into a section in place, keeping its tag; a block made from a `<div>`
  gets `tag: 'div'` so page rules like `section { padding }` don't reach it. Any
  other node (text, image) is wrapped in a new `div`-tagged section.

Only these top-level elements become sections. Every nested
section/header/article/div is a block, keeping its tag.

### 3.4 Containers: div, span and landmarks

`convertTreeElement` routes each element. `div` and `span` (`BLOCK_TAGS`) and
header/section/footer/main (`SECTION_TAGS`) never become text nodes: they skip the
prose branch and always reach `containerNode`. Their text becomes text-node
children (see doc 03). `span` is deliberately not in `PHRASING_TAGS`.

`containerNode(el, children, extraAttrs)` builds a `block`:
- `style`: the element's inline style, converted to em (`nodeStyle`). Class styles
  are not resolved into the node; the page CSS does that.
- `layout`: `detectLayout` reads `display`/`flex-direction` from the inline style
  (a hint for the property panel only).
- `attributes`: `sourceAttributes(el)`, plus `data-lp-form` for a `<form>`, plus
  `extraAttrs` (link attributes, `data-lp-text="p"`).
- `tag`: see 3.5.

### 3.5 Real tags: `node.tag`, `CONTAINER_TAGS`, `data-lp-tag`

A block keeps its source tag in `node.tag` when `isContainerTag(tag)` is true and
the tag is not `div`. `CONTAINER_TAGS` in `nodeAttributes.ts` is the allowlist:
landmarks, lists, dl/dt/dd, details/summary, fieldset/legend, label, blockquote,
pre, inline tags (i, b, strong, small, time, code...), `button`, the raw elements
(br, canvas, audio, video, img, template...), and h1-h6. With
`enable_import_raw_elements`, custom element names (`my-widget`) count too.

Left off on purpose (comment in `nodeAttributes.ts`):
- `p`: the browser moves a `<div>` out of a `<p>` when it re-reads the markup.
- `a`: becomes button / linked nodes.
- `form`: a submit would reload the editor.
These render as `<div>`.

Renderers use the tag: the editor's `MotionWrapper as={node.tag}` and production
Root/Section/Block. They also write `data-lp-tag`. The global rich-text `ul`/`ol`
rules in `src/index.css` skip `[data-lp-tag]`; without that they force bullets and
padding onto imported menus.

### 3.6 Attributes

`sourceAttributes(el)` returns `className`, `id` and every attribute
`keptAttributeName` accepts.

`keptAttributeName(name)` in `nodeAttributes.ts`:
1. `data-*` and `aria-*` keep their own name, unless they match `RESERVED_DATA`
   (the editor's own names: data-id, data-node-path, data-radix-*, data-lp-tag...).
2. Flag off (`enable_import_all_attributes`): only `PLAIN_ATTRIBUTES` (role, title,
   lang, dir, rel, tabindex, for, hidden).
3. Flag on: everything else is kept under its React name (`REACT_NAMES`:
   `tabindex` to `tabIndex`, `colspan` to `colSpan`, `playsinline` to
   `playsInline`...), except `DROPPED_ATTRIBUTE`: on* handlers, style/class/id (the
   node has its own fields), srcdoc, action/formaction, ping, background,
   srcset/sizes (would beat an image the user changes), contenteditable, autofocus,
   is, nonce, xmlns*.

`passthroughAttributes(attributes, where)` is what a renderer spreads on the
element:
- never `href` or `target` (renderers place links themselves, and editor links
  must not navigate);
- booleans (`BOOLEAN_PROPS`) are written non-empty, because React leaves out a
  boolean prop given `""`;
- with `where = 'editor'`, `PAGE_ONLY_PROPS` (hidden, inert, popover, disabled,
  draggable, autoPlay) are left out, so the content stays visible, still and
  clickable on the canvas. Preview and the published page apply them.

**Renderers spread `passthroughAttributes()` before their own props**, so the
editor's props always win: an imported `id`, `tabIndex`, `role` or data attribute
can't override `data-id`, `className`, event handlers or selection behaviour.

### 3.7 Empty elements and raw elements

- **Empty elements are kept** (`<span></span>` hamburger bars, empty divs), even
  with no attributes. The final `containerNode` call in `convertTreeElement`
  handles them. Imported pages skip the editor's blue empty-block tint
  (`isImportedPage` check in `Container.tsx`).
- **Raw elements** (`enable_import_raw_elements`): tags in `RAW_ELEMENT_TAGS`
  (br, wbr, canvas, audio, source, track, dialog, progress, meter, output, map,
  area, template) and img/picture/video with no source go to `rawElementNode`: a
  block with the real tag, its attributes and children. `VOID_TAGS` get no
  children (MotionWrapper and Block must not pass any). `<template>` converts its
  `.content` fragment. `hr` is always an empty block.
- Still dropped with the flag on: `RAW_SKIP_TAGS` (script, style, link, meta,
  title, base, head, param, noscript: React would build noscript's tracking
  `<img>` in the live editor) and `RAW_UNSUPPORTED_TAGS` (object, embed), which are
  reported.
- Flag off: `SKIP_TAGS` are dropped silently; `UNSUPPORTED_TAGS` (canvas, audio,
  dialog...) are dropped and reported.

### 3.8 Lists as blocks

With `enable_import_lists_as_blocks`, `ul`/`ol` fall through to `containerNode`
(tag ul/ol), and each `li` goes to `listItemNode`: a block with tag `li`. Its prose
becomes one text node marked `data-lp-inline`, so it stays on the marker's line;
non-prose content becomes child nodes. Flag off: a list whose items are all prose
and pass `tiptapSafeList` becomes one TipTap list text node (doc 03); a list of
links or cards becomes blocks.

### 3.9 Buttons and links: `convertInteractive`

For `a` and `button`:

| Content | Result |
|---|---|
| Plain text only (lossless on) / phrasing only or any `<button>` (lossless off) | `buttonNode`: `contentType: 'button'` |
| A lone `<img>` | linked image: `imageNode` with the link's href/target and its class |
| Anything else | linked block: `containerNode` with `linkAttributes` (a `<button>` keeps tag `button`; an `<a>` renders as div) |
| Nothing (lossless off) | `buttonNode` labelled "Button" |

`buttonNode`:
- `children` is a **plain label string** (not a TipTap doc): the text content with
  whitespace collapsed, else aria-label, title, value, or "Button". No wrapping
  `<span>`, so `.btn span {}` can't catch it.
- `tag: 'a' | 'button'`: the editor renders that tag (an `<a>` without href), so
  `.nav a {}` rules match. Imported buttons don't get the builder's
  `flex justify-center` classes and keep the page's font size.
- `linkAttributes` keeps href and target; a `javascript:` href becomes empty.
  `sanitizeCanvasTree` checks URLs again.

### 3.10 Media

| Source | Function | Node |
|---|---|---|
| `<img>` | `imageNode(imgSrc(el), el)` | `image`; `src` and `children` both hold the URL (editor reads `src`, production reads `children`). `imgSrc` falls back to data-src, then the first srcset entry |
| `<picture>` | its inner `<img>`; the picture's class moves to the image if the img has none | `image` |
| `<video>` | `convertVideo` (src on the element or a `<source>`) | `video` with autoPlay/loop/muted/controls; autoplay implies muted |
| `<iframe>` | `convertIframe`, by URL | `youtube`, `vimeo`, `googleMap`, else `html` |
| `<table>` | `convertImportedTable` | `table`, `uiType: 'minimalBorderless'` and empty head/body styles so the page CSS drives the look |

**width/height attribute rule.** img/video/iframe/svg/table call
`nodeStyle(el, true)`, which adds `sizeAttributeStyle`: a `width`/`height`
attribute becomes inline style only when no page rule that selects the element
sets that property (`pageCssSets`, any screen size). Like a browser,
`.card img { width: 100% }` beats `<img width="600">`. The attribute itself stays
on the node. Table cells don't carry `<td width>`: TipTap cells can only hold px
column widths.

### 3.11 Inline SVG

`convertSvg`:
1. Clones the `<svg>`, adds `xmlns` (needed for a data URI to render).
2. Rewrites `var()` in attributes with `svgColorValue`: `:root` variables stay
   live with the default as fallback (`var(--lp-ink, #2B1B2E)`), others are resolved.
3. Encodes it as `data:image/svg+xml` and makes an `image` node marked
   `data-lp-svg="inline"` (`INLINE_SVG_ATTR`), alt from aria-label.
4. Keeps only `SVG_NODE_ATTRIBUTE` attributes on the node (className, id, alt, role,
   title, tabIndex, data-*, aria-*). viewBox, fill and width stay in the markup.

The editor (`Contents.tsx`), Preview and the published renderer (`Elements.tsx`)
and the sandbox snapshot (`sandboxDocument.ts`) draw a `data-lp-svg` image as real
`<svg>` markup from `inlineSvgMarkup` in `src/utils/inlineSvg.ts`. That function
decodes the data URI and cleans it with DOMPurify's SVG profile (no scripts,
handlers, foreignObject or javascript: links). Real `<svg>` is needed so
`.brand svg {}` rules match and page JS can reach shapes by id (a dial, a ring).

### 3.12 Form fields and forms

With `enable_form_field_import`, `convertTreeElement` sends input/select/textarea
to `convertFormField` before the unsupported check:
- `<input type=submit|button|reset>` becomes a `buttonNode` with tag `button`.
- `type=hidden|image` is dropped.
- Others become `contentType: 'formField'` (`FormFieldNode`): `tag` is the element,
  `field` holds type, name, placeholder, value, checked, required, rows,
  autoComplete and `options` for a select.
- `FIELD_OWN_ATTRIBUTES` (type, name, value, checked...) are removed from
  `attributes`: as attributes, value/checked would lock the element in React.

The editor's `FormField` in `Contents.tsx` renders the real element but inert:
read-only, a select won't open (mousedown prevented), a checkbox won't toggle.
Preview and the published page render working fields. `FormFieldPanel` edits
placeholder, name and options.

`<form>` is a block (renders as div) marked `data-lp-form`. Page CSS `form`
selectors become `[data-lp-form]`. With `enable_sandbox_forms` the sandbox turns
it back into a real `<form>` (skill, "Conversion rules").

### 3.13 What is dropped or reported

- `skipped` (shown in the dialog's toast): tags in the unsupported set for the
  current flags. With the default flags only `object` and `embed`.
- `external`: stylesheets not on the allowlist and `<script src>` files not kept;
  the dialog tells the user to paste them into Custom Code.
- Silently gone: `<head>` content (meta, title; Judgify owns SEO), noscript, on*
  handlers, `DROPPED_ATTRIBUTE` names, iframes and videos with no source
  (videos are kept as raw blocks when raw elements are on).

### 3.14 Snippet holders in the inert document

Whenever the converter needs a scratch element (`innerHtmlOf`, `flushLoose`,
`rawElementNode` for template), it creates it with the pasted document's
`ownerDocument`, never the live `document`. In the live page an `<img>` inside the
holder would start loading (and a crafted page could make requests).

## 4. Why this approach

**Raw page CSS, structure as nodes.**
- Chosen: nodes keep class/id/tag/attributes and the page's own CSS is stored as
  `plainCss`.
- Older alternative: `htmlToCanvasSections` / `htmlToCanvasNode` (top of the same
  file) resolve CSS into inline `node.style` with a simplified cascade (last
  compound only, simple specificity). Replaced on 2026-09-25: the user wanted a
  converter built on their raw-CSS approach. `htmlToCanvasNode` is still used by
  `ActionMenu` (import into a node).
- Tried on 2026-09-25, reverted: resolving each node's class rules into
  `node.style`/`responsiveStyle`, turning `:hover`/`:active` into Animation effects,
  a migration for saved pages, and a version dropping `plainCss` with all rules
  folded into node styles. The user asked to revert to the previous commit. Reason
  beyond that: not recorded.

**Export restore before markup conversion.**
- Tried: rebuilding a page from the builder's own exported markup. It was lossy
  (extra nesting from wrappers, renderer divs becoming blocks, `data-id` keyed
  CSS regenerated, `class="undefined"`). Fixed on 2026-09-25 by embedding the tree
  as JSON and restoring it first. The skill says to keep that path rather than make
  markup round-trip.

**Root selection.**
- The 2026-09-25 version made the first element in `<body>` the root (a user
  decision then). The code now uses it only when it is a lone div/main/article;
  otherwise `<body>` is the root. When and why this changed: not recorded in the
  logs (the skill documents the current rule).

**Sections only at the top.**
- Confirmed on 2026-09-29: only body's direct children (main unwrapped) become
  sections, everything nested is a block. Unwrapping is limited to unstyled
  wrappers so a wrapper's CSS isn't lost.

**div/span always containers (2026-09-25).**
- The user asked for it. Side effect flagged then: `<h1>Hello <span>World</span></h1>`
  splits into block + text. Not tried: restricting it to spans inside divs
  (offered, not taken). The h1 case was fixed on 2026-09-29 by keeping the h1 tag
  on the block.

**Real tags (2026-09-29).**
- Ported from the user's app `frontend-editor`. Page CSS like `.nav a`, `ul li`,
  `details > summary` needs the real tags; a `<div>` for everything broke it.

**Frontend-editor parity port (2026-10-01).**
- Each rule behind its own flag: empty elements kept, all attributes, raw elements,
  lossless text, page scripts, `<html>` attributes. Before it, empty unattributed
  elements and canvas/audio/dialog... were dropped, and only a short attribute list
  was kept. Where parity rules conflict with older rules, parity wins (skill).
- Not ported: whitespace between two inline siblings (the importer can't tell flex
  from flow), `<head>` meta/title, non-allowlisted stylesheets.

**Form fields (2026-09-30).**
- Before: input/select/textarea dropped and reported. Now real elements so page
  CSS (`.field input`) matches; inert in the editor so clicks select the node.

**`<form>` as a marked div.**
- A real `<form>` would reload the editor on submit. Not tried in the editor: a
  real form with a submit guard. The sandbox does turn it back into a form.

**Inline SVG as a data-URI image plus `data-lp-svg`.**
- Keeps it an ordinary image node in the tree. On 2026-09-29 the page script died
  at an `#ticks` element inside an SVG that had become an `<img>`, so the snapshot,
  and since 2026-09-30 the editor and Preview too, draw the cleaned live `<svg>`.

**Editor props win over passthrough.**
- Recorded rule (2026-09-29): renderers spread `passthroughAttributes()` first.
  An imported attribute must never break selection, drag or animations.

## 5. How to modify or extend

**Support a new container tag X (render as itself):**
1. Add `'x'` to `CONTAINER_TAGS` in `src/utils/nodeAttributes.ts`. If it is void,
   add it to `VOID_TAGS`.
2. If it should never be a text node, check `convertTreeElement`: tags not in
   `BLOCK_TAGS`/`SECTION_TAGS` with prose children become text (or a tagged block
   under lossless text).
3. Check the renderers accept it: `MotionWrapper` (`as`), `Container.tsx`, and
   `Elements.tsx` Root/Section/Block. `ContainerTag` in `node.type.ts` follows the
   list automatically.
4. Add a test to `src/tests/import/domFidelity.test.ts` or
   `frontendEditorRules.test.ts`.

**Map a new element to its own node type (like iframe):**
1. Add a `case` in the `switch` of `convertTreeElement` and a `convertX` function.
2. Add the node type to `node.type.ts` and renderers for editor, Preview and
   published.
3. Name any URL field `...href`, `...ImageUrl`, `src`, `url` or `link` so
   `sanitizeCanvasTree` checks it (it matches by name).
4. If page JS must reach into it, add a snapshot step in
   `src/utils/security/sandboxDocument.ts`.
5. Put it behind a new `enable_import_<x>` flag with a comment
   (`feature-workflow` skill).

**Keep a new attribute:** with `enable_import_all_attributes` it is already kept.
If its React name differs, add it to `REACT_NAMES`; if it is boolean, to
`BOOLEAN_PROPS`; if it should only apply on the page, to `PAGE_ONLY_PROPS`. To
forbid one, extend `DROPPED_ATTRIBUTE` and add a test in `security.test.ts`.

**Stop dropping a tag:** with raw elements on, remove it from `RAW_SKIP_TAGS` or
`RAW_UNSUPPORTED_TAGS` and add it to `RAW_ELEMENT_TAGS` and `CONTAINER_TAGS`.
Think about what it loads in the live editor first (that is why noscript and
object/embed are dropped).

**Change root or section rules:** `buildRoot`, `ROOT_WRAPPER_TAGS`,
`expandWrapper`, `toSection`. Tests: `htmlToJsonTree.test.ts` ("root element")
and `fullPage.test.ts` ("full page structure").

Anything that changes the node shape must also work after export and re-import
(`exportHTML.ts`), and for pages already saved (they keep old data until
re-imported).

## 6. Gotchas and known limits

- **Module-level state.** `unitContext` and `pageRules` are module variables set
  for one `convertHtmlToJsonTree` call. Helpers like `sizeAttributeStyle` read them.
  Calling the tree helpers outside that call gets no units and no page rules.
- **`SKIP_TAGS` in root selection.** The lone-wrapper count always filters with the
  old `SKIP_TAGS` set, whatever the raw-elements flag. A top-level `<template>` or
  `<br>` doesn't stop a wrapper from being the root, but still becomes a section.
- **`isStyledByCss` is a text search.** It looks for `.class` or `#id` anywhere in
  the CSS, so a class used only inside `@media` or a comment still counts as styled.
- **A `<p>` holding blocks becomes a div** (`data-lp-text="p"` under lossless text),
  so `.card p {}` only reaches it through `alsoTargetTextWrappers`.
- **Linked blocks from `<a>` render as div.** `a` is not a container tag; the href
  lives in attributes and the renderer places the link.
- **`hidden` content shows in the editor** (page-only prop). That is on purpose so
  it can be edited.
- **Raw elements in the editor are live elements.** A `<dialog>` or `<audio>` is a
  real element on the canvas; only the page-only props are held back.
- **Pages imported before a rule existed** keep their old shape until re-imported.
- **Library scripts** that look up classes by their original names (Swiper, Font
  Awesome) won't find them after the `lp-` prefix (2026-10-01 log).
- Pasted `data-lp-*` attributes other than `data-lp-tag` are not reserved, so a
  source attribute such as `data-lp-page` would be kept.

## 7. Tests

| File | Covers |
|---|---|
| `src/tests/import/htmlToJsonTree.test.ts` | pipeline, root element, export round trip, div/span as blocks, empty elements |
| `src/tests/import/domFidelity.test.ts` | real tags, kept attributes |
| `src/tests/import/frontendEditorRules.test.ts` | code fences, all attributes, raw elements, page scripts, `<html>` attributes, buttons holding tags |
| `src/tests/import/fullPage.test.ts` | full themed page structure, tags a parent depends on, hidden content, form fields |
| `src/tests/import/promptRules.test.ts` | image size attributes, forms in the sandbox, event widgets |
| `src/tests/import/htmlToCanvasNode.test.ts` | the older import-into-node path |
| `src/tests/security/security.test.ts` | sanitizing imported trees and attributes |

Run `npx vitest run`; typecheck with `npx tsc --noEmit -p tsconfig.app.json` and
compare with the current baseline (about 226 errors).

**Live check:** use the `run-editor-and-screenshot` skill. Feed a test page from
`codeToNodeTestCodeFiles/` through the dialog (or swap a page's data with
Playwright `route`), then compare the original rendered at 1304px with the editor
at 100% zoom and Preview: section heights and node counts. To see the raw tree,
write a throwaway `src/tests/import/tmp-*.test.ts` that dumps the JSON, then
delete it.

## Notes: code vs skill and logs

- The header comment at the top of `htmlToCanvasNodes.ts` describes the old
  inline-style converter ("No CSS or JS is ever stored", text flattened to
  `textContent`). It does not describe `htmlToJsonTree`.
- The skill's element list says input/select/textarea/canvas/audio are "dropped and
  reported". With the current flags, form fields become `formField` nodes, canvas
  and audio are raw blocks, and only object/embed are reported.
- The skill says SVG image nodes keep only class/id/data/aria. `SVG_NODE_ATTRIBUTE`
  also keeps alt, role, title and tabIndex.
- The 2026-09-25 log says the old functions stay because ActionMenu uses them. Only
  `htmlToCanvasNode` has a caller; `htmlToCanvasSections` has none outside the file.
