import { cn } from '@/libs/cn'
import { HIDDEN_TOOLS, HiddenTool, hiddenToolUrl } from '@/utils/hiddenTools'

/** Switches between the hidden tool pages. They are not linked from anywhere else. */
export default function ToolsNav({ current }: { current: HiddenTool }) {
  return (
    <nav aria-label="Tools" className="flex gap-1">
      {HIDDEN_TOOLS.map(({ tool, label }) => (
        <a
          key={tool}
          href={hiddenToolUrl(tool)}
          aria-current={tool === current ? 'page' : undefined}
          className={cn('rounded-md px-3 py-1.5 text-sm font-medium', tool === current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/10 hover:text-foreground')}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
