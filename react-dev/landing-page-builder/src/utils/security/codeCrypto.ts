import editorConfig from '@/configs/editor.config'

/**
 * Page CSS, JavaScript and SVG are encrypted before they leave the browser and decrypted when they come back.
 * A web application firewall in front of the API reads request bodies for things that look like attacks
 * (`<script`, `@import`, `javascript:`, `<svg`), and a page's own custom code and inline icons trip those rules.
 * Encrypted text carries none of those patterns.
 *
 * CSS and JavaScript are the plainCss, plainJS and pageScripts fields. SVG is any string value anywhere in the
 * page tree that contains "svg": an inline icon stored as a data URI, raw <svg> markup, or a .svg address.
 * Object keys are not encrypted, so a key that contains "svg" still reaches the firewall.
 *
 * This is not a secret. The passphrase ships in the bundle, so anyone with the page can derive the key:
 * it hides the code from pattern matching, not from people. The firewall also no longer sees that code, so
 * what keeps it safe is the app itself (sanitizeCss, the sandbox and the page's isAllow flag), not the firewall.
 */

const AES_PREFIX = 'enc1:'
// Used when crypto.subtle is missing (a page served over plain http on a host other than localhost).
// It hides the same patterns but is only encoding, not encryption.
const BASE64_PREFIX = 'b64:'
const IV_BYTES = 12
const UNWANTED_IN_CIPHERTEXT = /svg|script|eval|import|onerror|onload/i

// Set only by the converter page, to read data that was encrypted with a different passphrase.
let passphraseOverride: string | null = null

/** Use another passphrase until it is cleared with null. The editor never calls this. */
export function setPassphraseOverride(value: string | null) {
  passphraseOverride = value?.trim() || null
}

const passphrase = (): string =>
  passphraseOverride || (import.meta.env.VITE_CONTENT_ENCRYPTION_KEY as string | undefined)?.trim() || editorConfig.content_encryption_passphrase

const toBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

const fromBase64 = (text: string): Uint8Array => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

let cachedKey: { passphrase: string; key: Promise<CryptoKey> } | null = null

/** AES-GCM key from the SHA-256 of the passphrase. Built once per passphrase. */
function aesKey(): Promise<CryptoKey> {
  const secret = passphrase()
  if (cachedKey?.passphrase !== secret) {
    const subtle = globalThis.crypto.subtle
    cachedKey = {
      passphrase: secret,
      key: subtle.digest('SHA-256', new TextEncoder().encode(secret)).then((raw) => subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])),
    }
  }
  return cachedKey.key
}

const hasSubtle = () => !!globalThis.crypto?.subtle

/** Empty text and text that is already protected are returned as they are. */
export async function encryptCode(text: string): Promise<string> {
  if (!text || text.startsWith(AES_PREFIX) || text.startsWith(BASE64_PREFIX)) return text
  const bytes = new TextEncoder().encode(text)
  if (!hasSubtle()) return BASE64_PREFIX + toBase64(bytes)

  const key = await aesKey()
  for (let attempt = 0; ; attempt++) {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES))
    const cipher = new Uint8Array(await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))
    const joined = new Uint8Array(IV_BYTES + cipher.length)
    joined.set(iv)
    joined.set(cipher, IV_BYTES)
    const encrypted = AES_PREFIX + toBase64(joined)
    // Random base64 can by chance spell a word a firewall rule looks for. Such a result is thrown away and made
    // again with a new IV; after a few tries the last one is used.
    if (attempt >= 8 || !UNWANTED_IN_CIPHERTEXT.test(encrypted)) return encrypted
  }
}

/** Decrypts one value, and throws when it cannot: a wrong passphrase, damaged text or no crypto.subtle. Plain text passes through. */
export async function decryptCodeStrict(value: string): Promise<string> {
  if (value.startsWith(BASE64_PREFIX)) return new TextDecoder().decode(fromBase64(value.slice(BASE64_PREFIX.length)))
  if (!value.startsWith(AES_PREFIX)) return value
  const joined = fromBase64(value.slice(AES_PREFIX.length))
  const plain = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: joined.slice(0, IV_BYTES) }, await aesKey(), joined.slice(IV_BYTES))
  return new TextDecoder().decode(plain)
}

/**
 * Plain text (a page saved before this existed) passes straight through. Text that cannot be decrypted, such
 * as after the passphrase changed, becomes empty rather than being injected into the page as garbage.
 */
export async function decryptCode(value: string): Promise<string> {
  try {
    return await decryptCodeStrict(value)
  } catch (error) {
    console.warn('Could not decrypt page code; it was left out.', error)
    return ''
  }
}

interface PageCode {
  plainCss?: string
  plainJS?: string
  pageScripts?: { src?: string; code?: string; type?: string }[]
}

async function mapPageCode<T extends PageCode>(content: T, change: (text: string) => Promise<string>): Promise<T> {
  if (!content || typeof content !== 'object') return content
  const next: T = { ...content }
  if (typeof next.plainCss === 'string') next.plainCss = await change(next.plainCss)
  if (typeof next.plainJS === 'string') next.plainJS = await change(next.plainJS)
  if (Array.isArray(next.pageScripts)) {
    next.pageScripts = await Promise.all(next.pageScripts.map(async (script) => (typeof script?.code === 'string' ? { ...script, code: await change(script.code) } : script)))
  }
  return next
}

/** A copy of `value` with `change` applied to every string in it, at any depth. Keys and non-string values are kept. */
async function mapStrings(value: unknown, change: (text: string) => string | Promise<string>): Promise<unknown> {
  if (typeof value === 'string') return change(value)
  if (Array.isArray(value)) return Promise.all(value.map((item) => mapStrings(item, change)))
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value).map(async ([key, item]) => [key, await mapStrings(item, change)] as const))
    return Object.fromEntries(entries)
  }
  return value
}

const SVG = /svg/i

/**
 * What an encrypted string looks like: the prefix and then nothing but padded base64. Loading decrypts only
 * strings of this shape, so ordinary text that happens to start with "enc1:" is left alone.
 */
function looksEncrypted(text: string): boolean {
  const prefix = text.startsWith(AES_PREFIX) ? AES_PREFIX : text.startsWith(BASE64_PREFIX) ? BASE64_PREFIX : ''
  if (!prefix) return false
  const body = text.slice(prefix.length)
  return body.length > 0 && body.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(body)
}

/**
 * A copy of the page content for the save request: the CSS and JavaScript encrypted, and every string that
 * contains "svg" encrypted wherever it sits in the tree. The original is not touched.
 */
export async function protectPageCode<T extends object>(content: T): Promise<T> {
  const withCode = await mapPageCode(content as PageCode & T, encryptCode)
  return (await mapStrings(withCode, (text) => (SVG.test(text) ? encryptCode(text) : text))) as T
}

/** The page content with everything protectPageCode encrypted decrypted again, for use after the data is loaded. */
export async function revealPageCode<T extends object>(content: T): Promise<T> {
  const walked = await mapStrings(content, (text) => (looksEncrypted(text) ? decryptCode(text) : text))
  return mapPageCode(walked as PageCode & T, decryptCode)
}

/** Like revealPageCode, but throws on the first value that cannot be decrypted instead of dropping it. */
export async function revealPageCodeStrict<T extends object>(content: T): Promise<T> {
  const walked = await mapStrings(content, (text) => (looksEncrypted(text) ? decryptCodeStrict(text) : text))
  return mapPageCode(walked as PageCode & T, decryptCodeStrict)
}
