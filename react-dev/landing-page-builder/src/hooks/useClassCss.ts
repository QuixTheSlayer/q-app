import { useMemo } from "react";
import { sanitizeCss } from "@/utils/security/sanitizeCss";
import { CanvasNode, LayoutNode } from "@/types/node.type";
import { RESPONSIVE_BREAKPOINTS } from "@/utils/responsive.utils";

function cssPropertyName(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function declarationsFor(style: React.CSSProperties): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${cssPropertyName(key)}: ${value};`)
    .join(" ");
}

/**
 * Generates a real `<style>` tag's worth of class rules from
 * `content.css` (see EditorContext's `syncClassStyle`) - each class's own
 * `.classname { ... }` rule plus its tablet/mobile `@media` overrides.
 * Node-level `style`/`responsiveStyle` still drive what actually renders
 * (kept in sync by syncClassStyle on every edit) - this hook only
 * reproduces the same rules as real, inspectable CSS for the page's own
 * `<style>` tag (see useClassJs.ts for the equivalent `<script>` tag).
 */
export function useClassCss(content?: CanvasNode | null): string {
  const raw = useMemo(() => {
    const css = (content as LayoutNode | null | undefined)?.css
    if (!css || Object.keys(css).length === 0) return ""

    const desktopRules: string[] = []
    const tabletRules: string[] = []
    const mobileRules: string[] = []

    for (const [className, rule] of Object.entries(css)) {
      // Pages saved with a broken Import HTML into node have null/string entries here.
      if (!rule || typeof rule !== "object") continue
      if (Object.keys(rule.style ?? {}).length > 0) {
        desktopRules.push(`.${className} { ${declarationsFor(rule.style)} }`)
      }
      if (rule.responsiveStyle?.tablet && Object.keys(rule.responsiveStyle.tablet).length > 0) {
        tabletRules.push(`.${className} { ${declarationsFor(rule.responsiveStyle.tablet)} }`)
      }
      if (rule.responsiveStyle?.mobile && Object.keys(rule.responsiveStyle.mobile).length > 0) {
        mobileRules.push(`.${className} { ${declarationsFor(rule.responsiveStyle.mobile)} }`)
      }
    }

    let result = desktopRules.join(" ")
    if (tabletRules.length > 0) {
      result += ` @media (max-width: ${RESPONSIVE_BREAKPOINTS.tablet}px) { ${tabletRules.join(" ")} }`
    }
    if (mobileRules.length > 0) {
      result += ` @media (max-width: ${RESPONSIVE_BREAKPOINTS.mobile}px) { ${mobileRules.join(" ")} }`
    }
    return result
  }, [content])
  // Built from node data, so a crafted value could break out of its rule.
  return useMemo(() => sanitizeCss(raw), [raw]);
}
