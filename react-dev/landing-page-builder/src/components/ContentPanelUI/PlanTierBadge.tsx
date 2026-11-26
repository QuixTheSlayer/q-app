import { cn } from '@/libs/cn'
import { useTranslation } from 'react-i18next'

export type PlanTier = 'Pro' | 'Ent'

/**
 * Small "PRO"/"ENTERPRISE" label on the top-left corner of an Insert-panel
 * button. Purely visual — there's no real account/subscription plan signal
 * anywhere in this app yet, so it doesn't block insertion. Tier assignment
 * per content/widget type lives in editorConfig.content_type_plan_tier /
 * widget_type_plan_tier.
 */
export function PlanTierBadge({ tier, className }: {
  tier?: PlanTier
  className?: string
}) {
  const { t } = useTranslation('insert')

  if (!tier) return null

  return (
    <div
      className={cn(
        'absolute top-1 left-1 rounded px-1 py-0.5 text-[8px] font-semibold leading-none tracking-wide',
        tier === 'Ent'
          ? 'bg-violet-600 text-white'
          : 'bg-amber-500 text-white',
        className
      )}
    >
      {tier === 'Ent' ? t('planTier.enterprise') : t('planTier.pro')}
    </div>
  )
}
