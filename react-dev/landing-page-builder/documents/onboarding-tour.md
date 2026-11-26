# Onboarding Tour

A first-time-user guided tour of the Editor: a spotlighted, step-by-step
walkthrough of the Insert panel, canvas, Property panel, Save, and Preview.
Auto-opens once per browser, and can be re-opened any time via the "?"
button in the navbar.

## Files

| File | Role |
|---|---|
| `src/hooks/useOnboardingTour.ts` | Drives open/step state, auto-open-once logic, `start()` |
| `src/components/ui/OnboardingTour/OnboardingTour.tsx` | Renders the spotlight backdrop + step card |
| `src/components/ui/OnboardingTour/tourSteps.ts` | `TOUR_STEPS` — the ordered step data |
| `src/hooks/useLocalStorage.ts` | Persists "has this browser seen the tour" |
| `src/configs/editor.config.ts` | `enable_onboarding_tour` feature flag (`isDev` by default) |
| `src/pages/Editor.page.tsx` | Wires `useOnboardingTour` + renders `<OnboardingTour>`, gates the "?" button |
| `src/components/EditorUI/Canvas.tsx` | Listens for `TOUR_PANEL_REQUEST_EVENT` to open the right side panel |
| `src/locales/*/tour.json` (via `useTranslation('tour')`) | Step copy (`steps.<id>.title` / `.description`), UI strings |

## Feature flag

Gated behind `editorConfig.enable_onboarding_tour` (`src/configs/editor.config.ts:249`),
which defaults to `isDev`. This flag gates three things independently:
whether `useOnboardingTour`'s auto-open effect can fire at all, whether the
"?" re-open button renders in the navbar, and whether `<OnboardingTour>` is
mounted in `Editor.page.tsx`. Flip it to enable in non-dev environments.

## State model (`useOnboardingTour`)

- `isOpen` / `stepIndex` — local state, not persisted mid-tour.
- `hasSeenTour` — persisted via `useLocalStorage(ONBOARDING_TOUR_STORAGE_KEY, false)`,
  key `landing_page_builder_onboarding_tour_seen`. Per-browser, not per-account.
- **Auto-open**: once `ready` (the page's `isSuccess`) flips true, and only
  if the flag is on and `hasSeenTour` is false, a 700ms timer opens the tour
  at step 0. The delay exists so the DOM targets the first steps spotlight
  (insert panel toggle, etc.) have actually mounted. The effect only depends
  on `[ready]` (`eslint-disable react-hooks/exhaustive-deps` is intentional)
  — depending on `hasSeenTour` too would re-open the tour the instant it
  closes and marks itself seen.
- **Manual re-open**: `start()` resets to step 0 and opens, called from the
  navbar's "?" button (`data-tour`-free, always visible when the flag is on).
- `next()` / `back()` / `skip()` (aliased to `dismiss`) all end up calling
  `setHasSeenTour(true)` once the tour is finished or dismissed early — so
  skipping counts as "seen," it won't reappear next load.

## Step data (`tourSteps.ts`)

Each `TourStep` has an `id`, i18n keys (`titleKey`/`descriptionKey`), and
optionally:

- `target` — a CSS selector to spotlight. Omitted → a centered
  welcome/done card with a full dim backdrop and no cutout (used for the
  first `welcome` and last `done` steps).
- `placement` — which side of the target the card prefers (`top` /
  `bottom` / `left` / `right`); ignored without a `target`.
- `panel` — `'content' | 'property'`. Forces the matching side panel open
  before this step's target can be measured (see below).

Steps spotlight real DOM via `data-tour="..."` attributes already present
on the relevant elements (`insert-panel-toggle`, `insert-section-button`,
`insert-block-button`, `insert-contents-group`, `#editor-wrapper`,
`property-panel-toggle`, `property-panel-controls`, `save-button`,
`preview-button`). Adding/renaming a step means adding/keeping the matching
`data-tour` attribute on the real element.

## Cross-panel coordination: `TOUR_PANEL_REQUEST_EVENT`

The Insert/Property panel toggle (`panelType`) is local state owned by
`Canvas.tsx`, not exposed through `EditorContext` (it's UI-only), and
`Editor.page.tsx` sits above `EditorContextProvider` so it has no direct
handle on it. Rather than plumbing panel state through context,
`useOnboardingTour` dispatches a `window` `CustomEvent`
(`TOUR_PANEL_REQUEST_EVENT`, detail `'content' | 'property'`) whenever the
current step declares a `panel` — mirroring the existing
`INSERT_SHORTCUT_ARMED_EVENT` pattern in `useGlobalInsertShortcuts.ts`.

`Canvas.tsx` listens for this event and:
1. Sets `panelType` to the requested value.
2. If the request is `'property'` and nothing is focused yet
   (`!canvas.focusedNode`), auto-focuses the page's first child node so the
   Property panel has real controls to spotlight instead of its empty
   "no element selected" state.

## Rendering (`OnboardingTour.tsx`)

- `useTargetRect(selector, isOpen)` re-measures the target's
  `getBoundingClientRect()` on mount, `resize`, and `scroll` (capture
  phase), plus a 300ms interval as a fallback for layout shifts the tour
  has no other way to observe (panel fold/unfold transitions, canvas zoom
  changes).
- The spotlight is a dimmed full-viewport `<div>` whose `box-shadow:
  0 0 0 9999px rgba(...)` fills everything *except* a rounded cutout sized
  to the target rect (`SPOTLIGHT_PADDING = 8`) — no clip-path/mask needed.
  When there's no target, it falls back to a plain full-screen dim.
- The step card is a fixed-width (`CARD_WIDTH = 320`) box positioned
  relative to the target per `placement`, then clamped into the viewport
  (`VIEWPORT_MARGIN = 16`) so it never renders off-screen; centered when
  there's no target.
- Renders at `z-[999999999]` to stay above everything, including modals.

## Adding a new step

1. Add a `data-tour="..."` attribute to the target element (if any).
2. Add an entry to `TOUR_STEPS` in `tourSteps.ts`, with `panel` set if the
   target lives inside the Insert or Property panel.
3. Add the matching `steps.<id>.title` / `steps.<id>.description` keys to
   the `tour` i18n namespace for every locale.

## Known constraints

- Tour "seen" state is per-browser (`localStorage`), not per-account — it
  will re-trigger for the same user on a different browser/device.
- The 300ms polling interval in `useTargetRect` is a deliberate
  belt-and-suspenders fallback, not the primary re-measure path; if a new
  layout-shift source appears that it doesn't catch, prefer adding a
  targeted `resize`/`scroll`-style listener over shortening the interval.
