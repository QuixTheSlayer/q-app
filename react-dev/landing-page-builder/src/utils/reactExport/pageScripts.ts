import type { PageScript } from '@/types/node.type'
import { JQUERY_INTEGRITY, JQUERY_SRC, usesJquery } from '@/utils/jquery.utils'
import { ID_FALLBACK_SCRIPT } from '@/utils/pageIds'
import { pageScriptTag } from '@/utils/security/sandboxDocument'

export type ScriptFile = { src: string; module: boolean }

/** Where each of the page's scripts goes in the React project. */
export type ScriptPlan = {
	/** public/scripts/… files, run once after React has mounted. */
	files: Record<string, string>
	run: ScriptFile[]
	/** Tags that stay in index.html (libraries, JSON data). */
	tags: string[]
}

const isRunnableJs = (script: PageScript) => !script.type || /^(text|application)\/(x-)?javascript$/i.test(script.type) || script.type === 'module'

const JQUERY_TAG = `<script src="${JQUERY_SRC}" integrity="${JQUERY_INTEGRITY}" crossorigin="anonymous"></script>`

/**
 * Same order as Export HTML: jQuery, the page's libraries and modules, the
 * generated class interactions, then the page's own JS. Libraries stay as tags in
 * index.html. Inline code needs the page on screen, so it moves to public/scripts
 * and runs after mount.
 */
export function planScripts({ plainJS, classJs, pageScripts = [] }: { plainJS?: string; classJs?: string; pageScripts?: PageScript[] }): ScriptPlan {
	const plan: ScriptPlan = { files: {}, run: [], tags: [] }
	const addFile = (code: string, module: boolean) => {
		const src = `scripts/${module ? 'module' : 'page'}-${plan.run.length + 1}.js`
		plan.files[`public/${src}`] = `${code.trim()}\n`
		plan.run.push({ src, module })
	}

	const ownJquery = pageScripts.some((script) => /jquery/i.test(script.src ?? ''))
	if (plainJS && usesJquery(plainJS) && !ownJquery) plan.tags.push(JQUERY_TAG)

	for (const script of pageScripts) {
		if (script.src || !isRunnableJs(script)) {
			const tag = pageScriptTag(script)
			if (tag) plan.tags.push(tag)
		} else if (script.code?.trim()) {
			addFile(script.code, script.type === 'module')
		}
	}
	if (classJs?.trim()) addFile(classJs, false)
	// Imported ids carry an `lp-` prefix; scripts that build an id at runtime still find it.
	if (plainJS?.trim()) addFile(`${ID_FALLBACK_SCRIPT}\n${plainJS}`, false)
	return plan
}
