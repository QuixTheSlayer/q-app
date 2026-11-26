import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover'
import { cn } from '@/libs/cn'
import { PROPERTY_HINTS, type PropertyHintKey } from './registry'
import editorConfig from '@/configs/editor.config'
import { useTranslation } from 'react-i18next'

export function PropertyHint({ hintKey, className }: { hintKey: PropertyHintKey; className?: string }) {
  const { t } = useTranslation('hints')
  if (!editorConfig.enable_property_hints) return null

  const hint = PROPERTY_HINTS[hintKey]
  if (!hint) return null

  const { Demo } = hint
  const title = t(`title.${hintKey}`)
  const description = t(`description.${hintKey}`)

  return (
    <Popover>
      <PopoverTrigger  asChild>
        <button
          type="button"
          aria-label={`What does ${title} do?`}
          className={cn(
            'inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0',
            className
          )}
        >
          <HelpCircle size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="z-[9999] w-[220px] rounded-md border bg-popover text-popover-foreground shadow-lg p-3">
        <div className="flex flex-col gap-2">
          <Demo />
          <div>
            <div className="text-[13px] font-semibold text-foreground">{title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
