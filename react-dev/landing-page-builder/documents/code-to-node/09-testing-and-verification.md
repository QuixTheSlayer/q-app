# 09 - Testing and verification

## 1. Purpose

Code to node has many small rules, and most bugs in it were found by measuring a real page, not by
reading code. This doc maps every unit test to the rule it protects, explains how to run the
checks, how to dump what the converter produces, how to measure an import live against the
original page, and which tooling traps have broken this code before. It ends with the checklist
for any change to code to node.

## 2. Where it lives

| Path | What | Role |
|---|---|---|
| `src/tests/import/*.test.ts` | 9 files | Converter rules (`htmlToJsonTree` and helpers) |
| `src/tests/security/security.test.ts` | 1 file | URL allowlists, CSS sanitizer, tree sanitizer, sandbox document |
| `src/tests/tiptap/trailingNode.test.ts` | 1 file | TipTap config regression |
| `src/tests/panel/*.test.ts` | 2 files | Property panel helpers ([../property-panel-behaviors.md](../property-panel-behaviors.md)) |
| `vitest.config.ts` | jsdom, globals, `src/**/*.test.ts(x)` | Test runner config |
| `codeToNodeTestCodeFiles/` | `test1.md`-`test6.md`, `prompt.md`, `prompt-lowes-has-talent.md` | Real pages for live measurement; the AI prompt |
| `.claude/skills/run-editor-and-screenshot/SKILL.md` | — | Starting the app and driving it with Playwright |
| `.claude/skills/code-to-node/SKILL.md` | "Testing and verification" | Short version of this doc |
| `playwright-test/editor/*.spec.ts` | `npm run pw-test` | General editor end-to-end tests (not code-to-node specific) |

Other test folders (`auth`, `chart`, `events`, `sanitize`, `styling`...) cover other features;
`src/tests/events/checkEventPlaceholders.test.ts` and `src/tests/sanitize/sanitizeHtml.test.ts` are
the nearest to this area.

## 3. Test map

### 3.1 `src/tests/import/`

| File | Protects |
|---|---|
| `htmlToJsonTree.test.ts` | The core contract: first element in body is the root, its children are sections, nav links become buttons, inline formatting/links/heading tags stay in text, media/linked blocks/iframes map to their types, form controls become form fields, bare text gets a text node, CSS kept with Google Fonts hoisted and other imports dropped, only classic inline scripts kept. Lone wrapper vs `<body>` as root; a lone `<section>` fragment; `external` files reported. `buildImportedScript` (late `DOMContentLoaded`, jQuery loading). **Export → import round trip** (`buildExportHtml`, embedded tree restored exactly; markup fallback). div/span always blocks; empty elements kept; text color fallback (parent inline, parent stylesheet / `:root` var, white, own color); span text wrapping without an extra `<span>`. |
| `domFidelity.test.ts` | Real container tags kept (`CONTAINER_TAGS`), off-list tags render as div, landmark tags on sections/root; kept attributes (data/aria/role/title/tabindex/for), never handlers or the editor's own `data-*`; only allowlisted attributes reach the element (`passthroughAttributes`); exact spaces and inline links in text. |
| `fullPage.test.ts` | The 2026-09-29 themed full page: only body's direct children (and an unwrapped `<main>`'s) become sections; inactive theme variants ignored and `:root` vars kept as `var()`; SVG colors from the default theme; root gets the `body {}` background/color/font size; Google Fonts `@import` with `;` in the URL kept, a non-allowlisted one behind a quoted `;` still dropped; `<summary>`, dt/dd, label and empty CSS-drawn tags keep their tag; `hidden` on the page but not the editor; `--lp-` variable prefix; `data-lp-text="plain"`; `form` selectors retargeted to `[data-lp-form]`; a heading holding a span stays a heading; link/button tags recorded; form fields with settings, submit inputs as buttons. |
| `unitConversion.test.ts` | px/rem → em (`lengthsToEm`), url()/quotes untouched; font-size divides by the parent, others by the own font; sizes from page CSS; page CSS rules use the font size of what they match; rem uses the page's root size and drops `html { font-size }`; `@media` conditions stay px; unmatched rules use the body size; `100vw` = canvas width, `100vh` = 900px; vh/vw in styles, CSS and the cascade; table width/height attributes; `clamp()`/`min()`/`calc()` font sizes; `font:` shorthand. |
| `pageClasses.test.ts` | `lp-` class prefix in CSS (quoted parts, at-rules, keyframe steps kept), class attributes, JS selector/class-list strings (not prose/URLs); page CSS order (`@import`, then tag defaults, then page rules); `data-lp-page` on the root; tag defaults skip what the page's `*` reset sets; text wrapper stands for the source tag and tag rules also target it; lists as ul/li blocks with inline item text; inline pieces; spaces around a span; `lp-` id prefix in the tree, CSS (`#id`, `[href="#id"]`, `url(#id)`) and JS; `ID_FALLBACK_SCRIPT`. |
| `pageScope.test.ts` | `scopePageCss`: tag-only selectors limited to `:where([data-lp-page])`, private selectors left, `:not()` handling, `body` → root, `html`/`:root` stay, `*` and pseudo-elements, `@media` scoped but keyframe steps not, idempotent; a page `section {}` rule stays off the builder panels; imported SVG shape classes prefixed, viewBox px kept, theme vars live with fallback. |
| `frontendEditorRules.test.ts` | The 2026-10-01 frontend-editor parity flags: code fences; inline style `;` inside url()/quotes; every attribute under React names, booleans present, dropped list, page-only props out of the editor; lossless text (bare formatting kept, split around tags TipTap would change, `<br>` piece, link with an id, `<small>`/nav text); lists as blocks; hamburger `<button>` block; raw elements; image with no src; page scripts order and `external`; `<html>` attributes; crafted page data with bad scripts; sandbox loads scripts before page JS; `alsoTargetTextWrappers` for every text-tag compound. |
| `promptRules.test.ts` | The AI prompt rules: image width/height attributes yield to page CSS; `editorBreakpoints` turns single-width `@media` into `@container lp-page` in em and leaves others; sandbox turns `[data-lp-form]` back into `<form>` and cancels navigation after the page handler; **event tokens survive import** (button hrefs, repeated `{{event_date}}`, `#countdown-target`). |
| `htmlToCanvasNode.test.ts` | The action-menu "Import HTML into a node" path returns class rules (not the pasted HTML) for `root.css`; `sanitizeCanvasTree` drops the broken entries older imports saved, so those pages load again (2026-10-01 crash). |
| `readHtmlFile.test.ts` | The Import HTML upload reader: UTF-8 text intact, BOM dropped, empty and oversized files rejected, read errors reported |
| `remapNodeId.test.ts` | Moving the root id on import: generated ids everywhere, the word `root` only as a whole value (never `contentType`), a restored export stays a root node |

### 3.2 `src/tests/security/security.test.ts`

| Block | Protects |
|---|---|
| `safeHref`, `safeMediaUrl`/`safeFrameUrl` | Normal links, anchors, mail/tel and `{{placeholders}}` kept; script schemes blocked however disguised; media data URLs allowed but not HTML; iframes only absolute http(s). |
| `sanitizeCss` | Ordinary CSS intact; only Google Fonts imports; escaped imports dropped; unsafe `url()` blanked; script-capable declarations dropped. |
| `sanitizeCanvasTree` | Unsafe URLs blanked in every field type; `on*` attributes dropped; `plainCss` sanitized, `plainJS` left for the sandbox; input not mutated. |
| `buildSandboxDocument` | Never `allow-same-origin`; snapshot keeps anchors in-frame, outbound links to the real tab; jQuery only when used; `muted` video; inline SVG restored without scripts/handlers, other SVG images left; frame scrolls its own window, parent's 100vh box dropped; `#links` scroll instead of loading the parent URL; root base font kept over host `html` font size; builder + page CSS copied, not the host's; form field live state. |

### 3.3 `src/tests/tiptap/trailingNode.test.ts`

TipTap (the rich-text editor library) `trailingNode` is off on purpose in `src/libs/tiptap/config`:
with it on, clicking into imported heading text added an empty `<p>`. The test checks our
`extensions` don't add one, and that plain `StarterKit` does (so the test proves the cause).

### 3.4 `src/tests/panel/`

| File | Protects |
|---|---|
| `companionStyles.test.ts` | Border/flex/max-width companion rules; cleared values add nothing. |
| `rotate.test.ts` | `parseRotate` units and `none` = 0; `normalizeDegrees` wrapping. |

### 3.5 `src/tests/export/`

| File | Protects |
|---|---|
| `reactExport.test.ts` | The React project export (30 tests): attribute and style-object conversion, text and whitespace rules, the unchecked spread for tag-only attributes, reading the rendered page (`data-id` rules), the wrapper and parts, repeated items as a component and a typed list, naming, the boxed page, the two groups of stylesheets and their order, the script plan, and a zip round trip with non-Latin text. See [08](08-export-react-project.md). |

The generated project itself is checked live, not by a unit test (see "Verifying a change by measurement" in [08](08-export-react-project.md)): click the export button in Playwright, unzip, run `tsc --noEmit` and `vite build`, serve it, and compare section heights with Preview.

## 4. How to run

From `react-dev/landing-page-builder`:

```bash
npx vitest run                               # whole suite (jsdom)
npx vitest run src/tests/import              # one folder
npx vitest run src/tests/import/fullPage.test.ts
npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -c "error TS"
```

- **Tests:** 312 tests as of 2026-10-02 (log), all passing; 35 test files. On 2026-10-02 (this doc),
  one full-suite run failed `buildImportedScript > runs DOMContentLoaded handlers...` and the
  same file passed on its own: that test waits a fixed 20ms, so it can be flaky under load.
  Re-run the file before treating it as a real failure.
- **Typecheck:** the app has a pre-existing error baseline. The logs record 227 (2026-09-25 to
  09-30) and 226 (2026-10-01 and 10-02). A run on 2026-10-02 gave 227: the extra one is in the
  untracked `src/utils/dateParaser.ts`, which isn't part of this feature. Rule: grep the output for the files
  you touched, and confirm the total didn't go up. `-p .` only follows project references and
  checks nothing.

## 5. The probe-test technique

To see exactly what the converter produces for some HTML, write a throwaway test, run it, read
the output file, and delete it:

1. Create `src/tests/import/tmp-probe.test.ts` (any `tmp-*.test.ts` name; the vitest include
   picks it up).
2. In it: import `htmlToJsonTree` from `@/utils/htmlToCanvasNodes`, read a page (for example
   `codeToNodeTestCodeFiles/test3.md`, which is plain HTML) with `fs.readFileSync`, call
   `htmlToJsonTree(html)`, and `fs.writeFileSync` the result as JSON (pretty-printed) to a
   scratch file. Add one trivial `expect` so the test passes.
3. `npx vitest run src/tests/import/tmp-probe.test.ts`.
4. Read the JSON (`root`, `css`, `js`, `skipped`, `external`).
5. **Delete the tmp file** before you finish. It must never be committed.

The same output is what the live measurement feeds into the page (section 6).

## 6. Live measurement

"Looks right" is checked by numbers. Method used on 2026-09-29, 09-30 and 10-01:

1. **Pages.** `codeToNodeTestCodeFiles/`:

   | File | Page | Notes |
   |---|---|---|
   | `test1.md` | Master Chief - The Reclaimer | modal, countdown |
   | `test2.md` | Master Chief: Spartan Legacy | 4,639 lines; reveal animation on a ticket card |
   | `test3.md` | Salt & Ember (Master Chef) | tabs (hidden 2nd day), SVG kitchen timer, dark mode, `#faq` link |
   | `test4.md` | Lumière Fashion Show 2025 | added 2026-10-01; one Unsplash image 404s |
   | `test5.md` | AETHER - Fashion Exhibition | empty on 2026-10-01; has content now; not in the measured tables |
   | `test6.md` | Asia Design Awards 2026 | follows the AI prompt; button color bug |
   | `prompt.md` | the AI prompt | keep in sync with `src/components/EditorUI/importHtmlPrompt.ts` |
   | `prompt-lowes-has-talent.md` | a client prompt | not a test page |

2. **Target.** Either the Vite dev server with page 11, or the logged-in local Judgify site
   (`local.newjudgify.me/landing-page-builder/builder_authenticator?email=`) with page 67, which
   includes the host site's CSS and is the most realistic. Page 67 needs the account that owns
   it (`dev3@judgify.me` gets a 401).
3. **Feed the import without saving.** Convert the page (probe test), then in Playwright answer the
   page-data request with it: `context.route('**/get_landingpage_data/11', ...)` for the editor and
   Preview; RenderPage reads `get_data_landingPage/*`. Nothing goes to `db.json`.
4. **Original.** Render the original HTML with `page.setContent` at **1304px** (the editor root,
   81.5em at 16px).
5. **Measure.** In the original, the editor (100% zoom) and Preview (read the sandbox through
   `frameLocator`/`contentFrame()`): for every text node, computed `color`, `font-size`,
   `font-weight`, `font-family`; each section's height; total page height. Also count nodes whose
   size differs between editor and Preview.
6. **Read the result** against known differences: `100vh` is 900px in the importer, so a 1000px-tall
   window shows a hero gap; the editor shows hidden content and open `<details>`, so it is taller.
7. **Behavior.** In the Preview frame: page JS runs (countdown ticks, tabs switch, dark-mode toggle),
   `#anchor` links scroll inside the frame, forms don't navigate, no console errors.

Results on 2026-10-01 (Preview vs original height): test1 6062/6068, test2 9753/9856, test3
7329/7236, test4 4007/4047, test6 7421/7424; no color or weight mismatches.

## 7. run-editor-and-screenshot gotchas

- **Port.** `npm run dev` runs Vite and json-server together. Vite moves past 5173 if it's busy;
  grep the log for `Local:`. The user's frontend-editor Vite server may hold `[::1]:5173`, which
  `localhost` resolves to, so use `http://127.0.0.1:<port>`.
- **json-server.** Port 3000 may already be running from an earlier launch; the new one then exits
  with `EADDRINUSE`. That's harmless if `curl -s http://localhost:3000/get_landingpage_data/11`
  returns JSON. Routes are in `routes.json`.
- **URL.** `/landing-page-builder/editor/<id>` for the editor, `/landing-page-builder/preview/<id>`
  for Preview; anything else renders RenderPage.
- **Proxy.** An `http_proxy`/`https_proxy` env var makes Chromium route localhost through it and hang.
  Launch with `args: ['--no-proxy-server', '--proxy-bypass-list=*']` or unset the vars.
- **Cold start.** The first navigation after `npm run dev` can take 30s+ (Vite pre-bundling); a
  503 right after start means retry. Use `waitUntil: 'domcontentloaded'`, not `networkidle` (the
  HMR WebSocket never idles).
- **Module resolution.** A driver script outside the project can't find `playwright`; put it in
  the project or set `NODE_PATH` to the project's `node_modules`.
- **Onboarding tour.** Set `landing_page_builder_onboarding_tour_seen` in localStorage from an init
  script, wrapped in try/catch (the init script also runs in sandboxed frames, where storage throws).
- **Property panel.** Opening it by clicking a canvas node is unreliable in Playwright; don't spend
  long on it.
- **Read every screenshot.** A blank dark canvas is a failed launch, not an empty page.

## 8. Build and tooling traps

- **`vite build` writes into tracked files.** `vite.config.ts` pins `rollupOptions.output.dir` to
  `../../public/js/landing-page-builder` (the committed Laravel bundle) with `emptyOutDir: true`, which
  overrides `--outDir`. After a check-only build, run `git restore public/js/landing-page-builder`
  from the repo root and check `git status` for new files. Rebuild the bundle only when the user asks.
- **Shell heredocs.** An unquoted heredoc (`<< EOF`) treats backslashes as escapes, so regexes and
  escape sequences written through it lose characters. Use a quoted heredoc (`<< 'EOF'`) or the
  Write/Edit tools.
- **Write/Edit tools and unicode escapes.** A backslash-u escape (backslash, `u`, four hex digits)
  in the content is written as the real character. This matters for the export's escaped `<` and
  for invisible-character checks in `safeUrl.ts`. Build such characters in code
  (`String.fromCharCode`, code-point comparisons like `isInvisible`), not as literal escapes.
- **Python non-raw strings** turn backslash-b into a backspace byte. Use raw strings.
- **Check after editing** a line with a regex or escapes: `od -c` (or `grep -n` the exact
  characters) to confirm the bytes are what you meant.
- **Never commit until the user says so**, and check `git status` for their unrelated work first.

## 9. Why this approach

| Decision | Chosen | Alternatives | Why |
|---|---|---|---|
| Fidelity check | Computed-style measurement against the original | Checking by eye/screenshots | The user's report "most of text color doesn't match" (2026-09-29) was only pinned down by measuring: 54 of 165 text colors differed in the editor and 38 in Preview, from three causes. |
| Feeding test pages | Playwright `route` swap | Saving to `db.json` | Nothing is written; any page id can show any test page. |
| Converter inspection | Throwaway `tmp-*.test.ts` | A dev-only UI or script | The test runner already has jsdom, the `@` alias and TipTap; nothing to maintain. |
| Unit tests | Pure functions (converter, sanitizers, helpers) under jsdom | Renderer component tests | Not tried. Renderer parity is checked live instead. |

## 10. How to modify or extend

- **New converter rule:** add a case to the test file for its area (table in 3.1). A new flag
  batch of rules can get its own file, like `frontendEditorRules.test.ts` and `promptRules.test.ts`.
- **New security rule:** `src/tests/security/security.test.ts`, in the block for the function.
- **New test page:** add `codeToNodeTestCodeFiles/testN.md` (a full HTML document), measure its
  original height, and record the results in the work log.
- **New sandbox snapshot step:** a `buildSandboxDocument` test in `security.test.ts`.

## 11. Gotchas and known limits

- The flaky 20ms wait in `htmlToJsonTree.test.ts` (section 4).
- There are no renderer unit tests. A change to `NodeMap/*` or `Elements.tsx` needs a live measurement.
- `test5.md` was empty when the 2026-10-01 tables were made; there's no baseline for it.
- Page 67 belongs to a specific account. The `builder_authenticator` route logs anyone in by
  `?email=` with no password (flagged to the user 2026-09-30; it is outside this app).
- Event tokens can't be checked in Preview (no event); use a real published event.

## 12. Checklist for any change to code to node

1. **Flag.** A new behavior gets `enable_<feature>` in `src/configs/editor.config.ts` with a
   one-line comment, default matching the newest flags (today `true`), gated at the real call site.
2. **Test.** Add a case to the matching `src/tests/import/` (or `security/`) file. Run
   `npx vitest run` and the typecheck against the baseline.
3. **Renderers in step.** Editor (`src/components/EditorUI/NodeMap/*`, `MotionWrapper`) and production
   (`src/components/PreviewUI/Elements.tsx`) must render the same element and styles
   ([06](06-rendering-parity-and-event-widgets.md)).
4. **Sanitizer.** New URL fields are named so `sanitizeCanvasTree` finds them (`...href`,
   `...ImageUrl`, `src`, `url`, `link`); new CSS paths go through `sanitizeCss`; no `on*`.
5. **Sandbox snapshot.** If the live DOM gains state or markup the frame needs (form values, SVG,
   forms), update `buildSandboxDocument` and its tests ([05](05-scripts-sandbox-and-security.md)).
   Never add `allow-same-origin`.
6. **Export.** Check `buildExportHtml` writes what the page needs, and that export → re-import still
   restores the exact tree ([07](07-custom-code-export-and-roundtrip.md)).
7. **AI prompt.** If the rule changes what markup works, update `importHtmlPrompt.ts` and
   `codeToNodeTestCodeFiles/prompt.md` together.
8. **Live measurement** on the test pages (section 6); write the numbers in the work log.
9. **Docs.** Update `.claude/skills/code-to-node/SKILL.md` and the doc in this folder for the area
   you changed.
10. **Build.** Restore `public/js/landing-page-builder` after a check-only build.
11. **Don't commit** until the user asks.
