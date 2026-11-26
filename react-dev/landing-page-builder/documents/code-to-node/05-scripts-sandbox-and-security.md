# 05 - Scripts, sandbox and security

## 1. Purpose

An imported page can bring its own JavaScript, `<script src>` libraries and `<html>` attributes.
That code must run so the page works (tabs, countdowns, dark-mode toggles), but it must never
run on Judgify's origin. There it could read the logged-in user's cookies and storage and call
Judgify's APIs as that user (XSS, cross-site scripting). This part keeps the page code, runs it
inside a sandboxed iframe in Preview and on the published page, and cleans every URL and every
stylesheet that reaches the live DOM.

## 2. Where it lives

| File | Key functions / components | Role |
|---|---|---|
| `src/utils/htmlToCanvasNodes.ts` | `DomExtractor`, `extractJsFromDoc`, `pageScriptsFromDoc`, `htmlAttributesFromDoc`, `externalFilesFromDoc`, `htmlToJsonTree`, `buildImportedScript` | Splits the pasted page into CSS, classic JS (`plainJS`), kept scripts (`pageScripts`), `<html>` attributes and files it can't include (`external`). `buildImportedScript` wraps JS for injection into a live page. |
| `src/utils/jquery.utils.ts` | `usesJquery`, `JQUERY_SRC`, `JQUERY_INTEGRITY` | Detects `$(`/`jQuery.` use; jQuery 3.7.1 URL plus its SRI hash (Subresource Integrity: the browser refuses the file if its hash differs). |
| `src/utils/pageIds.ts` | `ID_FALLBACK_SCRIPT` | Runs before page JS: `getElementById('x')` falls back to `lp-x` (ids get an `lp-` prefix on import). |
| `src/utils/security/sandboxDocument.ts` | `needsSandbox`, `buildSandboxDocument`, `snapshot`, `collectStyles`, `restoreInlineSvgs`, `restoreForms`, `surroundingColors`, `pageScriptTag`, `htmlTagAttributes`, `SANDBOX_PERMISSIONS`, `IN_PAGE_LINKS`, `NO_SUBMIT_NAVIGATION` | Builds the iframe's `srcdoc`: a snapshot of the rendered page plus its scripts. |
| `src/components/PreviewUI/SandboxFrame.tsx` | `SandboxFrame` | The `<iframe srcDoc sandbox={SANDBOX_PERMISSIONS} referrerPolicy="no-referrer">`. |
| `src/hooks/useSandboxSnapshot.ts` | `useSandboxSnapshot` | Waits until the rendered page stops changing, then calls the build function once. |
| `src/utils/inlineSvg.ts` | `inlineSvgMarkup` | Decodes an SVG data URI and cleans it with DOMPurify's SVG profile. |
| `src/pages/Preview.page.tsx`, `src/pages/RenderPage.page.tsx` | sandbox wiring | Render the page hidden, snapshot it, show `SandboxFrame`. |
| `src/utils/security/sanitizeCanvasTree.ts` | `sanitizeCanvasTree`, `sanitizeValue`, `sanitizeDoc`, `sanitizeAttributes`, `sanitizePageScripts`, `sanitizeRootCss` | Cleans a whole page tree (URLs, TipTap link marks, attributes, `plainCss`, `pageScripts`). |
| `src/utils/security/safeUrl.ts` | `safeHref`, `safeMediaUrl`, `safeFrameUrl`, `stripInvisible` | URL scheme allowlists. |
| `src/utils/security/sanitizeCss.ts` | `sanitizeCss`, `isAllowedStylesheetUrl`, `ALLOWED_IMPORT_HOSTS` | Cleans stylesheet text before it goes into a `<style>`. |
| `src/store/query.ts` | `getPageData`, `getRenderPageData` (`transformResponse`) | Runs `sanitizeCanvasTree` on every page load. |
| `src/utils/exportHTML.ts` | `buildExportHtml` | Writes the same scripts into an exported HTML file. See [07](07-custom-code-export-and-roundtrip.md). |
| `src/configs/editor.config.ts` | flags below | Feature switches. |

Flags:

| Flag | Gates |
|---|---|
| `enable_import_page_scripts` | https `<script src>`, modules and typed blocks go to `root.pageScripts`. Off: they are dropped (src ones listed in `external`). |
| `enable_import_html_attributes` | `<html>` attributes go to `root.htmlAttributes`. |
| `enable_sandbox_forms` | The snapshot turns `[data-lp-form]` blocks back into `<form>`. |
| `enable_custom_code` | The Custom Code dialog that edits `plainCss`/`plainJS`. |
| `enable_import_html` | The Import HTML dialog. |

## 3. How it works

### 3.1 Extracting the page's code (import time)

`htmlToJsonTree` calls `DomExtractor(html)`, which parses the paste into an inert `Document`
(`DOMParser`, so nothing runs or loads) and returns:

- **`js`** from `extractJsFromDoc`: every inline classic script (no `src`; no `type`, or
  `text/javascript`/`application/javascript`), in page order, joined with `\n;\n`. This becomes
  `root.plainJS`.
- **`scripts`** from `pageScriptsFromDoc` (only with `enable_import_page_scripts`), in page order:
  - `{ src, type? }` for a `src` that is absolute https or protocol-relative (`LOADABLE_SCRIPT`);
  - `{ code, type }` for inline code with any other type: `module`, `application/ld+json`
    (JSON-LD, structured data for search engines), templates.
  - A local `src` (`js/app.js`) is not kept.
  These become `root.pageScripts`.
- **`external`** from `externalFilesFromDoc`: stylesheet links outside the allowlist and `src`
  scripts that aren't kept. The Import dialog shows them in a toast
  (`importHtmlDialog.externalFiles`) so the user can paste them into Custom Code.
- **`htmlAttributes`** from `htmlAttributesFromDoc` (only with `enable_import_html_attributes`):
  every `<html>` attribute with a plain name, except `on*`, `style` and `xmlns*`.

Then `htmlToJsonTree`:

1. Renames page variables, classes and ids in `plainJS` string literals
   (`scopePageVariables`, `scopePageClasses`, `scopePageIds`). Module scripts get the same
   renaming; src and JSON-LD scripts don't.
2. Puts the `<html>` class through the same class renaming (it rides along as a fake holder node),
   so `html.dark` in the CSS and `class="dark"` stay in step (`lp-dark`).
3. Copies `lang`/`dir` onto the root node's attributes too, so the editor and Preview apply them.
4. Runs `sanitizeCanvasTree` on the root and `sanitizeCss` on the page CSS.

`plainJS` itself is not sanitized. It is stored as written and only ever runs in the sandbox.

### 3.2 Deciding whether a page is sandboxed

`needsSandbox(content)` in `sandboxDocument.ts` returns true when the page has any of:

- non-empty `plainJS`;
- at least one `pageScripts` entry;
- an `htmlAttributes` key other than `lang`/`dir` (for example `class="dark"`, `data-theme`).
  Only the frame has an `<html>` of its own to put them on.

Preview and RenderPage call it. A page without any of these renders directly, as before.

### 3.3 Rendering through the sandbox (Preview and published page)

1. The page still renders normally with React, inside the element `useSandboxSnapshot` watches
   (`elementRef` in Preview, `mainRef` in RenderPage). It is `visibility: hidden` until the
   snapshot is ready, then `display: none`. Preview keeps it mounted because Export reads it.
2. `useSandboxSnapshot(ref, enabled, build, key)` watches the element with a `MutationObserver`.
   When nothing changes for `QUIET_MS` (400 ms), or after `MAX_WAIT_MS` (4 s) at the latest, it
   calls `build(element)` once. A new `key` (new page data) takes a fresh snapshot.
3. `build` is `buildSandboxDocument(element, { title, js, classJs, pageScripts, htmlAttributes })`.
4. The result goes to `SandboxFrame` as `srcDoc`. In RenderPage the frame is `position: fixed;
   inset: 0` and fills the tab.
5. Class JS (`useClassJs`, the builder's own class interactions) is not injected into the parent
   page while the page is sandboxed; it runs inside the frame instead.

### 3.4 What `buildSandboxDocument` writes

```
<!DOCTYPE html>
<html {htmlTagAttributes}>
<head> meta, <title>, collectStyles(), <style>{surroundingColors}</style> </head>
<body>
  {snapshot(element)}
  <script> IN_PAGE_LINKS + NO_SUBMIT_NAVIGATION + ID_FALLBACK_SCRIPT </script>
  jQuery (if usesJquery(js) and no page script src contains "jquery")
  ...pageScripts (page order, via pageScriptTag)
  classJs
  plainJS
</body></html>
```

Every page script is written with `safeScript` (`</script` becomes `<\/script`), so code can't
close its tag early. Titles and attribute values go through `escapeHtml`.

Scripts sit at the end of `<body>`, so the page DOM exists when they run, and the real
`DOMContentLoaded` and `load` events still fire after them. The sandbox does not need
`buildImportedScript` (see 3.6).

**`htmlTagAttributes`**: starts from the app's own `<html lang>` and `class`, then adds the
page's attributes (checked again: plain names only, no `on*`/`style`/`xmlns*`). `class` values
are joined, others replace.

**`pageScriptTag`**: a `src` script only if the src is absolute https or protocol-relative
(checked again here); a `type` only if it matches `^[\w/+.-]+$`; inline code otherwise.

### 3.5 The snapshot steps, and the bug each one fixed

All in `snapshot(element)` and its helpers in `sandboxDocument.ts`. The clone is taken with
`cloneNode(true)`, then:

| Step | Code | Bug it fixed |
|---|---|---|
| Copy live `muted` onto `<video>`/`<audio>` | `snapshot` | React sets `muted` only as a DOM property, never as an attribute. A cloned background video played with sound. |
| Copy form fields' live state (`value`, `checked`, `selected`, textarea text) | `snapshot` | React sets these as properties only, so the copy lost them (2026-09-30, with `formField` nodes). |
| Remove `<script>` and `iframe[srcdoc]` from the clone | `snapshot` | Page scripts are added once, at the end, in a known order; nothing from the rendered DOM runs on its own. |
| Turn `img[data-lp-svg]` back into `<svg>` | `restoreInlineSvgs` + `inlineSvgMarkup` | On 2026-09-29 the page script died at `#ticks`, an id inside an SVG that import had turned into an image. The markup is cleaned with DOMPurify (`USE_PROFILES: { svg, svgFilters }`: no scripts, handlers, foreignObject or `javascript:` links). The image's class/style/data/aria attributes move onto the `<svg>`. |
| `[data-lp-form]` block becomes a `<form>` (with `enable_sandbox_forms`) | `restoreForms` | Imported forms render as blocks (a real form would reload the editor). In the frame, submit buttons, `required` checks and the page's submit handler need a real `<form>` (2026-10-01). It keeps `data-lp-form`, which the page's `form` CSS was rewritten to. No `action` is ever imported. |
| Remove `height`, `max-height`, `overflow`, `overflow-y` from the clone root | `snapshot` | RenderPage's `<main>` is a 100vh scroll box. Inside the frame the page must scroll the frame's window, so window scroll listeners, `scrollY` and anchors work (2026-09-29). |
| Set the clone root's `font-size` and `font-family` from the live element (if the root has none) | `snapshot` | Judgify's template sets `html { font-size: 13px }`, which shrank every em. Never `line-height`: its computed value is fixed px and would stop `line-height: 1.5` scaling. |
| Absolutize `<a href>` and set `target="_top"` when no target | `snapshot` | `srcdoc` has no base URL, so relative links would break. Outbound links open in the real tab, not the frame. `#` links are left alone. |
| Absolutize `img`/`video`/`source`/`iframe` `src` | `snapshot` | Same: relative media would not load. |
| Copy only the builder's stylesheets | `collectStyles`, `isBuilderStylesheet`, `BUILDER_STYLE` | Copying all the host site's CSS (Bootstrap/Metronic) restyled `.container`, `h1`, `a` and shrank em (2026-09-30). Kept: `<link>` under `/landing-page-builder/`, Google Fonts links, and the builder's tagged `<style>`s (`css-class`, `css-animation`, `css-responsive`, `data-tiptap-style`, Vite's dev CSS). The page CSS is inside `style[css-class]`. |
| Frame CSS: background/color from the surroundings, and unlocked scrolling | `surroundingColors` | Without the background the frame showed the editor's dark body. The copied app CSS sets `body { overflow: hidden }`; the frame CSS forces `html { overflow-y: auto }` and `body { overflow: visible }`. |
| In-page `#` links become `window.scrollTo` | `IN_PAGE_LINKS` | A srcdoc frame resolves `href="#faq"` against the parent URL, so a click loaded the whole app into the frame (2026-09-29). It honours `scroll-padding-top` and skips clicks the page already handled (`defaultPrevented`). `scrollIntoView` was not used because it would scroll the parent page too. |
| Cancel form submit navigation | `NO_SUBMIT_NAVIGATION` | A submit the page didn't cancel would load `about:srcdoc` into the frame. The listener is on `document`, so it runs after the form's own listeners. |
| `getElementById` fallback | `ID_FALLBACK_SCRIPT` | Ids built at runtime (`id + '-err'`) can't be renamed at import, so lookups fall back to `lp-` ids. |

### 3.6 `buildImportedScript` (live-page wrapper)

`buildImportedScript(js)` in `htmlToCanvasNodes.ts` wraps code for injection into a page that
has already loaded:

- its own function scope, so injecting it a second time doesn't throw "already declared";
- `document.addEventListener`/`window.addEventListener` are shimmed while the code runs, so
  `DOMContentLoaded` and `load` handlers are called right away (`setTimeout 0`): those events
  are long past. The originals are restored in `finally`;
- `ID_FALLBACK_SCRIPT` first;
- errors are caught and logged as `[imported script]`;
- if the code uses jQuery and `window.jQuery` is missing, it loads `JQUERY_SRC` with its SRI hash
  once (`script[data-imported-jquery]`) and runs after it loads.

Where it is used today: only `handleCustomCodeSave` in `src/pages/Editor.page.tsx`. When the user
saves the Custom Code dialog, the JS is appended to the editor page as
`<script data-custom-js>`, and removed when the editor unmounts. It does not run on a normal
page load or after Import HTML. See the note in section 6.

### 3.7 jQuery

`usesJquery(js)` matches `$(`, `$.`, `jQuery(`, `jQuery.` when the character before is not a
word character, `$` or `.` (so `obj.$el`, `my$var` and `${x}` don't count). The sandbox and
the export add `JQUERY_SRC` before the page scripts, unless a page script's `src` contains
"jquery" (the page brings its own copy).

### 3.8 Sanitizing the tree: `sanitizeCanvasTree`

Runs on:
- every page load: `getPageData` (editor) and `getRenderPageData` (published page) in
  `src/store/query.ts`, and Preview's local page data in `Preview.page.tsx`;
- every import: the end of `htmlToJsonTree`, and the embedded-tree path (an exported file can
  carry any node data).

It walks every key of the tree (`sanitizeValue`) and returns a copy (input not mutated):

| Key | Treatment |
|---|---|
| matches `/href$\|^link$/i` (`href`, `ctaHref`, `links[].href`, social `link`) | `safeHref` |
| matches `/^(src\|poster)$\|imageurl$/i` (`src`, `poster`, `imageUrl`, `logoImageUrl`) | `safeMediaUrl` |
| `url` | `safeFrameUrl` on `youtube`/`vimeo`/`googleMap`/`html` nodes, else `safeMediaUrl` |
| `children` string on `image`/`video` nodes | `safeMediaUrl` |
| other `children` string starting with `{` | parsed as a TipTap doc: link marks `safeHref`, any `attrs.src` `safeMediaUrl` (`sanitizeDoc`) |
| `children` object with `type: 'doc'` (tables) | `sanitizeDoc` |
| `attributes`, `htmlAttributes` | drop names matching `/^on\|^(srcdoc\|dangerouslysetinnerhtml\|formaction\|action)$/i`, then recurse |
| `plainCss` | `sanitizeCss` |
| `pageScripts` | `sanitizePageScripts`: keep https/protocol-relative `src`, or string `code`; keep `type` only if plain |
| `css` on the root | `sanitizeRootCss`: keep only object rules (fixes the 2026-10-01 action-menu crash data) |
| `plainJS` | left alone (sandbox only) |

**Naming convention:** the sanitizer matches by field name. A URL field named anything else is
not checked.

### 3.9 URL allowlists: `safeUrl.ts`

`schemeOf` reads the scheme after `stripInvisible` removes control, whitespace and zero-width
characters (browsers ignore them, so `java\tscript:` would still run). No scheme means a
relative URL, `#anchor` or `{{placeholder}}`, which always passes.

| Function | Allowed schemes | Otherwise |
|---|---|---|
| `safeHref` | http, https, mailto, tel, sms | `''` |
| `safeMediaUrl` | http, https, blob; `data:` only for image (incl. svg+xml), video, audio types | `''` |
| `safeFrameUrl` | http, https | `''` |

`data:text/html` is never allowed: it would load as a document and run script.

### 3.10 CSS: `sanitizeCss.ts`

Runs on every CSS string that reaches a `<style>`: `plainCss` (import, Custom Code save in
`Editor.page.tsx`, and every load through `sanitizeCanvasTree`) and the output of
`useClassCss`, `useResponsiveCss` and `useAnimationCss`. Steps, in order:

1. Remove `/* comments */`, so they can't split a keyword.
2. Statement at-rules (`@x ...;`): an `@import` survives only if `isAllowedImport` passes, i.e.
   https and host in `ALLOWED_IMPORT_HOSTS` (`fonts.googleapis.com`). Quoted parts are skipped
   whole, because Google Fonts URLs contain `;` (`wght@400;700`). Other statements pass.
3. Any escaped `@import` that slipped past (`@\69mport url(x) {`) is removed.
4. `url(...)`: allowed if relative, https, or `data:` image/font. Otherwise `url("")`.
   `image-set()`, `-webkit-image-set()` and `image()` get the same check on every source, or
   become `none`.
5. Declarations containing `expression(`, `-moz-binding`, `behavior:`, `javascript:` or
   `vbscript:` are dropped.

CSS escapes (`\69`, `\i`) are decoded (`decodeEscapes`) before every check, so `u\72l(` and
`ex\70ression(` are caught.

`isAllowedStylesheetUrl` is also used at import: a `<link rel="stylesheet">` outside the
allowlist is reported in `external` (and its `@import` is removed by step 2).

### 3.11 What the backend must still do

The front end can't protect against a request sent straight to the API. Still the backend's job
(not done in this app):

- Server-side validation of `page_content` on save.
- A Content Security Policy (CSP) header on the published page (the frame has its own CSP since 2026-10-07; the page around it does not).

`sanitizeCanvasTree` on load covers pages saved by calling the API directly, but only in this
front end.

### 3.12 Limits on what the frame can do (2026-10-07, uncommitted)

Page JS can't be filtered reliably as text (`stripJsSideEffects` only covers Import HTML and misses obfuscated code), so the frame itself enforces the limits. `src/utils/security/sandboxGuard.ts` holds them:

- `SANDBOX_PERMISSIONS` has no `allow-modals`, so `alert`, `confirm` and `prompt` do nothing, whoever wrote the code.
- `SANDBOX_CSP` goes in a `<meta http-equiv="Content-Security-Policy">` first in the `srcdoc`: `connect-src 'none'` (no fetch, XHR, WebSocket or beacon), `form-action 'none'`, `base-uri 'none'`, and no `eval` or `new Function`. Images, fonts, styles, media, frames and scripts may still come from https. The builder's own origin is added to style, font, image and media sources (buildSandboxCsp(origin)), because the frame copies the builder's stylesheet, which is plain http on a local site; without it that stylesheet was blocked.
- `SANDBOX_GUARD_SCRIPT` runs before every other script: `setInterval` is held to 50 ms or more, more than 200 live timers or 20000 DOM nodes "trips" the guard (timers cleared, message to the parent), and a heartbeat is posted every second.
- `SandboxFrame` listens for those messages (it checks `e.source`). A trip, or 6 s without a beat while the tab is visible, replaces the frame with a notice.

Checked in Chromium with the real documents: alert and confirm gave no dialog, `fetch` and `eval` were blocked, 500 intervals tripped the guard, `setInterval(f, 0)` ran about 20 times a second, and normal timers still worked.

`while (true) {}` is **not** stopped. A `srcdoc` frame shares the parent's process, so the whole tab freezes and nothing, including the heartbeat check, can run. Fixing it needs the page served from its own host (a cookieless sub-domain) so the browser isolates it.

## 4. Why this approach

### plainJS never runs on Judgify's origin

**Chosen:** page JS runs only in an iframe whose `sandbox` lacks `allow-same-origin`, so it gets
an opaque origin. Page scripts can't read Judgify's cookies or storage or call its APIs as the
visitor. The published page is seen by logged-in Judgify users, so a script on Judgify's origin
would be stored XSS against them. Recorded in the `feature-workflow` skill with commit
`4e5d0abe4` (2026-09-28); there is no work log for that day.

`SANDBOX_PERMISSIONS` = `allow-scripts allow-forms allow-modals allow-popups
allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation`. The frame also has
`referrerPolicy="no-referrer"`.

Alternatives:
- **Frameless Preview.** Tried on 2026-09-29 (built on request: Preview ran the whole script with
  no frame). The user restored the framed Preview and reported that the frame couldn't scroll
  and some JS misbehaved. Those were fixed in the frame instead (scroll unlock, in-page links,
  inline SVGs).
- **Adding `allow-same-origin`.** Not tried, and never to be done. With `allow-scripts` it lets
  the frame's script remove its own sandbox and reach the parent, which undoes the whole point.
- **Running page JS in the editor.** Not done for imported pages: the canvas is the logged-in
  editor on Judgify's origin, so the same XSS risk applies. Imported content must therefore be
  visible without JS (see doc 06). The exception is Custom Code save (sections 3.6 and 6).

### Snapshot instead of rendering React inside the frame

**Chosen:** React renders the page in the parent; the frame gets a static copy of that DOM plus
the page JS. Reason not recorded. Not tried: loading the app bundle inside the frame. The cost
is in section 6 (React widgets are static).

### Copy builder stylesheets only

**Chosen** on 2026-09-30: the published page never sees Judgify's Bootstrap/Metronic, so the
frame shouldn't either. Copying them was the earlier behaviour and caused the 13px em shrink.

### Base font size, not line-height

**Chosen:** copy only font-size and font-family. The reason is in the code comment in `snapshot`:
computed line-height is fixed px and would stop `line-height: 1.5` scaling. Whether copying
line-height was tried first is not recorded.

### URL check by field name

**Chosen:** match names (`...href`, `...ImageUrl`, `src`, `url`, `link`, `poster`) so every
template field is covered without a per-type list. Not tried: a schema per content type (more
exact, but every new template would need an entry, and a missed one would be unchecked).

### Sanitize on every load, not only on save

**Chosen:** pages saved before these checks existed, or saved through the API, are cleaned too.
Cost: one tree walk per load.

### Stylesheet allowlist: Google Fonts only

**Chosen:** other hosts' stylesheets would style the builder UI itself, and an `@import` from
any host is an outbound request. Fonts are harmless and pages rely on them. Not ported from
frontend-editor on 2026-10-01: non-allowlisted stylesheet links.

## 5. How to modify or extend

### Recipe: add a new URL field so it gets sanitized

1. Name the field so `sanitizeValue` catches it:
   - a link: ends in `href` (`secondaryHref`), or is exactly `link`;
   - an image/video: `src`, `poster`, or ends in `ImageUrl` (`bannerImageUrl`);
   - an iframe: `url` on a node whose type is in `FRAME_NODES`.
2. If the name can't follow this (for example `videoSource`), add it to `HREF_KEY`/`MEDIA_KEY` in
   `sanitizeCanvasTree.ts`, or add a new frame node type to `FRAME_NODES`.
3. Add a case to the `blanks unsafe URLs in every kind of field` test in
   `src/tests/security/security.test.ts` with a `javascript:` value.
4. Renderers: still put the value in `href`/`src` only, never into `innerHTML`.

### Recipe: add a snapshot step

1. Add it to `snapshot(element)` in `sandboxDocument.ts` (or a helper next to `restoreForms`).
   Work on the `clone`. Read live state from `element` by matching the same selector at the same
   index (as the media and form steps do).
2. Order matters: run after `script` removal; run before the link/src absolutizing if you create
   links or media.
3. If it changes behaviour a user could notice, gate it with a new `enable_sandbox_*` flag in
   `editor.config.ts` (with a comment), like `enable_sandbox_forms`.
4. If the parent page needs a matching change for the export file, change `buildExportHtml` in
   `src/utils/exportHTML.ts` too (the export has no snapshot; it uses the Preview DOM).
5. Add a `describe('buildSandboxDocument ...')` test in `src/tests/security/security.test.ts`:
   build an element, call `buildSandboxDocument`, assert on the string.
6. Never add a step that writes unescaped page text into the document; use `escapeHtml`, and
   clean any markup with DOMPurify as `inlineSvgMarkup` does.

### Recipe: allow a new external stylesheet host

1. Add the hostname to `ALLOWED_IMPORT_HOSTS` in `src/utils/security/sanitizeCss.ts`. This
   allows its `@import` and stops import from reporting its `<link>` in `external`.
2. Only if the builder itself loads that host as a `<link>` in the parent page, extend
   `isBuilderStylesheet` in `sandboxDocument.ts` so the frame copies it. Page CSS `@import`s
   need no change: they live inside `style[css-class]`, which is copied.
3. Add a case to `keeps Google Fonts imports and drops every other import` in
   `security.test.ts`.
4. Tell the backend team: a CSP `style-src`/`font-src` would need the host too.
5. Think first: any allowed stylesheet can style the builder UI and see which pages load it.

### Other changes that must move together

- A new page-level field that runs code (like `pageScripts`): add it to `needsSandbox`, to
  `sanitizeValue` (as `sanitizePageScripts` is), to `buildSandboxDocument`, and to
  `buildExportHtml`.
- A new kind of `<style>` the builder injects: give it an attribute and add it to
  `BUILDER_STYLE`, or the frame won't have it. Pass its text through `sanitizeCss`.
- `pageScriptTag` and `sanitizePageScripts` both check `src`/`type`; keep the two patterns the
  same.

## 6. Gotchas and known limits

- **Custom Code JS does run on Judgify's origin in the editor.** `handleCustomCodeSave` injects
  `buildImportedScript(js)` into the editor page after a save. It is the user's own code in their
  own session, it doesn't run on page load, and it never runs on Preview or the published page.
  But it contradicts the rule "never inject plainJS with a plain `<script>` in the parent page"
  in the `feature-workflow` skill. Decide before relying on it.
- **React widgets are static in the frame.** Sliders, countdown widgets, tabs and accordions
  built with the builder's own React nodes, scroll-to animations and the scroll-to-top button are
  frozen in the snapshot. Only the page's own JS and class JS run.
- **The snapshot is taken once.** After 400 ms of quiet or 4 s. Content that React fills in
  later is missing.
- **CSS-based leaks are not fully closed.** Any https `url()` is allowed, so CSS can still make
  requests (for example attribute selectors that load a URL per value). `@font-face`,
  `@keyframes` and allowlisted `@import`s stay in `plainCss`.
- **`builder_authenticator`** (in `packages/JLandingBuilder`, outside this app) logs anyone in by
  `?email=` with no password or token. Flagged to the user on 2026-09-30 and not changed. The
  docs and skill use it to log in to the local site for live checks.
- **The `lp-` prefix breaks some libraries.** Scripts that look up page classes by their
  original names (Swiper, Tailwind CDN, Font Awesome) won't find them (2026-10-01).
- **Local script files are lost.** `<script src="js/app.js">` can't be loaded; it is listed in
  `external` and must be pasted into Custom Code.
- **Inline typed/module scripts are dropped silently** when `enable_import_page_scripts` is off
  (only `src` scripts are reported in `external`).
- **`NO_SUBMIT_NAVIGATION` is always added**, even with `enable_sandbox_forms` off. Only the
  `<form>` restore is gated.
- **Preview has no event**, so `{{event_*}}` tokens show as written there (2026-10-02).
- **The comment in `snapshot`** about the frame copying the host site's CSS is out of date:
  `collectStyles` no longer copies it. The font-size step still matters (the base size comes
  from the wrapper).
- **Tooling trap:** the Write/Edit tools turn `\uXXXX` in content into the real character, and
  shell heredocs strip backslashes. The escape regexes in `sanitizeCss.ts` and `safeUrl.ts` are
  easy to break this way; check with `od -c` after editing.

### The `isAllow` flag (2026-10-08)

The backend sends `isAllow` with the page data. When it is false the page's JS and external CSS are switched off for that page:

- Render: `applyCodePolicy` (Editor canvas CSS, Preview, RenderPage) removes `plainJS`, `pageScripts` and `@import`. It works on a copy, so saving keeps the code.
- Import HTML: still accepts and stores the code. A paste with JS, script/stylesheet files or `@import` (`importHasRestrictedCode`) gets a warning that it can't be run or edited and the support email.
- Custom Code: the dialog shows only the notice; nothing can be created, edited or deleted.
- Undefined means allowed; only false, 0, "0" or "false" blocks (`parseIsAllow`).

## 7. Tests

- `src/tests/security/security.test.ts`: `safeHref`, `safeMediaUrl`/`safeFrameUrl`,
  `sanitizeCss` (imports, escapes, url(), script-capable declarations), `sanitizeCanvasTree`
  (every URL field kind, handlers dropped, plainCss cleaned, plainJS kept, no mutation), and
  `buildSandboxDocument` (no `allow-same-origin`, links, `</script>` escape, jQuery, muted video,
  inline SVG, scrolling, `#` links, base font, stylesheets, form fields).
- `src/tests/import/frontendEditorRules.test.ts`: `pageScripts` order and module renaming,
  `htmlAttributes`, their sanitizing, `needsSandbox`.
- `src/tests/import/promptRules.test.ts`: `restoreForms` and `NO_SUBMIT_NAVIGATION`.
- `src/tests/security/codePolicy.test.ts`: `isAllow` helpers and the import check.
- Run `npx vitest run`; typecheck with `npx tsc --noEmit -p tsconfig.app.json` against the
  baseline (226 as of 2026-10-02).

Live check (see the `run-editor-and-screenshot` skill): open Preview for a page with `plainJS`,
read the frame with Playwright `contentFrame()`, and check that the page script ran, the wheel
scrolls the frame, a `#` link scrolls without moving the parent, and there are no console
errors. In DevTools, `document.cookie` inside the frame must throw (opaque origin).
