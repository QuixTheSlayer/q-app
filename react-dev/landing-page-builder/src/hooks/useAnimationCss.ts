import { CanvasNode } from "@/types/node.type";
import { sanitizeCss } from "@/utils/security/sanitizeCss";
import { useMemo } from "react";
import editorConfig from "@/configs/editor.config";
import {
  EFFECT_TRANSITION_PROPS,
  getPreset,
  presetKeyframesCss,
  presetKeyframesName,
  resolveTiming,
  type EffectTiming,
} from "@/consts/animationEffects";

type TriggerType = "active" | "hover" | "auto" | "onView";

interface EffectStyle extends EffectTiming {
  animation_type: string;
  /** preset effects only, a value from ANIMATION_PRESETS. */
  preset?: string;
  // Prototype effects (scrollTo/show/hide/toggle/slideIn/fadeIn) don't use
  // `style` at all — they're driven by targetNodeId/slideFrom/etc instead
  // (see scrollToInteraction.utils.ts) and are handled by a separate JS
  // pipeline (useScrollToInteractions), not this CSS generator. Only the
  // original 7 style-effect types (backgroundColor/boxShadow/textShadow/
  // size/radius/rotate/move/zoom) populate this field.
  style?: Record<string, string | number>;
}

interface TriggerEffect {
  trigger: TriggerType;
  effects: EffectStyle[];
}

interface Animation {
  id: string;
  trigger_effect: TriggerEffect[];
}

interface Content  {

  animation?: Animation[];
}

/**
 * Pulls out every "boxShadow" (or "textShadow") effect value for a given
 * animation, keyed by animation id -> { trigger_type, shadowEffects }.
 * Mirrors the original behavior: only the FIRST trigger_effect entry's
 * shadow values are kept per animation id (matches the old `[0]` index).
 */
function buildShadowMap(
  animations: Animation[],
  animationType: "boxShadow" | "textShadow"
): Map<string, { trigger_type: TriggerType; shadowEffects: string[] }> {
  const cssProp = animationType === "boxShadow" ? "box-shadow" : "text-shadow";
  const map = new Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>();

  for (const animate of animations) {
    const first = animate.trigger_effect?.[0];
    if (!first) continue;

    const shadowEffects = (first.effects ?? [])
      .filter((effect) => {
        const value = effect.style?.[cssProp];
        return effect.animation_type === animationType && typeof value === "string" && value.length > 2;
      })
      .map((effect) => String(effect.style?.[cssProp]));

    map.set(animate.id, { trigger_type: first.trigger, shadowEffects });
  }

  return map;
}

function shadowRule(
  shadowMap: Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>,
  animationId: string,
  currentTrigger: TriggerType,
  cssProperty: "box-shadow" | "text-shadow"
): string {
  const entry = shadowMap.get(animationId);
  const matches = entry?.trigger_type === currentTrigger;
  const value = matches
    ? entry!.shadowEffects.filter((e) => e !== "empty").join(",")
    : "";

  return `${cssProperty}: ${value} !important;`;
}

function styleEff(
  effect: EffectStyle,
  animationId: string,
  currentTrigger: TriggerType,
  boxShadowMap: Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>,
  textShadowMap: Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>
): string {
  const { style = {} } = effect;
  const timing = resolveTiming(effect);
  // A freshly added effect has no value yet; those add nothing rather than snapping the node to a default.
  const has = (key: string) => style[key] !== undefined && style[key] !== "";

  switch (effect.animation_type) {
    case "backgroundColor":
      return `background-color: ${style["background-color"] || ""} !important;`;

    case "boxShadow":
      return shadowRule(boxShadowMap, animationId, currentTrigger, "box-shadow");

    case "textShadow":
      return shadowRule(textShadowMap, animationId, currentTrigger, "text-shadow");

    case "size":
      return `
        width: ${style["width"]} !important;
        height: ${style["height"]} !important;
        min-height: ${style["width"]} !important;
      `;

    case "radius":
      return `
        border-top-left-radius: ${style["border-top-left-radius"]} !important;
        border-bottom-left-radius: ${style["border-bottom-left-radius"]} !important;
        border-top-right-radius: ${style["border-top-right-radius"]} !important;
        border-bottom-right-radius: ${style["border-bottom-right-radius"]} !important;
      `;

    case "rotate":
      return `
        rotate: ${style["rotate"]}deg !important;
      `;

    case "move":
      return `
        left: ${style["left"]}px !important;
        top: ${style["top"]}px !important;
      `;

    case "zoom":
      return `
        overflow: hidden;
        div {
          transform: scale(${1 + Number(style["zoom"]) / 10}) !important;
          transition: transform ${timing.duration}ms ${timing.easing} ${timing.delay}ms;
        }
      `;

    case "opacity":
      return has("opacity") ? `opacity: ${style["opacity"]} !important;` : "";

    case "scale":
      return has("scale") ? `scale: ${style["scale"]} !important;` : "";

    case "translate":
      return `translate: ${Number(style["translate-x"]) || 0}px ${Number(style["translate-y"]) || 0}px !important;`;

    case "skew":
      return `transform: skew(${Number(style["skew-x"]) || 0}deg, ${Number(style["skew-y"]) || 0}deg) !important;`;

    case "blur":
      return has("blur") ? `filter: blur(${Number(style["blur"]) || 0}px) !important;` : "";

    case "textColor":
      return has("color") ? `color: ${style["color"]} !important;` : "";

    default:
      return "";
  }
}

const STATE_SELECTOR: Record<Exclude<TriggerType, "auto">, string> = {
  hover: "&:hover",
  active: "&:active",
  // useScrollToInteractions sets data-in-view once the node scrolls into view.
  onView: "&[data-in-view]",
};

/** `transition` for every property this node's effects animate, each with its own duration/delay/easing. */
function buildTransition(animate: Animation): string {
  const byProp = new Map<string, string>();
  for (const trigger of animate.trigger_effect ?? []) {
    for (const effect of trigger.effects ?? []) {
      const { duration, delay, easing } = resolveTiming(effect);
      for (const prop of EFFECT_TRANSITION_PROPS[effect.animation_type] ?? []) {
        byProp.set(prop, `${prop} ${duration}ms ${easing} ${delay}ms`);
      }
    }
  }
  return byProp.size > 0 ? [...byProp.values()].join(", ") : "all 0.2s ease-in-out";
}

/** The `animation` shorthand for a trigger's preset effects (several run together). */
function buildPresetAnimation(trigger: TriggerEffect): string {
  return (trigger.effects ?? [])
    .map((effect) => {
      const preset = effect.animation_type === "preset" ? getPreset(effect.preset) : undefined;
      if (!preset) return "";
      const { duration, delay, easing } = resolveTiming(effect);
      const iterations = effect.iterations ?? preset.defaultIterations ?? 1;
      return `${presetKeyframesName(preset.value)} ${duration}ms ${easing} ${delay}ms ${iterations === 0 ? "infinite" : iterations} normal both`;
    })
    .filter(Boolean)
    .join(", ");
}

function buildTriggerBlock(
  animate: Animation,
  trigger: TriggerEffect,
  transition: string,
  editor: boolean,
  boxShadowMap: Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>,
  textShadowMap: Map<string, { trigger_type: TriggerType; shadowEffects: string[] }>
): string {
  const isAuto = trigger.trigger === "auto";
  const effectRules = trigger.effects
    ?.map((effect) => styleEff(effect, animate.id, trigger.trigger, boxShadowMap, textShadowMap))
    .join("");

  // The zoom effect needs a resting transform: scale(1) baseline to animate
  // from/back to — but prototype effects (slideIn especially) set their own
  // transform inline via runPrototypeEffect, and an !important CSS rule here
  // would permanently pin it back to scale(1), silently killing the slide
  // (only opacity would still visibly animate). Only emit the reset when
  // this trigger actually has a zoom effect to support.
  const hasZoomEffect = trigger.effects?.some((effect) => effect.animation_type === "zoom")
  const transformReset = hasZoomEffect
    ? `transform: scale(1) !important;
      div {
        transform: scale(1) !important;
      }`
    : ""

  const presetAnimation = buildPresetAnimation(trigger);
  const isOnView = trigger.trigger === "onView";
  // Auto and on-view presets sit on the node itself (on-view paused at its first frame until the node
  // scrolls into view); hover/click presets play inside their state rule.
  // The editor canvas never gets data-in-view, so a paused on-view preset would leave its node stuck
  // on the invisible first frame there; the panel's preview shows the preset instead.
  const baseAnimation = presetAnimation && (isAuto || (isOnView && !editor))
    ? `animation: ${presetAnimation}; ${isOnView ? "animation-play-state: paused;" : ""}`
    : "";
  const stateAnimation = presetAnimation && !isAuto && !isOnView ? `animation: ${presetAnimation};` : "";
  const stateRunning = presetAnimation && isOnView ? "animation-play-state: running;" : "";

  return `
    [data-id="${animate.id}"] {
      transition: ${transition};
      cursor: pointer;
      left: 0;
      top: 0;
      zoom: 0;
      ${transformReset}
      ${baseAnimation}

      ${isAuto ? "" : `${STATE_SELECTOR[trigger.trigger as keyof typeof STATE_SELECTOR]} {`}
        ${effectRules}
        ${stateAnimation}
        ${isAuto ? "" : stateRunning}
      ${isAuto ? "" : "}"}
    }
  `;
}

/**
 * Generates the full CSS string for all animated elements in `content`.
 */
export function useAnimationCss(content: Content, { editor = false }: { editor?: boolean } = {}): string {
  const raw = useMemo(() => {
    const animations = content?.animation ?? [];
    if (animations.length === 0) return "";

    const boxShadowMap = buildShadowMap(animations, "boxShadow");
    const textShadowMap = buildShadowMap(animations, "textShadow");

    const keyframes = [
      ...new Set(
        animations.flatMap((animate) =>
          (animate.trigger_effect ?? []).flatMap((trigger) =>
            (trigger.effects ?? []).filter((effect) => effect.animation_type === "preset" && getPreset(effect.preset)).map((effect) => effect.preset as string)
          )
        )
      ),
    ].map((value) => presetKeyframesCss(getPreset(value)!));

    const blocks = animations
      ?.map((animate) => {
        const transition = buildTransition(animate);
        return (animate.trigger_effect ?? [])
          ?.map((trigger) => buildTriggerBlock(animate, trigger, transition, editor, boxShadowMap, textShadowMap))
          .join("");
      })
      .join("");
    // Editor only: a dashed outline on every node that has a real effect, so animated blocks stand out.
    // :where() keeps the specificity at zero, so a node's own selection/focus styling still wins.
    const outlines = editor && editorConfig.enable_animation_outline
      ? animations
          .filter((animate) => (animate.trigger_effect ?? []).some((trigger) => (trigger.effects ?? []).some((effect) => effect.animation_type && effect.animation_type !== "none")))
          .map((animate) => `:where([data-canvas-root] [data-id="${animate.id}"]){outline:1.5px dashed rgb(168 85 247 / 0.85);outline-offset:-2px;}`)
          .join("")
      : "";

    return keyframes.join("") + blocks + outlines;
  }, [content, editor]);
  // Built from node data, so a crafted value could break out of its rule.
  return useMemo(() => sanitizeCss(raw), [raw]);
}