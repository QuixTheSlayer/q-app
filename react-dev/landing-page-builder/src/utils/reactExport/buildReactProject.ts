import type { LayoutNode, PageScript } from '@/types/node.type'
import { escapeHtml, htmlTagAttributes, type ExportHtmlAssets } from '@/utils/exportHTML'
import { partComponent } from './componentFiles'
import { parseRenderedHtml } from './domToNodes'
import { openTag, type JsxContext } from './jsxWriter'
import { createNameRegistry, createNaming } from './names'
import { planScripts } from './pageScripts'
import { BUILDER_CSS, GITIGNORE, TSCONFIG, VITE_CONFIG, mainTsx, packageJson, readme } from './projectTemplates'
import { runnerSource } from './runnerTemplate'
import { isBlankText, isElement, type ElementNode, type NodeMap } from './types'

export type ExportFiles = Record<string, string>

export interface ReactExportOptions {
	/** The page's "boxed" setting (is_boxed): capped at 1200px and centered, like Preview's `main-container-lp`. */
	boxed?: boolean
}

// Indent of the page's JSX inside App's return ( … ).
const PAD = '    '

/** Folder and package name from the page title: "My Page!" -> "my-page". */
export const projectSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'landing-page'

/** The page's CSS for React: the app lives in <div id="root">, so "body > x" rules go through it. */
const reactCss = (css: string) => css.replace(/\bbody\s*>/g, 'body > #root >')

/** Class names the page defines rules for (root.css): these name components, Tailwind utilities do not. */
function ownClasses(content: ExportHtmlAssets['content']): Set<string> {
	const rules = (content as LayoutNode | undefined)?.css
	return new Set(rules && !Array.isArray(rules) ? Object.keys(rules).filter((name) => !/^\d+$/.test(name)) : [])
}

/** The elements directly inside `id`, without spacing-only text. */
function elementChildren(nodes: NodeMap, id: string): ElementNode[] {
	return (nodes[id] as ElementNode).children.map((child) => nodes[child]).filter(isElement)
}
const hasLooseText = (nodes: NodeMap, id: string) =>
	(nodes[id] as ElementNode).children.some((child) => nodes[child]?.kind === 'text' && !isBlankText((nodes[child] as { text: string }).text))

/**
 * The page (as rendered by Preview, the same markup Export HTML writes) as a
 * Vite + React + TypeScript project: path -> file text.
 *
 * The single wrapper around the page stays in App.tsx; each part inside it (navbar,
 * each section, footer) becomes a component, with repeated items as their own component.
 */
export function buildReactProject(bodyHtml: string, title: string, assets: ExportHtmlAssets = {}, options: ReactExportOptions = {}): ExportFiles {
	const { animationCss, responsiveCss, classCss, plainCss, classJs, plainJS, content } = assets
	const root = content as { pageScripts?: PageScript[]; htmlAttributes?: Record<string, string> } | undefined
	const pageScripts = root?.pageScripts ?? []
	const scripts = planScripts({ plainJS, classJs, pageScripts })

	// A `data-id` is kept only where CSS or a script points at it (see parseRenderedHtml).
	const referenced = [animationCss, responsiveCss, classCss, plainCss, classJs, plainJS, ...pageScripts.map((script) => script.code)].filter(Boolean).join('\n')
	const { nodes, rootId } = parseRenderedHtml(bodyHtml, (value) => Boolean(value) && referenced.includes(value))

	const naming = createNaming(ownClasses(content))
	const takeName = createNameRegistry()
	const usage = { cssProperties: false }
	const ctx: JsxContext = { nodes, usage }

	// One wrapper element around the whole page stays in App; otherwise the parts are the page's top-level elements.
	const top = elementChildren(nodes, rootId)
	const wrapper = top.length === 1 && !hasLooseText(nodes, rootId) && elementChildren(nodes, top[0]!.id).length > 0 && !hasLooseText(nodes, top[0]!.id) ? top[0]! : null
	const parts = wrapper ? elementChildren(nodes, wrapper.id) : top

	const componentFiles: Record<string, string> = {}
	const names: string[] = []
	const tags: string[] = []
	for (const part of parts) {
		const name = takeName(naming.describeName(nodes, part))
		for (const file of partComponent(nodes, part.id, name, takeName, naming)) componentFiles[`src/components/${file.name}.tsx`] = file.code
		names.push(name)
		tags.push(`<${name} />`)
	}

	const hasScripts = scripts.run.length > 0
	const inner = tags.map((tag) => `${PAD}  ${tag}`)
	const page = wrapper
		? [`${PAD}${openTag(ctx, wrapper, PAD)}`, ...inner, `${PAD}</${wrapper.tag}>`]
		: [`${PAD}<>`, ...inner, `${PAD}</>`]
	const body = options.boxed ? [`${PAD}<div className="main-container-lp">`, ...page.map((line) => `  ${line}`), `${PAD}</div>`] : page
	const app = [
		...(hasScripts ? ["import { useEffect } from 'react'"] : []),
		...(usage.cssProperties ? ["import type { CSSProperties } from 'react'"] : []),
		...names.map((name) => `import ${name} from './components/${name}'`),
		...(hasScripts ? ["import { runPageScripts } from './runPageScripts'"] : []),
		'',
		'/** The whole page, part by part, in order. */',
		'export default function App() {',
		...(hasScripts ? ['  useEffect(() => runPageScripts(), [])'] : []),
		'  return (',
		...body,
		'  )',
		'}',
		'',
	].join('\n')

	// The builder's own defaults are imported by main.tsx. The page's CSS is linked at the end of <body> (like the
	// builder appends it), after the style Tailwind adds to <head>, so at equal specificity the page wins. It lives in
	// public/ because Vite would merge a processed stylesheet into <head>.
	const appStyles: [string, string | undefined][] = [
		['base.css', '#root { display: contents; }\n'],
		['builder.css', BUILDER_CSS],
	]
	const pageStyles: [string, string | undefined][] = [
		['animation.css', animationCss],
		['responsive.css', responsiveCss],
		['classes.css', classCss],
		['page.css', plainCss ? `${reactCss(plainCss)}\n` : undefined],
	]
	const usedApp = appStyles.filter(([, css]) => css?.trim())
	const usedPage = pageStyles.filter(([, css]) => css?.trim())

	const indexHtml = [
		'<!doctype html>',
		`<html${htmlTagAttributes(root?.htmlAttributes)}>`,
		'<head>',
		'<meta charset="UTF-8" />',
		'<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
		`<title>${escapeHtml(title)}</title>`,
		'<script src="https://cdn.tailwindcss.com"></script>',
		'</head>',
		'<body>',
		'<div id="root"></div>',
		...scripts.tags,
		'<script type="module" src="/src/main.tsx"></script>',
		...usedPage.map(([file]) => `<link rel="stylesheet" href="/styles/${file}" />`),
		'</body>',
		'</html>',
		'',
	].join('\n')

	const files: ExportFiles = {
		'package.json': packageJson(projectSlug(title)),
		'tsconfig.json': TSCONFIG,
		'vite.config.ts': VITE_CONFIG,
		'.gitignore': GITIGNORE,
		'README.md': readme(title, names, hasScripts),
		'index.html': indexHtml,
		'src/main.tsx': mainTsx(usedApp.map(([file]) => file)),
		'src/App.tsx': app,
		...(hasScripts ? { 'src/runPageScripts.ts': runnerSource(scripts.run) } : {}),
		...Object.fromEntries(usedApp.map(([file, css]) => [`src/styles/${file}`, css!])),
		...Object.fromEntries(usedPage.map(([file, css]) => [`public/styles/${file}`, css!.endsWith('\n') ? css! : `${css}\n`])),
		...scripts.files,
		...componentFiles,
	}
	return files
}
