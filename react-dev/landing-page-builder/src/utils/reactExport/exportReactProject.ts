import type { RefObject } from 'react'
import type { ExportHtmlAssets } from '@/utils/exportHTML'
import type { ReactExportOptions } from './buildReactProject'

/**
 * Exports the rendered preview as a React + TypeScript (Vite) project in a .zip.
 * Same input as exportHTML: the preview's DOM plus the page's stylesheets and scripts.
 * The converter and the zip library load only now, so they stay out of the main bundle.
 */
export async function exportReactProject(contentRef: RefObject<HTMLDivElement>, title: string, assets: ExportHtmlAssets = {}, options: ReactExportOptions = {}): Promise<void> {
	const element = contentRef.current
	if (!element) throw new Error('The page is not ready yet')
	const [{ buildReactProject, projectSlug }, { strToU8, zipSync }] = await Promise.all([import('./buildReactProject'), import('fflate')])

	const folder = `${projectSlug(title)}-react`
	const files = buildReactProject(element.innerHTML, title, assets, options)
	const entries = Object.fromEntries(Object.entries(files).map(([path, text]) => [`${folder}/${path}`, strToU8(text)]))
	const blob = new Blob([zipSync(entries, { level: 6 }) as BlobPart], { type: 'application/zip' })

	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${folder}.zip`
	link.click()
	URL.revokeObjectURL(url)
}
