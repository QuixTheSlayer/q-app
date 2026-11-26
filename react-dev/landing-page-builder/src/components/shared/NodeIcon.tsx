import React from 'react'
import * as lucideIcons from 'lucide-react/icons'
import { iconifySvgUrl, isIconifyId } from '@/utils/iconify'

type LucideName = keyof typeof lucideIcons

interface NodeIconProps {
  /** A lucide icon name (`Star`) or an Iconify id (`mdi:home`). */
  icon?: string
  color?: string
  size?: number
  strokeWidth?: number
  className?: string
}

/** One icon, from either source, so the editor, preview, published page and panel all draw it the same way. */
export function NodeIcon({ icon, color, size, strokeWidth, className }: NodeIconProps) {
  if (isIconifyId(icon)) {
    // Iconify glyphs carry their own stroke, so `strokeWidth` only applies to lucide icons.
    return (
      <img
        src={iconifySvgUrl(icon, { color, size })}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        draggable={false}
        className={className}
        style={{ width: size, height: size, flex: 'none' }}
      />
    )
  }
  const Lucide = lucideIcons[(icon || 'AArrowDown') as LucideName] as React.FC<lucideIcons.LucideProps> | undefined
  if (!Lucide) return null
  return <Lucide color={color} name={icon || 'AArrowDown'} strokeWidth={strokeWidth} size={size} className={className} />
}
