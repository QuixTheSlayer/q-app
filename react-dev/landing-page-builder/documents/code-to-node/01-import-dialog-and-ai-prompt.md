# 01. Import HTML dialog and AI prompt

## Purpose

The Import HTML dialog is how a user gets a whole web page into the builder. They paste HTML (a full document, a fragment, or a whole AI chat reply), and the page's content is **replaced** by the converted node tree. The page's own CSS and JS are kept as strings on the root (`plainCss`/`plainJS`).

The dialog also holds an AI prompt panel. It gives the user a copyable prompt that makes ChatGPT, Claude or Gemini write HTML the importer handles well. Part 2 of that prompt is a list of rules, and each one protects a specific importer behavior. This doc explains those links, so you can change a rule without breaking an import.

The conversion itself (`htmlToJsonTree`) is covered in [02](02-structure-conversion.md), [03](03-text-conversion.md), [04](04-css-scoping-and-units.md) and [05](05-scripts-sandbox-and-security.md). This doc covers the dialog, the replace step, code fences and the prompt.

## Where it lives

| File | Key functions / components | Role |
|---|---|---|
| `src/components/EditorUI/ImportHtmlDialog.tsx` | `ImportHtmlDialog`, `handleFile`, `handleImport`, `runImport` | Toolbar trigger, upload button, CodeMirror paste box, replace confirmation, result toasts |
| `src/utils/readHtmlFile.ts` | `readHtmlFile`, `MAX_HTML_FILE_BYTES` | Reads an uploaded .html file; rejects an empty or oversized one |
| `src/utils/remapNodeId.ts` | `remapNodeId` | Moves every reference to the old root id to the current page's root id on import |
| `src/components/EditorUI/codeDialogTheme.ts` | `codeEditorTheme`, `primaryButtonStyle`, `outlineButtonStyle`, `TOOLBAR_TRIGGER_CLASS` | Shared look with the Custom Code dialog (see [07](07-custom-code-export-and-roundtrip.md)) |
| `src/pages/Editor.page.tsx` | `handleImportHtmlReplace`, `externalContentVersion` | Writes the result into the RTK Query cache and tells the editor to adopt it |
| `src/context/EditorContext.tsx` | `EditorContextProvider` (`externalVersion` prop) | Adopts content replaced from outside; keeps the old page undoable |
| `src/utils/htmlToCanvasNodes.ts` | `stripCodeFences`, `htmlToJsonTree`, `ImportedHtmlTree` | Code-fence cleanup and the converter entry point |
| `src/components/EditorUI/ImportHtmlAiPrompt.tsx` | `ImportHtmlAiPrompt` | The collapsible "Generate the HTML with AI" panel: preset picker, preview, copy button |
| `src/components/EditorUI/importHtmlPrompt.ts` | `IMPORT_HTML_PROMPT_PRESETS`, `importHtmlPromptPage`, `IMPORT_HTML_PROMPT_RULES`, `buildImportHtmlPrompt` | The prompt text: intro, Part 1 presets, Part 2 rules |
| `src/i18n/locales/*/insert.json` | `importHtmlDialog.*`, `importHtmlDialog.aiPrompt.*` | Labels and toasts, in all 14 locales |
| `src/configs/editor.config.ts` | `enable_import_html`, `enable_import_code_fences`, `enable_import_ai_prompt`, `enable_import_html_upload` | Feature flags |
| `codeToNodeTestCodeFiles/prompt.md`, `prompt-lowes-has-talent.md` | (text files) | Working copies of the prompt (see "The working copies" below) |

### Feature flags

| Flag | What it gates | Where it is checked |
|---|---|---|
| `enable_import_html` | The toolbar dialog | `Editor.page.tsx` (renders `ImportHtmlDialog` or not) |
| `enable_import_code_fences` | Taking the code out of ```` ``` ```` fences | `htmlToJsonTree` |
| `enable_import_ai_prompt` | The AI prompt panel inside the dialog | `ImportHtmlDialog` |
| `enable_import_html_upload` | The "Upload .html file" button and its hint line | `ImportHtmlDialog` |

All four default to `true`.

## How it works

### 1. The dialog

`ImportHtmlDialog` renders a toolbar button (`Code2` icon) that opens a wide dialog (up to 1100px, 94vw max). In order, the dialog shows:

1. The title and description (`importHtmlDialog.title`, `.description`).
2. The AI prompt panel, if `enable_import_ai_prompt` is on.
3. A red warning (`importHtmlDialog.replaceWarning`), if the page already has content. `hasExistingContent` is `root.children.length > 0`, computed in `Editor.page.tsx`.
4. The upload row (hint text and the "Upload .html file" button), if `enable_import_html_upload` is on.
5. A CodeMirror editor (CodeMirror is the code editor library; `@uiw/react-codemirror` is its React wrapper). It uses HTML mode from `@codemirror/lang-html`, which also highlights the CSS and JS inside `<style>` and `<script>`. It has line numbers and folding, a 50vh height, and the shared `codeEditorTheme`.
6. Cancel and Import buttons.

`HTML_EXTENSIONS` is created once at module level. CodeMirror reconfigures itself whenever the identity of the extension array changes, so building it inside the component would reconfigure the editor on every render.

The CodeMirror editor replaced a plain textarea on 2026-10-02 (commit `fa45063ac`). It was checked live with test6 (1,531 lines).

### 1a. Uploading an .html file (`handleFile`, flag `enable_import_html_upload`, added 2026-10-05)

The button opens the browser's file picker (a hidden `<input type="file" accept=".html,.htm,.xhtml,text/html">`, clicked through a ref). When a file is chosen:

1. `readHtmlFile(file)` (`src/utils/readHtmlFile.ts`) checks the size first. A file over `MAX_HTML_FILE_BYTES` (5 MB) is rejected without being read. Otherwise it reads the text with `file.text()` (UTF-8; the browser drops a byte order mark). An empty or whitespace-only file is rejected, and a read error is reported as `unreadable`. The function never throws; it returns `{ ok: true, text }` or `{ ok: false, reason }`.
2. `handleFile` clears the input's value so the same file can be picked again.
3. On failure it shows a warning toast: `fileTooLarge` (with the limit in MB), `fileEmpty` or `uploadFailed`.
4. On success it puts the text into the editor (`setHtml`), clears any pending replace confirmation, and shows the `fileLoaded` toast ("Loaded name.html - check it, then click Import").

**The file only fills the editor. It does not import.** The user still clicks Import, which runs the normal path in section 2 (replace warning, confirmation, toasts). Everything that works for pasted HTML works for a file, including a whole AI reply saved as a file (code fences) and a page exported by this builder (the embedded tree is restored, see [07](07-custom-code-export-and-roundtrip.md)).

### 2. Clicking Import (`handleImport`)

1. Empty input shows the `pasteFirst` toast and stops.
2. `htmlToJsonTree(html)` runs. It returns `{ root, css, js, skipped, external }`.
3. If `root.children` is empty, the `nothingConverted` toast shows and the dialog stays open.
4. If the page has content and this is the first click, `confirmingReplace` is set. The button turns red and reads "Replace page content" (`confirmReplace`). Nothing is replaced yet.
5. On the second click (or the first, on an empty page), `runImport` runs.
6. A thrown error is logged with `console.error` and shows the `failed` toast.

Typing in the editor resets `confirmingReplace`, and so does closing the dialog or clicking Cancel. So the user always confirms the HTML they are about to import.

### 3. `runImport` and the toasts

`runImport` calls `onReplace(result)` and then shows:

| Toast | When | Key |
|---|---|---|
| Success, "Imported N section(s)" | Always | `importHtmlDialog.imported` (`count` = `root.children.length`) |
| Warning, 10 seconds | `result.external` is not empty: linked files the importer could not include (local stylesheets, non-allowlisted CDN stylesheets, local `<script src>`) | `importHtmlDialog.externalFiles`. It tells the user to paste that code into Custom Code ([07](07-custom-code-export-and-roundtrip.md)) |
| Warning | `result.skipped` is not empty: tags with no node equivalent (with the current flags: `object`, `embed`) | `importHtmlDialog.skipped`, tags shown as `<tag>` |

Then it clears the editor and closes the dialog.

### 4. Why the dialog takes `onReplace` instead of calling `useEditor()`

The dialog renders in the top toolbar of `Editor.page.tsx`. That toolbar sits **outside** `EditorContextProvider`, which only wraps the canvas below it. Called there, `useEditor()` would quietly return `undefined`. So the parent passes a callback, `handleImportHtmlReplace`, which already owns the RTK Query cache (RTK Query is the Redux data-fetching layer; the page is the cached result of `getPageData`). `CustomCodeDialog` follows the same pattern with `onSave`.

### 5. `handleImportHtmlReplace` in `Editor.page.tsx`

```ts
setSynced('unsynced')
setExternalContentVersion((v) => v + 1)
dispatch(editorQuery.util.updateQueryData('getPageData', '', (draft) => {
  const current = draft.content as LayoutNode
  const restored = remapNodeId(root, root.id, current.id)
  draft.content = { ...current, ...restored, css: restored.css, js: restored.js,
    animation: restored.animation, plainCss: css, plainJS: js,
    pageScripts: restored.pageScripts, htmlAttributes: restored.htmlAttributes }
}))
```

What each part does:

- **`setSynced('unsynced')`** marks the page as having unsaved changes. Import does not save. The user saves as usual.
- **The root id is kept.** The new tree's root id is replaced by the current page's root id by `remapNodeId`. Anything that points at the root id (for example an animation entry restored from an export) follows it. How the replace works depends on the old id: a generated id (hyphenated with a digit, like a UUID) is replaced everywhere in the serialized tree, including inside CSS text. A plain word like `root` is replaced only where a whole value equals it, and never in `contentType`, `type`, `layout` or `tag`. See "Why `remapNodeId` instead of a plain string replace" below.
- **`css`, `js`, `animation`** (class rules, class interactions, animations) are set from the new tree even when they are `undefined`. A converted page leaves them unset, which clears the old page's rules. A re-imported export carries its own, which are kept (see [07](07-custom-code-export-and-roundtrip.md)).
- **`plainCss`/`plainJS`** come from the result's `css`/`js`. They are already sanitized and prefixed by `htmlToJsonTree`.
- **`pageScripts`/`htmlAttributes`** are always the new page's, never the old page's.

### 6. `externalContentVersion`: why the bump matters

`EditorContextProvider` copies its `content` prop into its own state once, and edits change that copy. Its `onUpdate` then writes the copy back into the cache with `Object.assign(draft.content, content)`.

If the toolbar only wrote the cache, the provider would keep its **stale copy of the old page**. The next edit on the canvas would write that old copy back over the import, and the whole page would revert.

So every toolbar write also bumps `externalContentVersion`, which is passed as `externalVersion`. When the number changes, the provider:

1. pushes its current content onto the undo history (so Ctrl+Z brings the old page back, as the warning text says),
2. clears the redo stack,
3. adopts the new `content` prop.

The bump and the cache write happen in the same event handler, so React renders them together.

### 7. Code fences (`stripCodeFences`, flag `enable_import_code_fences`)

An AI reply usually wraps the code in Markdown fences and adds chatter around it. `stripCodeFences` lets the user paste the whole reply:

- Input that already starts with `<` (after whitespace) is returned unchanged.
- Otherwise every fenced block is taken. ```` ```css ```` becomes `<style>…</style>`, ```` ```js ```` or ```` ```javascript ```` becomes `<script>…</script>`, and anything else (```` ```html ````, no language) is used as-is. The blocks are joined in order and the text around them is dropped.
- No fences means the input is returned unchanged.

The rule was ported from frontend-editor's `cleanPaste` on 2026-10-01 (frontend-editor is the user's own editor app, `D:\Q_P\frontend-editor`). It is the first step of `htmlToJsonTree`, so it runs before the export check too.

### 8. The AI prompt panel (`ImportHtmlAiPrompt`)

A collapsed panel, "Generate the HTML with AI". When opened it shows:

- A short description.
- Two boxes listing what the user may change (`CAN_CHANGE`: purpose, sections, style, fonts, content) and what to keep (`KEEP`: skeleton, format, structure, css, js). Their text comes from `importHtmlDialog.aiPrompt.canChange.*` and `.keep.*`.
- A preset picker ("Start from", a `radiogroup` of pill buttons), one per entry in `IMPORT_HTML_PROMPT_PRESETS`.
- A preview: Part 1 in green (`importHtmlPromptPage(preset)`), Part 2 in grey (`IMPORT_HTML_PROMPT_RULES`).
- A copy button. It writes `buildImportHtmlPrompt(preset)` with `navigator.clipboard.writeText`, shows `copied` (or `copyFailed`), and shows a check icon for 2 seconds.

The prompt text itself is English in every locale. Only the panel's labels are translated.

### 9. The prompt's structure (`importHtmlPrompt.ts`)

`buildImportHtmlPrompt(id)` = `INTRO` + the preset's Part 1 + a blank line + `IMPORT_HTML_PROMPT_RULES`.

- **`INTRO`**: "You are a senior front-end developer…". It asks for ONE self-contained HTML document, explains that the page goes into a builder's Import HTML feature, and opens `=== PART 1: THE PAGE (edit freely) ===`.
- **Part 1, presets** (`IMPORT_HTML_PROMPT_PRESETS`, typed `as const` so `ImportHtmlPresetId` is the union of ids):

| id | Label (`aiPrompt.presets.*`) | Page | Event widget used |
|---|---|---|---|
| `blank` | Blank template | Bracketed placeholders: purpose, audience, language, sections, style, fonts, extra details | none (the user fills it in) |
| `awards` | Design awards | "Asia Design Awards 2026", call for entries, 10 sections | Submit Entry and the deadline tokens |
| `pitch` | Startup pitch | "LaunchPad Pitch Challenge 2026", tabs for tracks, an Apply CTA band | Submit Entry and the deadline tokens |
| `photo` | Photo contest | "Frames of the City 2026", gallery and numbered rules | Submit Entry and the deadline tokens |
| `hackathon` | Hackathon | "BuildFast Hackathon 2026", hero countdown, Day 1/Day 2 tabs | Register, the countdown and the deadline tokens |
| `writing` | Young writers | "Young Writers Prize 2026", two age groups | Submit Entry and the deadline tokens |
| `conference` | Tech conference | "DevSummit Asia 2026", speakers grid, Day 1/Day 2 agenda tabs, 3 ticket cards | Register and the deadline tokens |
| `talent` | Talent show | "Campus Idol 2026", audition video, 5 categories, dark purple stage look | Submit Entry and the deadline tokens |
| `artprize` | Art prize | "Canvas of Asia Art Prize 2026", open call, gallery of last year's works, cream editorial look | Submit Entry and the deadline tokens |
| `film` | Film festival | "Lumen Short Film Festival 2026", 3-day screening tabs, cinematic dark look | Submit Entry and the deadline tokens |
| `run` | Charity run | "City Lights Charity Run 2026", 3 race categories, race-day tabs, sporty green/orange look | Register and the deadline tokens |

  The last five (added 2026-10-05) use no countdown: the rewritten Part 2 no longer has a countdown-target rule, so a preset must not ask for one.

  `importHtmlPromptPage` falls back to `blank` for an unknown id. On 2026-10-02 the pitch, hackathon and writing presets had their own entry forms replaced by a CTA section, to match Part 2's form rule.

- **Part 2** (`IMPORT_HTML_PROMPT_RULES`): `=== PART 2: BUILDER RULES (do not change) ===` with the sections Output format, Code format (a fixed skeleton), Structure (13 rules), Event widgets, CSS, JavaScript, Content. It ends with "Return only the ```html code block."

## Why this approach

### Why each group of Part 2 rules exists

The editor does not run page JS, and the importer turns markup into nodes by fixed rules. Each rule below asks the AI for markup that those rules handle. When you change a rule, change it against the behavior it protects.

**Output format**

| Rule | Importer behavior it protects |
|---|---|
| One ```` ```html ```` block, no explanation | `stripCodeFences` takes the fenced code. Chatter is dropped, but one clean block is the safest input |
| One `<style>` in `<head>`, one `<script>` at the end of `<body>` | `DomExtractor` collects `<style>` into `plainCss` and inline classic scripts into `plainJS`. The editor never runs that JS, so all behavior must be in one place that Preview's sandbox can run ([05](05-scripts-sandbox-and-security.md)) |
| Google Fonts only, via `<link rel="stylesheet">` | Only allowlisted stylesheet hosts (Google Fonts) become `@import`. Any other `<link>` goes to `external` and the user gets the "paste it into Custom Code" toast |
| No frameworks (React, Tailwind, Bootstrap); `<script src>` only https CDN | Classes and ids get an `lp-` prefix, so library scripts that look up the original class names (Swiper, Tailwind CDN, Font Awesome) don't find them (2026-10-01 log). Local `src` files go to `external`; https ones go to `root.pageScripts` ([05](05-scripts-sandbox-and-security.md)) |
| Images from `https://picsum.photos/seed/...`, not guessed Unsplash ids | On 2026-10-01, test4 had an image whose own Unsplash URL was a 404. Picsum seed URLs always load |
| Every `<img>` has width, height and alt | The attributes only become inline size when no page rule sets that property (`pageCssSets`), so CSS stays in charge ([02](02-structure-conversion.md)) |
| Icons as inline `<svg>`, no icon fonts | Inline SVG becomes a `data-lp-svg` image and is drawn as cleaned inline `<svg>` again. Icon fonts need a non-allowlisted stylesheet and class names the prefix would break |

**Code format (the fixed skeleton, shared classes, naming)**

The importer does not depend on the class names `.section`, `.card` or `.btn`. Every class gets an `lp-` prefix anyway. The 2026-10-01 log lists the skeleton changes but not a reason for the fixed skeleton. Reason not recorded. Only the parts of the skeleton that the Structure rules require (sections directly in `<body>`, one style and one script) are load-bearing for the importer.

**Structure**

| Rule | Importer behavior it protects |
|---|---|
| 1. `<header>`, `<section>`s and `<footer>` directly in `<body>`, no wrapper | `buildRoot`: each direct child of `<body>` becomes a **section**, and everything nested is a block. A lone `div`/`main`/`article` wrapper becomes the root instead, and an unstyled wrapper is unwrapped (`expandWrapper`). Without a wrapper, the outcome is always one section per content area |
| 2. Unique section id, inner `.container` | Ids get the `lp-` prefix and `#anchor` links follow them (`scopePageIds`) |
| 3. Layout with div/nav/ul/li/article/figure, flex or grid | These keep their real tag (`CONTAINER_TAGS`). With `enable_import_lists_as_blocks`, **every `ul`/`ol`/`li` is a block**, so each list item is its own editable node. The prompt says so, and asks for a class on lists of links, cards or badges. This rule was corrected on 2026-10-02 |
| 4. Text in h1-h6, `<p>`, `<ul>`/`<ol>`; no loose text next to elements | `div` and `span` are always containers. Loose text next to elements becomes separate text nodes, which fragments the line ([03](03-text-conversion.md)) |
| 5. Only simple inline tags in text, no `<span>`, no classes on inline tags | With `enable_import_lossless_text`, TipTap (the rich-text editor library) only gets text whose inline tags come back unchanged. A span, or a class on an inline tag, splits the line into separate inline nodes, which are harder to edit |
| 6. No blocks inside `<p>` | A `<p>` holding a block becomes a `div` block, so `.card p {}` stops matching it (a known limit) |
| 7. CTAs as `<a class="btn">` with plain text; `<button type="button">` only for JS controls | An `<a>` with inline-only content becomes a **button node**. A button node is only made for plain-text content; a `<button>` holding tags becomes a `button`-tag block |
| 8. No entry or registration forms; other forms handled in JS with `preventDefault` | Entry and registration belong to the event, reached through the event widget buttons (2026-10-02). For other forms, `action`/`formaction` are dropped (`DROPPED_ATTRIBUTE`), and with `enable_sandbox_forms` the sandbox turns `[data-lp-form]` back into a `<form>` and cancels navigation after the page's handler |
| 9. No `<object>`, `<embed>`, `<noscript>`, `<iframe srcdoc>`, no `on*` attributes | `object`/`embed` are dropped and reported in `skipped`. `noscript` is dropped (React would build its tracking `<img>` in the live editor). `srcdoc` and `on*` are dropped by the attribute filter and `sanitizeCanvasTree` |
| 10. All content visible on load: `<details>` FAQs, `hidden` tab panels, no CSS-only hiding, scroll-reveal behind `html.js` | **The editor does not run page JS.** Content hidden by CSS until a script reveals it would stay hidden and uneditable in the editor. `<details>` needs no JS, and with `enable_editor_open_details` it renders open in the editor. `hidden` is a page-only prop, so the editor shows every tab panel while Preview hides them. The `js` class is never on `<html>` in the editor, so `html.js .reveal` doesn't hide anything there |
| 11. Sticky header, not fixed | The prompt's own reason: a fixed header covers the first section. No other reason is recorded |
| 12. Links inside a paragraph only for other pages | Text links are TipTap link marks, and TipTap's default Link attributes add `target="_blank"`, so they **open a new tab**. Button nodes use `_self` when the href contains `#` (`PreviewUI/Elements.tsx`), so in-page jumps belong on a `.btn` or nav link |
| 13. Tables only for tabular data, column widths in CSS | TipTap table cells can only hold px column widths, so `<td width>` is not carried over |

**Event widgets**

Event widgets are tokens the published page fills in from the event (2026-10-02, commit `794192d98`):

- Button hrefs `{{event_submit_entry_url}}` and `{{event_register_url}}`. The importer keeps the href, and the Button renderer resolves it through `eventRouteMap`. The prompt says "never a real URL, `#` or an in-page anchor", because only the exact token is resolved.
- Text tokens `{{event_date}}`, `{{event_hour}}`, `{{event_timezone}}`, `{{event_timezone_offset}}`. The Text renderer replaces every occurrence (it only replaced the first one before 2026-10-02). The prompt forbids a fixed deadline date, so the page always shows the event's real deadline.
- The countdown reads its target from a hidden `#countdown-target` text built from the tokens, and stays hidden unless `Date.parse` gives a future date. The script never holds a hard-coded date. Preview has no event, so there the tokens show as `{{…}}` and the countdown stays hidden.

`promptRules.test.ts` locks in that the importer keeps all of these tokens.

**CSS**

| Rule | Importer behavior it protects |
|---|---|
| Tokens on `:root`, used with `var()` | Page variables get a `--lp-` prefix. A color that only uses `:root` variables stays live, so a dark-mode switch keeps working ([04](04-css-scoping-and-units.md)) |
| Background, color, font on `body {}`; no `html { font-size }` | `bodyStyle` copies `body {}` onto the root node, because that CSS would otherwise style the editor's own `<body>`. `html { font-size }` is dropped, because it would resize the editor UI |
| px or rem; avoid 100vh/100vw | Lengths are converted to em with a font-size cascade. `VIEWPORT_PX` treats 100vh as 900px, so a `100vh` section is not the real window height |
| Class selectors, low specificity, no `!important` | Tag rules get a `:where([data-lp-page])` scope, and imported text is a wrapper the rules must reach. Simple class rules survive that best. No more specific reason is recorded |
| Desktop first at 1300px; each `@media` tests one max-width only | The canvas root is 81.5em (1304px). With `enable_editor_page_breakpoints`, only single-width `@media` rules become `@container lp-page` rules, which is what lets the editor's tablet and mobile views apply them |
| Size images with CSS | See the width/height rule above: page CSS beats the attributes |
| Explicit colors | The editor runs in a dark theme. The importer adds `color-scheme: light` and falls back to inherited colors, but explicit colors are the safe path |
| Style every `<button>` fully | The builder's Tailwind reset strips button faces, so `importedBaseCss` restores the browser default (`ButtonFace`/`ButtonText`). An unstyled `<button>` therefore shows the **grey browser button**, the same as in a plain browser |

**JavaScript**

| Rule | Importer behavior it protects |
|---|---|
| Vanilla JS in one IIFE at the end of `<body>` | It becomes `plainJS`, which runs in the sandbox frame with its own scope |
| Toggle classes; class names and ids as **complete string literals** | `scopePageClasses`/`scopePageIds` rename string literals that are a whole class name, id or selector. Names built from pieces (`'tab-' + i`) or inside `innerHTML` strings keep the old name and miss the prefixed element. `ID_FALLBACK_SCRIPT` covers only `getElementById` |
| Page complete with JS disabled | Same reason as Structure rule 10: the editor does not run the script |
| No `document.write`, `eval`, `localStorage`, cookies, network | Reason not recorded. Note that the sandbox frame has no `allow-same-origin`, so it has an opaque origin, where storage and cookies are not available |

**Content** (realistic copy, same rhythm in every section) is about quality, not the importer.

### Why upload only fills the editor

- **Chosen:** load the file into the CodeMirror editor and let the user click Import.
- **Alternative (not tried):** import straight from the file. It is one click shorter, but the user could replace the whole page without seeing what was in the file, and the replace confirmation would have to be repeated in a second place.
- **Why this one:** one import path for paste and upload, so the same warnings, toasts and errors apply, and the user can fix or trim the code before importing. The Custom Code dialog's upload works the same way (it fills the editor), except that it appends to the existing text and this one replaces it, because two full pages cannot be joined.

### Why a 5 MB limit

CodeMirror and the converter slow down a lot on very large input. The limit is the constant `MAX_HTML_FILE_BYTES`. The Lowe's Has Talent export used for testing is 166 KB. Reason for the exact value: not recorded; change it if real pages are larger.

### Why `remapNodeId` instead of a plain string replace

Until 2026-10-05, `handleImportHtmlReplace` did `JSON.stringify(root).split(root.id).join(current.id)`. That is safe for generated ids, but older pages (and `db.json` pages) have the root id `"root"`. The text replace also rewrote `"contentType":"root"`, so the imported root had an unknown node type and the canvas showed a single "Invalid node!" box. It showed up when a page exported by the builder (root id `root`, 3 occurrences of the word in its tree) was uploaded. The fix is `remapNodeId`, which does the full-text replace only for generated ids, and for plain-word ids does an exact-value replace that skips type fields. **Tried/considered:** only restoring `contentType` after the replace (rejected: it would still rewrite words in text and class names such as `root-bar`).

### Other decisions

- **Replace, not append.** A full HTML document stands for a whole page, so import replaces the page content (code comment in `Editor.page.tsx`). Appending into one node is the separate action-menu path ([07](07-custom-code-export-and-roundtrip.md)).
- **A two-click confirmation instead of a separate modal.** The replace-confirmation flow was restored on 2026-09-25. No reason is recorded for the inline two-click form.
- **The prompt is part of the app.** It is shown in the dialog (`enable_import_ai_prompt`) instead of being kept only as a file. Reason not recorded beyond the flag comment.
- **CodeMirror instead of a textarea** (2026-10-02). The user asked for the Custom Code dialog's editor and theme in this dialog too.

## The working copies (`codeToNodeTestCodeFiles/prompt*.md`)

- `prompt.md` is the user's original prompt. The 2026-10-01 rule-by-rule check of the importer was made against it, and `promptRules.test.ts` says its pages were "built from codeToNodeTestCodeFiles/prompt.md". The code-to-node skill says to keep it and `importHtmlPrompt.ts` in sync.
- **They are out of sync right now.** `prompt.md` is an older version: no Part 1/Part 2 split, no code-format skeleton, no event widgets section, the older "forms are allowed" rule, and no rules 12 and 13 or the `<button>` styling rule. **`importHtmlPrompt.ts` is the current version.**
- `prompt-lowes-has-talent.md` is a client prompt (2026-10-02, uncommitted). Part 1 is the client's copy. Part 2 is a **tailored** copy of the dialog's rules: no images, no `<form>`, no `<script src>`, no table rule, and `line-height` added to the `body {}` rule.

When you change Part 2, decide whether `prompt.md` should follow. Tailored client prompts are not updated automatically.

## How to modify or extend

### Add a new preset

1. Add an entry `{ id: "myid", page: \`...\` }` to `IMPORT_HTML_PROMPT_PRESETS` in `importHtmlPrompt.ts`. Keep the same bullets as the others: Purpose, Audience, Language of the copy, numbered Sections, Visual style, Fonts, Extra details.
2. Use the event widgets: every entry button is `{{event_submit_entry_url}}` or `{{event_register_url}}`, and the deadline is written with `{{event_hour}} {{event_timezone}} on {{event_date}}`. Don't add an entry or registration form section. Use a CTA band instead.
3. Add the label `importHtmlDialog.aiPrompt.presets.myid` to **all 14** `src/i18n/locales/*/insert.json` files.
4. The picker and the `ImportHtmlPresetId` type pick up the new entry by themselves. No component change is needed.
5. Check it live: copy the prompt, run it in an AI tool, paste the reply and import. Measure the result as described in [09](09-testing-and-verification.md).

### Change a Part 2 rule safely

A rule is only correct if the importer really behaves the way the rule assumes. Check that with a probe test before you change the text.

1. Find the importer behavior the rule protects (the tables above, or the code-to-node skill).
2. Write a throwaway probe test, `src/tests/import/tmp-rule.test.ts`, that feeds markup following the new rule, and markup breaking it, to `htmlToJsonTree`:

   ```ts
   import { it, expect } from 'vitest'
   import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
   it('probe', () => {
     const { root, css, js } = htmlToJsonTree('<section><ul class="nav"><li><a href="#x">X</a></li></ul></section>')
     console.log(JSON.stringify(root.children[0], null, 2))
     expect(root.children).toHaveLength(1)
   })
   ```

3. Run it with `npx vitest run src/tests/import/tmp-rule.test.ts`. Read the tree: sections, tags, `contentType`, `data-lp-*` markers, the renamed classes in `css`/`js`.
4. If the behavior matters long term, move the assertion into `src/tests/import/promptRules.test.ts` and delete the probe.
5. Edit `IMPORT_HTML_PROMPT_RULES`. Escape backticks inside the template literal (`` \`\`\`html ``).
6. Decide whether `codeToNodeTestCodeFiles/prompt.md` should get the same change.
7. If the importer has to change to support the rule, that is a converter change. Give it its own `enable_*` flag and tests ([02](02-structure-conversion.md) onward).

### Change the dialog

- New toast or label: add the key under `importHtmlDialog` in all 14 `insert.json` files.
- New toolbar dialog that writes page content: take a callback from `Editor.page.tsx`, and in that callback **bump `externalContentVersion`** in the same handler as the cache write.
- Keep CodeMirror extension arrays at module level.
- New upload rule (a size, an extra file type): change `readHtmlFile` and its test, and add a toast key for any new rejection reason (a `reason` value in `HtmlFileResult`, shown in `handleFile`). To accept more extensions, change the `accept` attribute and keep the test file list in step.

## Gotchas and known limits

- **Forgetting the version bump reverts the page.** Any write to `getPageData` from outside `EditorContextProvider` must bump `externalContentVersion`, or the provider's stale copy wins on the next edit.
- **Root fields not listed in `handleImportHtmlReplace` carry over** from the old page (`...current` is spread first). Only `css`, `js`, `animation`, `plainCss`, `plainJS`, `pageScripts` and `htmlAttributes` are reset explicitly. Add a field there if it must not survive an import.
- **The root id rewrite depends on the shape of the old id.** Generated ids are replaced as text everywhere, so they must be unique strings. Plain words are replaced only as whole values and never in type fields, so a root id that is a plain word and also appears as a whole value in text (a text node whose entire value is the word) would be rewritten there too.
- **Upload reads UTF-8 only.** A file saved in another encoding (for example Windows-1252) shows garbled characters in the editor. Re-save it as UTF-8 or paste it.
- **Upload replaces the editor's text**, it does not append. Unsent text in the editor is overwritten.
- **Only one file at a time**, and no drag and drop (dropping a file on CodeMirror is not handled).
- **The dialog doesn't save.** The page is marked unsynced, and the user must still save.
- **`stripCodeFences` only runs when the input doesn't start with `<`.** A fence needs a newline after its language tag (```` ```html ```` then a new line).
- **The prompt can't guarantee the AI follows it.** The importer must still handle anything, so the prompt only steers. Don't rely on a prompt rule instead of a converter rule.
- **Event tokens show raw in Preview**, and the countdown stays hidden there, because Preview has no event. Whether the real date, hour and offset combine into a valid date is still to be checked on a real event (2026-10-02 log).
- The dialog's description (`importHtmlDialog.description`) says "Structure and styles are converted; external stylesheets aren't fetched". In fact CSS is kept as `plainCss` (not turned into node styles), and Google Fonts links do become `@import`.

## Tests

| File | Covers |
|---|---|
| `src/tests/import/frontendEditorRules.test.ts` | `stripCodeFences` (an AI reply with html/css/js fences, and markup left alone) and the other frontend-editor parity rules |
| `src/tests/import/promptRules.test.ts` | The builder rules added for the prompt: image size attributes vs CSS, editor breakpoints, sandbox forms, event widget tokens |
| `src/tests/import/htmlToJsonTree.test.ts` | Root and section rules, the export round trip |
| `src/tests/import/readHtmlFile.test.ts` | `readHtmlFile`: text of an html file converts, UTF-8 (Myanmar, Chinese) intact, BOM dropped, empty and whitespace-only rejected, oversized rejected without reading, read error reported not thrown |
| `src/tests/import/remapNodeId.test.ts` | `remapNodeId`: generated id replaced everywhere (css text, keys), `contentType: "root"` kept when the old id is the word `root`, class names and text containing the word untouched, an independent copy when the ids match, and a restored export with root id `root` is still a root node |
| `src/tests/import/fullPage.test.ts` | Full themed pages |

No test covers `ImportHtmlDialog`, `ImportHtmlAiPrompt` or `handleImportHtmlReplace` directly. The upload button was checked live (below).

Run `npx vitest run`, and typecheck with `npx tsc --noEmit -p tsconfig.app.json` against the baseline (226 per the 2026-10-01/02 logs).

**Live check:** start the editor (`run-editor-and-screenshot` skill), open Import HTML, paste a page (for example `codeToNodeTestCodeFiles/test6.md`), import, confirm the replace, then:

- edit one node and check that the page doesn't revert,
- press Ctrl+Z and check that the old page comes back,
- check the toasts for skipped and external files.

**Live check for upload** (2026-10-05, page 15, because pages 11-14 in `db.json` are stored as objects and don't load in dev): open Import HTML, click "Upload .html file", choose a file with Playwright's `setInputFiles` on `input[type=file]`. The editor should show the file's code and the "Loaded ..." toast. Click Import: "Imported 7 section(s)" and the page on the canvas. Test file used: a page exported by the builder (166 KB, root id `root`), which also exercises `remapNodeId`.

For the prompt, copy a preset, generate a page and import it. Measure it against the original as described in [09](09-testing-and-verification.md).
