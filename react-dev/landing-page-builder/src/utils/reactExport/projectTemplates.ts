// The fixed files of the exported Vite + React + TypeScript project (same versions this app uses).

export function packageJson(name: string): string {
	return `${JSON.stringify({
		name,
		private: true,
		version: '0.1.0',
		type: 'module',
		scripts: { dev: 'vite', build: 'vite build', typecheck: 'tsc --noEmit', preview: 'vite preview' },
		dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
		devDependencies: {
			'@types/react': '^18.3.18', '@types/react-dom': '^18.3.5', '@vitejs/plugin-react': '^4.3.4',
			typescript: '~5.6.2', vite: '^6.0.5',
		},
	}, null, 2)}\n`
}

export const TSCONFIG = `${JSON.stringify({
	compilerOptions: {
		target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler',
		jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, isolatedModules: true, types: ['vite/client'],
	},
	include: ['src'],
}, null, 2)}\n`

export const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

/** The builder's default stylesheets. The page's own CSS is linked at the end of index.html instead (see buildReactProject). */
export const mainTsx = (styles: string[]) => `import { createRoot } from 'react-dom/client'
import App from './App'
${styles.map((file) => `import './styles/${file}'`).join('\n')}

// No <StrictMode>: the page's own scripts (public/scripts) expect the page to be put on screen once.
createRoot(document.getElementById('root')!).render(<App />)
`

/**
 * The builder's rich-text list rules (src/index.css, which writes them with CSS nesting), flattened.
 * They style every plain list in a page - not imported text lists and not lists with a real tag
 * (`data-lp-text`, `data-lp-tag`) - with indent, margins and bullets that change per nesting level.
 */
function listCss(tag: 'ul' | 'ol', filter: string, types: string[]): string {
	const root = `${tag}${filter}:not([data-lp-text] *)`
	const rules: string[] = []
	let selector = root
	types.forEach((type, depth) => {
		if (depth === 0) rules.push(`${root} {\n  padding-left: 1.5rem;\n  margin: 0.5rem 0;\n}`)
		else {
			selector += ` > li > ${tag}${filter}`
			rules.push(`${selector} {\n  padding-left: 1.5rem;\n  margin-top: 0.3rem;\n}`)
		}
		rules.push(`${selector} > li {\n  list-style-type: ${type} !important;\n  margin-left: 0.4rem;\n}`)
	})
	return rules.join('\n\n')
}

const BULLET_LISTS = listCss('ul', ':not([data-type="taskList"]):not([data-lp-tag])', ['disc', 'circle', 'square'])
const NUMBERED_LISTS = listCss('ol', ':not([data-lp-tag])', ['decimal', 'upper-alpha', 'lower-alpha', 'upper-roman', 'lower-roman'])

/**
 * The rules the builder gives every rendered page that are not in the page's own CSS:
 * the UI package's resets (node_modules/judgify-react-ui), the base font and text rendering (Preview.css, editor.css, index.css), the boxed width and list rules (index.css) and the table defaults (editor.css, written
 * without the editor's `.judgify-editor` class). The builder's stylesheets are not part
 * of the export; without these the text falls back to Tailwind's system font and a
 * table loses its full width, fixed columns and cell padding.
 */
export const BUILDER_CSS = `/* Global resets from judgify-react-ui, the UI package the builder bundles (on top of Tailwind's reset). */
* {
  padding: 0;
  margin: 0;
  outline-color: #3b82f6;
}

li {
  list-style: none;
}

body {
  font-family: Arial, sans-serif;
  font-feature-settings: "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}

/* A boxed page (the page setting): capped at 1200px and centered, like Preview. */
.main-container-lp {
  max-width: 1200px;
  margin: 0 auto;
}

table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
  height: 100%;
}

.table-node * {
  border-color: inherit;
}

table td,
table th {
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  min-width: 1em;
  padding: 6px 8px;
  position: relative;
  vertical-align: middle;
}

table td > *,
table th > * {
  margin-bottom: 0;
}

table th {
  font-weight: normal;
  text-align: left;
}

.dragged-table {
  height: 100%;
}

.dragged-table tr {
  height: 2.77em !important;
}

${BULLET_LISTS}

${NUMBERED_LISTS}
`

export const GITIGNORE = 'node_modules\ndist\n'

export function readme(title: string, components: string[], hasScripts: boolean): string {
	return `# ${title}

Your Judgify landing page as a React + TypeScript project (Vite).

## Run it

1. Install Node.js 18 or newer from https://nodejs.org
2. In this folder, run \`npm install\`
3. Run \`npm run dev\` and open the address it shows (usually http://localhost:5173)

\`npm run build\` makes a \`dist/\` folder you can upload to any web host
(Vercel, Netlify, GitHub Pages…). \`npm run typecheck\` checks the TypeScript.

## What's where

- \`src/App.tsx\` puts the parts of the page in order.
- \`src/components/\` has one file per part: ${components.join(', ')}.
  Repeated items (cards, menu items, reviews…) have their own component, and
  their words, pictures and links are in a list at the top of the part that uses them.
- \`src/styles/\` has the builder's defaults (\`builder.css\`: base font, text rendering, boxed width, lists and tables).\n- \`public/styles/\` has the page's own CSS (\`page.css\` from Import HTML or Custom Code, plus the animation, responsive and class styles).\n  \`index.html\` links it at the end of \`<body>\`, in the order the builder applies it, so it wins over Tailwind's reset.\n- \`index.html\` has the title, the page's libraries and the \`<html>\` settings.
${hasScripts ? `- \`public/scripts/\` has the page's own JavaScript, unchanged. \`src/runPageScripts.ts\`
  runs it once after React has put the page on screen. Moving these behaviours
  into React (state and event handlers) is a good next step.
` : ''}
## Good to know

- **Tailwind** classes come from the Tailwind CDN script in \`index.html\`, like in the builder's HTML export.
  It is meant for development. For production, install Tailwind in this project and remove that script.
- **Judgify widgets** (sliders, countdowns, tabs, accordions) are exported as the markup the page shows,
  not as working React components.
- **Event tokens** such as \`{{event_register_url}}\` stay as written. Replace them with your own links and dates.
`
}
