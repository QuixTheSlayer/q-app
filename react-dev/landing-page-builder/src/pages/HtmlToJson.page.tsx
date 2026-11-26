import { useRef, useState } from 'react'
import { Copy, Download, Eraser, Upload } from 'lucide-react'
import { toast } from 'sonner'
import ToolsNav from '@/components/tools/ToolsNav'
import { Button } from '@/components/ui/primitives/button'
import { TextArea } from '@/components/ui/primitives/text-area'
import { HtmlJsonResult, HtmlJsonShape, convertHtmlToJson } from '@/utils/htmlToJsonTool'
import { MAX_HTML_FILE_BYTES, readHtmlFile } from '@/utils/readHtmlFile'
import { ConvertError } from '@/utils/security/convertCode'

const SHAPE_LABELS: Record<HtmlJsonShape, string> = {
  page: 'Page content (as saved)',
  full: 'Full result (tree, css, js, notes)',
}

const size = (text: string) => (text.length >= 1024 ? `${(text.length / 1024).toFixed(1)} KB` : `${text.length} characters`)

/**
 * A hidden tool that turns HTML into the page JSON tree with the same importer as Import HTML, so a page can be
 * converted without opening the editor, or the JSON compared with what a page saves.
 * Reached with ?html-json on a page address Laravel serves (see hiddenTools.ts). It has no link anywhere.
 */
export default function HtmlToJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [shape, setShape] = useState<HtmlJsonShape>('page')
  const [encrypt, setEncrypt] = useState(false)
  const [pretty, setPretty] = useState(true)
  const [result, setResult] = useState<HtmlJsonResult | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const reset = () => {
    setOutput('')
    setResult(null)
    setError('')
  }

  const run = async () => {
    setRunning(true)
    setError('')
    setResult(null)
    // The importer is synchronous, so let the button show it is working before a large page blocks the thread.
    await new Promise((resolve) => setTimeout(resolve, 0))
    try {
      const converted = await convertHtmlToJson(input, { shape, encrypt, pretty })
      setOutput(converted.output)
      setResult(converted)
    } catch (e) {
      setOutput('')
      setError(e instanceof ConvertError ? e.message : 'Something went wrong while converting. Check the HTML and try again.')
    } finally {
      setRunning(false)
    }
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    const read = await readHtmlFile(file)
    if (fileInput.current) fileInput.current.value = ''
    if (!read.ok) {
      setError(read.reason === 'tooLarge' ? `That file is larger than ${MAX_HTML_FILE_BYTES / 1024 / 1024} MB.` : read.reason === 'empty' ? 'That file is empty.' : 'That file could not be read.')
      return
    }
    setInput(read.text)
    reset()
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Copied')
    } catch {
      toast.error('Could not copy. Select the text and copy it by hand.')
    }
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = shape === 'page' ? 'page_content.json' : 'import-result.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = result?.stats

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-4 p-6 text-foreground">
      <header>
        <ToolsNav current="html-json" />
        <h1 className="mt-3 text-xl font-semibold">HTML to JSON tree converter</h1>
        <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
          Converts HTML (a full page or a fragment, with its style and script) into the node tree the editor uses, with the same importer as Import HTML.
          Everything happens in this browser; nothing is sent anywhere.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-md border border-border bg-black/20 p-3">
        <label className="flex flex-col gap-1 text-xs font-medium">
          Output
          <select value={shape} onChange={(e) => setShape(e.target.value as HtmlJsonShape)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
            {(Object.keys(SHAPE_LABELS) as HtmlJsonShape[]).map((value) => (
              <option key={value} value={value}>{SHAPE_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm" title="The form that is sent when a page is saved">
          <input type="checkbox" checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} />
          Encrypt CSS, JS and SVG
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
          Indent JSON output
        </label>

        <div className="ml-auto">
          <Button type="button" variant="primary" onClick={run} isDisabled={running || !input.trim()}>
            {running ? 'Converting...' : 'Convert'}
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="flex min-h-[320px] flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">HTML</h2>
            <div className="flex gap-1">
              <input ref={fileInput} type="file" accept=".html,.htm,text/html,text/plain" hidden onChange={(e) => upload(e.target.files?.[0])} />
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}><Upload size={14} className="mr-1.5" />Open file</Button>
              <Button type="button" variant="outline" onClick={() => { setInput(''); reset() }} isDisabled={!input}><Eraser size={14} className="mr-1.5" />Clear</Button>
            </div>
          </div>
          <TextArea
            aria-label="HTML"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run() }}
            placeholder="Paste HTML, with its <style> and <script>. A reply from an AI chat with ```html fences works too."
            className="min-h-[320px] flex-1 resize-y font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">{size(input)}. Ctrl+Enter converts.</p>
        </section>

        <section className="flex min-h-[320px] flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">JSON</h2>
            <div className="flex gap-1">
              <Button type="button" variant="outline" onClick={copy} isDisabled={!output}><Copy size={14} className="mr-1.5" />Copy</Button>
              <Button type="button" variant="outline" onClick={download} isDisabled={!output}><Download size={14} className="mr-1.5" />Download</Button>
            </div>
          </div>
          <TextArea aria-label="JSON" readOnly spellCheck={false} value={output} className="min-h-[320px] flex-1 resize-y font-mono text-xs" />
          <div aria-live="polite" className="min-h-[1.25rem] text-xs">
            {error && <p role="alert" className="text-destructive">{error}</p>}
            {stats && (
              <div className="flex flex-col gap-1 text-muted-foreground">
                <p>
                  {stats.sections} section{stats.sections === 1 ? '' : 's'}, {stats.nodes} nodes. CSS {(stats.cssBytes / 1024).toFixed(1)} KB, JS {(stats.jsBytes / 1024).toFixed(1)} KB. Output {size(output)}.
                </p>
                {stats.skipped.length > 0 && <p>Dropped, no equivalent node: {stats.skipped.map((tag) => `<${tag}>`).join(', ')}.</p>}
                {stats.external.length > 0 && <p>Linked files that could not be included: {stats.external.join(', ')}.</p>}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
