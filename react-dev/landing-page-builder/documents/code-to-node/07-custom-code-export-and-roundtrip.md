# 07. Custom Code, Export HTML and the round trip

## Purpose

This doc covers three features that work around an imported page:

- **Custom Code** lets the user read and edit the page's own CSS and JS (`root.plainCss` / `root.plainJS`), by typing or by uploading `.css`/`.js` files.
- **Export HTML** writes the page as one standalone `.html` file, with every stylesheet and script the live page uses. (Preview's **Export React** writes the same page as a React project; see [08](08-export-react-project.md). It takes the same rendered markup and assets.)
- **The round trip** means an exported file imported again gives back exactly the same page. This works because the export embeds the node tree as JSON.

The doc also covers the older **action-menu "Import HTML" into a node**, which still uses the first-generation converter, and the crash it caused on 2026-10-01.

## Where it lives

| File | Key functions / components | Role |
|---|---|---|
| `src/components/EditorUI/CustomCodeDialog.tsx` | `CustomCodeDialog`, `handleFile`, `handleSave` | Toolbar dialog: CSS and JS tabs (CodeMirror), file upload, save |
| `src/components/EditorUI/codeDialogTheme.ts` | `codeEditorTheme`, `primaryButtonStyle`, `outlineButtonStyle`, `TOOLBAR_TRIGGER_CLASS` | Shared theme for the Custom Code and Import HTML dialogs |
| `src/pages/Editor.page.tsx` | `handleCustomCodeSave`, `externalContentVersion` | Writes `plainCss`/`plainJS` into the RTK Query cache and runs the JS once on the canvas |
| `src/utils/htmlToCanvasNodes.ts` | `buildImportedScript` | Wraps page JS for injection after React has rendered |
| `src/utils/exportHTML.ts` | `exportHTML`, `buildExportHtml`, `readEmbeddedPageData`, `PAGE_DATA_SCRIPT_ID` | Builds and downloads the export, and reads the embedded tree back |
| `src/pages/Preview.page.tsx` | the "Export" button | Collects the assets and calls `exportHTML` |
| `src/utils/jquery.utils.ts` | `usesJquery`, `JQUERY_SRC`, `JQUERY_INTEGRITY` | Decides when jQuery is added, and the pinned script with its SRI hash |
| `src/utils/pageIds.ts` | `ID_FALLBACK_SCRIPT` | `getElementById('x')` falls back to `lp-x` |
| `src/utils/security/sandboxDocument.ts` | `pageScriptTag` | Writes one `root.pageScripts` entry as a `<script>` tag (shared with the sandbox) |
| `src/components/EditorUI/ActionMenu.tsx` | `handleImportHtmlIntoNode`, `handleExportHtml` | Node menu: import HTML into a node, copy a node's HTML |
| `src/utils/htmlToCanvasNodes.ts` | `htmlToCanvasNode`, `htmlToCanvasSections` | The first-generation converter (CSS resolved into class rules) |
| `src/utils/security/sanitizeCanvasTree.ts` | `sanitizeCanvasTree`, `sanitizeRootCss` | Runs on every load. Cleans the root's `css` map |
| `src/hooks/useClassCss.ts` | `useClassCss` | Builds the class CSS; skips entries that aren't rule objects |

### Feature flags

| Flag | What it gates |
|---|---|
| `enable_custom_code` | The Custom Code toolbar dialog (checked in `Editor.page.tsx`) |

Export HTML and the action-menu import have **no flag**. The Import HTML flags are in [01](01-import-dialog-and-ai-prompt.md).

## How it works

### 1. Custom Code dialog

`CustomCodeDialog` gets the current `css` and `js` from `Editor.page.tsx` (`data.content.plainCss` / `plainJS`) and an `onSave` callback.

1. **Opening** resets the draft to the page's current code and selects the CSS tab. A cancelled edit is gone the next time the dialog opens.
2. **Tabs**: CSS (`@codemirror/lang-css`) and JS (`@codemirror/lang-javascript`), each a 50vh-high CodeMirror editor (dialog up to 1100px wide) with folding and the shared `codeEditorTheme`.
3. **Upload**: the button opens a hidden file input. It accepts `.css` on the CSS tab and `.js`/`.mjs` on the JS tab. `handleFile` reads the file with `file.text()` and **appends** it to the current tab after a blank line. The input is then cleared, so the same file can be picked again. A read error shows `customCodeDialog.uploadFailed`.
4. **Save** trims both strings, calls `onSave`, shows `customCodeDialog.saved` and closes the dialog.
5. A note under the editor (`customCodeDialog.jsRunNote`) says: "JS runs on the canvas once when you save here, and always on Preview, the published page and exports."

Like `ImportHtmlDialog`, the dialog sits in the toolbar outside `EditorContextProvider`, so it takes a callback instead of calling `useEditor()`.

### 2. `handleCustomCodeSave` in `Editor.page.tsx`

1. `setSynced('unsynced')` and **bump `externalContentVersion`**. Without the bump, the provider's stale copy would be written back on the next edit and the change would be lost ([01](01-import-dialog-and-ai-prompt.md), section 6).
2. Write the cache: `root.plainCss = sanitizeCss(css) || undefined`, `root.plainJS = js || undefined`. An empty string removes the field.
3. **Run the JS once on the canvas.** Any earlier `script[data-custom-js]` is removed. Then `buildImportedScript(js)` is appended to `document.body` as a new `<script data-custom-js>`.
4. On leaving the editor, an effect cleanup removes that script.

`buildImportedScript` gives the code its own function scope (so running it again can't throw "already declared"). It fires `DOMContentLoaded`/`load` listeners at once, because those events have already happened. It runs `ID_FALLBACK_SCRIPT` first, loads jQuery first when the code uses `$`/`jQuery`, and logs errors instead of breaking the page.

> Note: this step runs page JS on Judgify's own origin, in the editor. The code-to-node skill says "plainJS never runs on Judgify's origin", and the README says the editor never runs it. Both describe the import/Preview path. This Custom Code step is a deliberate exception: it came in with commit `30e22f39f` ("add custom code dialog") on 2026-09-28, and the UI text states it. There is no work log for that day, so the reason is not recorded. This is flagged for review.

### 3. Export HTML

The **Export** button is on the Preview page (`Preview.page.tsx`). It calls:

```ts
exportHTML(elementRef, data.title, {
  animationCss: css, responsiveCss, classCss,
  plainCss: content?.plainCss, classJs, plainJS: content?.plainJS,
  content: dataForRender(),
})
```

`elementRef` is the rendered page. It stays rendered, but hidden, while a sandboxed page is shown in the frame, because Export reads its `innerHTML`. `exportHTML` builds the file with `buildExportHtml`, downloads it as `<title>.html` through a Blob URL, and revokes the URL.

`buildExportHtml(bodyHtml, title, assets)` is a pure function (split out on 2026-09-25 for testing). It writes:

**`<html>` attributes.** `lang="en"`, then `root.htmlAttributes` on top (the source page's `lang`, `class`, `data-theme`…, from `enable_import_html_attributes`). Names must look like attribute names, and `on*`, `style` and `xmlns*` are dropped. Values are HTML-escaped.

**`<head>`**, in this order:
1. charset and viewport `<meta>`, and the escaped `<title>`.
2. `<script src="https://cdn.tailwindcss.com">`. The rendered markup carries the builder's Tailwind classes. No separate reason is recorded.
3. One `<style>` each, skipping empty ones: `animationCss` (`useAnimationCss`), `responsiveCss` (`useResponsiveCss`), `classCss` (`useClassCss`), `plainCss`. `plainCss` gets its own tag so its `@import` rules stay first in that sheet (a browser ignores an `@import` after any other rule).

**`<body>`**, in this order:
1. The rendered markup (`bodyHtml`).
2. The page data: `<script type="application/json" id="judgify-page-data">` holding `JSON.stringify(content)`, with every `<` written as `<`.
3. The scripts:
   - jQuery 3.7.1 (`JQUERY_SRC`, with an SRI `integrity` hash and `crossorigin`) when `plainJS` uses `$`/`jQuery` (`usesJquery`) **and** the page doesn't load its own jQuery (a `pageScripts` `src` matching `/jquery/i`).
   - Each `root.pageScripts` entry through `pageScriptTag`: https `src` scripts, module scripts and typed blocks (JSON-LD), in page order, before the code that uses them. A non-https `src` writes nothing.
   - `classJs` (`useClassJs`, the builder's class interactions).
   - `plainJS`, with `ID_FALLBACK_SCRIPT` in front of it in the same `<script>`. Imported ids carry an `lp-` prefix, and the fallback lets `getElementById('x')` still find `lp-x` when the page builds an id at runtime.

Scripts sit at the end of `<body>`, so the page's own `DOMContentLoaded`/`load` handlers fire normally. That is why the export does not wrap `plainJS` in `buildImportedScript`.

**Escaping:**

| What | How | Why |
|---|---|---|
| CSS in `<style>` | `</style` becomes `<\/style` (`safeStyle`) | A literal `</style>` in the code would end the tag early |
| JS in `<script>` | `</script` becomes `<\/script` (`safeScript`) | Same, for scripts |
| Page data JSON | every `<` becomes `<` | Nothing inside the JSON (text containing `</script>`) can close the tag. The JSON still parses to the same value |
| Title, attribute values | `escapeHtml` | Plain HTML escaping |

### 4. The round trip: export, then import again

`htmlToJsonTree` (the Import HTML converter, see [01](01-import-dialog-and-ai-prompt.md)) first calls `readEmbeddedPageData(parseDoc(html))`:

1. It reads `#judgify-page-data`'s text and runs `JSON.parse`.
2. It accepts the data only if it is an object with `type === "container"` and a `children` array. Otherwise it returns `null`, and the markup is converted as usual.
3. A crafted file could hold any node data, so the tree goes through `sanitizeCanvasTree`, the same check as a page load. `css` is `sanitizeCss(plainCss)`, and `skipped`/`external` are empty.

`handleImportHtmlReplace` then keeps the restored tree's `css`, `js` and `animation` (class rules, class interactions, animations) and moves the old root id to the current page's root id with `remapNodeId` (`src/utils/remapNodeId.ts`; see [01](01-import-dialog-and-ai-prompt.md), "Why `remapNodeId` instead of a plain string replace"). An export can also come from the Import HTML dialog's upload button, which loads the file's text into the editor first. The result equals the exported page (`htmlToJsonTree.test.ts`, "export → import round trip").

### 5. Action menu: "Import HTML" into a node

The node action menu (`ActionMenu.tsx`) shows **Import HTML** for nodes that can hold children (`hasChildNode`). It opens a plain textarea dialog.

`handleImportHtmlIntoNode`:

1. Stops if the input is empty or nothing is focused. Shows `menu.importHtmlFailed` if the node can't hold children (text, button, image and video nodes keep a string in `children`, and an array there would crash React).
2. Calls `htmlToCanvasNode(html)`, which returns `{ nodes, animations, css, js }`. No nodes shows `menu.importHtmlNothingConverted`.
3. In **one** `canvas.updateContent` call, it replaces the focused node's children with `nodes` (or the root's, for the root) and merges `animations` into `root.animation`, `css` into `root.css` and `js` into `root.js`. A single call matters: two separate calls would each read the same old `content` closure, and the second would overwrite the first.

This runs inside `EditorContextProvider`, so it uses `useEditor()` and needs no version bump.

`htmlToCanvasNode` is the **first-generation converter**, not `htmlToJsonTree`:

- It pulls out the `<style>` text and takes the `<body>` content.
- It sanitizes with DOMPurify. `onclick` is kept only so `detectOnclickInteraction` can pattern-match it; it is never run or copied onto a node.
- It converts each element with `convertElement`, which resolves the page CSS into each node's styles, and runs `flattenWrapperSections`.
- `resolveInteractions` turns recognized `onclick` patterns into animations or class JS.
- It returns the class rules from `buildCssTree(collectAllClassStyles(...))`, keyed by class name, for the class-aware panel controls (`syncClassStyle`).

`htmlToCanvasSections` is the same converter with section wrapping. Nothing in `src/` calls it any more.

**The 2026-10-01 crash.** Importing HTML into a node crashed the page with "Cannot read properties of null (reading 'style')":

- **Cause:** since 2026-09-25, `htmlToCanvasNode` had returned the pasted HTML **string** as `css`. ActionMenu spread it into `root.css`, so every character became a "class rule" (`{ "0": "<", "1": "d", ... }`). Saved through PHP, the map could also come back as an array. `useClassCss` then hit an entry that wasn't a rule object.
- **Fix, in three layers:**
  1. `htmlToCanvasNode` returns class rules like `htmlToCanvasSections` does, and its debug `console.log` was removed.
  2. `useClassCss` skips entries that are not objects (`if (!rule || typeof rule !== "object") continue`).
  3. `sanitizeCanvasTree` cleans a root's `css` on every load (`sanitizeRootCss`). A non-object or an array becomes `undefined`, and entries that aren't plain objects are dropped. Pages that were already broken open again.

### 6. Action menu: "Export as HTML"

`handleExportHtml` is a different feature from the page export. It copies the focused node's rendered `outerHTML` (found by `[data-id]`) to the clipboard. It has no styles, scripts or page data, so it does **not** round-trip.

## Why this approach

### Embedded JSON instead of rebuilding from markup

- **Chosen:** embed the node tree in the export as `<script type="application/json" id="judgify-page-data">`, and restore it on import before trying markup conversion.
- **Observed on 2026-09-25, not kept:** re-importing the exported markup through the normal converter gave a different UI. Rebuilding nodes from the builder's own rendered markup is lossy by nature:
  - the preview wrapper and the old root became extra nesting,
  - the renderers' wrapper divs became blocks,
  - buttons put `font-size: 1em` on the link and the real size on an inner span,
  - animation and responsive CSS is keyed by `data-id`, which re-import regenerates,
  - classless nodes were exported as `class="undefined mx-auto"` (that bug was fixed separately with `cn()`).
- **Not tried:** making every renderer emit markup that converts back exactly. The skill's guidance is to keep the embedded-JSON path working rather than trying to make markup round-trip.
- **Trade-off:** the tree is in the file twice (as JSON and as rendered markup). Editing the exported HTML by hand changes nothing on re-import while the JSON is there. Removing the `#judgify-page-data` script makes the importer convert the markup instead.

### Export writes every stylesheet and script the live page uses

On 2026-09-25 `exportHTML` was changed to take an assets object. Before that, imported pages lost their own CSS and JS on export. jQuery is added because imported scripts often expect the host site to provide it. Its SRI hash was computed from the downloaded file.

### Custom Code theme colors as inline styles

- **Chosen:** `primaryButtonStyle`/`outlineButtonStyle` are React `style` objects, and `codeEditorTheme` is a CodeMirror `EditorView.theme` at `Prec.highest`, built from the app's CSS variables (`rgb(var(--primary))`...).
- **Why:** the `Button` primitive writes its own `color` (a default blue) as an inline style. An inline style beats any class, so Tailwind classes like `bg-primary` lose to it. The theme colors have to be inline too (comment in `codeDialogTheme.ts`). The CodeMirror theme uses the same tokens so the editor follows the app's light and dark themes. Syntax colors stay CodeMirror's own.
- **Not tried:** changing the `Button` primitive. It is shared across the app.

### Upload appends instead of replacing

Uploaded code is added to the end of the current tab "so nothing is lost" (code comment, and the dialog description). The common use is the import's `external` toast: paste or upload the stylesheet the importer couldn't include, next to the CSS already there.

### Running Custom Code JS on the canvas

Reason not recorded (see the note in "How it works" section 2). The UI text describes it as intended.

### Keeping the old converter for the action menu

The 2026-09-25 log says the old functions were kept "because `ActionMenu`'s import-into-node still uses them". Today only `htmlToCanvasNode` has a caller. Moving the action menu to `htmlToJsonTree` is not recorded as tried. It would need a way to merge `plainCss`/`plainJS` and the `lp-` prefixes into an existing page.

## How to modify or extend

### Add a new asset to the export (for example a new generated stylesheet)

1. Add an optional field to `ExportHtmlAssets` in `exportHTML.ts`.
2. Write it in `buildExportHtml`, in the right order: CSS in the `styles` list, JS in the `scripts` list. Always pass CSS through `safeStyle` and JS through `safeScript`.
3. Pass it from `Preview.page.tsx`'s `exportHTML(...)` call.
4. If the sandbox frame needs it too, add it in `buildSandboxDocument` (`sandboxDocument.ts`). The export and the sandbox should load the same things in the same order ([05](05-scripts-sandbox-and-security.md)).
5. Add a `buildExportHtml` test in `src/tests/import/htmlToJsonTree.test.ts` (or a new `src/tests/import/exportHtml.test.ts`).

### Add a new root field that must survive the round trip

Nothing to do for the export: the whole root is embedded. On import, check `handleImportHtmlReplace` in `Editor.page.tsx`. Fields are taken from the restored tree through `...restored`, but a field the new tree **lacks** keeps the old page's value. If it must be cleared, list it explicitly, like `pageScripts`. If the field holds a URL or code, make sure `sanitizeCanvasTree` checks it (it matches fields by name: `...href`, `...ImageUrl`, `src`, `url`, `link`).

### Change the Custom Code dialog

- Labels: `customCodeDialog.*` in all 14 `src/i18n/locales/*/insert.json`.
- Any new write from the toolbar must bump `externalContentVersion` in the same handler.
- CSS written to the page must go through `sanitizeCss`.
- Keep CodeMirror extension arrays stable (module level), as the comment above `LANGUAGE` asks.

### Change the action-menu import

Keep its `css` a `Record<string, CssClassRule>`. `htmlToCanvasNode.test.ts` checks that. If you switch it to `htmlToJsonTree`, give the change its own flag and decide how `plainCss`/`plainJS` merge with the page's existing ones.

## Gotchas and known limits

- **Custom Code CSS on an imported page must use the prefixed names.** Imported classes and ids carry `lp-` (`.lp-hero`, `#lp-faq`). Class and id prefixing runs only inside `htmlToJsonTree`. At render, imported pages only get the `:where([data-lp-page])` scoping for tag rules (`scopePageCss`). A new `.hero {}` rule typed into Custom Code matches nothing.
- **Custom Code JS runs on the canvas only at save time**, not when the page loads in the editor. A second save removes the earlier script tag, but anything the earlier script did (listeners, DOM changes) stays until the user leaves the editor.
- **The JS is stored as typed**: no sanitizing, only `trim()`. Safety relies on the sandbox frame for Preview and the published page ([05](05-scripts-sandbox-and-security.md)), and on the backend.
- **`ID_FALLBACK_SCRIPT` is in the export only when `plainJS` exists.** A page whose only code is a module in `pageScripts` gets no fallback.
- **jQuery detection only looks at `plainJS`**, not at `classJs` or module `pageScripts`.
- **The exported `plainCss` is written as stored.** Pages imported before the `:where` scoping existed are scoped at render in the app, but not in the export.
- **The export loads the Tailwind CDN at runtime**, so an exported file needs network access to look right.
- **Editor-only rules are not exported**, for example `enable_editor_page_breakpoints`' container queries. The export keeps the page's real `@media` rules.
- **An exported page with root id `root` needs `remapNodeId`.** Exports from older pages have the literal root id `root`. A plain text replace turned `contentType: "root"` into the page id and the canvas showed "Invalid node!" (fixed 2026-10-05). Any new code that moves the root id must not text-replace a plain-word id.
- **The embedded JSON wins over the markup.** Hand edits to an exported file's markup are ignored on re-import while `#judgify-page-data` is present.
- **The action-menu import uses the old converter.** It resolves CSS into node styles and class rules, keeps no `plainCss`/`plainJS`, adds no `lp-` prefixes, and has no flag. Its result differs from the toolbar import. It runs DOMPurify but not `sanitizeCanvasTree`. The tree is sanitized on the next page load.
- **`CustomCodeDialog` rebuilds its extension array** (`[...LANGUAGE[key], codeEditorTheme]`) on every render, although the comment above `LANGUAGE` says arrays should be created once.

## Tests

| File | Covers |
|---|---|
| `src/tests/import/htmlToJsonTree.test.ts` | "export → import round trip": `buildExportHtml` with page data restores the exact tree (including a `</script>` inside text, plus `plainCss`/`plainJS`), and the markup fallback when no tree is embedded. Also `buildImportedScript`, with and without jQuery |
| `src/tests/import/htmlToCanvasNode.test.ts` | The action-menu converter returns class rules, and `sanitizeCanvasTree` drops broken `root.css` entries (an object map and the PHP array form) |
| `src/tests/import/pageClasses.test.ts` | `ID_FALLBACK_SCRIPT` |
| `src/tests/import/remapNodeId.test.ts` | Moving the root id of a restored export, including a root id that is the word `root` |
| `src/tests/security/security.test.ts` | `sanitizeCanvasTree` and `sanitizeCss`, which the restore path relies on |

No test covers `CustomCodeDialog`, `handleCustomCodeSave`, or the jQuery, `pageScripts` and `htmlAttributes` parts of `buildExportHtml`. Add tests there when you change them.

Run `npx vitest run`, and typecheck with `npx tsc --noEmit -p tsconfig.app.json` against the baseline (226 per the 2026-10-01/02 logs).

**Live check** (`run-editor-and-screenshot` skill):

1. **Custom Code**: open it on an imported page, upload a `.css` file and check that it is appended. Save, edit a node, and check that the code is still there (the version bump works).
2. **Export**: in Preview, click Export and open the file in a browser. The page JS should run (tabs, countdown), with no console errors.
3. **Round trip**: import the exported file through Import HTML. The tree should match the original, with animations and class rules intact.
4. **Action menu**: on a block, choose Import HTML, paste `<style>.card{color:red}</style><div><div class="card">Hi</div></div>`, and check that the page doesn't crash and `root.css` has a `card` rule.
