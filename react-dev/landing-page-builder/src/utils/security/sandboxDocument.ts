import { JQUERY_INTEGRITY, JQUERY_SRC, usesJquery } from '@/utils/jquery.utils'
import { FORM_ATTR, INLINE_SVG_ATTR } from '@/utils/nodeAttributes'
import editorConfig from '@/configs/editor.config'
import { inlineSvgMarkup } from '@/utils/inlineSvg'
import { ID_FALLBACK_SCRIPT } from '@/utils/pageIds'
import type { PageScript } from '@/types/node.type'
import { buildSandboxCsp, SANDBOX_GUARD_SCRIPT } from '@/utils/security/sandboxGuard'

/**
 * Builds the srcdoc for SandboxFrame: a snapshot of the rendered page plus the
 * page's own JS. It runs in an iframe with an opaque origin, so page scripts
 * can't read Judgify's cookies/storage or call its APIs as the visitor.
 */

/** Everything the iframe loads runs without allow-same-origin. */
export const SANDBOX_PERMISSIONS = 'allow-scripts  allow-popups   allow-top-navigation-by-user-activation'

// Matches `</script` (any case) inside page JS: left as-is it would close the <script>
// tag early and let the rest be read as HTML, so it's written as `<\/script`.
const safeScript = (js: string) => js.replace(/<\/script/gi, '<\\/script')

// Replaces the characters that have meaning in HTML (& < > "), so text dropped into
// the document or an attribute value stays plain text.
const escapeHtml = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// <style> elements the builder itself adds: page CSS, animation/responsive CSS, TipTap, and Vite's dev CSS.
const BUILDER_STYLE = 'style[css-class], style[css-animation], style[css-responsive], style[data-tiptap-style], style[data-vite-dev-id]'

/** Only the builder's own stylesheet, and font services (fonts are harmless and pages rely on them). */
const isBuilderStylesheet = (link: HTMLLinkElement) =>
	link.href.includes('/landing-page-builder/') || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(link.href)

/** The builder's stylesheets (its CSS + the injected page CSS), with absolute URLs. The host site's own
 * CSS (Judgify's Bootstrap/Metronic bundles, debug bar) stays out: its `.container`, `h1`, `a`... rules
 * would restyle the page, which never sees them when published on its own. */
function collectStyles(): string {
	return Array.from(document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(`link[rel~="stylesheet"], ${BUILDER_STYLE}`))
		.filter((el) => !(el instanceof HTMLLinkElement) || isBuilderStylesheet(el))
		.map((el) => (el instanceof HTMLLinkElement
			? `<link rel="stylesheet" href="${escapeHtml(el.href)}">`
			: `<style>${el.textContent ?? ''}</style>`))
		.join('\n')
}

/** An image imported from inline <svg> goes back to being that (cleaned) <svg>, so page
 * scripts that reach into it by id (a dial, a progress ring) work. */
function restoreInlineSvgs(clone: HTMLElement) {
	clone.querySelectorAll<HTMLImageElement>(`img[${INLINE_SVG_ATTR}]`).forEach((img) => {
		const markup = inlineSvgMarkup(img.getAttribute('src') || '')
		if (!markup) return
		const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
		if (svg.nodeName.toLowerCase() !== 'svg') return
		// The image's own attributes (class, style, data-id, aria-*) move onto the <svg>.
		for (const attr of Array.from(img.attributes)) {
			if (!['src', 'alt', 'loading', 'decoding', INLINE_SVG_ATTR].includes(attr.name)) svg.setAttribute(attr.name, attr.value)
		}
		img.replaceWith(img.ownerDocument.importNode(svg, true))
	})
}

/** An imported <form> renders as a block (a real one would reload the editor on submit). In the frame it
 * is a <form> again, so submit buttons, `required` checks and the page's submit handler work. It keeps
 * data-lp-form, which the page's `form` rules were rewritten to. It has no action (never imported). */
function restoreForms(clone: HTMLElement) {
	clone.querySelectorAll(`[${FORM_ATTR}]`).forEach((block) => {
		const form = block.ownerDocument.createElement('form')
		for (const attr of Array.from(block.attributes)) form.setAttribute(attr.name, attr.value)
		form.append(...Array.from(block.childNodes))
		block.replaceWith(form)
	})
}

/** A submit the page's own handler didn't cancel would load about:srcdoc into the frame: this listener,
 * on the document, runs after the form's own listeners and cancels it. */
const NO_SUBMIT_NAVIGATION = `document.addEventListener('submit', function (event) { event.preventDefault(); });`

/** srcdoc has no base URL, so links/media must be absolute; outbound links open in the real tab. */
function snapshot(element: HTMLElement): string {
	const clone = element.cloneNode(true) as HTMLElement
	// React sets `muted` only as a DOM property, never the attribute, so a copied
	// <video> would lose it and play with sound - write the live state onto the copy.
	const liveMedia = element.querySelectorAll<HTMLMediaElement>('video, audio')
	clone.querySelectorAll<HTMLMediaElement>('video, audio').forEach((media, i) => {
		if (liveMedia[i]?.muted) media.setAttribute('muted', '')
	})
	// Form fields: React sets value/checked/selected as properties only, so write them onto the copy.
	const liveFields = element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
	clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((field, i) => {
		const live = liveFields[i]
		if (!live) return
		if (field instanceof HTMLTextAreaElement) field.textContent = live.value
		else if (field instanceof HTMLSelectElement) Array.from(field.options).forEach((o, j) => o.toggleAttribute('selected', (live as HTMLSelectElement).options[j]?.selected ?? false))
		else if (field.type === 'checkbox' || field.type === 'radio') field.toggleAttribute('checked', (live as HTMLInputElement).checked)
		else field.setAttribute('value', live.value)
	})
	clone.querySelectorAll('script, iframe[srcdoc]').forEach((el) => el.remove())
	restoreInlineSvgs(clone)
	if (editorConfig.enable_sandbox_forms) restoreForms(clone)
	// The page scrolls the frame's own window, like a real tab (window scroll listeners, scrollY,
	// #anchors) - not a 100vh box of its own, as RenderPage's <main> is in the parent.
	for (const prop of ['height', 'max-height', 'overflow', 'overflow-y']) clone.style.removeProperty(prop)
	// The page's base font comes from its wrapper in the parent (Preview sets 16px). The frame copies the
	// host site's CSS too (Judgify's template sets html { font-size: 13px }), which would shrink every em.
	const live = getComputedStyle(element)
	// Not line-height: its computed value is fixed px, which would stop a page's `line-height: 1.5` scaling.
	for (const prop of ['font-size', 'font-family']) {
		if (!clone.style.getPropertyValue(prop)) clone.style.setProperty(prop, live.getPropertyValue(prop))
	}
	clone.querySelectorAll<HTMLElement>('[href]').forEach((el) => {
		const href = el.getAttribute('href') || ''
		if (href.startsWith('#')) return
		if (el instanceof HTMLAnchorElement) {
			el.setAttribute('href', el.href)
			if (!el.getAttribute('target')) el.setAttribute('target', '_top')
		}
	})
	clone.querySelectorAll<HTMLImageElement | HTMLVideoElement | HTMLSourceElement | HTMLIFrameElement>('img[src], video[src], source[src], iframe[src]')
		.forEach((el) => el.setAttribute('src', el.src))
	return clone.outerHTML
}

/** Background and text color the page sits on in the parent (e.g. Preview's white panel),
 * so the frame doesn't show the editor's own dark body instead. */
function surroundingColors(element: HTMLElement): string {
	let background = ''
	for (let el: HTMLElement | null = element; el && !background; el = el.parentElement) {
		const style = getComputedStyle(el)
		if (style.backgroundImage !== 'none') background = style.background
		else if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') background = style.backgroundColor
	}
	const color = element.parentElement ? getComputedStyle(element.parentElement).color : ''
	// The app's own CSS locks body scrolling (the editor layout needs that); a page must scroll.
	return `html, body { margin: 0; height: auto !important; min-height: 100%; }
html { overflow-y: auto !important; }
body { overflow: visible !important; background: ${background || '#fff'}; color: ${color || 'inherit'}; }`
}

/** A srcdoc frame resolves `href="#faq"` against the parent page's URL, so a click would load the
 * whole app into the frame. In-page links scroll to their target instead. It listens in the capture
 * phase so a page handler that calls stopPropagation() can't let the link navigate. */
const IN_PAGE_LINKS = `window.addEventListener('click', function (event) {
	var link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
	if (!link) return;
	event.preventDefault();
	var id = decodeURIComponent(link.getAttribute('href').slice(1));
	var target = id ? document.getElementById(id) : null;
	// Scrolls only this frame's window (scrollIntoView would move the parent page too), keeping scroll-padding-top.
	var padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
	if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - padding, behavior: 'smooth' });
	else if (!id || id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
}, true);`

type PageContent = { plainJS?: string; pageScripts?: PageScript[]; htmlAttributes?: Record<string, string> } | null | undefined

/** A page is shown in the sandbox frame when it has JS to run, scripts to load, or <html> attributes
 * (class="dark", data-theme) its CSS depends on - only the frame has a <html> of its own to put them on. */
export function needsSandbox(content: PageContent): boolean {
	const htmlAttrs = Object.keys(content?.htmlAttributes ?? {}).filter((name) => name !== 'lang' && name !== 'dir')
	return !!content?.plainJS?.trim() || !!content?.pageScripts?.length || htmlAttrs.length > 0
}

/** A kept page script as a tag: an https `src` (checked again here), or typed/module code. */
export function pageScriptTag({ src, code, type }: PageScript): string {
	const typeAttr = type && /^[\w/+.-]+$/.test(type) ? ` type="${escapeHtml(type)}"` : ''
	if (src) return /^(https:)?\/\/[^/]/i.test(src) ? `<script${typeAttr} src="${escapeHtml(src)}"></script>` : ''
	return code?.trim() ? `<script${typeAttr}>\n${safeScript(code)}\n</script>` : ''
}

/** The frame's <html> attributes: the page's own (handlers dropped) over the app's lang and class. */
function htmlTagAttributes(htmlAttributes: Record<string, string> = {}): string {
	const attrs: Record<string, string> = { lang: document.documentElement.lang || 'en', class: document.documentElement.className }
	for (const [name, value] of Object.entries(htmlAttributes)) {
		if (!/^[a-z][a-z0-9-]*$/i.test(name) || /^(on.*|style|xmlns.*)$/i.test(name)) continue
		attrs[name] = name === 'class' ? [attrs.class, value].filter(Boolean).join(' ') : value
	}
	return Object.entries(attrs).map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join('')
}

export function buildSandboxDocument(element: HTMLElement, { title, js, classJs, pageScripts = [], htmlAttributes }: { title: string; js: string; classJs?: string; pageScripts?: PageScript[]; htmlAttributes?: Record<string, string> }): string {
	// A page that loads its own jQuery doesn't get a second copy.
	const ownJquery = pageScripts.some((script) => /jquery/i.test(script.src ?? ''))
	const scripts = [
		`<script>\n${SANDBOX_GUARD_SCRIPT}\n</script>`,
		`<script>\n${IN_PAGE_LINKS}\n${NO_SUBMIT_NAVIGATION}\n${ID_FALLBACK_SCRIPT}\n</script>`,
		usesJquery(js) && !ownJquery ? `<script src="${JQUERY_SRC}" integrity="${JQUERY_INTEGRITY}" crossorigin="anonymous"></script>` : '',
		// The page's own libraries and modules, in its order, before the code that uses them.
		...pageScripts.map(pageScriptTag),
		classJs?.trim() ? `<script>\n${safeScript(classJs)}\n</script>` : '',
		js.trim() ? `<script>\n${safeScript(js)}\n</script>` : '',
	].filter(Boolean).join('\n')

	return `<!DOCTYPE html>
<html${htmlTagAttributes(htmlAttributes)}>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${buildSandboxCsp(window.location.origin)}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
${collectStyles()}
<style>${surroundingColors(element)}</style>
</head>
<body>
${snapshot(element)}
${scripts}
</body>
</html>`
}
