const TAILWIND_SCRIPT = '<script src="https://cdn.tailwindcss.com"></script>'

// Editor-only highlight: outline utilities (focus, hover, parent, drag) and the z-index they add.
const isHighlightClass = (cls: string) => /(^|:)-?outline/.test(cls) || cls === 'z-[11]'

/** A copy of the node's markup without the editor's focus/hover outlines. */
export function cleanNodeClone(el: Element): Element {
  const clone = el.cloneNode(true) as Element
  for (const item of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
    const kept = Array.from(item.classList).filter((cls) => !isHighlightClass(cls))
    if (kept.length) item.setAttribute('class', kept.join(' '))
    else item.removeAttribute('class')
    const style = (item as HTMLElement).style
    if (style?.outline || style?.outlineOffset) {
      style.removeProperty('outline')
      style.removeProperty('outline-offset')
      if (!item.getAttribute('style')) item.removeAttribute('style')
    }
  }
  return clone
}

const ruleApplies = (el: Element, selector: string): boolean => {
  try {
    return el.matches(selector) || !!el.querySelector(selector)
  } catch {
    return true
  }
}

// Pseudo-classes/elements can't be matched on the DOM, so test the selector without them.
const plainSelector = (selector: string) =>
  selector.replace(/::?(?!where|is|not|has)[\w-]+(\([^)]*\))?/g, '').trim() || '*'

function relatedRules(rules: CSSRuleList, el: Element): string[] {
  const out: string[] = []
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const applies = rule.selectorText.split(',').some((sel) => ruleApplies(el, plainSelector(sel)))
      if (applies) out.push(rule.cssText)
    } else if (rule instanceof CSSGroupingRule) {
      const inner = relatedRules(rule.cssRules, el)
      if (inner.length) out.push(`${rule.cssText.slice(0, rule.cssText.indexOf('{'))}{\n${inner.join('\n')}\n}`)
    } else {
      // @font-face, @keyframes, @import...
      out.push(rule.cssText)
    }
  }
  return out
}

/** Only the rules of `css` that match the node or something inside it. */
export function relatedCss(el: Element, css: string): string {
  if (!css.trim()) return ''
  try {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return relatedRules(sheet.cssRules, el).join('\n')
  } catch {
    return css
  }
}

/** The node's markup (no editor outlines) with the CSS that styles it in a <style> tag first. */
export function buildNodeExportHtml(el: Element, cssSources: (string | undefined)[]): string {
  const css = cssSources
    .filter((source): source is string => !!source?.trim())
    .map((source) => relatedCss(el, source))
    .filter(Boolean)
    .join('\n')
    .replace(/<\/style/gi, '<\\/style')
  return [TAILWIND_SCRIPT, css && `<style>\n${css}\n</style>`, cleanNodeClone(el).outerHTML].filter(Boolean).join('\n')
}
