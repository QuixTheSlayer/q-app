import React from 'react'
import { isElement, isTextblock, markRank } from '../schema'
import type { Attrs, ElementNode, Mark, RTNode, TextNode } from '../types'
import { FILLER_ATTR, NODE_ATTR, PATH_ATTR, pathToString } from './dom'

// The model drawn as React elements. Nodes keep their identity when an edit does not touch them, so React.memo skips them
// and the DOM under an unchanged block is not touched while the user types in another one.

const text = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined)

function markElement(mark: Mark, children: React.ReactNode, key: string): React.ReactNode {
	const a = mark.attrs ?? {}
	switch (mark.type) {
		case 'bold': return <strong key={key}>{children}</strong>
		case 'italic': return <em key={key}>{children}</em>
		case 'underline': return <u key={key}>{children}</u>
		case 'strike': return <s key={key}>{children}</s>
		case 'code': return <code key={key}>{children}</code>
		case 'subscript': return <sub key={key}>{children}</sub>
		case 'superscript': return <sup key={key}>{children}</sup>
		case 'link':
			return <a key={key} href={text(a.href)} target={text(a.target)} rel={text(a.rel)} className={text(a.class)} title={text(a.title)}>{children}</a>
		case 'highlight': {
			const color = text(a.color)
			return <mark key={key} data-color={color} style={color ? { backgroundColor: color, color: 'inherit' } : undefined}>{children}</mark>
		}
		case 'textStyle': {
			const style: React.CSSProperties = {}
			if (text(a.color)) style.color = a.color as string
			if (text(a.fontSize)) style.fontSize = a.fontSize as string
			if (text(a.fontFamily)) style.fontFamily = a.fontFamily as string
			if (text(a.lineHeight)) style.lineHeight = a.lineHeight as string
			return Object.keys(style).length ? <span key={key} style={style}>{children}</span> : <React.Fragment key={key}>{children}</React.Fragment>
		}
		default: return <React.Fragment key={key}>{children}</React.Fragment>
	}
}

/** A run: its text (a "\n" is a <br>) inside its marks, the link outermost. */
function renderRun(run: TextNode, key: string, keepNewlines: boolean): React.ReactNode {
	const parts: React.ReactNode[] = []
	if (keepNewlines) parts.push(run.text)
	else run.text.split('\n').forEach((piece, i) => {
		if (i > 0) parts.push(<br key={`b${i}`} />)
		if (piece) parts.push(piece)
	})
	let node: React.ReactNode = <React.Fragment key={`t${key}`}>{parts}</React.Fragment>
	const marks = [...(run.marks ?? [])].sort((x, y) => markRank(x.type) - markRank(y.type))
	for (let i = marks.length - 1; i >= 0; i--) node = markElement(marks[i]!, node, `${key}m${i}`)
	return node
}

const endsWithBreak = (runs: TextNode[]) => runs.length > 0 && runs[runs.length - 1]!.text.endsWith('\n')

function renderInline(node: ElementNode): React.ReactNode[] {
	const runs = (node.content ?? []) as TextNode[]
	const code = node.type === 'codeBlock'
	const out: React.ReactNode[] = runs.map((r, i) => renderRun(r, String(i), code))
	// An empty line, or one ending in a break, needs a spare <br> to have a height.
	if (!runs.length || endsWithBreak(runs)) out.push(<br key="filler" {...{ [FILLER_ATTR]: '' }} />)
	return out
}

const textAlignStyle = (attrs?: Attrs): React.CSSProperties | undefined => (attrs?.textAlign ? { textAlign: attrs.textAlign as React.CSSProperties['textAlign'] } : undefined)

export interface RenderContext {
	/** Bumped for a block to rebuild its DOM from scratch (after an input method changed it behind React's back). */
	epochs: Map<string, number>
}

interface BlockProps {
	node: ElementNode
	path: readonly number[]
	ctx: RenderContext
	epoch: number
}

function renderChildren(node: ElementNode, path: readonly number[], ctx: RenderContext): React.ReactNode[] {
	return (node.content ?? []).filter((c): c is ElementNode => isElement(c as RTNode)).map((child, i) => {
		const childPath = [...path, i]
		const epoch = ctx.epochs.get(pathToString(childPath)) ?? 0
		return <BlockView key={`${i}:${epoch}`} node={child} path={childPath} ctx={ctx} epoch={epoch} />
	})
}

const colWidths = (cell: ElementNode): number[] | null => {
	const w = cell.attrs?.colwidth
	return Array.isArray(w) && w.every((x) => typeof x === 'number') ? (w as number[]) : null
}

function BlockBody({ node, path, ctx }: BlockProps): React.ReactElement {
	const id = pathToString(path)
	const common = { [NODE_ATTR]: id }
	const textblock = { ...common, [PATH_ATTR]: id }
	switch (node.type) {
		case 'paragraph':
			return <p {...textblock} style={textAlignStyle(node.attrs)}>{renderInline(node)}</p>
		case 'heading': {
			const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1))
			return React.createElement(`h${level}`, { ...textblock, style: textAlignStyle(node.attrs) }, renderInline(node))
		}
		case 'codeBlock':
			return <pre {...textblock}><code className={text(node.attrs?.language) ? `language-${node.attrs!.language}` : undefined}>{renderInline(node)}</code></pre>
		case 'blockquote':
			return <blockquote {...common}>{renderChildren(node, path, ctx)}</blockquote>
		case 'bulletList':
			return <ul {...common}>{renderChildren(node, path, ctx)}</ul>
		case 'orderedList': {
			const start = Number(node.attrs?.start)
			return <ol {...common} start={start && start !== 1 ? start : undefined} type={text(node.attrs?.type) as React.OlHTMLAttributes<HTMLOListElement>['type']}>{renderChildren(node, path, ctx)}</ol>
		}
		case 'listItem':
			return <li {...common}>{renderChildren(node, path, ctx)}</li>
		case 'horizontalRule':
			return <hr {...common} contentEditable={false} />
		case 'table': {
			const firstRow = (node.content?.[0] as ElementNode | undefined)
			const widths: (number | null)[] = []
			for (const cell of (firstRow?.content ?? []) as ElementNode[]) {
				const w = colWidths(cell)
				const span = Number(cell.attrs?.colspan) || 1
				for (let i = 0; i < span; i++) widths.push(w?.[i] ?? null)
			}
			const hasWidths = widths.some((w) => w)
			return (
				<table {...common}>
					{hasWidths && <colgroup contentEditable={false}>{widths.map((w, i) => <col key={i} style={w ? { width: `${w}px` } : { minWidth: '25px' }} />)}</colgroup>}
					<tbody>{renderChildren(node, path, ctx)}</tbody>
				</table>
			)
		}
		case 'tableRow':
			return <tr {...common}>{renderChildren(node, path, ctx)}</tr>
		case 'tableCell':
		case 'tableHeader': {
			const Tag = node.type === 'tableHeader' ? 'th' : 'td'
			const colspan = Number(node.attrs?.colspan) || 1
			const rowspan = Number(node.attrs?.rowspan) || 1
			const w = colWidths(node)
			return (
				<Tag {...common} colSpan={colspan > 1 ? colspan : undefined} rowSpan={rowspan > 1 ? rowspan : undefined} data-colwidth={w ? w.join(',') : undefined}>
					{renderChildren(node, path, ctx)}
				</Tag>
			)
		}
		default:
			return <div {...common}>{isTextblock(node) ? renderInline(node) : renderChildren(node, path, ctx)}</div>
	}
}

export const BlockView = React.memo(
	function BlockView(props: BlockProps) {
		return BlockBody(props)
	},
	(a, b) => a.node === b.node && a.epoch === b.epoch && a.path.length === b.path.length && a.path.every((v, i) => v === b.path[i]),
)

export function renderDoc(doc: ElementNode, ctx: RenderContext): React.ReactNode[] {
	return renderChildren(doc, [], ctx)
}
