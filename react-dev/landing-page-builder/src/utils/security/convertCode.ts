import { decryptCodeStrict, encryptCode, protectPageCode, revealPageCodeStrict } from '@/utils/security/codeCrypto'

export type ConvertMode = 'encrypt' | 'decrypt'
/** `auto` decides from the input: page data when it is JSON, a single piece of text otherwise. */
export type ConvertKind = 'auto' | 'text' | 'page'

export interface ConvertResult {
  output: string
  /** What the input was taken to be. */
  kind: 'text' | 'page'
  /** How many values were encrypted or decrypted. */
  changed: number
}

/** A problem with the input that the user can fix. The message is shown as it is. */
export class ConvertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConvertError'
  }
}

const ENCRYPTED_START = /^(?:enc1|b64):/
const countEncrypted = (json: string) => (json.match(/"(?:enc1|b64):/g) ?? []).length

/** Parses JSON, and when the result is itself a JSON string (a page_content value with its quotes) parses that too. */
function parsePage(input: string): object | null {
  try {
    let value: unknown = JSON.parse(input)
    if (typeof value === 'string') value = JSON.parse(value)
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

export async function convert(mode: ConvertMode, kind: ConvertKind, rawInput: string, options: { pretty?: boolean } = {}): Promise<ConvertResult> {
  const input = rawInput.trim()
  if (!input) throw new ConvertError('Paste something to convert.')

  const page = kind === 'text' ? null : parsePage(input)
  const asPage = kind === 'page' || (kind === 'auto' && page !== null && !(mode === 'decrypt' && ENCRYPTED_START.test(input)))

  if (asPage) {
    if (!page) throw new ConvertError('That is not valid JSON, so it cannot be converted as page data.')
    const json = (value: object) => JSON.stringify(value, null, options.pretty ? 2 : undefined)
    try {
      if (mode === 'encrypt') {
        const output = json(await protectPageCode(page))
        return { output, kind: 'page', changed: countEncrypted(output) - countEncrypted(input) }
      }
      const output = json(await revealPageCodeStrict(page))
      return { output, kind: 'page', changed: countEncrypted(input) - countEncrypted(output) }
    } catch {
      throw new ConvertError('Could not decrypt a value. The passphrase may be different from the one used to encrypt it, or the text was changed.')
    }
  }

  if (mode === 'encrypt') {
    if (ENCRYPTED_START.test(input)) throw new ConvertError('That text already starts with enc1: or b64:, so it looks encrypted already.')
    return { output: await encryptCode(rawInput), kind: 'text', changed: 1 }
  }

  if (!ENCRYPTED_START.test(input)) throw new ConvertError('That text is not encrypted: it does not start with enc1: or b64:.')
  try {
    return { output: await decryptCodeStrict(input), kind: 'text', changed: 1 }
  } catch {
    throw new ConvertError('Could not decrypt it. The passphrase may be different from the one used to encrypt it, or the text was changed.')
  }
}
