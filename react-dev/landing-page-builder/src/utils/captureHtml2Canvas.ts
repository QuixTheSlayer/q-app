import html2canvas from 'html2canvas'
import { changeImageUrlFromElement } from '@/utils/convertToCanvas'

/**
 * Captures a PNG of a live, already-rendered DOM element via html2canvas.
 *
 * Earlier revisions of this feature cloned the target into a detached copy
 * before capturing it (`cloneNode`, then forcing `width: fit-content` and
 * `zoom: 100%` on the clone, positioned off-screen). That's exactly what
 * made captures diverge from what was actually on screen: forcing
 * `fit-content` drops the width constraint that any percentage-sized
 * descendant was laying out against, and forcing `zoom: 100%` discards
 * whatever zoom the source was actually being displayed/captured at.
 *
 * This captures the real element in place instead — no clone, so nothing
 * about its layout can diverge from what's genuinely rendered. It's fine
 * for `changeImageUrlFromElement` to mutate it directly (swapping <img>
 * src/background-image to inlined base64) because both call sites here
 * are capture-only staging elements (Canvas.tsx's zoomed preview pane,
 * ActionMenu.tsx's off-screen node preview) — never the actual page
 * content the end user sees.
 *
 * We went html2canvas → getDisplayMedia → back to html2canvas over the
 * course of this feature; see documents/thumbnail-capture.md for why
 * getDisplayMedia was set aside (it let a user pick their entire screen or
 * an unrelated window instead of just the target element).
 */
export async function captureElementAsPng(element: HTMLDivElement): Promise<Blob> {
    await changeImageUrlFromElement(element)

    const canvas = await html2canvas(element, {
        backgroundColor: '#fff',
        useCORS: true,
        allowTaint: false,
        scale: 1,
    })

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob conversion failed.'))),
            'image/png'
        )
    })
}

/**
 * Shared by both thumbnail-capture call sites (Canvas.tsx's page thumbnail,
 * ActionMenu.tsx's sub-template thumbnail) — each only differs in which
 * element it captures and what filename the resulting File should carry.
 */
export async function captureElementAsFile(element: HTMLDivElement, filename: string): Promise<File> {
    const blob = await captureElementAsPng(element)
    return new File([blob], filename, { type: 'image/png' })
}
