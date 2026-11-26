import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEditor } from "@/context/EditorContext";
import { cn } from "@/libs/cn";
import { ToolTipPanel } from "@/components/ui/ToolTipPanel";

/**
 * Persisted design-time visibility for the focused node — saved with the
 * page as node.hidden, distinct from the runtime-only hide/show/toggle
 * prototype effects (which flip a DOM element's inline style at click time
 * and never touch node data). Shown in the property panel's shared header
 * row (next to DeviceScopeControl) so it's reachable regardless of which
 * content type's panel/tab is currently open.
 */
function NodeVisibilityToggle() {
  const { t } = useTranslation("propertyPanel")
  const canvas = useEditor()
  if (!canvas?.focusedNode) return null

  const isHidden = canvas.focusedNode.hidden === true

  return (
    <ToolTipPanel label={t(isHidden ? "nodeVisibilityToggle.show" : "nodeVisibilityToggle.hide")}>
      <button
        type="button"
        aria-label={t(isHidden ? "nodeVisibilityToggle.show" : "nodeVisibilityToggle.hide")}
        onClick={() => {
          canvas.updateNode((node) => ({
            ...node,
            hidden: !isHidden,
          }))
        }}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-md border border-border shrink-0",
          isHidden ? "text-muted-foreground bg-muted hover:text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
      >
        {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </ToolTipPanel>
  )
}

export default NodeVisibilityToggle
