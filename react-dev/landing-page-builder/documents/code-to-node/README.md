# Code to Node: technical documentation

"Code to node" is the set of features that turns a pasted web page (HTML, CSS and JS) into the builder's editable node tree, and keeps it looking and working the same in the editor, in Preview and on the published page.

This folder explains how each part works, why it was built that way, what else was tried, and how to change or extend it. Start here, then open the doc for the part you are touching.

## The five decisions everything else follows from

1. **Structure becomes nodes; styling stays the page's own CSS.** Elements become real nodes (sections, blocks, text, buttons...), but the `<style>` is kept as a raw string (`root.plainCss`) and applied as-is. Converting CSS rules into node styles was built on 2026-09-25 and reverted at the user's request. See [04](04-css-scoping-and-units.md).
2. **The page's names are made private, not the page.** Classes, ids and CSS variables get an `lp-` / `--lp-` prefix, and tag-only rules are limited to the imported root with `:where([data-lp-page])`. That stops Bootstrap, Tailwind and the builder's own theme from colliding with the page. The user rejected a wrapper scoping class (`lp-imported-root`). See [04](04-css-scoping-and-units.md).
3. **Every length becomes `em`.** The editor zooms by changing the root font size, so only `em` follows the zoom. Lengths are converted with a real font-size cascade, never a flat `px / 16`. See [04](04-css-scoping-and-units.md).
4. **Page JS never runs on Judgify's origin.** Preview and the published page show a snapshot inside an iframe without `allow-same-origin`, where the script runs. The editor doesn't run it on load, which is why imported content must be visible without JS. One exception: saving from the Custom Code dialog runs that JS once on the editor canvas (`handleCustomCodeSave` in `Editor.page.tsx`). See [05](05-scripts-sandbox-and-security.md).
5. **Fidelity is checked by measurement.** "Looks the same" means the computed color, size, weight and font of every text node, and the section heights, match the original. See [09](09-testing-and-verification.md).

## Pipeline at a glance

```
User pastes HTML (or a whole AI reply)            ImportHtmlDialog.tsx
  │  stripCodeFences                              (```html/css/js fences → page)
  ▼
htmlToJsonTree(html)                              src/utils/htmlToCanvasNodes.ts
  ├─ has <script id="judgify-page-data">? → restore the exported tree exactly
  └─ otherwise
       DomExtractor      → css, js, pageScripts, body, external files
       unit context      → font-size cascade                     unitConversion.ts
       convertHtmlToJsonTree → root node + sections + blocks + text…
       sanitizeCanvasTree(root)                                  utils/security/
       page CSS, in this order:
         convertCssUnits → px/rem/vw/vh to em                    unitConversion.ts
         name prefixing  → lp- classes / ids / --lp- variables   pageClasses/pageIds/pageVariables.ts
         alsoTargetTextWrappers + importedBaseCss
         scopePageCss    → :where([data-lp-page]) for tag rules  pageScope.ts
         sanitizeCss                                             utils/security/
  ▼
{ root, css, js, skipped, external }
  ▼
Editor.page.tsx handleImportHtmlReplace           replaces the page, bumps externalContentVersion
  ▼
Rendered three ways
  ├─ Editor canvas (MotionWrapper, NodeMap/*)     page CSS injected, page JS NOT run
  ├─ Preview (PreviewUI/*)                        snapshot → SandboxFrame, JS runs in the frame
  └─ Published page (RenderPage)                  same sandbox as Preview
```

## Documents

| # | Doc | Read it when you change… |
|---|---|---|
| 01 | [Import dialog and AI prompt](01-import-dialog-and-ai-prompt.md) | the Import HTML dialog, the replace flow, code fences, the AI prompt and its presets |
| 02 | [Structure conversion](02-structure-conversion.md) | how elements become root/sections/blocks/buttons/media/form fields, kept attributes |
| 03 | [Text conversion](03-text-conversion.md) | what becomes a TipTap text node, inline pieces, text wrappers, text colors |
| 04 | [CSS scoping and units](04-css-scoping-and-units.md) | prefixes, `:where` scoping, base CSS, px→em, editor breakpoints |
| 05 | [Scripts, sandbox and security](05-scripts-sandbox-and-security.md) | page JS, the sandbox frame and snapshot, sanitizers, URL allowlists |
| 06 | [Rendering parity and event widgets](06-rendering-parity-and-event-widgets.md) | editor/Preview/published renderers, imported-page behaviors, `{{event_*}}` tokens |
| 07 | [Custom Code, export and round trip](07-custom-code-export-and-roundtrip.md) | the Custom Code dialog, Export HTML, export → re-import, import into a node |
| 08 | [Export as a React project](08-export-react-project.md) | Preview's "Export React" button, the DOM -> JSX converter, repeated items, scripts, the builder's default CSS |
| 09 | [Testing and verification](09-testing-and-verification.md) | anything: test map, probe tests, live measuring, the change checklist |

Related, outside this folder: [Property panel behaviors](../property-panel-behaviors.md) (companion styles, computed values, field reset, rotate control), [Thumbnail capture](../thumbnail-capture.md), [Onboarding tour](../onboarding-tour.md).

## Marker attributes

The converter tags elements so CSS and renderers can recognise imported content. Search for the name to find every place that relies on it.

| Marker | Set on | Used for |
|---|---|---|
| `data-lp-page` | the imported root | `:where([data-lp-page])` scoping, base CSS, `isImportedPage` checks |
| `data-lp-text="<tag>"` / `"plain"` | text-node wrappers | the wrapper stands for the source `<h2>`/`<p>`/…; page tag rules also target it |
| `data-lp-inline` | inline text pieces | displayed inline so a split line stays one line |
| `data-lp-tag` | containers with a real tag | the rich-text `ul`/`ol` rules in `index.css` skip them |
| `data-lp-svg` | data-URI images made from inline `<svg>` | turned back into a cleaned `<svg>` for rendering and the sandbox |
| `data-lp-form` | blocks made from `<form>` | `form` selectors are retargeted to it; the sandbox turns it back into a `<form>` |
| `script#judgify-page-data` | exported HTML | lets re-import restore the exact tree |

## Feature flags

All in `src/configs/editor.config.ts`, all `true` by default. Each one can be turned off on its own (dev-only overrides: localStorage key `landing_page_builder_feature_overrides`).

| Flag | What it gates | Doc |
|---|---|---|
| `enable_import_html` | the Import HTML toolbar dialog | 01 |
| `enable_import_ai_prompt` | the copyable AI prompt panel in that dialog | 01 |
| `enable_import_html_upload` | the "Upload .html file" button in that dialog | 01 |
| `enable_export_react` | Preview's "Export React" button (the page as a React + TypeScript project in a .zip) | 08 |
| `enable_import_code_fences` | pasting a whole AI reply with ``` fences | 01 |
| `enable_custom_code` | the Custom Code dialog (edit `plainCss`/`plainJS`) | 07 |
| `enable_import_all_attributes` | keep every safe source attribute under its React name | 02 |
| `enable_import_raw_elements` | keep br/canvas/audio/dialog/… as blocks with their real tag | 02 |
| `enable_import_lists_as_blocks` | every ul/ol/li is a block, never one rich-text list | 02 |
| `enable_form_field_import` | input/select/textarea become form field nodes | 02 |
| `enable_import_lossless_text` | TipTap only gets text it gives back unchanged | 03 |
| `enable_import_page_scripts` | https/module/JSON-LD scripts kept in `root.pageScripts` | 05 |
| `enable_import_html_attributes` | `<html lang/class/data-theme>` kept for the published page | 05 |
| `enable_sandbox_forms` | the sandbox turns imported forms back into real `<form>`s | 05 |
| `enable_editor_page_breakpoints` | editor tablet/mobile views apply the page's own `@media` rules | 04 |
| `enable_editor_open_details` | imported `<details>` show open in the editor | 06 |

## Where the history is

The reasons behind each decision come from the daily logs in `documents/work_history/`: 2026-09-25 (converter rebuilt, CSS→node styles reverted, export round trip), 2026-09-29 (DOM fidelity, themed pages, sandbox scrolling), 2026-09-30 (render parity, prefixes, form fields), 2026-10-01 (frontend-editor parity, lists as blocks, prompt rules), 2026-10-02 (CodeMirror dialog, event widgets, client prompt). The short rule list for agents is `.claude/skills/code-to-node/SKILL.md`. Keep it and these docs in step.
