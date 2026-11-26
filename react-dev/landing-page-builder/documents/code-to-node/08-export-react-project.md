# 08. Export as a React project

## Purpose

Preview's **Export React** button turns the page you see into a Vite + React + TypeScript project and downloads it as a `.zip`. A developer unzips it, runs `npm install` and `npm run dev`, and has the page as components they can edit: one file per part of the page (navbar, each section, footer), and repeated items (cards, menu entries, reviews) as one component plus a typed list of their words, pictures and links.

It sits next to the older **Export** button (single `.html` file, see [07](07-custom-code-export-and-roundtrip.md)). It was modelled on the React export in the user's own app `frontend-editor` (`D:\Q_P\frontend-editor`, `src/features/export/react/*`, merged as `589adcd`; the pipeline and most helpers were ported from there).

## Where it lives

| File | Key functions | Role |
|---|---|---|
| `src/pages/Preview.page.tsx` | `handleExportReact`, `exportAssets`, the "Export React" button | The button, its busy state and toasts; passes the page's CSS/JS and the `is_boxed` setting |
| `src/utils/reactExport/exportReactProject.ts` | `exportReactProject` | Loads the converter and `fflate` on demand, builds the files, zips them and downloads `<title>-react.zip` |
| `src/utils/reactExport/buildReactProject.ts` | `buildReactProject`, `projectSlug` | The orchestrator: parse, split into parts, write every file |
| `src/utils/reactExport/domToNodes.ts` | `parseRenderedHtml` | Reads the rendered markup into a small node map; drops handlers, empty ids, unreferenced `data-id`s, scripts |
| `src/utils/reactExport/jsxWriter.ts` | `writeElement`, `openTag` | Writes JSX for one element and everything in it |
| `src/utils/reactExport/jsxAttrs.ts` | `jsxAttr`, `jsxAttrName`, `styleJsx`, `styleEntries`, `cssPropName`, `isKnownAttribute`, `attrValueCode` | HTML attribute -> React attribute, inline `style` -> style object, tag-only attributes |
| `src/utils/reactExport/names.ts` | `createNaming`, `createNameRegistry`, `createPropNames`, `pascalCase` | Component and prop names |
| `src/utils/reactExport/repeats.ts` | `findRepeats` | Finds runs of same-shaped siblings and turns what differs into props |
| `src/utils/reactExport/componentFiles.ts` | `partComponent` | One `.tsx` per part, plus the item components and their typed lists |
| `src/utils/reactExport/pageScripts.ts` | `planScripts` | Decides which scripts stay as tags and which move to `public/scripts` |
| `src/utils/reactExport/runnerTemplate.ts` | `runnerSource` | `src/runPageScripts.ts` of the exported project |
| `src/utils/reactExport/projectTemplates.ts` | `packageJson`, `TSCONFIG`, `VITE_CONFIG`, `mainTsx`, `BUILDER_CSS`, `readme` | The fixed files, the builder's default CSS, the README |
| `src/utils/reactExport/types.ts` | `NodeMap`, `isBlankText`, `collapseSpaces` | Shared types and the whitespace helpers |
| `src/utils/exportHTML.ts` | `htmlTagAttributes`, `escapeHtml`, `ExportHtmlAssets` | Shared with Export HTML: the `<html>` attributes and the asset shape |
| `src/utils/htmlToCanvasNodes.ts` | `splitDeclarations` (now exported) | Splits an inline style on `;` outside quotes and parentheses |
| `src/configs/editor.config.ts` | `enable_export_react` | Feature flag (default `true`) |
| `src/tests/export/reactExport.test.ts` | 30 tests | See "Tests" |

Dependency added: `fflate` (`^0.8.3`, the same zip library `frontend-editor` uses), loaded with a dynamic `import()` so it and the converter stay out of the main bundle.

### Feature flag

| Flag | What it gates | Where it is checked |
|---|---|---|
| `enable_export_react` | The "Export React" button and the toast host on Preview | `Preview.page.tsx` |

## How it works

### 1. Clicking Export React (`Preview.page.tsx`)

`handleExportReact` calls `exportReactProject(elementRef, data.title, exportAssets(), { boxed: data.is_boxed === 1 })`. `exportAssets()` is the same asset object the old Export button builds (animation CSS, responsive CSS, class CSS, `plainCss`, `classJs`, `plainJS`, and the page tree as `content`); both buttons now call it. While it runs the button reads "Exporting…" and ignores clicks. A toast reports success or failure (the page has its own `<Toaster>` because Preview has no other toast host; the text is plain English like the rest of Preview).

`elementRef` is the rendered page. Preview keeps it rendered even for sandboxed pages (it is only hidden), so the export reads `element.innerHTML`, the same markup Export HTML writes.

### 2. Reading the markup (`parseRenderedHtml`)

The markup is parsed with `DOMParser` into a flat node map (`ElementNode` / `TextNode`, each with an id and parent id). While reading:

- `on*` attributes, empty `id=""`, and `<script>`, `<noscript>`, `<template>` elements are dropped (page code is handled separately, see step 7).
- A `data-id` is kept only when its value appears in the page's CSS or JS (`keepDataId`, built from `referenced` in `buildReactProject`). The builder puts a different `data-id` on every node, so keeping them all would make every card in a row look different.

### 3. Splitting into parts (`buildReactProject`)

- If `<body>` holds exactly one element and that element holds elements (and no loose text), it is the **page wrapper**: it stays in `App.tsx` with its attributes, and each element inside it is a part. In practice this is the builder's root `<div class="w-full min-h-full">` and its sections.
- Otherwise the top-level elements are the parts and `App` returns a fragment.
- If the page is **boxed** (`options.boxed`, from the page's `is_boxed` setting), `App` wraps everything in `<div className="main-container-lp">`. Preview puts that class on a container outside the exported markup, so the export has to add it back.

Each part is written by `partComponent` to `src/components/<Name>.tsx`, and `App.tsx` imports and lists them in order.

### 4. Naming (`createNaming`)

A part is named, in order, from: its `id` (an imported page's `lp-` prefix removed, so `lp-hero` becomes `Hero`; `radix-…` and UUID ids are ignored), its first **own** class, a landmark or heading inside it (`nav` -> `Navbar`, a heading's first three words), then its tag (`Section`, `Block`). Duplicates get a number (`Section2`). React's own names (`App`, `Fragment`…) are avoided.

An **own class** is an imported page's `lp-` class or a class that has a rule in the page's `root.css` (`ownClasses`). Builder pages are full of Tailwind utilities (`flex`, `mx-auto`, `mt-4`), which say nothing about what a part is, so other classes are never used for names.

### 5. Writing JSX (`jsxWriter`, `jsxAttrs`)

- **Attributes** use React names (`class` -> `className`, `for` -> `htmlFor`, `colspan` -> `colSpan={2}`), booleans are bare (`required`), form defaults become `defaultValue` / `defaultChecked`, a `<select>` gets `defaultValue` from its selected option, and `on*` handlers are dropped (React cannot take them as strings).
- **Inline styles become style objects.** The builder styles every node with `style="…"`, so `style="display: flex; gap: 1em"` is written as `style={{ display: 'flex', gap: '1em' }}`. Properties are camelCased (`-webkit-line-clamp` -> `WebkitLineClamp`), `!important` is dropped (React cannot express it), a value with `;` inside `url(data:…;base64,…)` or quotes stays whole (`splitDeclarations`). Three or more declarations go one per line; text-level elements stay on one line. A style with a custom property (`--lp-ink`) gets `as CSSProperties` and the file imports that type, otherwise `tsc` rejects it.
- **Text**: spaces are collapsed the way a browser does, but only plain whitespace (`collapseSpaces`, `isBlankText`). A non-breaking space is real content (the importer relies on it at inline edges), so `\s` and `trim()` are not used. Text holding `{ } < >` or an entity is written as a `{"…"}` string. `<pre>` and `<style>` keep every space and line break. A space between two inline elements on separate lines becomes `{' '}`.
- **Attributes a tag's type does not accept.** React's types allow some attributes only on certain tags (`noValidate` on a `<form>`, not a `<div>`). An imported form becomes `<div data-lp-form novalidate>`, which fails `npm run typecheck`. `isKnownAttribute` (the `TAG_ONLY` table) finds those, and they are written in a spread of a plain object: `<div {...({ noValidate: true } as object)}>`. React still sets them. (A spread of an object with only unknown keys is also a type error, which is why the `as object` cast is there.)

### 6. Repeated items (`findRepeats`, `collectFields`)

Siblings with the same **shape** become one component. The shape (`signature`) is the tag, classes, **inline style**, any kept `data-id`, and where text sits, but not the words or addresses. A run is grouped when the items are card-like tags (`div`, `article`, `li`, `figure`, `a`…) with elements inside, and there are three or more, or two with real structure.

Every text, `src`, `href`, `alt`… that differs between the items becomes a typed prop; the first item's markup becomes the item component and each item's values become a row of the list at the top of the part:

```tsx
const cardItems: CardProps[] = [
  { image: "d1.jpg", imageAlt: "Dish 1", title: "Dish 1", text: "Tasty 1" },
  …
]
… {cardItems.map((item, index) => <Card key={index} {...item} />)}
```

Two things differ from `frontend-editor`: the style is part of the shape (inline styles can differ per card, while `frontend-editor` keeps styles in CSS classes), and a node whose `data-id` CSS points at is never merged (its CSS would hit only the first card). Prop names come from the text's parent (`title` for a heading, `text` for a paragraph, `label` for a link or button, `item` for a list item), else the parent's own class, else `text` (then `text2`, `text3`).

### 7. Scripts (`planScripts`, `runnerSource`)

Same order as Export HTML: jQuery (only when `plainJS` uses it and the page has none of its own), the page's `pageScripts`, `classJs`, then `plainJS` with `ID_FALLBACK_SCRIPT` in front.

- Libraries and data (an `https` `src`, or a type like `application/ld+json`) stay as `<script>` tags in `index.html`, before the app.
- Inline code (modules, `classJs`, `plainJS`) needs the page on screen, so it moves to `public/scripts/page-N.js` / `module-N.js`. `src/runPageScripts.ts` loads them one after the other once React has mounted. While they load, it makes `DOMContentLoaded` and `window` `load` listeners run right away, because those events already happened.
- With no scripts there is no runner file and `App` has no `useEffect`.

### 8. Styles (`BUILDER_CSS`, page CSS)

Two groups:

- **The builder's defaults** (`src/styles/base.css` and `builder.css`), imported by `src/main.tsx`: `#root { display: contents }`, and `BUILDER_CSS`, which holds the rules the builder applies to every rendered page but which are not in the page's own CSS (see "Why a `builder.css`").
- **The page's own CSS** (`public/styles/animation.css`, `responsive.css`, `classes.css`, `page.css`, only the ones the page has), linked with `<link>` tags at the **end of `<body>` in `index.html`**, in the order the builder applies them. `page.css` keeps its `@import` rules first and has `body >` selectors pointed through `#root`.

### 9. Project files and download

`index.html` has the page title, the `<html>` attributes (`htmlTagAttributes`, shared with Export HTML), the Tailwind CDN script, the library tags, the app module and the page stylesheet links. `package.json`, `tsconfig.json`, `vite.config.ts` and `README.md` come from `projectTemplates.ts`. `exportReactProject` zips everything under a `<slug>-react/` folder and downloads it.

## Why this approach

### Start from the rendered page, not from the node tree

- **Chosen:** convert the markup Preview rendered (the same input as Export HTML).
- **Why:** every node type, Ready Made Template and widget is already turned into HTML by the real renderers. Reading the markup covers all of them, and the export looks like Preview by construction.
- **Alternative (not tried):** write JSX per node type straight from the `CanvasNode` tree. The JSX would be cleaner (real props instead of markup), but it would repeat about 25 renderers and drift every time one changes. `frontend-editor` can write from its tree because its nodes already are HTML elements.

### Port `frontend-editor`'s pipeline

The structure (parts as components, repeated items as a component plus a typed list, scripts in `public/scripts` and a runner, `fflate` zip, a lazy import) was ported from `frontend-editor/src/features/export/react`. What changed for this app:

| `frontend-editor` | Here | Why |
|---|---|---|
| Reads its own node tree | Reads rendered markup | See above |
| Styles are in CSS classes (`.fe-<id>`), `style` is dropped | `style` becomes a style object | The builder styles every node inline |
| React 19, Vite 8 | React 18.3, Vite 6, TS 5.6 | Same versions as this app |
| `build` = `tsc -b && vite build` | `build` = `vite build`, plus `typecheck` | A style or attribute TypeScript dislikes should not stop a build |
| `\s` / `trim()` for blank text | ASCII whitespace only | A non-breaking space is content here |
| Handlers kept as `data-on*` and restored | Handlers dropped | The sanitizer already removes `on*` from builder pages |
| Names from any class | Names from own classes only | Builder markup is mostly Tailwind utilities |
| Export a whole page or one selected part | Whole page only | See "How to extend" |

### Page CSS in `public/`, linked at the end of `<body>`

- **Tried first (2026-10-05):** import the page CSS from `main.tsx`. The exported page was a few pixels off on imported pages. Cause: Tailwind's CDN script adds its `<style>` to `<head>` at runtime, after Vite's `<link>`, so at equal specificity Tailwind's reset beat the page's own low-specificity rules (`:where([data-lp-page]) ul { … }`).
- **Tried second:** link `src/styles/page.css` from `index.html`. `vite build` merges any stylesheet it processes into one file in `<head>`, so the position was lost.
- **Chosen:** files in `public/` are copied untouched, so the link stays where it is written. This is what the builder does itself: "page CSS is appended to the end of `<body>`, so the page wins ties" ([04](04-css-scoping-and-units.md)).

### Why a `builder.css`

The builder's own stylesheets are not in the export, but they style every page Preview shows. Measuring the exported page against Preview found five things missing, each now in `BUILDER_CSS` with its source named in a comment:

1. **Tables** lost their full width, fixed columns and cell padding (`src/css/editor.css`, written there as `.judgify-editor table …`). Measured: a table was 441px wide in the export and 1352px in Preview.
2. **The base font**: Preview pages are Arial (`Preview.css`, `editor.css`), the export fell back to Tailwind's system font (2px per text line).
3. **Text rendering** (`font-feature-settings`, `text-rendering: optimizeLegibility`) changed text widths by about 4%.
4. **The boxed width** `.main-container-lp` (`src/index.css`).
5. **The rich-text list rules** (`src/index.css`, written there with CSS nesting; flattened here by `listCss`) and **two global resets from `judgify-react-ui`** (`* { padding: 0; margin: 0 }` and `li { list-style: none }`, found in `node_modules/judgify-react-ui/dist/packages/index.css`).

**Alternative (not tried):** copy the builder's whole compiled stylesheet into the export. It would match everything, but it is hundreds of KB of editor CSS, and a developer would have to know which rules matter.

### Tailwind CDN, like Export HTML

Builder markup uses Tailwind utility classes, so the project needs Tailwind. It loads the Play CDN script, exactly like Export HTML does, and the README says it is for development.
**Alternative (not tried):** install Tailwind in the project. That needs the builder's Tailwind config copied, a content path for the generated `.tsx`, and a check that the generated CSS equals the CDN's.

## How to modify or extend

### Add a rule to the builder's defaults

1. Add it to `BUILDER_CSS` in `projectTemplates.ts`, with the source file in the comment.
2. Check it by measurement (see "Verifying"): a rule you only think is missing can change pages that already match.
3. Add an assertion to `reactExport.test.ts`, "React project styles".

### Support another attribute that React types only on some tags

Add it to `TAG_ONLY` in `jsxAttrs.ts` (attribute name -> the tags React accepts it on). Typecheck a generated project: `tsc --noEmit` in the unzipped folder lists every attribute TypeScript rejects.

### Change how parts or items are named

`createNaming` in `names.ts` (parts, `meaningfulName` / `describeName`) and `itemName` / `textPropName` in `repeats.ts` (items and props). Add a case to "names parts after an own class or heading".

### Make fewer or more repeated items

`worthGrouping` (how many items and what shape) and `ITEM_TAGS` in `repeats.ts`; `signature` decides what counts as "the same". Anything that should keep two items apart belongs in `signature`.

### Export one selected part (not built)

`frontend-editor` offers "Only <selected part>". Here: add an action-menu item, take `document.querySelector('[data-id="…"]').outerHTML`, and call `buildReactProject(html, title, assets)`. The wrapper rule treats a single element as the page wrapper, so check the result.

### Move to a local Tailwind build

Replace the CDN script in `buildReactProject` (`index.html`), add `tailwindcss`, `postcss` and `autoprefixer` to `packageJson`, and add a Tailwind config. Then page CSS no longer needs to go after Tailwind's runtime `<style>`, but keep it where it is, because it is also correct without the CDN.

## Gotchas and known limits

- **Widgets are static.** Sliders, countdowns, tabs and accordions are exported as the markup Preview shows, as in Export HTML. The README says so.
- **The Tailwind script has no integrity hash.** The Play CDN is a dynamic script with no fixed hash. Fine for development; production should install Tailwind (see above).
- **`builder.css` copies rules from the builder.** If `src/index.css`, `src/css/editor.css`, `Preview.css` or `judgify-react-ui` change, `builder.css` does not follow. Re-measure after such a change.
- **Event tokens stay as written** (`{{event_register_url}}`, `{{event_date}}`). The developer replaces them.
- **Prop names can be generic** (`text`, `text2`, `text3`) when an item's text sits in plain `span`s or `div`s with no class of their own.
- **Dependency versions are fixed** in `packageJson` (React 18.3, Vite 6, TS 5.6, the app's). Update them with the app.
- **Preview must be loaded**: the export reads the live Preview DOM. There is no export from the editor.
- **Custom elements and unusual tags** are written as is. TypeScript may not know them.
- **A page with only a single element in `<body>` and nothing inside it** has no parts to split; `App` returns that one element.
- **Pre-existing:** `Preview.page.tsx` has two type errors from before this feature (a missing `./RenderPreview` module and a `CanvasNode` argument); the project's error count is unchanged by it.

## Tests

`src/tests/export/reactExport.test.ts` (30 tests):

- **JSX attributes**: React names, numbers, booleans, handlers and style dropped, the tag-only table.
- **Style objects**: property names, splitting on `;` outside quotes and parentheses, `!important`, one-line vs one-per-line, the `CSSProperties` cast and quote escaping.
- **JSX elements**: spaces between words and tags, non-breaking space kept, braces escaped, `<pre>` and `<style>` exact, the gap between inline elements, the unchecked spread, form fields, `<select>` default.
- **Reading the page**: empty ids, handlers and scripts dropped; `data-id` kept only when referenced.
- **React project**: the setup and versions, the wrapper in `App`, one component per part, repeated cards as a component and a typed list, items with different styles not merged, `data-id` referenced in CSS not merged, naming (own class, heading, `Navbar`, numbering), the boxed wrapper, no wrapper for several top-level elements, the title and `<html>` attributes.
- **Styles**: the two groups of files, page CSS linked after the app module in the right order, `@import` first, `body >` rewritten, only the stylesheets the page has, the flattened list rules.
- **Scripts**: no runner without code, the move to `public/scripts` with the id fallback first, the export order (libraries, modules, JSON data, `classJs`, `plainJS`), no second jQuery.
- **Zip**: every file, including non-Latin text, survives a zip round trip.

No unit test runs `exportReactProject` (it needs a real download), `parseRenderedHtml` against a real Preview, or compiles the generated project. Those were checked live.

### Verifying a change by measurement

This is how the feature was verified (2026-10-05), and how to check any change to it:

1. Start the app (`run-editor-and-screenshot` skill).
2. In Playwright, open `/landing-page-builder/preview/<id>`, click "Export page as a React project", and save the download.
3. Unzip it, link `node_modules` to the app's (`mklink /J`; remove it with `rmdir`, never delete the folder), run `tsc --noEmit` and `vite build`, and serve it with `vite preview`.
4. Compare with Preview: the height of every top-level section (editor-built pages), or the page height against the sandbox frame's document height (imported pages, whose Preview is a frame). For a deeper check, walk both trees and print the first nodes whose height, font size or computed text properties differ.
5. Wait several seconds before measuring: the Tailwind script generates its CSS after load.

**Results (2026-10-05)**: editor-built sample pages 15, 16 (animations), 25, 28, 29 (boxed), 30 (boxed): `tsc` and `vite build` pass, every section height equals Preview's, no console errors. Imported pages (converted `codeToNodeTestCodeFiles` pages and the exported "Lowe's Has Talent" page, loaded through a Playwright route): `tsc` and build pass, and the page height equals the Preview frame's.

Things this check found and fixed: tables without the builder's table CSS, the Arial base font, text rendering, the boxed page setting, page CSS losing ties to Tailwind's reset, the builder's list rules and `judgify-react-ui` resets, and an imported form's `novalidate` on a `<div>` failing `tsc`.
