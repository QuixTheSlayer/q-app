import axios from "axios";
import { toUploadUrl } from "@/utils/s3DevProxy";

interface ManualCanvasOptions {
    width?: number;
    height?: number;
}

/**
 * Manually converts an HTML element into an HTMLCanvasElement without third-party libraries.
 * @param elementOrId The HTMLElement itself or its string ID attribute.
 * @param options Optional overrides for width and height.
 */
export const convertHtmlToCanvasManual = async (
    elementOrId: HTMLElement | string,
    options: ManualCanvasOptions = {}
): Promise<HTMLCanvasElement> => {

    // 1. Resolve the element
    const targetElement = typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!targetElement) {
        throw new Error('[ManualCanvas] Target element not found.');
    }

    // 2. Determine target dimensions
    const width = options.width || targetElement.offsetWidth;
    const height = options.height || targetElement.offsetHeight;

    // 3. Clone element and manually inline its computed CSS styles
    // (SVG foreignObject requires explicit style definitions to render correctly)
    const clonedElement = targetElement.cloneNode(true) as HTMLElement;
    await inlineExternalImages(clonedElement);
    inlineComputedStyles(targetElement, clonedElement);

    // 4. Serialize the HTML element into an XML-compliant string
    const serializer = new XMLSerializer();
    const htmlString = serializer.serializeToString(clonedElement);

    // 5. Construct the SVG containing a foreignObject payload
    const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; padding: 0; box-sizing: border-box;">
          ${htmlString}
        </div>
      </foreignObject>
    </svg>
  `;

    // 6. Load the SVG data into an Image object asynchronously using Promises
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const img = new Image();

        // Create a secure Object URL blob for the SVG string
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // 7. Create a Canvas and draw the loaded SVG image onto it
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(blobUrl);
                reject(new Error('[ManualCanvas] Failed to acquire 2D canvas context.'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            // Clean up the memory blob URL
            URL.revokeObjectURL(blobUrl);
            resolve(canvas);
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(blobUrl);
            reject(error);
        };

        img.src = blobUrl;
    });
};

/**
 * Helper function to inline computed CSS rules from the source DOM node 
 * directly onto the cloned element node's style attribute.
 */
function inlineComputedStyles(source: HTMLElement, target: HTMLElement): void {
    const sourceStyles = window.getComputedStyle(source);

    // Copy applicable style properties
    for (let i = 0; i < sourceStyles.length; i++) {
        const key = sourceStyles[i];
        target.style.setProperty(key, sourceStyles.getPropertyValue(key));
    }

    // Recursively apply to all nested children elements
    const sourceChildren = source.children;
    const targetChildren = target.children;

    for (let i = 0; i < sourceChildren.length; i++) {
        inlineComputedStyles(
            sourceChildren[i] as HTMLElement,
            targetChildren[i] as HTMLElement
        );
    }
}

/**
 * Finds all external images inside an element, fetches them, 
 * and replaces their src attributes with local Base64 Data URLs.
 */

export const fetchImg = async (img: string) => {
    return await axios.post(img).then(({ data }) => {
        // console.log(data.data.url)
        return (data?.data?.url)
    })
}

/**
 * A judgify.me URL is a bucket key, not something the browser can fetch
 * directly — it needs to be exchanged for a short-lived signed S3 URL
 * first. Anything else (an external URL, a signed URL that's already been
 * resolved) is returned as-is.
 */
async function resolveSignedUrl(rawUrl: string): Promise<string> {
    if (!rawUrl.includes('judgify.me')) return rawUrl

    const key = new URL(rawUrl).pathname.slice(1).split('/').slice(1).join('/')
    return await fetchImg(`/landing-page-builder/genereate_signed_url?key=${key}`)
}

/**
 * Fetches an image URL's bytes ourselves and inlines them as a base64 data
 * URL, rather than assigning the signed URL directly and leaving
 * html2canvas to fetch it cross-origin — that relies on the S3 bucket's
 * CORS policy allowing whatever origin the app happens to be running from
 * (it doesn't, e.g. from the Vite dev host), and fails silently either way.
 * Shared by both the `<img>` src and CSS `background-image` inlining below —
 * they only differ in how the resulting data URL gets applied back.
 */
async function fetchAsDataUrl(sourceUrl: string): Promise<string> {
    const response = await fetch(toUploadUrl(sourceUrl), { mode: 'cors' });
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

async function inlineExternalImages(element: HTMLElement): Promise<void> {

    const images = element.querySelectorAll('img');

    const conversionPromises = Array.from(images).map(async (img) => {
        // Skip if it's already a base64 string or empty
        if (!img.src || img.src.startsWith('data:')) return;
        if (!img.src.includes('judgify.me')) return

        try {
            const sourceUrl = await resolveSignedUrl(img.src)
            img.src = await fetchAsDataUrl(sourceUrl); // Replaces external URL with base64 string
        } catch (error) {
            console.warn(`Failed to fetch and inline image: ${img.src}`, error);
        }
    });

    await Promise.all(conversionPromises);
}

/**
 * cloneNode(true) never copies a <canvas>'s drawn bitmap — the clone comes
 * out blank. Chart.js (and anything else drawing into a canvas, e.g.
 * ChartPanel's preview) renders there, so a cloned element used for
 * thumbnail/html2canvas capture would show an empty box where the chart
 * should be. Replace each cloned canvas with a snapshot <img> of the live
 * source canvas's current pixels, matched up by DOM position since the
 * clone is structurally identical to the source.
 */
function inlineCanvasElements(source: HTMLElement, target: HTMLElement): void {
    const sourceCanvases = [...source.querySelectorAll('canvas')];
    const targetCanvases = [...target.querySelectorAll('canvas')];

    sourceCanvases.forEach((sourceCanvas, i) => {
        const targetCanvas = targetCanvases[i];
        if (!targetCanvas) return;

        let dataUrl: string;
        try {
            dataUrl = sourceCanvas.toDataURL('image/png');
        } catch {
            return;
        }

        const img = document.createElement('img');
        img.src = dataUrl;
        img.width = sourceCanvas.width;
        img.height = sourceCanvas.height;
        img.style.cssText = targetCanvas.style.cssText;
        img.className = targetCanvas.className;

        targetCanvas.replaceWith(img);
    });
}

/**
 * html2canvas (still true as of 1.4.1 — a long-standing, unfixed upstream
 * limitation) doesn't implement CSS flex/grid `gap`: it lays out children
 * back-to-back with zero spacing even though the real browser genuinely
 * renders the gap. Converting `gap` to an equivalent `margin` on children
 * fixes the simple cases, but was tested here against a real nav bar
 * (`justify-content` + `gap` + `flex-shrink`) and did *not* fix it — and a
 * further attempt to sidestep html2canvas's flex engine entirely by
 * freezing every flex/grid container's children to measured absolute pixel
 * positions made real pages *worse* (nested containers fighting each
 * other's coordinate space, overlapping text). Both were reverted.
 *
 * There isn't a safe general DOM-level patch for this — html2canvas's own
 * flex/grid implementation has bugs beyond just `gap` (margins on flex
 * items came out wrong too in testing), and blindly rewriting layout modes
 * risks breaking pages that currently capture correctly. If a specific
 * capture needs to look right, the safest fix is a targeted one: querying
 * for that node's own container and neutralizing just its `gap` via
 * `style.gap = 0` + explicit `margin` on its *direct* children only (not
 * recursively), verified against that node — not a page-wide transform.
 */

export async function changeImageUrlFromElement(element: HTMLDivElement, sourceElement?: HTMLElement) {
    if (sourceElement) {
        inlineCanvasElements(sourceElement, element);
    }

    const images = [...element.querySelectorAll('img')];
    const bgImgEl = [...element.querySelectorAll("*")].filter((el) => {
        return (
            window.getComputedStyle(el).backgroundImage.includes('url(')
        );
    }) as HTMLElement[]


    // html2canvas renders CSS background-image natively, so keep it as a
    // background-image rather than swapping in a real <img> element — that
    // avoids having to reproduce background-size/position by hand, and
    // sidesteps z-index/stacking-context pitfalls of injecting a positioned
    // element next to whatever else already lives in the container (e.g.
    // overlaid text in a Hero section). Only the URL needs to change: inline
    // it as base64 the same way inlineExternalImages already does for plain
    // <img> tags, via the shared resolveSignedUrl/fetchAsDataUrl helpers.
    await Promise.all((bgImgEl).map(async (img) => {

        const style = getComputedStyle(img)
        const bg = style.backgroundImage
        const trimmedUrl = bg.slice(5).split('")')[0]

        try {
            const sourceUrl = await resolveSignedUrl(trimmedUrl)
            img.style.backgroundImage = `url("${await fetchAsDataUrl(sourceUrl)}")`;
        } catch (error) {
            console.warn(`Failed to fetch and inline background image: ${trimmedUrl}`, error);
        }

    }));
    //Change Image url
    await Promise.all(images.map(async (img) => {
        if (!img.src.includes('judgify.me')) return

        try {
            const sourceUrl = await resolveSignedUrl(img.src)
            img.src = await fetchAsDataUrl(sourceUrl)
            img.style.objectFit = 'cover'
        } catch (error) {
            console.warn(`Failed to fetch and inline image: ${img.src}`, error);
        }
    }));

    // // Wait for reload
    // await Promise.all(images.map(img => new Promise(res => {
    //     img.onload = res;
    //     img.onerror = res;
    // })));
}