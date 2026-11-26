import { useMemo } from "react";
import { sanitizeCss } from "@/utils/security/sanitizeCss";
import { CanvasNode } from "@/types/node.type";
import { RESPONSIVE_BREAKPOINTS } from "@/utils/responsive.utils";
import editorConfig from "@/configs/editor.config";

function isTabNode(node: CanvasNode): node is CanvasNode & { tabs: { children: CanvasNode[] }[] } {
  return (node as any).contentType === "tab" && Array.isArray((node as any).tabs);
}

function cssPropertyName(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function declarationsFor(style: React.CSSProperties): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${cssPropertyName(key)}: ${value} !important;`)
    .join(" ");
}

function* walk(node: CanvasNode): Generator<CanvasNode> {
  yield node;
  if (isTabNode(node)) {
    for (const tab of node.tabs) {
      for (const child of tab.children ?? []) yield* walk(child);
    }
    return;
  }
  const children = (node as any).children;
  if (Array.isArray(children)) {
    for (const child of children as CanvasNode[]) yield* walk(child);
  }
}

/**
 * Generates real @media rules for every node's responsiveStyle overrides —
 * the counterpart to the editor's live in-canvas preview (RenderNode.tsx),
 * which just swaps inline styles and can't express "only below 768px".
 * Mirrors useAnimationCss's pattern: [data-id="..."] selectors + !important,
 * injected into the page via the same <style> mechanism.
 */
export function useResponsiveCss(content?: CanvasNode | null): string {
  const raw = useMemo(() => {
    if (!content || !editorConfig.enable_responsive_editing) return "";

    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    for (const node of walk(content)) {
      const tablet = node.responsiveStyle?.tablet;
      const mobile = node.responsiveStyle?.mobile;

      if (tablet && Object.keys(tablet).length > 0) {
        tabletRules.push(`[data-id="${node.id}"] { ${declarationsFor(tablet)} }`);
      }
      if (mobile && Object.keys(mobile).length > 0) {
        mobileRules.push(`[data-id="${node.id}"] { ${declarationsFor(mobile)} }`);
      }
    }

    let css = "";
    if (tabletRules.length > 0) {
      css += `@media (max-width: ${RESPONSIVE_BREAKPOINTS.tablet}px) { ${tabletRules.join(" ")} }`;
    }
    if (mobileRules.length > 0) {
      css += `@media (max-width: ${RESPONSIVE_BREAKPOINTS.mobile}px) { ${mobileRules.join(" ")} }`;
    }
    return css;
  }, [content]);
  // Built from node data, so a crafted value could break out of its rule.
  return useMemo(() => sanitizeCss(raw), [raw]);
}
