import { useEffect } from "react";
import { AnimationEntry, findPrototypeEffects, runPrototypeEffect } from "@/utils/scrollToInteraction.utils";

interface Content {
  animation?: AnimationEntry[];
}

/**
 * Attaches delegated click/hover listeners plus per-node IntersectionObservers
 * (for the "onView" trigger) that drive the prototype effects (scrollTo/show/
 * hide/toggle/slideIn/fadeIn) — the trigger_effect types that can't be
 * expressed as pure CSS the way useAnimationCss handles style effects via
 * :hover/:active. Event delegation on the root avoids touching every
 * individual node render function across Elements.tsx.
 */
export function useScrollToInteractions(content: Content | undefined, rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const rootEl = rootRef.current
    const animations = content?.animation ?? []
    if (!rootEl || animations.length === 0) return

    function resolveNodeId(target: EventTarget | null): string | undefined {
      const el = target instanceof Element ? target.closest<HTMLElement>("[data-id]") : null
      return el?.getAttribute("data-id") ?? undefined
    }

    function onClick(e: MouseEvent) {
      if (!rootEl) return
      // A click on something inside a node (the text of a button) counts as a click on the node: the nearest one with a click effect acts.
      let el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-id]") : null
      while (el) {
        const effects = findPrototypeEffects(animations, el.getAttribute("data-id") ?? "", "active")
        if (effects.length) {
          effects.forEach((effect) => runPrototypeEffect(rootEl, effect))
          return
        }
        el = el.parentElement?.closest<HTMLElement>("[data-id]") ?? null
      }
    }

    function onMouseEnter(e: MouseEvent) {
      const nodeId = resolveNodeId(e.target)
      if (!nodeId || !rootEl) return
      findPrototypeEffects(animations, nodeId, "hover").forEach((effect) => runPrototypeEffect(rootEl, effect))
    }

    rootEl.addEventListener("click", onClick)
    // mouseenter doesn't bubble, but capture phase lets one listener catch it on descendants
    rootEl.addEventListener("mouseenter", onMouseEnter, true)

    // "onView" triggers fire once per node when its own element scrolls into
    // view — one shared IntersectionObserver, watching every node that
    // actually has an onView trigger with prototype effects attached.
    const onViewNodeIds = animations
      .filter((animate) => animate.trigger_effect?.some((t) => t.trigger === "onView"))
      .map((animate) => animate.id)

    let observer: IntersectionObserver | undefined
    if (onViewNodeIds.length > 0) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const nodeId = (entry.target as HTMLElement).getAttribute("data-id")
          if (!nodeId || !rootEl) return
          findPrototypeEffects(animations, nodeId, "onView").forEach((effect) => runPrototypeEffect(rootEl, effect))
          observer?.unobserve(entry.target)
        })
      }, { threshold: 0.5 })

      onViewNodeIds.forEach((nodeId) => {
        const el = rootEl.querySelector(`[data-id="${nodeId}"]`)
        if (el) observer!.observe(el)
      })
    }

    // The CSS side of "onView" (style effects and presets, see useAnimationCss) keys off data-in-view,
    // so every onView node gets it once it's about a sixth visible - a lower bar than the prototype
    // observer above, so tall sections still trigger.
    let viewObserver: IntersectionObserver | undefined
    if (onViewNodeIds.length > 0) {
      const observed = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute("data-in-view", "")
          observed.unobserve(entry.target)
        })
      }, { threshold: 0.15 })
      viewObserver = observed
      onViewNodeIds.forEach((nodeId) => {
        const el = rootEl.querySelector(`[data-id="${nodeId}"]`)
        if (el && !el.hasAttribute("data-in-view")) observed.observe(el)
      })
    }

    return () => {
      viewObserver?.disconnect()
      rootEl.removeEventListener("click", onClick)
      rootEl.removeEventListener("mouseenter", onMouseEnter, true)
      observer?.disconnect()
    }
  }, [content, rootRef])
}
