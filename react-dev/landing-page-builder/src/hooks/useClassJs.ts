import { useMemo } from "react";
import { CanvasNode, LayoutNode } from "@/types/node.type";

/**
 * Serializes `content.js` (see EditorContext's class-based JS controller)
 * into a real, self-contained runtime script - literally what gets
 * rendered inside the page's `<script>` tag (see useClassJsInjection.ts),
 * not just run internally. Supports the same three triggers prototype
 * effects already support elsewhere in this app (active/hover/onView -
 * `auto` is a CSS-only trigger, see useAnimationCss.ts, not applicable to
 * these DOM-driven effects) against the same six actions
 * (scrollTo/show/hide/toggle/slideIn/fadeIn), targeting other nodes by
 * their `data-id` - identical runtime behavior to scrollToInteraction.utils.ts's
 * per-node prototype effects, just triggered by class membership instead of
 * a single node id.
 */
export function useClassJs(content?: CanvasNode | null): string {
  return useMemo(() => {
    const js = (content as LayoutNode | null | undefined)?.js
    if (!js || Object.keys(js).length === 0) return ""

    const rulesJson = JSON.stringify(js)



    return `(function(){
  var RULES = ${rulesJson};
  function runEffect(effect){
    var targetEl = document.querySelector('[data-id="' + effect.targetNodeId + '"]');
    if (!targetEl) return;
    switch (effect.animation_type) {
      case 'scrollTo':
        targetEl.scrollIntoView({ behavior: effect.scrollBehavior || 'smooth', block: 'center' });
        if (effect.highlightTarget) {
          targetEl.style.outline = '2px solid rgb(37 99 235)';
          targetEl.style.outlineOffset = '3px';
          setTimeout(function(){ targetEl.style.outline = ''; }, 1200);
        }
        break;
      case 'hide':
        targetEl.style.display = 'none';
        break;
      case 'show':
        targetEl.style.display = '';
        break;
      case 'toggle':
        targetEl.style.display = targetEl.style.display === 'none' ? '' : 'none';
        break;
      case 'fadeIn': {
        var d = effect.transitionDurationMs || 400;
        targetEl.style.transition = 'none';
        targetEl.style.display = '';
        targetEl.style.opacity = '0';
        void targetEl.offsetHeight;
        targetEl.style.transition = 'opacity ' + d + 'ms ease';
        requestAnimationFrame(function(){ targetEl.style.opacity = '1'; });
        break;
      }
      case 'slideIn': {
        var dur = effect.transitionDurationMs || 400;
        var from = effect.slideFrom || 'bottom';
        var transform = { top: 'translateY(-24px)', bottom: 'translateY(24px)', left: 'translateX(-24px)', right: 'translateX(24px)' }[from];
        targetEl.style.transition = 'none';
        targetEl.style.display = '';
        targetEl.style.opacity = '0';
        targetEl.style.transform = transform;
        void targetEl.offsetHeight;
        targetEl.style.transition = 'opacity ' + dur + 'ms ease, transform ' + dur + 'ms ease';
        requestAnimationFrame(function(){ targetEl.style.opacity = '1'; targetEl.style.transform = 'translate(0, 0)'; });
        break;
      }
    }
  }
  function trigger(className, triggerType){
    var rule = RULES[className];
    if (!rule) return;
    rule.trigger_effect.forEach(function(te){
      if (te.trigger !== triggerType) return;
      te.effects.forEach(runEffect);
    });
  }
  function classesOf(el){
    return (el.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean);
  }
  document.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest('[data-id]') : null;
    if (!el) return;
    classesOf(el).forEach(function(cls){ trigger(cls, 'active'); });
  });
  document.addEventListener('mouseenter', function(e){
    var el = e.target && e.target.closest ? e.target.closest('[data-id]') : null;
    if (!el) return;
    classesOf(el).forEach(function(cls){ trigger(cls, 'hover'); });
  }, true);
  var onViewClasses = Object.keys(RULES).filter(function(cls){
    return RULES[cls].trigger_effect?.some(function(te){ return te.trigger === 'onView'; });
  });
  if (onViewClasses.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        classesOf(entry.target).forEach(function(cls){ trigger(cls, 'onView'); });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    onViewClasses.forEach(function(cls){
      document.querySelectorAll('.' + cls).forEach(function(el){ observer.observe(el); });
    });
  }
})();`
  }, [content])
}
