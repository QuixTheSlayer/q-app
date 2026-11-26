import { PanelRowContainer, SectionContainer } from "@/components/PropertyPanelUI/ui";
import { useEditor } from "@/context/EditorContext";
import ColorPicker from "@/components/ui/ColorPicker";
import { NumberField, NumberFieldInput } from "@/components/ui/primitives/number-field";
import { Select, SelectOption } from "@/components/ui/Select";
import { useMemo } from "react";
import { cn } from "@/libs/cn";
import { isLayoutNode } from "@/utils/editor.utils";
import { item_align_x, item_align_y } from "@/consts/propertyField.consts";
import CSSUtils from "@/utils/CSS.utils";
import { icons } from "@/components/ui/icons/Icons";
import { ToolTipPanel } from "@/components/ui/ToolTipPanel";
import { CornerDownLeftIcon } from "lucide-react";
import { JUSTIFY_CONTENT } from "@/types/node.enum";
import { useTranslation } from "react-i18next";

type LayoutModeType = 'row' | 'column' | 'grid'
const LAYOUT_MODES: LayoutModeType[] = ['row', 'column', 'grid']
const ALIGNMENT_TYPES = ['start', 'center', 'end'] as const

const ALIGN_ICON_KEY = {
  1: { start: 'alignLeft', center: 'alignCenterX', end: 'alignRight' },
  2: { start: 'alignTop', center: 'alignCenterY', end: 'alignBottom' },
} as const

/**
 * Shown instead of the per-content-type panel when more than one node is
 * selected. A multi-selection can mix arbitrary content types (text, image,
 * button, ...), so this only exposes style properties that make sense on any
 * node, and fans every change out to all selected nodes via
 * updateSelectedNodesStyle rather than the single-node updateNodeStyle path
 * the rest of the property panel uses.
 */
function MultiSelectPanel() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()

  const GRID_AUTO_FLOW_OPTIONS = [
    { value: 'row', label: t('multiSelectPanel.row') },
    { value: 'column', label: t('multiSelectPanel.column') },
    { value: 'dense', label: t('multiSelectPanel.dense') },
  ]

  const ALIGN_LABEL = {
    1: { start: t('multiSelectPanel.alignLeft'), center: t('multiSelectPanel.alignCenter'), end: t('multiSelectPanel.alignRight') },
    2: { start: t('multiSelectPanel.alignTop'), center: t('multiSelectPanel.alignCenter'), end: t('multiSelectPanel.alignBottom') },
  } as const

  const targets = useMemo(() => {
    if (!canvas) return []
    const list = canvas.focused && !canvas.selectedNodes.some(n => n.id === canvas.focused?.id)
      ? [...canvas.selectedNodes, canvas.focused]
      : canvas.selectedNodes
    return list.map(n => canvas.getNode(n.path)).filter(Boolean)
  }, [canvas])

  const count = targets.length

  /** Reads `key` off every target's style — shared value if all agree, undefined ("Mixed") otherwise. */
  function sharedStyleValue<T = string | number>(key: keyof React.CSSProperties): { value: T | undefined; isMixed: boolean } {
    if (targets.length === 0) return { value: undefined, isMixed: false }
    const values = targets.map(n => n?.style?.[key] as T | undefined)
    const first = values[0]
    const isMixed = values.some(v => v !== first)
    return { value: isMixed ? undefined : first, isMixed }
  }

  const background = sharedStyleValue<string>('backgroundColor')
  const opacity = sharedStyleValue<number>('opacity')
  const padding = sharedStyleValue<string>('padding')
  const margin = sharedStyleValue<string>('margin')
  const borderWidth = sharedStyleValue<string>('borderWidth')
  const borderColor = sharedStyleValue<string>('borderColor')
  const borderRadius = sharedStyleValue<string>('borderRadius')

  const allContainers = targets.length > 0 && targets.every(n => n && isLayoutNode(n))

  /** Row/column both use display:flex, so the toggle's shared value depends on both display and flexDirection together — not flexDirection alone (a flex-row node and a grid node both lack an explicit "row" flexDirection, but aren't the same mode). */
  function sharedLayoutMode(): { value: 'row' | 'column' | 'grid' | undefined; isMixed: boolean } {
    if (targets.length === 0) return { value: undefined, isMixed: false }
    const modes = targets.map(n => {
      if (n?.style?.display === 'grid') return 'grid'
      return n?.style?.flexDirection === 'column' ? 'column' : 'row'
    })
    const first = modes[0]
    const isMixed = modes.some(m => m !== first)
    return { value: isMixed ? undefined : (first as 'row' | 'column' | 'grid'), isMixed }
  }

  const layoutMode = sharedLayoutMode()
  const isGrid = layoutMode.value === 'grid'
  const flexWrap = sharedStyleValue<string>('flexWrap')
  const justifyContent = sharedStyleValue<string>('justifyContent')
  const alignItems = sharedStyleValue<string>('alignItems')
  const gap = sharedStyleValue<string>('gap')

  /**
   * Mirrors AligmentSection's key swap: for a row parent, the first (X) grid
   * writes justifyContent and the second (Y) grid writes alignItems; for a
   * column parent it's reversed. A mixed-direction selection has no single
   * correct swap, so it falls back to the row mapping (same default
   * AligmentSection uses via its `?? 'justifyContent'`-less ternary).
   */
  const alignment1Key: 'justifyContent' | 'alignItems' = layoutMode.value === 'row' || layoutMode.isMixed ? 'justifyContent' : 'alignItems'
  const alignment2Key: 'justifyContent' | 'alignItems' = alignment1Key === 'justifyContent' ? 'alignItems' : 'justifyContent'
  const alignment1 = alignment1Key === 'justifyContent' ? justifyContent : alignItems
  const alignment2 = alignment2Key === 'justifyContent' ? justifyContent : alignItems
  const gridTemplateColumns = sharedStyleValue<string>('gridTemplateColumns')
  const gridTemplateRows = sharedStyleValue<string>('gridTemplateRows')
  const gridAutoFlow = sharedStyleValue<string>('gridAutoFlow')
  const justifyItems = sharedStyleValue<string>('justifyItems')

  const paddingLeft = sharedStyleValue<string>('paddingLeft')
  const paddingRight = sharedStyleValue<string>('paddingRight')
  const paddingTop = sharedStyleValue<string>('paddingTop')
  const paddingBottom = sharedStyleValue<string>('paddingBottom')
  const marginLeft = sharedStyleValue<string>('marginLeft')
  const marginRight = sharedStyleValue<string>('marginRight')
  const marginTop = sharedStyleValue<string>('marginTop')
  const marginBottom = sharedStyleValue<string>('marginBottom')

  const gridCount = (value?: string) => value === undefined ? undefined : (CSSUtils.getGridCount(value) || 1)

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-muted-foreground pb-2">
        {t('multiSelectPanel.editingSelectedElements', { count })}
      </div>


      <div className="flex flex-col gap-1 h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" >
             {allContainers && (
        <SectionContainer hintKey="layoutType" label={t('multiSelectPanel.layout')}>
          <PanelRowContainer layoutType="col" hintKey="layoutType" label={t('multiSelectPanel.layoutType')}>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex gap-1 h-[30px] w-full relative justify-start items-center">
                {LAYOUT_MODES.map((mode, index) => (
                  <div
                    key={mode}
                    style={{ backgroundColor: layoutMode.value === mode ? "#50cd89e4" : "" }}
                    onClick={() => {
                      if (mode === 'grid') {
                        canvas?.updateSelectedNodesStyle({
                          display: 'grid',
                          gridTemplateColumns: gridTemplateColumns.value || 'repeat(2, 1fr)',
                          gridTemplateRows: gridTemplateRows.value || 'repeat(2, 1fr)',
                        })
                      } else {
                        canvas?.updateSelectedNodesStyle({
                          display: 'flex',
                          flexDirection: mode,
                          gridTemplateColumns: undefined,
                          gridTemplateRows: undefined,
                        })
                      }
                    }}
                    className={cn(
                      'relative cursor-pointer flex justify-center items-center h-full w-[33%] bg-accent hover:bg-input text-foreground',
                      index === 0 ? 'rounded-l-[6px]' : index === LAYOUT_MODES.length - 1 ? 'rounded-r-[6px]' : ''
                    )}
                  >
                    <ToolTipPanel label={t(`multiSelectPanel.layoutMode.${mode}`)}>
                      <div style={{ color: 'var(--forground)' }} className="min-w-[60px] w-full h-[30px] flex justify-center items-center">
                        {mode === 'row' ? icons.flexRow() : mode === 'column' ? icons.flexCol() : icons.grid()}
                      </div>
                    </ToolTipPanel>
                  </div>
                ))}

                {!isGrid && (
                  <ToolTipPanel label={t('multiSelectPanel.wrap')}>
                    <div
                      onClick={() => canvas?.updateSelectedNodesStyle({ flexWrap: flexWrap.value === 'wrap' ? 'nowrap' : 'wrap' })}
                      className={cn(
                        'cursor-pointer w-[35px] h-[30px] flex justify-center items-center border border-primary rounded text-primary/90',
                        flexWrap.value === 'wrap' ? 'bg-primary/80 text-white' : ''
                      )}
                    >
                      <CornerDownLeftIcon size={16} />
                    </div>
                  </ToolTipPanel>
                )}
              </div>
              {(layoutMode.isMixed || flexWrap.isMixed) && <MixedLabel />}
            </div>
          </PanelRowContainer>

          {!isGrid && (
            <PanelRowContainer layoutType="col" hintKey="alignX" label={t('multiSelectPanel.alignment')}>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex px-0 relative justify-between h-[30px]">
                  <div className="flex w-[48%] justify-between h-full gap-[1px]">
                    {ALIGNMENT_TYPES.map((align, index) => (
                      <div
                        key={align}
                        style={{ backgroundColor: alignment1.value === align ? "#50cd89e4" : "" }}
                        onClick={() => canvas?.updateSelectedNodesStyle({ [alignment1Key]: align })}
                        className={cn(
                          'relative cursor-pointer flex justify-center hover:bg-input items-center h-full w-full bg-accent',
                          index === 0 ? 'rounded-l-[6px]' : index === ALIGNMENT_TYPES.length - 1 ? 'rounded-r-[6px]' : ''
                        )}
                      >
                        <ToolTipPanel label={ALIGN_LABEL[1][align]}>
                          <div style={{ color: 'var(--forground)' }} className="cursor-pointer w-full h-full flex justify-center items-center">
                            {icons[ALIGN_ICON_KEY[1][align]]()}
                          </div>
                        </ToolTipPanel>
                      </div>
                    ))}
                  </div>
                  <div className="flex w-[48%] justify-between h-full gap-[1px]">
                    {ALIGNMENT_TYPES.map((align, index) => (
                      <div
                        key={align}
                        style={{ backgroundColor: alignment2.value === align ? "#50cd89e4" : "" }}
                        onClick={() => canvas?.updateSelectedNodesStyle({ [alignment2Key]: align })}
                        className={cn(
                          'relative cursor-pointer flex justify-center hover:bg-input items-center h-full w-full bg-accent',
                          index === 0 ? 'rounded-l-[6px]' : index === ALIGNMENT_TYPES.length - 1 ? 'rounded-r-[6px]' : ''
                        )}
                      >
                        <ToolTipPanel label={ALIGN_LABEL[2][align]}>
                          <div style={{ color: 'var(--forground)' }} className="cursor-pointer w-full h-full flex justify-center items-center">
                            {icons[ALIGN_ICON_KEY[2][align]]()}
                          </div>
                        </ToolTipPanel>
                      </div>
                    ))}
                  </div>
                </div>
                {(alignment1.isMixed || alignment2.isMixed) && <MixedLabel />}
              </div>
            </PanelRowContainer>
          )}

            {
                     !isGrid  &&  <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " label={t('multiSelectPanel.justifyContent')}>
                                  <div className="flex flex-col gap-1 w-full">
                                    <Select
                                      aria-label={t('multiSelectPanel.justifyContent')}
                                      size="sm"
                                      placement="bottom end"
                                      items={JUSTIFY_CONTENT}
                                      selectedKey={justifyContent.value ?? null}
                                      onSelectionChange={(v) => canvas?.updateSelectedNodesStyle({ justifyContent: v as React.CSSProperties['justifyContent'] })}
                                    >
                                      {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                                    </Select>
                                    {justifyContent.isMixed && <MixedLabel />}
                                  </div>
                                </PanelRowContainer>
                    }

          <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="gap" label={t('multiSelectPanel.gap')}>
            <div className="flex flex-col gap-1 w-full">
              <NumberField
                aria-label={t('multiSelectPanel.gap')}
                minValue={0}
                value={CSSUtils.extractEmValue(gap.value)}
                onChange={(v) => canvas?.updateSelectedNodesStyle({ gap: CSSUtils.setEmValue(v) })}
              >
                <NumberFieldInput hideStepper size="sm" className={cn(gap.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {gap.isMixed && <MixedLabel />}
            </div>
          </PanelRowContainer>

          {isGrid && <>
            <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="columns" label={t('multiSelectPanel.columnsCount')}>
              <div className="flex flex-col gap-1 w-full">
                <NumberField
                  aria-label={t('multiSelectPanel.columnsCount')}
                  minValue={1}
                  value={gridCount(gridTemplateColumns.value)}
                  onChange={(v) => canvas?.updateSelectedNodesStyle({ gridTemplateColumns: `repeat(${v}, 1fr)` })}
                >
                  <NumberFieldInput hideStepper size="sm" className={cn(gridTemplateColumns.isMixed && 'text-muted-foreground')} />
                </NumberField>
                {gridTemplateColumns.isMixed && <MixedLabel />}
              </div>
            </PanelRowContainer>
            <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="rows" label={t('multiSelectPanel.rowsCount')}>
              <div className="flex flex-col gap-1 w-full">
                <NumberField
                  aria-label={t('multiSelectPanel.rowsCount')}
                  minValue={1}
                  value={gridCount(gridTemplateRows.value)}
                  onChange={(v) => canvas?.updateSelectedNodesStyle({ gridTemplateRows: `repeat(${v}, 1fr)` })}
                >
                  <NumberFieldInput hideStepper size="sm" className={cn(gridTemplateRows.isMixed && 'text-muted-foreground')} />
                </NumberField>
                {gridTemplateRows.isMixed && <MixedLabel />}
              </div>
            </PanelRowContainer>
            <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="gridAutoFlow" label={t('multiSelectPanel.autoFlow')}>
              <div className="flex flex-col gap-1 w-full">
                <Select
                  aria-label={t('multiSelectPanel.gridAutoFlow')}
                  size="sm"
                  placement="bottom end"
                  items={GRID_AUTO_FLOW_OPTIONS}
                  selectedKey={gridAutoFlow.value ?? 'row'}
                  onSelectionChange={(v) => canvas?.updateSelectedNodesStyle({ gridAutoFlow: v as React.CSSProperties['gridAutoFlow'] })}
                >
                  {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                </Select>
                {gridAutoFlow.isMixed && <MixedLabel />}
              </div>
            </PanelRowContainer>
            <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="alignX" label={t('multiSelectPanel.alignX')}>
              <div className="flex flex-col gap-1 w-full">
                <Select
                  aria-label={t('multiSelectPanel.alignX')}
                  size="sm"
                  placement="bottom end"
                  items={item_align_x}
                  selectedKey={justifyItems.value ?? 'stretch'}
                  onSelectionChange={(v) => canvas?.updateSelectedNodesStyle({ justifyItems: v as React.CSSProperties['justifyItems'] })}
                >
                  {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                </Select>
                {justifyItems.isMixed && <MixedLabel />}
              </div>
            </PanelRowContainer>
            <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="alignY" label={t('multiSelectPanel.alignY')}>
              <div className="flex flex-col gap-1 w-full">
                <Select
                  aria-label={t('multiSelectPanel.alignY')}
                  size="sm"
                  placement="bottom end"
                  items={item_align_y}
                  selectedKey={alignItems.value ?? 'stretch'}
                  onSelectionChange={(v) => canvas?.updateSelectedNodesStyle({ alignItems: v as React.CSSProperties['alignItems'] })}
                >
                  {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                </Select>
                {alignItems.isMixed && <MixedLabel />}
              </div>
            </PanelRowContainer>
          </>}
        </SectionContainer>
      )}


      <SectionContainer hintKey="backgroundColor" label={t('multiSelectPanel.color')}>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="backgroundColor" label={t('multiSelectPanel.background')}>
          <div className="flex flex-col gap-1 w-full">
            <ColorPicker
              value={background.value}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ backgroundColor: v })}
            />
            {background.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
      </SectionContainer>

      <SectionContainer hintKey="opacity" label={t('multiSelectPanel.appearance')}>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="opacity" label={t('multiSelectPanel.opacity')}>
          <div className="flex flex-col gap-1 w-full">
            <NumberField
              aria-label={t('multiSelectPanel.opacity')}
              minValue={0}
              maxValue={1}
              step={0.05}
              value={opacity.value}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ opacity: v })}
            >
              <NumberFieldInput hideStepper size="sm" className={cn(opacity.isMixed && 'text-muted-foreground')} />
            </NumberField>
            {opacity.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
      </SectionContainer>

      <SectionContainer label={t('multiSelectPanel.spacing')}>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="padding" label={t('multiSelectPanel.padding')}>
          <div className="flex flex-col gap-1 w-full">
            <NumberField
              aria-label={t('multiSelectPanel.padding')}
              minValue={0}
              value={CSSUtils.extractEmValue(padding.value)}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ padding: CSSUtils.setEmValue(v) })}
            >
              <NumberFieldInput hideStepper size="sm" className={cn(padding.isMixed && 'text-muted-foreground')} />
            </NumberField>
            {padding.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="margin" label={t('multiSelectPanel.margin')}>
          <div className="flex flex-col gap-1 w-full">
            <NumberField
              aria-label={t('multiSelectPanel.margin')}
              minValue={0}
              value={CSSUtils.extractEmValue(margin.value)}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ margin: CSSUtils.setEmValue(v) })}
            >
              <NumberFieldInput hideStepper size="sm" className={cn(margin.isMixed && 'text-muted-foreground')} />
            </NumberField>
            {margin.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
      </SectionContainer>

     
      {allContainers && (
        <SectionContainer hintKey="padding" label={t('multiSelectPanel.paddingPerSide')}>
          <PanelRowContainer layoutType="row" multiField className=" p-2 gap-3 " label="">
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.left')}</span>
              <NumberField aria-label={t('multiSelectPanel.paddingLeft')} minValue={0} value={CSSUtils.extractEmValue(paddingLeft.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ paddingLeft: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(paddingLeft.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {paddingLeft.isMixed && <MixedLabel />}
            </div>
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.right')}</span>
              <NumberField aria-label={t('multiSelectPanel.paddingRight')} minValue={0} value={CSSUtils.extractEmValue(paddingRight.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ paddingRight: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(paddingRight.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {paddingRight.isMixed && <MixedLabel />}
            </div>
          </PanelRowContainer>
          <PanelRowContainer layoutType="row" multiField className=" p-2 gap-3 " label="">
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.top')}</span>
              <NumberField aria-label={t('multiSelectPanel.paddingTop')} minValue={0} value={CSSUtils.extractEmValue(paddingTop.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ paddingTop: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(paddingTop.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {paddingTop.isMixed && <MixedLabel />}
            </div>
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.bottom')}</span>
              <NumberField aria-label={t('multiSelectPanel.paddingBottom')} minValue={0} value={CSSUtils.extractEmValue(paddingBottom.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ paddingBottom: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(paddingBottom.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {paddingBottom.isMixed && <MixedLabel />}
            </div>
          </PanelRowContainer>
        </SectionContainer>
      )}

      {allContainers && (
        <SectionContainer hintKey="margin" label={t('multiSelectPanel.marginPerSide')}>
          <PanelRowContainer layoutType="row" multiField className=" p-2 gap-3 " label="">
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.left')}</span>
              <NumberField aria-label={t('multiSelectPanel.marginLeft')} minValue={0} value={CSSUtils.extractEmValue(marginLeft.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ marginLeft: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(marginLeft.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {marginLeft.isMixed && <MixedLabel />}
            </div>
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.right')}</span>
              <NumberField aria-label={t('multiSelectPanel.marginRight')} minValue={0} value={CSSUtils.extractEmValue(marginRight.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ marginRight: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(marginRight.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {marginRight.isMixed && <MixedLabel />}
            </div>
          </PanelRowContainer>
          <PanelRowContainer layoutType="row" multiField className=" p-2 gap-3 " label="">
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.top')}</span>
              <NumberField aria-label={t('multiSelectPanel.marginTop')} minValue={0} value={CSSUtils.extractEmValue(marginTop.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ marginTop: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(marginTop.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {marginTop.isMixed && <MixedLabel />}
            </div>
            <div className="flex flex-col gap-1 w-[45%]">
              <span className="text-xs text-muted-foreground">{t('multiSelectPanel.bottom')}</span>
              <NumberField aria-label={t('multiSelectPanel.marginBottom')} minValue={0} value={CSSUtils.extractEmValue(marginBottom.value)} onChange={(v) => canvas?.updateSelectedNodesStyle({ marginBottom: CSSUtils.setEmValue(v) })}>
                <NumberFieldInput hideStepper size="sm" className={cn(marginBottom.isMixed && 'text-muted-foreground')} />
              </NumberField>
              {marginBottom.isMixed && <MixedLabel />}
            </div>
          </PanelRowContainer>
        </SectionContainer>
      )}

      </div>

    
      {/* <SectionContainer label="Border">
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " label="Width">
          <div className="flex flex-col gap-1 w-full">
            <NumberField
              aria-label="Border width"
              minValue={0}
              value={parsePx(borderWidth.value)}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ borderWidth: `${v}px`, borderStyle: 'solid' })}
            >
              <NumberFieldInput hideStepper size="sm" className={cn(borderWidth.isMixed && 'text-muted-foreground')} />
            </NumberField>
            {borderWidth.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="borderColor" label="Color">
          <div className="flex flex-col gap-1 w-full">
            <ColorPicker
              value={borderColor.value}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ borderColor: v })}
            />
            {borderColor.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
        <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " hintKey="borderRadius" label="Radius">
          <div className="flex flex-col gap-1 w-full">
            <NumberField
              aria-label="Border radius"
              minValue={0}
              value={parsePx(borderRadius.value)}
              onChange={(v) => canvas?.updateSelectedNodesStyle({ borderRadius: `${v}px` })}
            >
              <NumberFieldInput hideStepper size="sm" className={cn(borderRadius.isMixed && 'text-muted-foreground')} />
            </NumberField>
            {borderRadius.isMixed && <MixedLabel />}
          </div>
        </PanelRowContainer>
      </SectionContainer> */}
    </div>
  )
}

function MixedLabel() {
  const { t } = useTranslation('propertyPanel')
  return <span className="text-[10px] text-muted-foreground italic">{t('multiSelectPanel.mixedValues')}</span>
}

export default MultiSelectPanel
