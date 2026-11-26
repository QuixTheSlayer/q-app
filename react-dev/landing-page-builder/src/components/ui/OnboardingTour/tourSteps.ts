import type { TourVisualId } from './tourVisuals'

export interface TourStep {
  id: string
  /** CSS selector of the element to spotlight. Omitted = centered welcome/done card with a full backdrop, no cutout. */
  target?: string
  titleKey: string
  descriptionKey: string
  /** Preferred side of the target to place the card on. Ignored when `target` is omitted. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Extra px added on top of the card's normal GAP for this step only.
   * Needed when the target sits right next to another interactive element
   * the card would otherwise land on — e.g. propertyControls' target is the
   * property panel's content area, whose left edge is only 30px from the
   * insert/property panel-toggle strip (Canvas.tsx's `left-[-30px] w-[30px]`
   * buttons), which the default GAP alone doesn't clear.
   */
  placementGap?: number
  /**
   * Forces a side panel or dialog open so this step's target actually
   * exists to spotlight — see TOUR_PANEL_REQUEST_EVENT in
   * useOnboardingTour.ts. 'content'/'property' force the Insert/Property
   * panel; requesting 'property' also auto-focuses the page's first node
   * (if nothing is already focused) so the panel has real controls to show
   * instead of its "no element selected" empty state. 'pageSettings' opens
   * the right-side Page Settings fold panel; 'pageSettingsChange' also
   * force-reveals the thumbnail's hover-only "Change" trigger (the tour has
   * no way to hover it). There's deliberately no option to force the real
   * thumbnail-creation Dialog open — Radix's Dialog.Content hides
   * everything outside its own portal (aria-hidden + pointer-events:none),
   * including this tour's own overlay, breaking its Next/Back buttons.
   * Steps that need to show what's inside that dialog use `visual` (a
   * static mockup) instead of the real thing.
   */
  panel?: 'content' | 'property' | 'pageSettings' | 'pageSettingsChange'
  /** A small static mockup rendered in the card — see tourVisuals.tsx — for
   * steps that need to show a real dialog/panel's contents without actually
   * opening it (which would break the tour, see `panel`'s doc comment). */
  visual?: TourVisualId
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'steps.welcome.title',
    descriptionKey: 'steps.welcome.description',
  },
  {
    id: 'insertPanel',
    target: '[data-tour="insert-panel-toggle"]',
    titleKey: 'steps.insertPanel.title',
    descriptionKey: 'steps.insertPanel.description',
    placement: 'right',
    panel: 'content',
  },
  {
    id: 'addSection',
    target: '[data-tour="insert-section-button"]',
    titleKey: 'steps.addSection.title',
    descriptionKey: 'steps.addSection.description',
    placement: 'right',
    panel: 'content',
  },
  {
    id: 'addBlock',
    target: '[data-tour="insert-block-button"]',
    titleKey: 'steps.addBlock.title',
    descriptionKey: 'steps.addBlock.description',
    placement: 'right',
    panel: 'content',
  },
  {
    id: 'addContents',
    target: '[data-tour="insert-contents-group"]',
    titleKey: 'steps.addContents.title',
    descriptionKey: 'steps.addContents.description',
    placement: 'right',
    panel: 'content',
  },
  {
    id: 'canvas',
    target: '#editor-wrapper',
    titleKey: 'steps.canvas.title',
    descriptionKey: 'steps.canvas.description',
    placement: 'bottom',
  },
  {
    id: 'propertyPanel',
    target: '[data-tour="property-panel-toggle"]',
    titleKey: 'steps.propertyPanel.title',
    descriptionKey: 'steps.propertyPanel.description',
    placement: 'left',
    panel: 'content',
  },
  {
    id: 'propertyControls',
    target: '[data-tour="property-panel-controls"]',
    titleKey: 'steps.propertyControls.title',
    descriptionKey: 'steps.propertyControls.description',
    placement: 'left',
    placementGap: 30,
    panel: 'property',
  },
  {
    id: 'pageName',
    target: '[data-tour="page-name-input"]',
    titleKey: 'steps.pageName.title',
    descriptionKey: 'steps.pageName.description',
    placement: 'bottom',
  },
  {
    id: 'viewSwitcher',
    target: '[data-tour="view-switcher"]',
    titleKey: 'steps.viewSwitcher.title',
    descriptionKey: 'steps.viewSwitcher.description',
    placement: 'bottom',
  },
  {
    id: 'thumbnailCapture',
    target: '[data-tour="page-setting-panel-toggle"]',
    titleKey: 'steps.thumbnailCapture.title',
    descriptionKey: 'steps.thumbnailCapture.description',
    placement: 'right',
  },
  {
    id: 'changeImage',
    target: '[data-tour="thumbnail-change-trigger"]',
    titleKey: 'steps.changeImage.title',
    descriptionKey: 'steps.changeImage.description',
    placement: 'right',
    panel: 'pageSettingsChange',
  },
  {
    id: 'createThumbnail',
    titleKey: 'steps.createThumbnail.title',
    descriptionKey: 'steps.createThumbnail.description',
    visual: 'createThumbnailDialog',
  },
  {
    id: 'save',
    target: '[data-tour="save-button"]',
    titleKey: 'steps.save.title',
    descriptionKey: 'steps.save.description',
    placement: 'bottom',
  },
  {
    id: 'preview',
    target: '[data-tour="preview-button"]',
    titleKey: 'steps.preview.title',
    descriptionKey: 'steps.preview.description',
    placement: 'bottom',
  },
  {
    id: 'done',
    titleKey: 'steps.done.title',
    descriptionKey: 'steps.done.description',
    panel: 'content',
  },
]
