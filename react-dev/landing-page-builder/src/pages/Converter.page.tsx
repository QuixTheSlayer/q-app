import { useRef, useState } from 'react'
import { ArrowLeftRight, Copy, Download, Eraser, KeyRound, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/primitives/button'
import { TextArea } from '@/components/ui/primitives/text-area'
import { cn } from '@/libs/cn'
import ToolsNav from '@/components/tools/ToolsNav'
import { setPassphraseOverride } from '@/utils/security/codeCrypto'
import { ConvertError, ConvertKind, ConvertMode, ConvertResult, convert } from '@/utils/security/convertCode'

const KIND_LABELS: Record<ConvertKind, string> = {
  auto: 'Detect',
  text: 'Text (CSS, JS, SVG)',
  page: 'Page data (JSON)',
}

const size = (text: string) => (text.length >= 1024 ? `${(text.length / 1024).toFixed(1)} KB` : `${text.length} characters`)

/**
 * A hidden tool for converting text or page data to and from the encrypted form that saves use, by hand: to read
 * what is stored in the database or seen in the network tab, or to prepare a value to paste in.
 * Reached with ?converter on a page address Laravel serves (see App.tsx). It has no link anywhere.
 */
export default function Converter() {
  const [mode, setMode] = useState<ConvertMode>('decrypt')
  const [kind, setKind] = useState<ConvertKind>('auto')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [pretty, setPretty] = useState(true)
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const run = async () => {
    setRunning(true)
    setError('')
    setResult(null)
    // The override only lasts for this conversion, so the next one starts from the editor's own passphrase again.
    setPassphraseOverride(passphrase || null)
    try {
      const converted = await convert(mode, kind, input, { pretty })
      setOutput(converted.output)
      setResult(converted)
    } catch (e) {
      setOutput('')
      setError(e instanceof ConvertError ? e.message : 'Something went wrong while converting. Check the text and try again.')
    } finally {
      setPassphraseOverride(null)
      setRunning(false)
    }
  }

  const swap = () => {
    setInput(output)
    setOutput('')
    setResult(null)
    setError('')
    setMode((m) => (m === 'encrypt' ? 'decrypt' : 'encrypt'))
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
    const isJson = result?.kind === 'page'
    const url = URL.createObjectURL(new Blob([output], { type: isJson ? 'application/json' : 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${mode === 'encrypt' ? 'encrypted' : 'decrypted'}.${isJson ? 'json' : 'txt'}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    setInput(await file.text())
    setOutput('')
    setResult(null)
    setError('')
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-4 p-6 text-foreground">
      <header>
        <ToolsNav current="converter" />
        <h1 className="mt-3 text-xl font-semibold">Encrypt / decrypt converter</h1>
        <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
          Converts text or page data the same way saving and loading a page does. Encrypted values start with <code>enc1:</code> or <code>b64:</code>.
          Everything happens in this browser; nothing is sent anywhere.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-md border border-border bg-black/20 p-3">
        <div role="group" aria-label="Direction" className="flex overflow-hidden rounded-md border border-border">
          {(['decrypt', 'encrypt'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn('px-4 py-2 text-sm font-medium capitalize', mode === value ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10')}
            >
              {value}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium">
          Input is
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ConvertKind)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {(Object.keys(KIND_LABELS) as ConvertKind[]).map((value) => (
              <option key={value} value={value}>{KIND_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium">
          Passphrase (leave empty for the editor's own)
          <span className="flex items-center gap-1">
            <input
              type={showPassphrase ? 'text' : 'password'}
              autoComplete="off"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="uses the editor's passphrase"
              className="h-9 w-[260px] rounded-md border border-input bg-background px-2 text-sm text-foreground"
            />
            <button type="button" aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'} aria-pressed={showPassphrase} onClick={() => setShowPassphrase((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-white/10">
              <KeyRound size={15} />
            </button>
          </span>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
          Indent JSON output
        </label>

        <div className="ml-auto flex gap-2">
          <Button type="button" variant="primary" onClick={run} isDisabled={running || !input.trim()}>
            {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <section className="flex min-h-[320px] flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Input</h2>
            <div className="flex gap-1">
              <input ref={fileInput} type="file" hidden onChange={(e) => upload(e.target.files?.[0])} />
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}><Upload size={14} className="mr-1.5" />Open file</Button>
              <Button type="button" variant="outline" onClick={() => { setInput(''); setOutput(''); setResult(null); setError('') }} isDisabled={!input}><Eraser size={14} className="mr-1.5" />Clear</Button>
            </div>
          </div>
          <TextArea
            aria-label="Input"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run() }}
            placeholder={mode === 'decrypt' ? 'Paste enc1:... text, or page data with encrypted values' : 'Paste CSS, JavaScript, SVG, or page data (JSON)'}
            className="min-h-[320px] flex-1 resize-y font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">{size(input)}. Ctrl+Enter converts.</p>
        </section>

        <div className="flex items-center justify-center">
          <Button type="button" variant="outline" onClick={swap} isDisabled={!output} aria-label="Use the output as the input, in the other direction" title="Use the output as the input, in the other direction">
            <ArrowLeftRight size={16} />
          </Button>
        </div>

        <section className="flex min-h-[320px] flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Output</h2>
            <div className="flex gap-1">
              <Button type="button" variant="outline" onClick={copy} isDisabled={!output}><Copy size={14} className="mr-1.5" />Copy</Button>
              <Button type="button" variant="outline" onClick={download} isDisabled={!output}><Download size={14} className="mr-1.5" />Download</Button>
            </div>
          </div>
          <TextArea aria-label="Output" readOnly spellCheck={false} value={output} className="min-h-[320px] flex-1 resize-y font-mono text-xs" />
          <div aria-live="polite" className="min-h-[1.25rem] text-xs">
            {error && <p role="alert" className="text-destructive">{error}</p>}
            {result && (
              <p className="text-muted-foreground">
                {result.kind === 'page' ? 'Page data' : 'Text'}: {result.changed} value{result.changed === 1 ? '' : 's'} {mode === 'encrypt' ? 'encrypted' : 'decrypted'}. {size(output)}.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
