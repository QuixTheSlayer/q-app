import { describe, expect, it } from 'vitest'
import { iconifySvgUrl, isIconifyId, toIconifyColor } from '@/utils/iconify'

describe('isIconifyId', () => {
  it('accepts prefix:name ids', () => {
    expect(isIconifyId('mdi:home')).toBe(true)
    expect(isIconifyId('material-symbols:arrow-right-alt')).toBe(true)
  })

  it('rejects lucide names and anything that could change the request', () => {
    expect(isIconifyId('Star')).toBe(false)
    expect(isIconifyId('')).toBe(false)
    expect(isIconifyId('mdi:home/../x')).toBe(false)
    expect(isIconifyId('mdi:home?color=red')).toBe(false)
    expect(isIconifyId('a:b:c')).toBe(false)
    expect(isIconifyId('MDI:Home')).toBe(false)
  })
})

describe('toIconifyColor', () => {
  it('keeps plain hex and drops alpha', () => {
    expect(toIconifyColor('#ff0000')).toBe('#ff0000')
    expect(toIconifyColor('#ff000080')).toBe('#ff0000')
  })

  it('expands short hex and converts rgb()/rgba()', () => {
    expect(toIconifyColor('#f00')).toBe('#ff0000')
    expect(toIconifyColor('rgba(0, 128, 255, 0.5)')).toBe('#0080ff')
  })

  it('falls back to a default for anything else', () => {
    expect(toIconifyColor('url(x)')).toBe('#333333')
    expect(toIconifyColor(undefined)).toBe('#333333')
  })
})

describe('iconifySvgUrl', () => {
  it('builds the API url with color and size', () => {
    expect(iconifySvgUrl('mdi:home', { color: '#ff0000', size: 24 })).toBe('https://api.iconify.design/mdi/home.svg?color=%23ff0000&height=24')
  })

  it('returns nothing for an invalid id', () => {
    expect(iconifySvgUrl('Star')).toBe('')
    expect(iconifySvgUrl('mdi:home/../x')).toBe('')
  })
})

describe('iconifyDataUrl', () => {
  it('wraps the body in an svg data url with the color applied', async () => {
    const { iconifyDataUrl } = await import('@/utils/iconify')
    const url = iconifyDataUrl({ body: '<path d="M0 0h24v24H0z"/>', width: 24, height: 24 }, 'rgba(255, 0, 0, 0.5)')
    expect(url.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    const svg = decodeURIComponent(url.replace('data:image/svg+xml;utf8,', ''))
    expect(svg).toContain('viewBox="0 0 24 24"')
    expect(svg).toContain('color="#ff0000"')
    expect(svg).toContain('<path')
  })
})
