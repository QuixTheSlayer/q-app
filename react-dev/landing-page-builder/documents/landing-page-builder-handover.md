# Landing Page Builder — Handover Document

> Last updated: April 2026

---

## 1. Project Overview

The **Landing Page Builder** is a drag-and-drop visual page editor embedded inside the Judgify admin panel. It allows event organisers to build fully custom event landing pages without writing code.

### What it does

- Provides a canvas-based editor where users drag, drop, and style page elements (text, images, buttons, tables, accordions, tabs, image sliders, etc.)
- Saves the page layout as a JSON tree to the server
- Renders the saved layout as a public-facing landing page for event participants

### Main features

| Feature | Description |
|---|---|
| Drag & Drop | Drag new elements from the Insert panel onto the canvas, or rearrange existing ones |
| Rich-text editing | In-canvas text editing powered by TipTap |
| Property panel | Context-aware style/attribute controls per selected element |
| Layer panel | Tree view of all elements for quick navigation and selection |
| Templates panel | Insert pre-built section templates |
| Undo / Redo | Full history of canvas state changes |
| Zoom | Zoom in/out of the editor canvas |
| Preview | Live preview of the rendered page |
| Export HTML | Download the rendered page as a self-contained `.html` file |
| S3 Image Upload | Upload images directly to AWS S3 from the editor |
| Event Widgets | Special draft elements (buttons/text) pre-filled with event URL/date placeholders |
| Scroll-to-top button | Configurable floating scroll-to-top button on the rendered page |

### Tech stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Redux Toolkit + RTK Query** (server state / API calls)
- **React Context** (editor canvas state)
- **dnd-kit** (drag and drop)
- **TipTap** (rich text editor)
- **AWS SDK v3** (S3 image uploads)
- **judgify-react-ui** (internal shared component library, loaded from GitHub)

### Architecture overview

This app is a **React SPA embedded inside a Laravel/PHP application**. It is NOT a standalone app — it is injected as a widget into an existing Blade view at the `#landing-page-builder` DOM mount point. Routing is handled manually by reading `window.location.pathname` (no React Router), because the surrounding Laravel app owns the URL structure.

---

## 2. Codebase Structure

```
src/
├── App.tsx                   # Entry point — custom pathname-based page router
├── main.tsx                  # React root mount (mounts on #landing-page-builder)
├── providers/
│   └── AppProvider.tsx       # Redux Provider wrapper
├── pages/
│   ├── Editor.page.tsx       # Main editor page (load/save, canvas layout)
│   ├── Preview.page.tsx      # Preview of the page (with Export HTML button)
│   └── RenderPage.page.tsx   # Public-facing rendered landing page (no editor chrome)
├── context/
│   ├── EditorContext.tsx     # ⭐ Core editor state — canvas tree, focus, undo/redo
│   └── DndContextProvider.tsx # dnd-kit DndContext wrapper with sensor config
├── store/
│   ├── index.ts              # Redux store setup
│   └── query.ts              # RTK Query API endpoints (get/save page data)
├── components/
│   ├── EditorUI/
│   │   ├── Canvas.tsx        # Combines all 3 panels + canvas area
│   │   ├── EditorWrapper.tsx # Scrollable canvas shell, zoom controls, toaster
│   │   ├── RenderNode.tsx    # Recursive node renderer (editor mode)
│   │   ├── Nodes.tsx         # All node component implementations
│   │   └── ActionMenu.tsx    # Float action menu on node hover
│   ├── ContentPanelUI/       # Left sidebar (Insert / Layers / Templates)
│   │   ├── Insert.tsx        # Draggable new element tiles + widget buttons
│   │   ├── Layers.tsx        # Recursive tree view of canvas nodes
│   │   └── Templates.tsx     # Pre-built section templates
│   └── PropertyPanelUI/      # Right sidebar — properties of the focused node
│       ├── index.tsx         # Routes to the correct panel by contentType
│       └── PanelTypes/       # One panel component per node contentType
├── hooks/
│   ├── useCanvasDnd.ts       # All dnd-kit drag event handlers
│   ├── useCanvasKeyShortcut.ts  # Keyboard shortcuts (copy/paste/delete/undo etc.)
│   ├── useUploadToS3.ts      # Image upload to S3 via presigned URL
│   └── useFileDrop.ts        # File drop handler for image nodes
├── types/
│   ├── node.type.ts          # All CanvasNode TypeScript types
│   ├── node.enum.ts          # NODE_TYPE, CONTENT_TYPE, LAYOUT enums
│   ├── widget.type.ts        # WidgetType enum
│   └── contentFile.type.ts   # API response/payload types (PageFile, etc.)
├── utils/
│   ├── nodeUpdater.ts        # ⭐ Recursive node tree updater (path-based)
│   ├── canvas.utils.ts       # Node factory functions (generateNewNode, etc.)
│   ├── editor.utils.ts       # Type guards (isLayoutNode, isAllowedToInsert, etc.)
│   ├── CSS.utils.ts          # em ↔ px conversion helpers
│   ├── dnd.utils.ts          # Geometry helpers for DnD drop targeting
│   ├── deepNodeDuplicate.ts  # Deep clone a node tree with fresh IDs
│   ├── checkEventPlaceholders.ts # Validate required event placeholders before save
│   ├── exportHTML.ts         # Export inner HTML as a downloadable .html file
│   ├── getCsrfToken.ts       # Reads CSRF token from <meta> tag
│   └── getIdFromUrl.ts       # Extracts page ID from URL pathname (last segment)
├── consts/
│   ├── defaultNodeStyle.ts   # Default style/shape for each node contentType (NEW_NODES)
│   ├── event-widgets.const.ts # Event placeholder strings ({{event_register_url}}, etc.)
│   └── widgetContents.ts     # Widget node definitions (submit entry, register, dates)
├── configs/
│   └── editor.config.ts      # Editor config (root_font_size = 16)
└── libs/
    ├── aws-client.ts         # AWS S3 client (presigned POST, currently unused path)
    ├── cn.ts                 # Tailwind class merge helper
    ├── dnd-kit.ts            # Custom MouseSensor / TouchSensor
    └── tiptap/               # TipTap extensions config
```

### State management

There are **two separate state layers**:

| Layer | Tool | What it manages |
|---|---|---|
| Canvas / Editor state | React Context (`EditorContext`) | The node tree, focus tracking, undo/redo history, zoom level, TipTap editor instance |
| Server state (API) | Redux Toolkit + RTK Query | Fetching and saving page data from/to the server |

These two layers are intentionally kept separate. `EditorContext` is the source of truth for everything on the canvas. RTK Query is only used for initial data load and save mutations.

### Routing

There is **no React Router**. Routing is done manually in `App.tsx` by matching `window.location.pathname`:

| Pathname prefix | Component |
|---|---|
| `/landing-page-builder/editor` | `Editor.page.tsx` |
| `/landing-page-builder/preview` | `Preview.page.tsx` |
| anything else | `RenderPage.page.tsx` (public render) |

The page ID is extracted from the last URL segment via `getIdFromUrl()`.

---

## 3. Key / Critical Modules ⚠️

### 3.1 Node Tree + Path System (`EditorContext`, `nodeUpdater`)

The entire canvas is represented as a **recursive JSON tree** of `CanvasNode` objects. Every node has a `type` (`container` | `content`) and a `contentType` (`section`, `block`, `text`, `image`, `button`, etc.).

Nodes are addressed using **dot-notation path strings** (e.g., `"root.0.1.2"`), where each number is a child index. This path system is fundamental — it is used in focus tracking, DnD resolution, and all update operations.

`nodeUpdater.ts` is the recursive engine that traverses the tree by path and applies an updater function to the target node. **Almost every canvas mutation goes through this function.** Be very careful modifying it — a regression here breaks the entire editor.

```
root
 └─ section [path: root.0]
     └─ block  [path: root.0.0]
         ├─ text   [path: root.0.0.0]
         └─ image  [path: root.0.0.1]
```

**Things to be careful about:**
- Paths are re-computed by index position after every insert/delete/move, so never store a path and use it after a mutation
- `root` in the path is the root node itself (NaN index), handled specially in `nodeUpdater`
- Accordion and Tab nodes can hold children despite being `type: "content"` — the `hasChildNode()` / `isAllowedToInsert()` guards handle this special case

### 3.2 Drag & Drop (`useCanvasDnd`, `DndContextProvider`)

The DnD system handles two distinct drag scenarios:

- **New element drag**: User drags a tile from the Insert panel onto the canvas. Identified by `DraggedElementType.New`.
- **Canvas element drag**: User drags an existing node to reorder it. Identified by `DraggedElementType.Canvas`.

`useCanvasDnd.ts` contains all the `onDragStart / onDragOver / onDragEnd` handlers. During drag-over, it calls `getNearestEdge()` to determine whether to insert before or after a target node, and applies a visual indicator via `showDropIndicator()`.

**Things to be careful about:**
- The DnD system uses custom `MouseSensor` from `libs/dnd-kit.ts` (not the default `PointerSensor`) to avoid conflicts with click events and text editing
- Drop targeting uses raw DOM measurements (`getBoundingClientRect`), not dnd-kit's built-in collision detection — only `MeasuringStrategy.Always` is used
- `isAllowedToInsert()` gates which containers can receive drops. Content-only nodes cannot be dropped into

### 3.3 EditorContext (`context/EditorContext.tsx`)

This is the largest and most critical file. It exposes:

- `content` / `setContent` — the root canvas node tree
- `focused` / `focusedNode` — currently selected node (id + path)
- `updateNode(updaterFn, targetPath?)` — patch any node by path
- `updateNodeStyle(style, targetPath?)` — patch only the style of a node
- `insertNode / insertSection` — add children to a container
- `moveNode` — move a node from one path to another (used by DnD)
- `duplicateNode / deleteNode` — clone or remove the focused node
- `undo() / redo()` — history traversal (`history` and `future` state arrays)
- `textEditorObj` — the active TipTap editor instance (for text nodes)

Undo/redo works by pushing entire `CanvasNode` tree snapshots into the `history` array before every mutation. There is no diffing. This is simple and reliable, but memory-intensive for very large pages.

### 3.4 RenderNode vs RenderElement (Editor vs Public)

There are two separate recursive renderers:

| File | Used in | Purpose |
|---|---|---|
| `EditorUI/RenderNode.tsx` | Editor only | Renders nodes with click handlers, DnD wrappers, action menus, focus rings |
| `PreviewUI/RenderElement.tsx` | Preview + RenderPage | Renders clean output HTML without any editor chrome |

**Do not mix them.** The editor renderer has many interactive layers that would break the public page if included.

### 3.5 Event Placeholders

The backend injects dynamic event data into the page at render time by replacing placeholder strings in node content. The two **mandatory** placeholders that must exist in every saved page are:

- `{{event_submit_entry_url}}` — used in the Submit Entry button `href`
- `{{event_register_url}}` — used in the Register button `href`

`checkEventPlaceholders()` validates these before saving. If either is missing, the save is blocked with a toast warning.

Additional placeholders include: `{{event_date}}`, `{{event_hour}}`, `{{event_timezone}}`, `{{event_timezone_offset}}`, `{{event_view_entries}}`.

---

## 4. Common Bugs & Debugging Tips

| Issue | Likely cause | How to debug |
|---|---|---|
| Dropped node appears in wrong position | Path was stale at drop time | Log `canvasDropPositionRef.current` in `useCanvasDnd.onDragEnd` |
| Undo doesn't restore expected state | Mutation happened outside `updateContent()` (bypassed history) | Ensure all mutations go through `EditorContext` methods, not direct `setContent` |
| TipTap editor loses focus unexpectedly | Another element captured a mouse event | Check for `e.stopPropagation()` missing on click handlers around the canvas |
| Image not uploading | Missing/expired CSRF token or S3 signed URL expired | Check network tab; confirm `X-CSRF-Token` header is present and the `/generate_upload_url` response is 200 |
| Save blocked with "Submit entry widget is missing" | `{{event_submit_entry_url}}` not in canvas content | Make sure the Submit Entry widget button is placed on the canvas |
| Canvas not rendering after load | `data.content` from API is not valid JSON / parse failed | `page_content` from server is stored as a JSON string and parsed via `JSON.parse()` in the RTK Query `transformResponse` — check the raw API response |
| Styles using wrong units | CSS.utils em/px conversion off | All dimensions are stored in `em` units relative to `root_font_size: 16`. `pxToEm` and `emToPx` in `CSS.utils.ts` do the conversion |

---

## 5. Server-side Integration

### API Endpoints

All requests go to `/landing-page-builder/` base URL on the **same origin** (no separate API domain). The Laravel backend serves these routes.

| Method | URL | Purpose |
|---|---|---|
| `GET` | `/landing-page-builder/get_landingpage_data/:id` | Load page for editor/preview |
| `POST` | `/landing-page-builder/save/:id` | Save page content |
| `GET` | `/landing-page-builder/get_data_landingPage/:event_name` | Load page for public rendering |
| `POST` | `/landing-page-builder/generate_upload_url` | Generate S3 presigned URL for image upload |

### Request / Response shapes

**GET page data** → response shape: `{ data: [PageQueryData] }`  
`page_content` is a **JSON string** (not an object). It is parsed inside the RTK Query `transformResponse`.

**Save page** → POST body:
```json
{
  "id": 123,
  "title": "Page title",
  "content": { /* CanvasNode tree object */ },
  "thumbnail": "",
  "description": "",
  "scrollToTop": { ... }
}
```

**Image upload flow:**
1. POST `/generate_upload_url` with `{ filename, type, subfolder }` → get back `{ url, access_url }`
2. PUT directly to S3 using the signed URL with the file as body (no auth headers)

### Auth / Headers

- CSRF token is read from `<meta name="csrf-token">` in the page `<head>` (injected by the Laravel Blade view)
- Token is attached as `X-CSRF-Token` header to all RTK Query requests via `prepareHeaders`
- No Bearer token or session cookie is managed by this app — it relies entirely on the surrounding Laravel session

---

## 6. Environment Setup

### Prerequisites

- **Node.js**: check `.nvmrc` or use the version consistent with the rest of the monorepo (v18+ recommended)
- **npm / yarn**: the project uses npm

### Install

```bash
# From the landing-page-builder directory
npm install
```

The `judgify-react-ui` package is sourced from a private GitHub repo:
```
"judgify-react-ui": "github:JudgifyMyanmarTeam/judgify-react-ui"
```
You need appropriate GitHub access (SSH key or HTTPS token with repo read permission) for `npm install` to succeed.

### Environment variables

Create a `.env` file **two levels up** (at the Laravel project root — `../../.env`) since `vite build` uses `dotenv -e ../../.env`. Required variables:

| Variable | Purpose |
|---|---|
| `VITE_AWS_REGION` | AWS region for the S3 bucket (e.g., `ap-southeast-1`) |
| `VITE_AWS_S3_KEY_ID` | AWS access key ID (for the aws-client.ts path — mostly unused in prod) |
| `VITE_AWS_SECRET_S3_KEY` | AWS secret key |
| `VITE_AWS_LANDING_PAGE_BUCKET_NAME` | S3 bucket name for image storage |

> Note: In production, image uploads go through the backend's `/generate_upload_url` endpoint (presigned URL from the server), so the AWS credentials on the frontend may not be strictly needed at runtime. They are primarily used by the `aws-client.ts` path, which is not the active upload flow.

### Dev server

```bash
npm run dev
```

This starts a Vite dev server. Because the app expects to be embedded inside Laravel, you will likely need to run both this and the Laravel server. The Vite dev server can be used standalone for component-level work, but full editor functionality (API calls, CSRF) requires the Laravel app running.

---

## 7. Build & Deployment

### Build command

```bash
npm run build
```

This runs `dotenv -e ../../.env -- vite build`.

### Output

Vite outputs to:
```
../../public/js/landing-page-builder/
    index.js
    style.css
```

This is the `public/` folder of the Laravel application. The Laravel Blade views inject these files via `<script src="/js/landing-page-builder/index.js">` and the corresponding CSS link.

### Deployment steps

1. Pull latest changes
2. Run `npm install` (if dependencies changed)
3. Run `npm run build`
4. The compiled output in `public/js/landing-page-builder/` is automatically served by Laravel — no further deploy step is needed for the frontend

### Rollback

Since the build output is committed/deployed alongside the Laravel app:
- Roll back the Git commit that changed the output files, **OR**
- Re-run `npm run build` from a previous Git tag/commit of this sub-project
- The output is a single `index.js` and `style.css` — replacing these files with the previous version is sufficient

---

## 8. Things NOT to Touch ⚠️

| Area | Reason |
|---|---|
| `nodeUpdater.ts` | The recursive path traversal is delicate. Any off-by-one or edge-case miss breaks all canvas mutations |
| `EditorContext.tsx` — `undo / redo` logic | History snapshots are complete tree copies. Changing how/when snapshots are taken will corrupt history |
| `DndContextProvider.tsx` — custom `MouseSensor` | The standard `PointerSensor` conflicts with TipTap text editing. Do not swap sensors without thorough testing |
| `getCsrfToken.ts` | Security-critical. The CSRF token must come from the meta tag — do not hardcode or bypass |
| Path addressing in `focusNode / moveNode` | Paths become stale after mutations. Any code that caches a path between mutations is dangerous |
| `main.tsx` — mount target `#landing-page-builder` | This ID is set by the Laravel Blade template. Changing it requires coordinating with the backend |
| `vite.config.ts` — output directory | Output must stay at `../../public/js/landing-page-builder/` to be served by Laravel |

---

## 9. Pending Work & Known Issues

### Known issues / bugs

- **Thumbnail capture is commented out**: The `handleCapture()` function (using `html2canvas`) and the S3 thumbnail upload in `Editor.page.tsx` are commented out. The `thumbnail` field always saves as an empty string. This was likely disabled due to CORS issues with external images.
- **`aws-client.ts` is unused in the active flow**: The frontend AWS SDK client (`libs/aws-client.ts`) exists but the active image upload path goes through the backend's `/generate_upload_url` endpoint instead. The direct SDK path should either be cleaned up or the intent documented.
- **Scroll position not saved**: Canvas scroll position resets on re-render (e.g., after save).

### Tech debt

- `Nodes.legacy.tsx` — a legacy version of `Nodes.tsx` still exists in the repo. It can likely be deleted but verify nothing imports it first.
- `sample.tsx` in `PropertyPanelUI/` — appears to be a scratch/exploration file, not used in production.
- `ALIGN_NOTE.md` in `PropertyPanelUI/` — contains internal notes, not user-facing.
- Several commented-out code blocks throughout `Canvas.tsx`, `Editor.page.tsx`, and `EditorWrapper.tsx` — these are leftover experiments and can be cleaned up.
- Local file data (`data/localdata/`) appears to be a holdover from when the editor used `localStorage` before server integration. Verify if still needed.

### Future suggestions

- **Undo/redo efficiency**: Current approach snapshots the entire tree on every change. For large pages, consider a command-based diff approach instead.
- **Thumbnail generation**: Re-enable thumbnail capture using an approach that avoids CORS issues (e.g., server-side screenshot, or restrict images to S3-hosted ones only).
- **Responsive/mobile preview**: The editor currently has no mobile breakpoint preview mode. A viewport-size toggle (desktop / tablet / mobile) would significantly improve UX.
- **Template saving**: Users can't currently save their own sections as templates. A "Save as template" action would pair naturally with the existing Templates panel.
- **Keyboard navigation on canvas**: Navigating between sibling nodes with arrow keys (without mouse) is not implemented.

---

## 10. Access & Tools

| Resource | Details |
|---|---|
| Repository | Part of the `Judgify-Judging-Panel-v2` monorepo |
| Shared component library | `judgify-react-ui` — private GitHub repo at `JudgifyMyanmarTeam/judgify-react-ui` |
| AWS S3 | `VITE_AWS_LANDING_PAGE_BUCKET_NAME` bucket in `ap-southeast-1` — used for image storage |
| Backend | Laravel app at the monorepo root, serves all API routes under `/landing-page-builder/` |
| Debugging | React DevTools (inspect context/state); Redux DevTools (inspect RTK Query cache); `console.log` in `nodeUpdater.ts` for path tracing |
| dnd-kit docs | https://docs.dndkit.com/api-documentation |
| TipTap docs | https://tiptap.dev/docs |
