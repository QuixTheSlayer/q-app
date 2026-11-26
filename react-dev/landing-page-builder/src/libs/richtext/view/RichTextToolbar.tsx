import React, { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import {
	AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ChevronDown, ClipboardPaste, ClipboardType, Code, Code2, Copy, Eye, IndentDecrease, IndentIncrease, Italic, Link2, Link2Off,
	List, ListOrdered, Minus, Quote, Redo2, RemoveFormatting, Replace, Scissors, Search, SquareCode, Strikethrough, Subscript, Superscript, Table, TextSelect, Underline, Undo2, Trash2, Combine, Split, ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, Rows3, Columns3,
} from 'lucide-react'
import { fonts } from '@/consts/propertyField.consts'
import CSSUtils from '@/utils/CSS.utils'
import { pasteFrom } from './clipboard'
import { findNext, replaceAll, replaceOne } from './findReplace'
import type { RichTextHandle } from '../handle'

export type EditorView = 'edit' | 'source' | 'preview'

export interface ToolbarProps {
	handle: RichTextHandle
	className?: string
	/** Source / Preview buttons, only offered by the boxed editor that can show those views. */
	view?: { mode: EditorView; onChange: (mode: EditorView) => void }
}

type Chain = { [command: string]: (...args: any[]) => Chain } & { run(): boolean }

const sizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64]
const btn =
	'inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-1.5 text-slate-600 transition-colors hover:bg-slate-200/70 disabled:pointer-events-none disabled:opacity-35 data-[active=true]:bg-slate-200 data-[active=true]:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:data-[active=true]:bg-slate-700 dark:data-[active=true]:text-white'
const dropdown =
	'h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-7 text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
const field = 'h-8 rounded-md border border-slate-300 bg-white px-2 dark:border-slate-600 dark:bg-slate-800'
const smallBtn = 'h-8 rounded-md border border-slate-300 px-3 hover:bg-slate-200/70 dark:border-slate-600 dark:hover:bg-slate-700'
const sep = (k: string) => <span key={k} className="mx-1 h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-600" aria-hidden />
const keep = (e: React.MouseEvent) => e.preventDefault()
const ic = 17

function Drop({ label, value, onChange, children, className }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
	return (
		<span className="relative inline-flex">
			<select aria-label={label} className={[dropdown, className].filter(Boolean).join(' ')} value={value} onChange={(e) => onChange(e.target.value)}>
				{children}
			</select>
			<ChevronDown size={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
		</span>
	)
}

function ColorTool({ label, color, glyph, onPick }: { label: string; color: string; glyph: React.ReactNode; onPick: (c: string) => void }) {
	return (
		<label className={btn + ' relative cursor-pointer'} title={label} onMouseDown={keep}>
			{glyph}
			<ChevronDown size={12} />
			<input type="color" aria-label={label} className="absolute inset-0 cursor-pointer opacity-0" value={/^#[0-9a-f]{6}$/i.test(color) ? color : '#000000'} onChange={(e) => onPick(e.target.value)} />
		</label>
	)
}

/** A formatting bar for a RichTextHandle. It re-renders on every editor change so the active states stay current. */
export function RichTextToolbar({ handle, className, view }: ToolbarProps) {
	const editor = handle.editor
	useSyncExternalStore(editor.subscribe, editor.getSnapshot)
	const [linkOpen, setLinkOpen] = useState(false)
	const [url, setUrl] = useState('')
	const [findOpen, setFindOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [replacement, setReplacement] = useState('')
	const [note, setNote] = useState('')
	const [gridOpen, setGridOpen] = useState(false)
	const [hover, setHover] = useState({ rows: 0, cols: 0 })

	const apply = (fn: (c: Chain) => Chain) => fn(handle.chain().focus() as unknown as Chain).run()
	const editing = !view || view.mode === 'edit'

	const tool = (label: string, icon: React.ReactNode, onRun: () => void, active?: boolean, disabled?: boolean, text?: string) => (
		<button key={label} type="button" className={btn} title={label} aria-label={label} aria-pressed={active} data-active={!!active} disabled={disabled || (!editing && label !== 'Source' && label !== 'Preview')} onMouseDown={keep} onClick={onRun}>
			{icon}
			{text && <span className="text-sm">{text}</span>}
		</button>
	)
	const mark = (label: string, name: string, icon: React.ReactNode, command: string) => tool(label, icon, () => apply((c) => c[command]!()), handle.isActive(name))

	const clip = (action: 'cut' | 'copy') => () => {
		editor.focus()
		document.execCommand(action)
	}
	const paste = (asText: boolean) => async () => {
		editor.focus()
		const data = new DataTransfer()
		try {
			for (const item of await navigator.clipboard.read()) {
				if (!asText && item.types.includes('text/html')) data.setData('text/html', await (await item.getType('text/html')).text())
				if (item.types.includes('text/plain')) data.setData('text/plain', await (await item.getType('text/plain')).text())
			}
		} catch {
			try {
				data.setData('text/plain', await navigator.clipboard.readText())
			} catch {
				setNote('Allow clipboard access to paste from here, or press Ctrl+V.')
				return
			}
		}
		pasteFrom(editor, data)
	}

	const textStyle = handle.getAttributes('textStyle')
	const textColor = String(textStyle.color ?? '')
	const highlight = String(handle.getAttributes('highlight').color || '#fde047')
	const px = CSSUtils.extractEmValue(textStyle.fontSize as string | undefined)
	const sizeValue = px && sizes.includes(px) ? String(px) : ''
	const fontValue = String(fonts.find((f) => handle.isActive('textStyle', { fontFamily: f.value }))?.value ?? '')
	const format = handle.isActive('codeBlock') ? 'code' : handle.isActive('blockquote') ? 'quote' : [1, 2, 3, 4].map((l) => (handle.isActive('heading', { level: l }) ? String(l) : '')).find(Boolean) ?? '0'
	const isLink = handle.isActive('link')
	const inTable = handle.isActive('table')
	const aligns: [string, React.ReactNode][] = [['left', <AlignLeft size={ic} />], ['center', <AlignCenter size={ic} />], ['right', <AlignRight size={ic} />], ['justify', <AlignJustify size={ic} />]]

	const setFormat = (v: string) => {
		if (v === 'code') return apply((c) => c.toggleCodeBlock())
		if (v === 'quote') return apply((c) => c.toggleBlockquote())
		const level = Number(v)
		apply((c) => (level ? c.setHeading({ level }) : c.setParagraph()))
	}
	const applyLink = () => {
		const href = url.trim()
		if (href) apply((c) => c.extendMarkRange('link').setLink({ href, target: '_blank' }))
		setLinkOpen(false)
	}
	const search = (fn: () => boolean | number) => setNote(fn() ? '' : 'No matches')

	return (
		<div role="toolbar" aria-label="Text formatting" className={['max-w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200', className].filter(Boolean).join(' ')} onClick={(e) => e.stopPropagation()}>
			<div className="flex flex-wrap items-center gap-0.5 p-2">
				{view && (
					<>
						{tool('Source', <Code2 size={ic} />, () => view.onChange(view.mode === 'source' ? 'edit' : 'source'), view.mode === 'source', false, 'Source')}
						{tool('Preview', <Eye size={ic} />, () => view.onChange(view.mode === 'preview' ? 'edit' : 'preview'), view.mode === 'preview')}
						{sep('s0')}
					</>
				)}
				{tool('Cut', <Scissors size={ic} />, clip('cut'))}
				{tool('Copy', <Copy size={ic} />, clip('copy'))}
				{tool('Paste', <ClipboardPaste size={ic} />, paste(false))}
				{tool('Paste as plain text', <ClipboardType size={ic} />, paste(true))}
				{sep('s1')}
				{tool('Undo', <Undo2 size={ic} />, () => handle.commands.undo!(), false, !editor.canUndo)}
				{tool('Redo', <Redo2 size={ic} />, () => handle.commands.redo!(), false, !editor.canRedo)}
				{sep('s2')}
				{tool('Find', <Search size={ic} />, () => setFindOpen((o) => !o), findOpen)}
				{tool('Find and replace', <Replace size={ic} />, () => setFindOpen(true))}
				{tool('Select all', <TextSelect size={ic} />, () => apply((c) => c.selectAll()))}
				{tool('Clear formatting', <RemoveFormatting size={ic} />, () => apply((c) => c.unsetAllMarks()))}
				{sep('s3')}
				{mark('Bold', 'bold', <Bold size={ic} />, 'toggleBold')}
				{mark('Italic', 'italic', <Italic size={ic} />, 'toggleItalic')}
				{mark('Underline', 'underline', <Underline size={ic} />, 'toggleUnderline')}
				{mark('Strikethrough', 'strike', <Strikethrough size={ic} />, 'toggleStrike')}
				{sep('s4')}
				<Drop label="Format" value={format} onChange={setFormat}>
					<option value="0">Paragraph</option>
					<option value="1">Heading 1</option>
					<option value="2">Heading 2</option>
					<option value="3">Heading 3</option>
					<option value="4">Heading 4</option>
					<option value="quote">Quote</option>
					<option value="code">Code</option>
				</Drop>
				<Drop label="Font size" value={sizeValue} onChange={(v) => apply((c) => (v ? c.setFontSize(CSSUtils.pxToEm(Number(v)) + 'em') : c.unsetFontSize()))} className="w-24">
					<option value="">Size</option>
					{sizes.map((s) => <option key={s} value={String(s)}>{s}</option>)}
				</Drop>
				<Drop label="Font" value={fontValue} onChange={(v) => apply((c) => (v ? c.setFontFamily(v) : c.unsetFontFamily()))} className="w-36">
					<option value="">Font</option>
					{fonts.map((f) => <option key={String(f.value)} value={String(f.value)}>{f.label}</option>)}
				</Drop>
				{sep('s5')}
				<ColorTool label="Text color" color={textColor} onPick={(c) => apply((x) => x.setColor(c))} glyph={<span className="text-base font-semibold leading-none" style={{ borderBottom: '3px solid ' + (textColor || '#e11d48') }}>A</span>} />
				<ColorTool label="Highlight color" color={highlight} onPick={(c) => apply((x) => x.setHighlight({ color: c }))} glyph={<span className="rounded-sm px-1 text-sm font-semibold leading-none" style={{ background: highlight }}>H</span>} />
				{sep('s6')}
				{aligns.map(([a, icon]) => tool(`Align ${a}`, icon, () => apply((c) => c.setTextAlign(a)), handle.isActive({ textAlign: a })))}
				{sep('s7')}
				{tool('Bullet list', <List size={ic} />, () => apply((c) => c.toggleBulletList()), handle.isActive('bulletList'))}
				{tool('Numbered list', <ListOrdered size={ic} />, () => apply((c) => c.toggleOrderedList()), handle.isActive('orderedList'))}
				{tool('Outdent', <IndentDecrease size={ic} />, () => apply((c) => c.liftListItem()), false, !handle.isActive('listItem'))}
				{tool('Indent', <IndentIncrease size={ic} />, () => apply((c) => c.sinkListItem()), false, !handle.isActive('listItem'))}
				{sep('s8')}
				{mark('Subscript', 'subscript', <Subscript size={ic} />, 'toggleSubscript')}
				{mark('Superscript', 'superscript', <Superscript size={ic} />, 'toggleSuperscript')}
				{mark('Inline code', 'code', <Code size={ic} />, 'toggleCode')}
				{tool('Quote', <Quote size={ic} />, () => apply((c) => c.toggleBlockquote()), handle.isActive('blockquote'))}
				{tool('Code block', <SquareCode size={ic} />, () => apply((c) => c.toggleCodeBlock()), handle.isActive('codeBlock'))}
				{tool('Divider', <Minus size={ic} />, () => apply((c) => c.setHorizontalRule()))}
				{isLink
					? tool('Remove link', <Link2Off size={ic} />, () => apply((c) => c.extendMarkRange('link').unsetLink()), true)
					: tool('Add link', <Link2 size={ic} />, () => (setUrl(''), setLinkOpen((o) => !o)), linkOpen)}
				<span className="relative inline-flex" onMouseLeave={() => setGridOpen(false)}>
					{tool('Insert table', <Table size={ic} />, () => setGridOpen((o) => !o), gridOpen || inTable)}
					{gridOpen && (
						<div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800" onMouseDown={keep}>
							<div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1.1rem)' }}>
								{Array.from({ length: 100 }, (_, i) => {
									const r = Math.floor(i / 10) + 1
									const c = (i % 10) + 1
									const on = r <= hover.rows && c <= hover.cols
									return <button key={i} type="button" aria-label={'Table ' + r + ' by ' + c} className={'size-[1.1rem] rounded-[3px] border ' + (on ? 'border-blue-500 bg-blue-200 dark:bg-blue-500/40' : 'border-slate-300 dark:border-slate-600')} onMouseEnter={() => setHover({ rows: r, cols: c })} onClick={() => (setGridOpen(false), apply((x) => x.insertTable({ rows: r, cols: c, withHeaderRow: true })))} />
								})}
							</div>
							<div className="mt-1.5 text-center text-xs text-slate-500">{hover.rows ? hover.cols + ' × ' + hover.rows : 'Choose size'}</div>
						</div>
					)}
				</span>
			</div>
			{inTable && editing && (
				<div className="flex flex-wrap items-center gap-0.5 border-t border-dashed border-slate-300 px-2 py-1 dark:border-slate-600" aria-label="Table tools">
					<span className="mr-1 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">Table</span>
					{tool('Row above', <ArrowUpToLine size={ic} />, () => apply((c) => c.addRowBefore()))}
					{tool('Row below', <ArrowDownToLine size={ic} />, () => apply((c) => c.addRowAfter()))}
					{tool('Column left', <ArrowLeftToLine size={ic} />, () => apply((c) => c.addColumnBefore()))}
					{tool('Column right', <ArrowRightToLine size={ic} />, () => apply((c) => c.addColumnAfter()))}
					{sep('t1')}
					{tool('Delete row', <Rows3 size={ic} />, () => apply((c) => c.deleteRow()), false, false, 'Row')}
					{tool('Delete column', <Columns3 size={ic} />, () => apply((c) => c.deleteColumn()), false, false, 'Column')}
					{sep('t2')}
					{tool('Merge cells', <Combine size={ic} />, () => apply((c) => c.mergeCells()))}
					{tool('Split cell', <Split size={ic} />, () => apply((c) => c.splitCell()))}
					{tool('Toggle header row', <Table size={ic} />, () => apply((c) => c.toggleHeaderRow()), false, false, 'Header')}
					{sep('t3')}
					{tool('Delete table', <Trash2 size={ic} />, () => apply((c) => c.deleteTable()), false, false, 'Delete table')}
				</div>
			)}
			{(linkOpen && !isLink) || findOpen || note ? (
				<div className="flex flex-wrap items-center gap-2 border-t border-dashed border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
					{linkOpen && !isLink && (
						<form className="flex items-center gap-2" onSubmit={(e) => (e.preventDefault(), applyLink())}>
							<input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" aria-label="Link address" className={field + ' w-56'} />
							<button type="submit" className="h-8 rounded-md bg-slate-800 px-3 text-white">Apply</button>
						</form>
					)}
					{findOpen && (
						<>
							<input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search(() => findNext(editor, query))} placeholder="Find" aria-label="Find" className={field + ' w-40'} />
							<input value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Replace with" aria-label="Replace with" className={field + ' w-40'} />
							<button type="button" className={smallBtn} onClick={() => search(() => findNext(editor, query))}>Find next</button>
							<button type="button" className={smallBtn} onClick={() => search(() => replaceOne(editor, query, replacement))}>Replace</button>
							<button type="button" className={smallBtn} onClick={() => search(() => replaceAll(editor, query, replacement))}>Replace all</button>
						</>
					)}
					{note && <span className="text-slate-500">{note}</span>}
				</div>
			) : null}
		</div>
	)
}

/** The toolbar pinned just under an element on the page (found by its data-id), following scroll and resize. */
export function FloatingRichTextToolbar({ handle, anchorId }: { handle: RichTextHandle; anchorId: string }) {
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

	useLayoutEffect(() => {
		const place = () => {
			const el = document.querySelector<HTMLElement>(`[data-name="node"][data-id="${CSS.escape(anchorId)}"]`)
			if (!el) return setPos(null)
			const r = el.getBoundingClientRect()
			setPos({ top: r.bottom + 8, left: Math.max(8, r.left) })
		}
		place()
		window.addEventListener('resize', place)
		window.addEventListener('scroll', place, true)
		const id = window.setInterval(place, 300)
		return () => {
			window.removeEventListener('resize', place)
			window.removeEventListener('scroll', place, true)
			window.clearInterval(id)
		}
	}, [anchorId])

	if (!pos) return null
	return createPortal(
		<div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 999998, width: 'min(760px, calc(100vw - 16px))' }}>
			<RichTextToolbar handle={handle} />
		</div>,
		document.body,
	)
}
