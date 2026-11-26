import {cn} from "@/libs/cn";
import type {CSSProperties} from "react";
import {Undo2} from "lucide-react";
import {useTranslation} from "react-i18next";
import editorConfig from "@/configs/editor.config";
import {usePanelStyle} from "@/hooks/usePanelStyle";
import {createContext, PropsWithChildren, useContext} from "react"
import {PropertyHint} from "@/components/PropertyPanelUI/hints/PropertyHint"
import type {PropertyHintKey} from "@/components/PropertyPanelUI/hints/registry"

/** Title of the redesigned PanelSection wrapping a legacy section, so its own heading isn't shown twice. */
export const KitSectionTitle = createContext<string | null>(null)

export function SectionContainer ({label: ownLabel,direction, hintKey,className, children}: PropsWithChildren<{
  label?: string
  direction?:"row"|"col"
  hintKey?: PropertyHintKey,
  className?:string
}>) {
  const kitTitle = useContext(KitSectionTitle)
  const covered = !!ownLabel && ownLabel.trim() === kitTitle
  const label = covered ? undefined : ownLabel
  return (
    <div className={cn('   flex flex-col gap-3 w-full pb-[12px]',className)}>
      {/* No label (the parent FoldList already shows it) — keep the row for the
          hint, but don't reserve the full heading height. */}
      {!covered && (label || hintKey) && <div className={cn('text-foreground flex items-center gap-1.5 font-semibold text-[13.25px]', label ? 'h-[48px]' : 'h-[20px] mt-2')}>
        {label}
        {hintKey && <PropertyHint hintKey={hintKey} />}
      </div>}
      <div className={cn(" w-full flex  gap-4  justify-between ",`flex-${direction??"col"}`)}  >
        {children}
      </div>
    </div>
  )
}

type PanelRowContainerProps = PropsWithChildren<{
  multiField?: boolean;
  label?: string;
  htmlFor?: string
  className?: string
  layoutType:"row"|"col"
  hintKey?: PropertyHintKey
  /** Style props this row edits - enables the "changed" dot and reset button (see FieldReset). */
  props?: (keyof CSSProperties & string)[]
}>

/** "Changed" dot + "back to original" button for a row that edits `props`. From frontend-editor's FieldRow. */
function FieldReset({ props }: { props: (keyof CSSProperties & string)[] }) {
  const { t } = useTranslation('propertyPanel')
  const { isChanged, reset } = usePanelStyle()
  if (!editorConfig.enable_panel_field_reset || !isChanged(props)) return null
  return (
    <span className="inline-flex items-center gap-1 ml-auto">
      <span className="size-1.5 rounded-full bg-primary" aria-label={t('panel.fieldChanged')} title={t('panel.fieldChanged')} />
      <button type="button" onClick={() => reset(props)} className="text-muted-foreground hover:text-primary rounded p-0.5" aria-label={t('panel.resetField')} title={t('panel.resetField')}>
        <Undo2 size={12} />
      </button>
    </span>
  )
}

// & (
//     | {multiField: true; htmlFor?: never}
//     | {multiField?: false; htmlFor: string}
//   )

export function PanelRowContainer ({children, label, htmlFor, multiField = false, className,layoutType, hintKey, props}: PanelRowContainerProps) {
  if(multiField) return (
    <fieldset className=" w-[99%]  bg-primary/30  rounded  " >
      <div className={cn(" w-full flex gap-1   ", `flex-${layoutType}`, className)}>
       {(label ||'' )?.length > 0 && <legend style={{
          width:(label ||'' )?.length > 0 ? 'auto':0
        }} className=" font-medium text-[13px]  flex items-center gap-1 text-foreground col-span-0 w-full">{label}{hintKey && <PropertyHint hintKey={hintKey} />}{props && <FieldReset props={props} />}</legend>}
        {children}
      </div>
    </fieldset>
  )
  return (
     <div className={cn(" w-[99%]  flex gap-1  px-2 py-2 ", `flex-${layoutType}`, className)}>
         {(label ||'' )?.length > 0 && <legend style={{
          width:(label ||'' )?.length > 0 ? 'auto':0
        }} className=" font-medium text-[13px]  flex items-center gap-1 text-foreground col-span-0 w-full">{label}{hintKey && <PropertyHint hintKey={hintKey} />}{props && <FieldReset props={props} />}</legend>}
        {children}
      </div>
  )
}

export function ActionList ({children, className, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn('h-[2.35rem] font-medium text-[13.5px] pl-[8px] flex items-center gap-2 text-foreground hover:text-primary/30 active:text-primary/30 col-span-1', className)}
    >
      {children}
    </button>
  )
}
