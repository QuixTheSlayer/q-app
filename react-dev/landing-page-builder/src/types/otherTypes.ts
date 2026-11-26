export type TriggerModeType = "active"|"hover"|"auto"|"onView"

export type AnimationValueType = React.CSSProperties

/** Fields of one animation effect (besides `style`) that updateAnimationEffectField can write. */
export type AnimationEffectFieldName =
  | 'targetNodeId'
  | 'scrollBehavior'
  | 'highlightTarget'
  | 'slideFrom'
  | 'transitionDurationMs'
  | 'duration'
  | 'delay'
  | 'easing'
  | 'iterations'
  | 'preset'
