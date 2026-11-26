# Thumbnail Capture

How the editor turns a rendered node tree into a PNG thumbnail — for the
full-page "Create Thumbnail" dialog and for "Create Template" (sub-template
capture). This is fully client-side; no backend involvement.

## Files

| File | Role |
|---|---|
| `src/utils/captureViaDisplayMedia.ts` | `captureElementViaDisplayMedia(element)` — the actual capture |
| `src/context/PreviewContext.tsx` | `previewRef`, `captureRef`, `isCapturing`/`setIsCapturing` |
| `src/components/EditorUI/Canvas.tsx` | Full-page thumbnail (`handleCaptureThumbnail`) |
| `src/components/EditorUI/ActionMenu.tsx` | Sub-template thumbnail (`handleCapture`, called from `createTemplate`) |

## Why not html2canvas

The original implementation cloned the target DOM node into an offscreen
`<div>` and ran it through `html2canvas`. html2canvas doesn't actually
render the DOM — it re-implements a subset of CSS in JS and paints its own
approximation. That diverges from what the browser really renders:
gradients, custom fonts, box/text shadows, backdrop-filter, and flex/grid
edge cases routinely came out wrong. The offscreen clone made it worse —
cloned nodes were given `width: fit-content` / `zoom` overrides that didn't
match the node's real layout width.

## Why not server-side headless Chromium either

An earlier version of this feature rendered the node tree through a
dedicated render-only route and screenshotted it server-side with
Browsershot (Puppeteer). That gives pixel-perfect output — a real browser
engine — but was reverted because it required backend changes (new
Laravel routes/controller, a render-only React page, an S3 upload path)
and had real infra dependencies: a working Chromium binary + `CHROME_PATH`
on the server, the container being able to HTTP-call its own public URL,
and (discovered along the way) a genuine unrelated bug in the vendored
`vendor/spatie/browsershot/bin/browser.cjs` where a prior "remove
console.log" cleanup had commented out the only lines that actually invoke
`page.screenshot()`/`page.pdf()` — silently breaking Browsershot's
`save()`/`screenshot()`/`savePdf()` on this branch family. If that surfaces
again, that's the file to check first — it's not this feature's code.

## How it works now: `getDisplayMedia`

`captureElementViaDisplayMedia()` uses the Screen Capture API
(`navigator.mediaDevices.getDisplayMedia`) to grab a real video frame of
whatever the browser has actually painted, then crops it in a canvas to
the target element's bounding box:

1. Open a display-media stream (`preferCurrentTab: true` — a Chrome-only
   hint that preselects "This Tab" in the native picker; other browsers
   ignore it and show their normal picker).
2. Play it into an offscreen `<video>`, wait for `loadeddata`, then wait
   two `requestAnimationFrame`s so the compositor has actually painted a
   frame.
3. Read the track's actual captured resolution via `track.getSettings()`
   and compute `scaleX`/`scaleY` against `window.innerWidth`/`innerHeight`
   (accounts for device pixel ratio — the captured resolution is in
   physical pixels, the element's `getBoundingClientRect()` is in CSS
   pixels).
4. `drawImage` the scaled crop rect onto a canvas sized to match, then
   `canvas.toBlob('image/png')`.
5. **Always** stop every track in `finally` — otherwise the browser's
   "sharing this tab" indicator/banner stays up indefinitely.

Because this reads actual rendered pixels, **the target element must be
genuinely visible on screen, unobstructed, at the moment of capture** —
it cannot capture something off-DOM, `display:none`, or zoomed to zero.

### Full-page thumbnail (`Canvas.tsx`)

The "Create Thumbnail" dialog already renders a live, on-screen preview
(`ref={captureRef}`, zoomed to 40%) of the page's first N sections
(`sectionCount`) — that's the existing "Preview" panel in the dialog. This
element is already visible when the user clicks "Create", so
`handleCaptureThumbnail` just calls `captureElementViaDisplayMedia(captureRef.current)`
directly. Existing upload/save flow (`useUploadToS3` → `saveData`) is
unchanged.

### Sub-template thumbnail (`ActionMenu.tsx`)

The focused node's preview (`ref={previewRef}`) is normally rendered
**off-screen** (`position: fixed; top: -999999px; zoom: 0%` in `Canvas.tsx`)
so it doesn't visually clutter the editor while it stays mounted for other
purposes. Since real screen capture needs real on-screen pixels, capture
has to temporarily bring it into view:

- `PreviewContext` exposes `isCapturing`/`setIsCapturing`, read by
  `Canvas.tsx` to switch the preview container from
  `absolute; top: -999999px; zoom: 0%` to
  `fixed; top: 0; left: 0; z-index: 999999; zoom: 100%` — genuinely on
  screen, stacked above everything else so nothing obstructs it.
- `ActionMenu.tsx`'s `handleCapture()`: `setIsCapturing(true)` → wait two
  RAFs for the layout/paint to settle → capture → `setIsCapturing(false)`
  in `finally` (always resets, even on error/rejection).
- A `toast.loading(...)` runs for the duration, telling the user to pick
  "This Tab" in the browser's picker — otherwise the sudden full-screen
  content swap (while the modal briefly disappears behind it) is
  confusing with no explanation.

## Known limitations (inherent to the API, not fixable client-side)

- **Native picker every time.** `preferCurrentTab` only preselects the
  option in Chromium browsers — the user still has to click through it.
  There's no way to make this fully silent/automatic.
- **Requires a secure context.** `getDisplayMedia` doesn't exist at all
  over plain HTTP unless the origin is `localhost`. A plain-HTTP local
  vhost (e.g. `http://local.newjudgify.me`) needs either:
  - Chrome flag `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
    → add the vhost origin → Enabled → relaunch (per-developer, no server
    changes), or
  - a real HTTPS vhost for local dev.

  Production, served over HTTPS, is unaffected.
- **Wrong-tab risk.** If the user picks a different tab/window/screen than
  the one showing the element, the crop math (which assumes "this tab") is
  simply wrong — there's no way to detect or prevent that from the page.
- **Resolution assumptions.** The scale factor assumes the captured
  surface matches `window.innerWidth`/`innerHeight` 1:1 (times device
  pixel ratio). Multi-monitor setups or a browser that caps capture
  resolution could throw this off.

## If accuracy or the permission prompt becomes a real problem

The two alternatives already explored and why they were set aside:

- **html2canvas** (previous approach): no permission prompt, fully
  automatic, but approximates CSS instead of rendering it — accuracy
  regressions are expected and hard to fix at the root.
- **Server-side Browsershot/Puppeteer**: pixel-perfect, fully automatic,
  but requires backend changes and real production infra (Chromium binary,
  `CHROME_PATH`, the app being able to call its own URL, S3 upload
  credentials with a proven ACL path). Revisit this if the client-side
  permission-prompt UX turns out to be unacceptable.
