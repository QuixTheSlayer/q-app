import { cn } from '@/libs/cn'
import { INSERT_ARM_KEY } from './insertShortcuts'
import editorConfig from '@/configs/editor.config'

export function InsertShortcutBadge({ shortcutKey, armed, className }: {
  shortcutKey?: string
  armed?: boolean
  className?: string
}) {
  if (!shortcutKey || !editorConfig.enable_insert_shortcuts) return null

  return (
    <div
      className={cn(
        'absolute top-1 right-1 gap-0.5 flex items-center  rounded px-1 py-0.5 text-[9px] font-mono leading-none border transition-colors',
        armed
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background/80 text-muted-foreground border-border',
        className
      )}
    >
      <span>{INSERT_ARM_KEY}</span>
      <span>{"+"} </span>
      <span>{shortcutKey.toUpperCase()}</span>
    </div>
  )
}
