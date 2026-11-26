import { Monitor, Smartphone, Tablet, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEditor } from "@/context/EditorContext";
import { DeviceScope } from "@/types/node.type";
import { cn } from "@/libs/cn";
import { ToolTipPanel } from "@/components/ui/ToolTipPanel";
import editorConfig from "@/configs/editor.config";

const SCOPES: { value: DeviceScope; labelKey: string; Icon: typeof Monitor }[] = [
  { value: "desktop", labelKey: "deviceScopeControl.desktop", Icon: Monitor },
  { value: "tablet", labelKey: "deviceScopeControl.tablet", Icon: Tablet },
  { value: "mobile", labelKey: "deviceScopeControl.mobile", Icon: Smartphone },
]

/**
 * Lets the user pick which breakpoint the property panel is editing, and
 * clear the focused node's override for that breakpoint. Mirrors — and
 * stays in sync with — the desktop/tablet/mobile canvas view toggle in
 * Editor.page.tsx, since both drive the same EditorContext.deviceScope.
 */
function DeviceScopeControl() {
  const { t } = useTranslation("propertyPanel")
  const canvas = useEditor()
  if (!canvas || !editorConfig.enable_responsive_editing) return null

  const { deviceScope, setDeviceScope, focusedNode } = canvas
  const hasOverride = deviceScope !== "desktop" && !!(focusedNode as any)?.responsiveStyle?.[deviceScope] &&
    Object.keys((focusedNode as any).responsiveStyle[deviceScope]).length > 0

  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="flex items-center rounded-md border border-border overflow-hidden">
        {SCOPES.map(({ value, labelKey, Icon }) => (
          <ToolTipPanel key={value} label={t(labelKey)}>
            <button
              type="button"
              aria-label={t("deviceScopeControl.editStylesAriaLabel", { label: t(labelKey) })}
              onClick={() => setDeviceScope(value)}
              className={cn(
                "flex items-center justify-center w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10",
                deviceScope === value && "bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary"
              )}
            >
              <Icon size={14} />
            </button>
          </ToolTipPanel>
        ))}
      </div>
      {hasOverride && (
        <ToolTipPanel label={t("deviceScopeControl.clearOverride", { deviceScope })}>
          <button
            type="button"
            aria-label={t("deviceScopeControl.clearOverride", { deviceScope })}
            onClick={() => {
              canvas.updateNode((node) => {
                const responsiveStyle = { ...(node as any).responsiveStyle }
                delete responsiveStyle[deviceScope]
                return { ...node, responsiveStyle } as typeof node
              })
            }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw size={13} />
          </button>
        </ToolTipPanel>
      )}
    </div>
  )
}

export default DeviceScopeControl
