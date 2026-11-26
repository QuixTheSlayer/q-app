export type PrototypeTriggerType = "active" | "hover" | "auto" | "onView";
export type PrototypeActionType = "scrollTo" | "show" | "hide" | "toggle" | "slideIn" | "fadeIn";

export interface PrototypeEffect {
  animation_type: PrototypeActionType;
  targetNodeId?: string;
  scrollBehavior?: "smooth" | "auto";
  highlightTarget?: boolean;
  slideFrom?: "top" | "bottom" | "left" | "right";
  transitionDurationMs?: number;
}

interface TriggerEffect {
  trigger: PrototypeTriggerType;
  effects: {
    animation_type: string;
    targetNodeId?: string;
    scrollBehavior?: "smooth" | "auto";
    highlightTarget?: boolean;
    slideFrom?: "top" | "bottom" | "left" | "right";
    transitionDurationMs?: number;
  }[];
}

export interface AnimationEntry {
  id: string;
  trigger_effect: TriggerEffect[];
}

const PROTOTYPE_ACTION_TYPES = new Set<PrototypeActionType>(["scrollTo", "show", "hide", "toggle", "slideIn", "fadeIn"]);

const HIGHLIGHT_CLASS = "scroll-to-highlight";
const HIDDEN_ATTR = "data-prototype-hidden";
const PROTOTYPE_STYLE_ATTR = "prototype-interaction-style";

const slideTransform: Record<NonNullable<PrototypeEffect["slideFrom"]>, string> = {
  top: "translateY(-24px)",
  bottom: "translateY(24px)",
  left: "translateX(-24px)",
  right: "translateX(24px)",
};

export function ensureHighlightStyleInjected() {
  if (document.head.querySelector(`style[${PROTOTYPE_STYLE_ATTR}]`)) return
  const style = document.createElement("style")
  style.setAttribute(PROTOTYPE_STYLE_ATTR, "")
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 2px solid rgb(var(--primary, 37 99 235)) !important;
      outline-offset: 3px;
      transition: outline-color 0.3s ease;
    }
  `
  document.head.appendChild(style)
}

function getTargetEl(rootEl: ParentNode, targetNodeId: string | undefined) {
  if (!targetNodeId) return null
  return rootEl.querySelector<HTMLElement>(`[data-id="${targetNodeId}"]`)
}

/** Applies one prototype effect (scrollTo/show/hide/toggle/slideIn/fadeIn) to its target node, found via data-id scoped to rootEl. */
export function runPrototypeEffect(rootEl: ParentNode, effect: PrototypeEffect) {
  const targetEl = getTargetEl(rootEl, effect.targetNodeId)
  if (!targetEl) return

  switch (effect.animation_type) {
    case "scrollTo": {
      targetEl.scrollIntoView({ behavior: effect.scrollBehavior || "smooth", block: "center" })
      if (effect.highlightTarget) {
        ensureHighlightStyleInjected()
        targetEl.classList.add(HIGHLIGHT_CLASS)
        window.setTimeout(() => targetEl.classList.remove(HIGHLIGHT_CLASS), 1200)
      }
      break
    }
    case "hide": {
      if (targetEl.style.display !== "none") {
        targetEl.setAttribute(HIDDEN_ATTR, "true")
        targetEl.style.display = "none"
      }
      break
    }
    case "show": {
      targetEl.removeAttribute(HIDDEN_ATTR)
      targetEl.style.display = ""
      break
    }
    case "toggle": {
      const isHidden = targetEl.style.display === "none"
      if (isHidden) {
        targetEl.removeAttribute(HIDDEN_ATTR)
        targetEl.style.display = ""
      } else {
        targetEl.setAttribute(HIDDEN_ATTR, "true")
        targetEl.style.display = "none"
      }
      break
    }
    case "fadeIn": {
      const duration = effect.transitionDurationMs ?? 400
      targetEl.style.transition = "none"
      targetEl.style.display = ""
      targetEl.style.opacity = "0"
      // Force the browser to commit the opacity:0 state before switching the
      // transition back on and animating to 1 — otherwise both writes land
      // in the same style-recalc batch and the browser never paints the
      // starting frame, so it snaps straight to the end state instead of
      // visibly fading in.
      void targetEl.offsetHeight
      targetEl.style.transition = `opacity ${duration}ms ease`
      requestAnimationFrame(() => { targetEl.style.opacity = "1" })
      break
    }
    case "slideIn": {
      const duration = effect.transitionDurationMs ?? 400
      const from = effect.slideFrom ?? "bottom"
      targetEl.style.transition = "none"
      targetEl.style.display = ""
      targetEl.style.opacity = "0"
      targetEl.style.transform = slideTransform[from]
      // See fadeIn's comment — same forced-reflow fix, needed here too.
      void targetEl.offsetHeight
      targetEl.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`
      requestAnimationFrame(() => {
        targetEl.style.opacity = "1"
        targetEl.style.transform = "translate(0, 0)"
      })
      break
    }
  }
}

/** Finds every prototype effect on nodeId's animation entry for the given trigger. */
export function findPrototypeEffects(animations: AnimationEntry[] | undefined, nodeId: string, trigger: PrototypeTriggerType): PrototypeEffect[] {
  const animate = animations?.find((a) => a.id === nodeId)
  if (!animate) return []

  const result: PrototypeEffect[] = []
  for (const triggerEffect of animate.trigger_effect ?? []) {
    if (triggerEffect.trigger !== trigger) continue
    for (const effect of triggerEffect.effects ?? []) {
      if (PROTOTYPE_ACTION_TYPES.has(effect.animation_type as PrototypeActionType) && effect.targetNodeId) {
        result.push(effect as PrototypeEffect)
      }
    }
  }
  return result
}
