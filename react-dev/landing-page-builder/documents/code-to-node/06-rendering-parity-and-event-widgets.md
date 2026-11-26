# 06 - Rendering parity and event widgets

## 1. Purpose

An imported page is drawn by three different renderers: the editor canvas, Preview, and the
published page (RenderPage). If any of them adds its own layout (a wrapper, a forced
`position`, a line clamp, a builder font weight), the page looks different in each place and the
user can't trust what they edit. This part keeps the three renderers producing the same elements
with the same styles, and lists the few editor-only differences that are on purpose.

The second half covers **event widgets**: `{{event_*}}` tokens in imported buttons and text that
the published page fills in from the Judgify event (submit/register URLs, the deadline).

## 2. Where it lives

| File | Key functions / components | Role |
|---|---|---|
| `src/components/EditorUI/NodeWrapper/MotionWrapper.tsx` | `MotionWrapper` | Every editor node's element. Renders the node's real tag through `as`, drops Radix's `type="button"`, gives void tags no children. |
| `src/components/EditorUI/NodeMap/Container.tsx` | `Container` | Editor renderer for root, sections and blocks (layout nodes). |
| `src/components/EditorUI/NodeMap/Contents.tsx` | `Text`, `Image`, `Video`, `Button`, `FormField`, `Table` | Editor renderers for content nodes. |
| `src/components/EditorUI/Nodes.tsx` | imports `Container` and the `Contents` renderers | Wires the NodeMap renderers into the canvas. |
| `src/components/PreviewUI/Elements.tsx` | `Root`, `Section`, `Block`, `Text`, `Image`, `Button`, `FormField`, `eventDeadlineMap` | Production renderers, shared by Preview and RenderPage. |
| `src/utils/nodeAttributes.ts` | `passthroughAttributes`, `PAGE_ONLY_PROPS`, `VOID_TAGS`, `CONTAINER_TAGS`, `keepsPageColor`, `IMPORTED_PAGE_ATTR` | Which source attributes a renderer may spread, per place (`'page'` or `'editor'`). |
| `src/utils/pageScope.ts` | `isImportedPage`, `scopePageCss` | Detects an imported root (`data-lp-page`); scopes tag-only page CSS (see [04](04-css-scoping-and-units.md)). |
| `src/context/EditorContext.tsx` | `syncClassStyle`, `updateNodeStyle`, `primaryClassName` | Class-aware style edits; skipped on imported pages. |
| `src/css/editor.css` | `.judgify-editor h1..h4` weight rules | Builder heading weights, which skip imported pages. |
| `src/hooks/useResolvedEventHref.ts` | `eventName`, `eventRouteMap`, `useEventRouteResolver`, `useResolvedEventHref` | Maps an href token to a key of the event's routes. |
| `src/consts/event-widgets.const.ts` | `EVENT_ROUTES`, `EVENT_DEADLINE` | The token strings. |
| `src/pages/Editor.page.tsx`, `Preview.page.tsx`, `RenderPage.page.tsx` | page CSS `<style css-class>` effect | Inject the page CSS at the end of `<body>`. |
| `src/configs/editor.config.ts` | `enable_editor_open_details` | The only flag in this part. |

## 3. How it works

### 3.1 The same element in every renderer

1. **Real tags.** An imported container keeps its source tag in `node.tag` (allowlist
   `CONTAINER_TAGS`). The editor `Container` passes `as={node.tag ?? (isSection ? 'section' : undefined)}`
   to `MotionWrapper`, which renders `motion[as]` instead of `motion.div`. Production `Root`,
   `Section` and `Block` render `node.tag ?? 'div'` (root/block) or `node.tag ?? 'section'` (section).
   So an untagged section is a `<section>` in both places.
2. **Buttons and links.** The editor `Button` passes `as` only for `node.tag === 'a' | 'button'`.
   The editor `<a>` never gets an `href` (`passthroughAttributes` never outputs href/target), so a
   click can't leave the editor. Production `Button` renders `<a href>` when there is a resolved
   URL, otherwise `<button>`.
3. **Form fields.** The editor `FormField` passes `as={node.tag}` (input/select/textarea) and makes
   it inert (read-only, select won't open, toggles won't flip). Production renders the working element.
4. **Radix `type="button"`.** `PopoverWrapper` wraps every node in `PopoverTrigger asChild`, which
   adds `type="button"` to the child. `MotionWrapper` removes `type` from the props and only puts
   it back on a real `<button>` (default `'button'`) or an `<input>` whose own type isn't `button`.
5. **Void tags.** `MotionWrapper` and production `Block` give no children to tags in `VOID_TAGS`
   (br, wbr, hr, img, source, track, area) - not even the editor's own controls.
6. **Attributes.** Renderers spread `passthroughAttributes(node.attributes, where)` **before** their
   own props, so the editor's `data-id`, `data-node-path`, handlers and styles always win.
   The editor passes `'editor'`, which leaves out `PAGE_ONLY_PROPS`
   (`hidden`, `inert`, `popover`, `disabled`, `draggable`, `autoPlay`).
7. **Class names.** Every renderer passes `node.attributes.className` through. See 3.4.

### 3.2 Editor-only layout that was removed (per work_history 2026-09-30)

- **Text style on the node element.** The editor `Text` puts the node style on the
  `MotionWrapper` element (like Preview's outer text `<div>`). Only collapsable text keeps the style
  on the inner `EditorContent`, like Preview's inner div.
- **Line clamp only for collapsable text.** Both renderers set `-webkit-box` + `overflow: hidden` +
  `WebkitLineClamp` only when `node.collapsable` and collapsed (`clamped` in the editor `Text`; the
  collapsable branch of production `Text`). `overflow: hidden` creates a new block formatting
  context, which stops the text's margins from collapsing with its neighbours.
- **Blocks are not `position: relative`.** `Container` adds `relative` only to root and sections
  (they anchor the "Add Section" button and the side tab). A block gets `position: relative` only
  while its grid overlay is shown and it has no position of its own. Otherwise a page's
  `position: absolute` element would find a different containing block in the editor.
- **No forced centering for images.** The editor `Image` adds `!flex !items-center !justify-center`
  only to the empty placeholder (`!hasPicture`).
- **Builder heading weights.** `src/css/editor.css` sets `.judgify-editor h1 { font-weight: 800 }`
  (h2 700, h3 600, h4 500) as `h1:not(:where([data-lp-page] *))`. Preview and RenderPage also carry
  the `judgify-editor` class, so the skip matters there too. `:where()` keeps the selector's
  specificity unchanged.

### 3.3 Production `Root`: `min-h-full`

`Root` in `Elements.tsx` renders `className={cn("w-full min-h-full", className)}` and the root
style **minus its `width`** (that width is the editor canvas size, see `Canvas.tsx`). It also sets
`data-id` so per-device CSS (`useResponsiveCss`) can target it.

Why `min-h-full`: on 2026-09-25 the user's page had `#pmha-page { overflow: hidden }`. Once the
root carried that id, `h-full` pinned the root to the scroller's height, and the hidden overflow
clipped everything below the first screen. With `min-h-full` the root grows with its content.

### 3.4 The `cn(className, ...)` rule

`cn` (`src/libs/cn.ts`) is `twMerge(clsx(...))`. `clsx` drops `undefined`/`false`, so
`cn(node.attributes?.className, "mx-auto")` never prints the word `undefined`.
`className + " mx-auto"` does: on 2026-09-25 classless nodes were exported as
`class="undefined mx-auto"` from production `Section` and `Button`, fixed with `cn()`.

What the code does today:

| Renderer | Pattern |
|---|---|
| `Root`, `Section`, `Button`, `Table` (Elements.tsx) | `cn(...)` |
| editor `Container`, `Text`, `Image`, `Button`... | `cn("builder classes", node.attributes?.className)` |
| `Block` (Elements.tsx) | `` `${node.attributes?.className ?? ""} ` `` (safe, but not `cn`) |
| `Text`, `Image`, `FormField` (Elements.tsx) | `className={node.attributes?.className}` (React omits an undefined prop) |

Note: the skill phrases the rule as `cn(className, "...")`. The editor puts the page class last.
Both are safe from "undefined"; argument order only matters to `twMerge` when two Tailwind
classes conflict, and imported page classes carry an `lp-` prefix, so they never do.

### 3.5 Imported-page behaviors (`isImportedPage`)

`isImportedPage(root)` is true when the root has a `data-lp-page` attribute (set by the importer).

| Where | Behavior | Why |
|---|---|---|
| `Container` | No blue empty-block tint (`bg-blue-200/50`) | Empty elements are kept on purpose (hamburger bars, CSS-drawn shapes); the tint would cover the page's own look. Classed blocks skip it too. |
| `EditorContext.syncClassStyle` | Returns early: a style edit stays on the edited node | See below. |
| Editor/Preview/RenderPage page CSS effect | Runs `scopePageCss` on `plainCss` again | Covers pages imported before scoping existed. The editor also runs `editorBreakpoints` (flag `enable_editor_page_breakpoints`). |

**The test6 button color bug (2026-10-01).** `syncClassStyle` is the builder's class-aware
editing: a style edit on a node with a class is written to `root.css[primaryClass]` and copied to
every node sharing that first class. All imported buttons share `.btn`, so changing one button's
text color recolored all four buttons on test6. On imported pages the page's own stylesheet
already styles every `.btn`, so the fan-out is skipped. Buttons recolored before the fix keep
their color.

### 3.6 `hidden` and `<details>` in the editor

- `hidden` (and the other `PAGE_ONLY_PROPS`) apply on the page, not the editor. A tabbed schedule's
  second panel is visible and editable on the canvas; Preview and the published page hide it until
  the page script reveals it. This is why the editor is taller than Preview on test3.
- `enable_editor_open_details`: `Container` adds `open` to an imported `<details>` in the editor, so
  FAQ answers can be edited. Preview/published keep the source state (an `open` attribute in the
  source is kept by `enable_import_all_attributes`). This is why the editor is taller on test3/test6.

### 3.7 Page CSS order

Editor, Preview and RenderPage each append one `<style css-class>` to the **end of `<body>`**,
holding the class CSS plus the (scoped) `plainCss`. Being last, the page's rules win ties with the
builder's Tailwind and the host site's stylesheets.

## 4. Event widgets

### 4.1 The tokens

| Token | Where | Filled from | Filled by |
|---|---|---|---|
| `{{event_submit_entry_url}}` | button/link `href` | `event_route.submit_an_entry_url` | production `Button` via `eventRouteMap` |
| `{{event_register_url}}` | button/link `href` | `event_route.register_url` | production `Button` via `eventRouteMap` |
| `{{view_entries}}` | button/link `href` | `event_route.view_entries` | `eventRouteMap` (see Gotchas: name mismatch) |
| `{{event_date}}` | text | `event_deadline.end_date` | production `Text` |
| `{{event_hour}}` | text | `event_deadline.end_hour` | production `Text` |
| `{{event_timezone}}` | text | `event_deadline.timezone` | production `Text` |
| `{{event_timezone_offset}}` | text | `event_deadline.timezone_offset` | production `Text` |

The data comes from `useGetRenderPageDataQuery(eventName)` (`RenderPageQueryData`:
`event_route`, `event_deadline`).

### 4.2 How the renderers fill them

1. **Where tokens resolve.** `eventName` in `useResolvedEventHref.ts` is `''` on
   `/landing-page-builder/editor` and `/preview` routes, so the query is skipped and `data` is
   undefined. Only RenderPage (the published URL) has a real event name.
2. **Button.** `resolvedUrl` is `node.attributes.href` until data arrives. With data, if the href
   is a key of `eventRouteMap`, it becomes `data.event_route[route]`. If that route URL is `"#"`,
   the button renders nothing (`<></>`) - the event doesn't offer that action.
3. **Text.** `resolvedChildren` replaces every occurrence of each deadline token in the stored
   TipTap JSON string with `text.split(token).join(value)`, then `generateHTML` renders it. Until
   2026-10-02 only the first occurrence was replaced (a `.replace` with a string); a page that
   shows the deadline in the hero and the CTA band showed a raw token in the second place.
4. **Editor.** The editor `Text` and `Button` never resolve tokens; the user sees and edits them as text.
5. **Preview** shows raw tokens (`{{event_date}}`), and the AI prompt's countdown stays hidden,
   because there is no event data there.
6. **Sandboxed published page.** RenderPage renders the page first (hidden), then snapshots it into
   the sandbox frame. The page JS runs on the snapshot, so it reads the already-filled text (the
   query result is the same one RenderPage itself waits for).

### 4.3 How the importer keeps them

Nothing in the importer is token-specific; the tokens survive because no step changes them:

- `safeHref` (`src/utils/security/safeUrl.ts`) finds no scheme in `{{...}}` and keeps it
  ("relative URLs, #anchors and {{placeholders}} pass through").
- Id renaming only touches `#id` hrefs, so token hrefs are left alone.
- Text tokens are plain characters inside TipTap text.

`promptRules.test.ts` ("event widgets in imported pages") locks this in: both button hrefs, two
`{{event_date}}` in one text, and the hidden `#countdown-target` text
`{{event_date}}T{{event_hour}}{{event_timezone_offset}}`.

### 4.4 The AI prompt's countdown

`src/components/EditorUI/importHtmlPrompt.ts` ("Event widgets" section) asks for a
`<div id="countdown" hidden>` and a hidden `<p id="countdown-target">` built from the tokens. The
page script reads the target, and removes `hidden` only if `Date.parse` gives a future time. The
id becomes `lp-countdown-target` on import; the script's string literal is renamed too, and
`ID_FALLBACK_SCRIPT` covers lookups built at runtime (see [05](05-scripts-sandbox-and-security.md)).

## 5. Why this approach

| Decision | Chosen | Alternatives | Why |
|---|---|---|---|
| Parity method | Remove editor-only layout from the editor renderers so the editor draws the same DOM as Preview | **Tried and reverted, 2026-09-29:** a frameless Preview (built on request; the user restored the framed Preview). Not tried: rendering the editor canvas inside an iframe. | The editor's wrappers were the cause of the differences (measured on 2026-09-30). Fixing them keeps one DOM shape everywhere. |
| Real tags | `node.tag` + `MotionWrapper as` + production `Tag` | Before 2026-09-29 every container was a `<div>`. | Page CSS targets tags (`.nav ul`, `details > summary`); `<details>` needs a real `<summary>`. |
| Radix `type` | Strip it in `MotionWrapper` | Not tried: replacing `PopoverTrigger asChild`. | One place fixes every node. Bootstrap's `[type=button] { appearance: button }` drew every node as a native button (inline-block spans, dark buttons). |
| Root height | `min-h-full` | `h-full` (the old code) | Fixed-height root + imported `overflow: hidden` blocked scrolling (2026-09-25). |
| Class fan-out on imported pages | Skip `syncClassStyle` | Keep fan-out (all `.btn` change together). | The user reported the fan-out as a bug (test6). The page CSS already shares the look. |
| `hidden` | Page only | Apply it in the editor too. | Hidden content (second tab, modals) must stay editable; the editor never runs page JS, so nothing would ever reveal it. |
| Token fill | `split/join` on the TipTap JSON string | A global regex replace. Reason for split/join over a regex not recorded. | Replaces every occurrence with no regex escaping of `{{`/`}}`. |

## 6. How to modify or extend

**To add an imported tag that must render as itself:**
1. Add it to `CONTAINER_TAGS` in `src/utils/nodeAttributes.ts` (and `VOID_TAGS` if it can't hold children).
2. Check `motion[tag]` exists for it (Motion supports standard HTML tags); the `as` type is `ContainerTag`.
3. Nothing else in the renderers: `Container` and `Block` use `node.tag` already.
4. Add a case to `src/tests/import/domFidelity.test.ts` or `frontendEditorRules.test.ts`.
5. Measure the page in the editor and Preview (section 8).

**To add an editor-only behavior for imported pages** (like the open `<details>`):
1. Add an `enable_<feature>` flag in `editor.config.ts` with a one-line comment.
2. Gate it at the editor renderer (`Container.tsx` or `Contents.tsx`) with `isImportedPage(canvas.content)` or a `node.tag` check.
3. Leave Preview/RenderPage alone unless the published page should change too.
4. Note the editor/Preview height difference it causes in the work log, so later measurements aren't misread.

**To add a page-only attribute** (applied on the page, never in the editor): add it to
`PAGE_ONLY_PROPS` in `nodeAttributes.ts`; if it's a boolean, also to `BOOLEAN_PROPS`.

**To add a new event token:**
1. Add the token to `src/consts/event-widgets.const.ts`.
2. Href token: add it to `eventRouteMap` in `src/hooks/useResolvedEventHref.ts`, and the key to `EventRoute` in `src/types/contentFile.type.ts`.
   Text token: add a `fill(...)` line in production `Text` (`Elements.tsx`), and the key to `EventDeadline`.
3. Add it to the "Event widgets" section of `importHtmlPrompt.ts` and `codeToNodeTestCodeFiles/prompt.md` (keep both in sync).
4. Extend the event-widgets test in `src/tests/import/promptRules.test.ts`.
5. Check it on a real published event; Preview can't show it.

**When you change any renderer:** change the editor (`NodeMap/*`) and production (`Elements.tsx`)
in step, and check the sandbox snapshot still copies what you added (`sandboxDocument.ts`, see [05](05-scripts-sandbox-and-security.md)).

## 7. Gotchas and known limits

- **Editor taller than Preview on purpose:** hidden content and open `<details>` show in the editor.
  Compare editor vs Preview per node, not just by total height.
- **`100vh`** is 900px in the importer (`VIEWPORT_PX`), so a test window of a different height shows
  a gap in hero sections. Not a renderer bug.
- **`{{view_entries}}` vs `{{event_view_entries}}`:** `eventRouteMap` uses `{{view_entries}}`, but
  `EVENT_ROUTES.VIEW_ENTRIES` is `{{event_view_entries}}`. A link written with the constant won't
  resolve. Reason not recorded; check before relying on View Entries.
- **Unchecked deadline values:** `db.json` only has sample deadline values, so whether the real
  date/hour/offset build a valid `Date.parse` string is still to check on a real event (log 2026-10-02).
- **Token values go into a JSON string:** `Text` replaces tokens inside the serialized TipTap JSON before
  `JSON.parse`. A value containing `"` or a backslash would break the parse. Today's values
  (dates, hours, zone names) don't contain them.
- **Images style twice:** both the image wrapper and the `<img>` get `node.style` (editor and
  production). The `<img>` drops `rotate` so the picture turns once. Other properties (a border, for example)
  apply to both elements. Reason not recorded.
- **Stale comment:** `Container.tsx`'s doc comment says it is "Not yet wired into
  CanvasNodeComponents". It is: `Nodes.tsx` imports and uses it.
- **Save-time token check unused:** `Editor.page.tsx` `savePageData` calls `checkEventPlaceholders(data)`
  and ignores the result.
- **Older imports** keep the data from before a rule existed until re-imported (only the CSS
  scoping is re-applied at render time).

## 8. Tests and how to verify

Unit tests (`npx vitest run`):

| File | Covers |
|---|---|
| `src/tests/import/domFidelity.test.ts` | Real tags, off-list tags as div, attribute passthrough per place |
| `src/tests/import/fullPage.test.ts` | `hidden` on the page but not the editor canvas; link/button tags |
| `src/tests/import/frontendEditorRules.test.ts` | Page-only attributes kept out of the editor; void/raw elements |
| `src/tests/import/promptRules.test.ts` | Event tokens survive import |
| `src/tests/import/pageScope.test.ts` | `isImportedPage`, scoped page CSS |

There are no unit tests for the renderers themselves; parity is checked live.

**How to verify parity (the method from work_history 2026-09-29/30 and 2026-10-01):**
1. Start the dev server (`run-editor-and-screenshot` skill). Use page 11 on the dev server, or the
   logged-in local site with page 67 (see [09](09-testing-and-verification.md)).
2. With Playwright, swap the page data with `context.route('**/get_landingpage_data/11', ...)`
   for a test page from `codeToNodeTestCodeFiles/` (converted with `htmlToJsonTree`). Nothing is saved.
3. Render the **original** HTML with `page.setContent` at the editor's root width (1304px = 81.5em).
4. Open the editor at 100% zoom and Preview (read the frame through `contentFrame()`).
5. For every text node, compare computed `color`, `font-size`, `font-weight` and `font-family`
   with the original. Compare each section's height and the total page height.
6. Compare editor vs Preview node by node (count nodes whose size differs).
7. Expected (2026-10-01): no color or weight mismatches on test1-4 and test6; total heights within a
   few px except the known `100vh` and open-content differences.
8. For event tokens: Preview must show the raw tokens; check a real published event for filled values.
