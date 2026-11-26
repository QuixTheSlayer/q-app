import { cn } from '@/libs/cn'
import { isMacOS } from '@/utils/platform.utils'

/**
 * Small "which key triggers this" hint, for actions reachable via a global
 * keyboard shortcut (theme toggle, save, preview switch, etc.) — the
 * toolbar counterpart to InsertShortcutBadge, which uses the panel's own
 * "/ + letter" arm-then-press convention instead of raw modifier combos.
 */
export function ShortcutBadge({ keys, className }: {
  /** Combo parts in display order, e.g. ['alt', 't'] or ['ctrl', 's'] — 'ctrl' renders as ⌘ on macOS. */
  keys: string[]
  className?: string
}) {
  const parts = keys.map((key) => {
    const lower = key.toLowerCase()
    if (lower === 'ctrl' || lower === 'cmd' || lower === 'meta') return isMacOS() ? '⌘' : 'Ctrl'
    if (lower === 'alt') return isMacOS() ? '⌥' : 'Alt'
    if (lower === 'shift') return '⇧'
    return key.toUpperCase()
  })

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-mono leading-none border border-white/20 bg-white/10 text-white/70',
        className
      )}
    >
      {parts.map((part, i) => (
        <span key={i}> { i > 0 && <span>{"+"}</span>} {part}</span>
        
      ))}
    </span>
  )
}
