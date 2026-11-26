// Where one character, one word or one line ends. Used when the browser does not tell us what a delete should remove.
// Intl.Segmenter keeps a Burmese or emoji cluster whole; the fallback handles surrogate pairs and combining marks only.

type Unit = 'char' | 'word' | 'line'

interface Segment { index: number; segment: string; isWordLike?: boolean }
type SegmenterCtor = new (locale?: string, options?: { granularity: 'grapheme' | 'word' }) => { segment(input: string): Iterable<Segment> }

const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter

function segments(text: string, granularity: 'grapheme' | 'word'): Segment[] {
	if (Segmenter) return [...new Segmenter(undefined, { granularity }).segment(text)]
	// Fallback: a grapheme is a code point plus any combining marks after it; a word is a run of letters/digits or a single other character.
	const out: Segment[] = []
	const re = granularity === 'grapheme' ? /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[^])[̀-ͯ᪰-᫿᷀-᷿‍️ါ-ှ]*/gu : /[\p{L}\p{N}_]+|\s+|[^]/gu
	let m: RegExpExecArray | null
	while ((m = re.exec(text))) out.push({ index: m.index, segment: m[0], isWordLike: /[\p{L}\p{N}]/u.test(m[0]) })
	return out
}

/** The offset to delete back to from `offset`. */
export function previousBoundary(text: string, offset: number, unit: Unit): number {
	if (offset <= 0) return 0
	if (unit === 'line') {
		const start = text.lastIndexOf('\n', offset - 1)
		return start < 0 ? 0 : start + 1
	}
	if (unit === 'char') {
		let at = 0
		for (const s of segments(text, 'grapheme')) {
			if (s.index >= offset) break
			at = s.index
		}
		return at
	}
	// word: skip spaces and punctuation before the caret, then the word itself
	const words = segments(text, 'word').filter((s) => s.index < offset)
	let i = words.length - 1
	while (i >= 0 && !words[i]!.isWordLike && /^\s*$/.test(words[i]!.segment)) i--
	if (i < 0) return 0
	return words[i]!.index
}

/** The offset to delete forward to from `offset`. */
export function nextBoundary(text: string, offset: number, unit: Unit): number {
	if (offset >= text.length) return text.length
	if (unit === 'line') {
		const end = text.indexOf('\n', offset)
		return end < 0 ? text.length : end
	}
	if (unit === 'char') {
		for (const s of segments(text, 'grapheme')) {
			if (s.index + s.segment.length > offset) return s.index + s.segment.length
		}
		return text.length
	}
	const words = segments(text, 'word').filter((s) => s.index + s.segment.length > offset)
	let i = 0
	while (i < words.length && !words[i]!.isWordLike && /^\s*$/.test(words[i]!.segment)) i++
	if (i >= words.length) return text.length
	return words[i]!.index + words[i]!.segment.length
}
