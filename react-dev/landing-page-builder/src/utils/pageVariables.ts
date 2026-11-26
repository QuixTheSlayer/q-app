/**
 * An imported page's CSS custom properties get a private `--lp-` prefix. The page CSS is
 * injected unscoped into the editor, so a page `--muted` or `--bg` would fight the
 * builder's own theme variables of the same name (and break one side or the other).
 */

const PREFIX = '--lp-'

// A custom property declaration in CSS: `--name:`.
const DECLARED = /(?<![\w-])(--[\w-]+)\s*:/g
// A custom property name anywhere (`--name` in var(), a declaration or a style key),
// not glued to a longer word.
const NAME = /(?<![\w-])--[\w-]+(?![\w-])/g
// A JS string literal: '...', "..." or `...` (with escapes).
const JS_STRING = /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g

/** Names the page defines: CSS declarations plus custom properties set in style="" keys. */
function declaredNames(css: string, styleKeys: string[]): Set<string> {
	const names = new Set<string>()
	for (const match of css.matchAll(DECLARED)) names.add(match[1])
	for (const key of styleKeys) if (key.startsWith('--')) names.add(key)
	// Already private (e.g. a re-import of our own output): left as is.
	for (const name of names) if (name.startsWith(PREFIX)) names.delete(name)
	return names
}

function collectStyleKeys(node: unknown, out: string[] = []): string[] {
	if (!node || typeof node !== 'object') return out
	const { style, responsiveStyle, children } = node as { style?: object; responsiveStyle?: Record<string, object>; children?: unknown }
	if (style) out.push(...Object.keys(style))
	for (const bucket of Object.values(responsiveStyle ?? {})) out.push(...Object.keys(bucket ?? {}))
	if (Array.isArray(children)) children.forEach((child) => collectStyleKeys(child, out))
	return out
}

/** Prefixes the page's own custom properties in its CSS, node tree and JS string literals. */
export function scopePageVariables<T>(root: T, css: string, js: string): { root: T; css: string; js: string } {
	const names = declaredNames(css, collectStyleKeys(root))
	if (!names.size) return { root, css, js }
	const rename = (text: string) => text.replace(NAME, (name) => (names.has(name) ? PREFIX + name.slice(2) : name))
	return {
		root: JSON.parse(rename(JSON.stringify(root))) as T,
		css: rename(css),
		// Only inside strings ('var(--ink)', setProperty('--r')) - never `--i` decrements in code.
		js: js.replace(JS_STRING, rename),
	}
}
