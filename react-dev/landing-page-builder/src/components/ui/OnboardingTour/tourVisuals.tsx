import { Plus } from 'lucide-react'

/**
 * Small static mockups embedded in a tour step's card for steps that need
 * to show what a real dialog/panel looks like without actually opening it.
 * Opening the real thumbnail-creation Dialog (Radix) hides everything
 * outside its portal (aria-hidden + pointer-events:none), including this
 * tour's own overlay — see the `panel` doc comment in tourSteps.ts. These
 * are purely illustrative, non-interactive, and never reflect live state.
 */
export const TOUR_VISUALS = {
  createThumbnailDialog: CreateThumbnailDialogMock,
} as const

export type TourVisualId = keyof typeof TOUR_VISUALS

function CreateThumbnailDialogMock() {
  return (
    <div className="rounded-lg border border-border/60 bg-white text-[#1a1a1a] shadow-lg p-3 flex flex-col gap-2.5 pointer-events-none select-none">
      <div className="text-[12px] font-bold">Create Thumbnail Image</div>

      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-[#555]">Section count</div>
        <div className="w-[52px] h-[20px] rounded border border-[#ddd] bg-[#f7f7f7] flex items-center px-1.5 text-[11px] font-semibold">2</div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-medium text-[#555]">Preview</div>
        <div className="rounded border border-[#eee] overflow-hidden">
          <div className="h-[10px] bg-[#2b2b3a]" />
          <div className="h-[22px] bg-[#6f8fd4]" />
        </div>
      </div>

      <div className="self-end flex items-center gap-1 rounded bg-primary text-white text-[10px] font-semibold px-2.5 py-1">
        <Plus size={10} />
        Create
      </div>
    </div>
  )
}
