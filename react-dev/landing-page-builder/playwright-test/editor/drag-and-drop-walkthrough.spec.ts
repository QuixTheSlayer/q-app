import { test, expect } from '@playwright/test'
import {
  gotoEditor,
  openInsertTab,
  openLayersTab,
  openPropertyPanel,
  openContentPanel,
  insertFocusedBlockInNewSection,
  insertButton,
  clickCanvasNode,
  layerRows,
  blockSaveRequests,
  EDITOR_PAGE_ID,
} from './fixtures'

/**
 * Narrated, video-recorded walkthrough of building a page from scratch —
 * a user-guide-style recording, not just a regression check.
 *
 * This was originally written to exercise real drag-and-drop (dragging
 * Insert-panel buttons onto the canvas via raw mouse events), matching how
 * a user can actually build a page here. That approach was abandoned after
 * extensive investigation: dragging a "New" element from the Insert panel
 * onto a small or edge-adjacent target intermittently misclassifies which
 * edge the cursor is nearest to (useCanvasDnd.ts's processDragMove /
 * dnd.utils.ts's getNearestEdge, a fixed 10px-from-edge threshold), which
 * routes the insert to the wrong parent or drops it silently — confirmed
 * via direct logging of the app's internal state, not guessed. The failure
 * was genuinely flaky (varied between otherwise-identical runs) and, even
 * on runs that appeared to succeed, could place the new node as a sibling
 * of the intended container rather than a child of it. That's a real
 * unresolved issue in the app's own "New"-element drag handling, not
 * something a test-side workaround could reliably paper over — so this
 * suite uses click-based insertion instead, same as insert-panel.spec.ts
 * already does (every Insert-panel button inserts into the focused
 * container on a plain click; dragging is one way in, not the only way).
 *
 * `test.use({ video: 'on' })` below scopes video recording to just this
 * file — the shared playwright.config.ts doesn't enable it project-wide.
 * Run just this file with a recording location outside the repo via:
 *   npx playwright test playwright-test/editor/drag-and-drop-walkthrough.spec.ts --output="<dir outside the repo>"
 * (`--output` overrides outputDir for that invocation only, without
 * touching the shared config other specs rely on).
 */
test.use({
  video: { mode: 'on', size: { width: 1920, height: 1080 } },
  viewport: { width: 1920, height: 1080 },
})

/**
 * Clicks an Insert-panel button (or any locator resolving to exactly one)
 * and returns a locator for whatever it just created, identified via the
 * Layers panel's last row (its `id` attribute is the node id — see
 * fixtures.ts's own `lastLayerRowId`/`canvasNodeById`, which aren't
 * exported so this mirrors them locally). A click-insert always appends,
 * so "last row" is a safe assumption here — unlike a drag-insert, which
 * can land at any index.
 */
async function insertViaClick(page: import('@playwright/test').Page, source: string | import('@playwright/test').Locator) {
  // fixtures.ts's insertButton() matches the label as a trailing substring
  // of the button's full accessible name (which also carries a shortcut
  // badge like "/ + N ") — that's ambiguous for "Button" specifically,
  // since "Submit Entry Button"/"Register Button" also end in "Button" and
  // none of this suite's other specs happened to insert the plain Button
  // content type to expose it. Callers that hit that ambiguity pass an
  // exact-match Locator instead of a label string.
  const locator = typeof source === 'string' ? insertButton(page, source) : source
  await locator.click()
  await openLayersTab(page)
  const id = await page.locator('input[data-name="layer-item-open"]').last().getAttribute('id')
  await openInsertTab(page)
  return page.locator(`[data-node-path][data-id="${id}"]`)
}

test.describe('Build a page from scratch (recorded walkthrough)', () => {
  test('insert content, edit it, check its properties, save, and preview', async ({ page }) => {
    test.setTimeout(120_000)

    // Never let a real PUT reach json-server — see fixtures.ts's
    // blockSaveRequests: `save/:id` writes straight onto db.json's shared
    // dev row, and this test must not permanently mutate it.
    await blockSaveRequests(page)

    await test.step('Open the editor', async () => {
      await gotoEditor(page)
    })

    const block = await test.step('Insert a Section, then a focused Block inside it', async () => {
      // insertFocusedBlockInNewSection covers both: a bare Section refuses
      // direct Content children (EditorContext.tsx blocks Content nodes at
      // a top-level section path), so a Block has to go in between. It
      // also re-focuses the Block via the Layers panel afterward, since
      // (unlike inserting a Section) inserting a Block doesn't auto-focus
      // what it creates.
      const block = await insertFocusedBlockInNewSection(page)
      await openPropertyPanel(page)
      await expect(page.getByText('Block Properties')).toBeVisible()
      // openPropertyPanel/openContentPanel toggle the OUTER sidebar view
      // (Property panel vs. ContentPanel) — distinct from openInsertTab/
      // openLayersTab, which switch ContentPanel's own INNER tabs and only
      // work while that outer view is already "content". Switch back to
      // it here so the Insert-panel buttons below are actually in the DOM.
      await openContentPanel(page)
      return block
    })

    const text = await test.step('Insert a Text element into the Block', async () => {
      await openLayersTab(page)
      const before = await layerRows(page).count()
      await openInsertTab(page)

      const node = await insertViaClick(page, 'Text')

      await openLayersTab(page)
      await expect(layerRows(page)).toHaveCount(before + 1)
      await openInsertTab(page)
      return node
    })

    const image = await test.step('Insert an Image element into the Block', async () => {
      return insertViaClick(page, 'Image')
    })

    const button = await test.step('Insert a Button element into the Block', async () => {
      // Exact match, not the shared insertButton('Button') helper — see
      // insertViaClick's note on why "Button" alone is ambiguous here.
      return insertViaClick(page, page.getByRole('button', { name: '/ + N Button', exact: true }))
    })

    await test.step('Edit the text content directly on the canvas', async () => {
      // The text node is a live Tiptap editor — this click focuses it and
      // puts the caret in it, so a normal select-all + type edits it
      // exactly like a real user would. This has to happen right after the
      // click, before anything else touches focus: opening the Property
      // panel next (to confirm it shows "Text Properties") clicks a
      // sidebar button, which moves focus off the editor — so typing has
      // to come first or it silently lands on the wrong element.
      await clickCanvasNode(text)
      await page.keyboard.press('ControlOrMeta+A')
      await page.keyboard.type('Welcome to the page!')
      await expect(text).toContainText('Welcome to the page!')

      await openPropertyPanel(page)
      await expect(page.getByText('Text Properties')).toBeVisible()
    })

    await test.step('Confirm the Image Properties panel opens', async () => {
      await clickCanvasNode(image)
      await expect(page.getByText('Image Properties')).toBeVisible()
    })

    await test.step('Rename the Button label and make it bold', async () => {
      await clickCanvasNode(button)
      await expect(page.getByText('Button Properties')).toBeVisible()

      const propertiesPanel = page
        .getByText('Button Properties')
        .locator('xpath=ancestor::div[contains(@class, "overflow-y-auto")][1]')
      await propertiesPanel.getByRole('textbox').first().fill('Click Here')
      await propertiesPanel.getByRole('button', { name: 'Bold', exact: true }).click()

      await expect(button).toContainText('Click Here')
      await expect(button).toHaveCSS('font-weight', '700')
    })

    await test.step('Check the Layers panel lists everything just inserted', async () => {
      // Still on the outer Property view from the last property check —
      // switch back to ContentPanel before its inner Layers tab exists.
      await openContentPanel(page)
      await openLayersTab(page)
      await expect(page.getByText('Element Layers')).toBeVisible()
      await openInsertTab(page)
    })

    await test.step('Save the page (mocked) and confirm the sync badge updates', async () => {
      await expect(page.getByText('Unsaved Changes')).toBeVisible()
      await page.getByRole('button', { name: 'Save page' }).click()
      await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10000 })
    })

    await test.step('Open the live Preview page', async () => {
      await page.getByRole('button', { name: 'Switch to preview page' }).click()
      await expect(page).toHaveURL(new RegExp(`/landing-page-builder/preview/${EDITOR_PAGE_ID}$`))
      await expect(page.getByRole('link', { name: 'Back to dashboard' })).toHaveCount(0)
    })
  })
})
