import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { item_position } from '@/consts/propertyField.consts'
import { useEditor } from '@/context/EditorContext'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from '@/components/ui/Select'
import CSSUtils from '@/utils/CSS.utils'
import PositionPreview, { HorizontalAnchor, VerticalAnchor } from './PositionPreview'
import editorConfig from '@/configs/editor.config'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { ToolTipPanel } from '@/components/ui/ToolTipPanel'

type PositionValue = Exclude<React.CSSProperties['position'], undefined>

/** Everything needed to fully clear a node back to normal document flow. */
const STATIC_PATCH: React.CSSProperties = {
  position: undefined,
  left: undefined,
  right: undefined,
  top: undefined,
  bottom: undefined,
  zIndex: undefined,
  transform: undefined,
}

function horizontalAnchorOf(style: React.CSSProperties): HorizontalAnchor {
  if (typeof style.transform === 'string' && style.transform.includes('translateX(-50%)') && style.left === '50%') return 'center'
  if (style.right !== undefined && style.right !== 'unset') return 'right'
  return 'left'
}

function verticalAnchorOf(style: React.CSSProperties): VerticalAnchor {
  if (typeof style.transform === 'string' && style.transform.includes('translateY(-50%)') && style.top === '50%') return 'center'
  if (style.bottom !== undefined && style.bottom !== 'unset') return 'bottom'
  return 'top'
}

/**
 * Comprehensive position controller: mode select (static/relative/sticky/
 * fixed/absolute), a 9-point anchor picker for one-click corner/edge/center
 * placement, manual left/right/top/bottom/z-index fields for fine-tuning,
 * and a reset-to-static button. Shown for every node type (not just
 * containers) — see LayoutSection.tsx, which renders this unconditionally
 * before its container-only layout/grid/padding/margin sections.
 */
export default function PositionControlSection() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode

  if (!editorConfig.enable_position_controller || !canvas || !node) return null

  const style = node.style
  const rawPosition = style.position
  const positionValue: PositionValue | 'static' = (rawPosition ?? 'static') as PositionValue | 'static'
  const hasOffsets = positionValue === 'absolute' || positionValue === 'fixed' || positionValue === 'sticky'
  const showAnchorGrid = positionValue === 'absolute' || positionValue === 'fixed'

  const activeH = horizontalAnchorOf(style)
  const activeV = verticalAnchorOf(style)

  const applyMode = (next: PositionValue | 'static') => {
    if (next === 'static') {
      canvas.updateNodeStyle(STATIC_PATCH)
      return
    }
    const patch: React.CSSProperties = { position: next }
    // Give a newly-positioned node a sane starting anchor (top-left) instead
    // of leaving it with no left/top/right/bottom at all, which would let it
    // silently keep rendering in its normal-flow spot despite `position`
    // having changed — confusing since nothing visibly moves.
    if (style.left === undefined && style.right === undefined) patch.left = style.left ?? '0em'
    if (style.top === undefined && style.bottom === undefined) patch.top = style.top ?? '0em'
    if (style.zIndex === undefined) patch.zIndex = 1
    canvas.updateNodeStyle(patch)
  }

  const applyAnchor = (h: HorizontalAnchor, v: VerticalAnchor) => {
    const patch: React.CSSProperties = {}
    const transforms: string[] = []

    if (h === 'center') {
      patch.left = '50%'
      patch.right = 'unset'
      transforms.push('translateX(-50%)')
    } else if (h === 'right') {
      patch.right = style.right !== undefined && style.right !== 'unset' ? style.right : '0em'
      patch.left = 'unset'
    } else {
      patch.left = style.left !== undefined && style.left !== 'unset' ? style.left : '0em'
      patch.right = 'unset'
    }

    if (v === 'center') {
      patch.top = '50%'
      patch.bottom = 'unset'
      transforms.push('translateY(-50%)')
    } else if (v === 'bottom') {
      patch.bottom = style.bottom !== undefined && style.bottom !== 'unset' ? style.bottom : '0em'
      patch.top = 'unset'
    } else {
      patch.top = style.top !== undefined && style.top !== 'unset' ? style.top : '0em'
      patch.bottom = 'unset'
    }

    patch.transform = transforms.length > 0 ? transforms.join(' ') : undefined
    canvas.updateNodeStyle(patch)
  }

  return (
    <div className="w-full">
      <SectionContainer hintKey="positionOffset" label={t('layoutSection.position')}>
        <PanelRowContainer multiField className="px-2 py-2 justify-start items-start gap-3" layoutType="col" hintKey="positionOffset" label={t('layoutSection.position')} htmlFor="layout-position">
          <div className="flex w-full gap-2 items-center">
            <Select
              id="layout-position"
              aria-label={t('layoutSection.position')}
              size="sm"
              placeholder=""
              className="w-full bg-card/50"
              items={item_position}
              selectedKey={positionValue}
              onSelectionChange={(v) => applyMode(v as PositionValue | 'static')}
            >
              {(item) => <SelectOption key={item.value} className="!bg-card/50" id={item.value}>{item.label}</SelectOption>}
            </Select>
            {positionValue !== 'static' && (
              <ToolTipPanel label={t('layoutSection.resetPosition')}>
                <button
                  type="button"
                  aria-label={t('layoutSection.resetPosition')}
                  onClick={() => applyMode('static')}
                  className="flex items-center justify-center w-7 h-7 shrink-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw size={13} />
                </button>
              </ToolTipPanel>
            )}
          </div>
        </PanelRowContainer>

        {hasOffsets && (
          <>
            <PositionPreview
              position={positionValue}
              activeH={activeH}
              activeV={activeV}
              onPick={showAnchorGrid ? applyAnchor : undefined}
            />

            <PanelRowContainer multiField className="px-2 justify-start items-start gap-3" layoutType="row" label="" htmlFor="position-x">
              <PanelRowContainer className="px-0 justify-start w-full" layoutType="col" hintKey="positionLeft" label={t('layoutSection.left')}>
                <NumberField
                  id="position-x-l"
                  aria-label={t('layoutSection.positionXLAria')}
                  className="col-span-1"
                  isDisabled={activeH !== 'left'}
                  value={CSSUtils.extractEmValue(style.left)}
                  onChange={(v) => canvas.updateNodeStyle({ left: CSSUtils.setEmValue(v), right: 'unset', transform: undefined })}
                >
                  <NumberFieldInput size="sm" />
                </NumberField>
              </PanelRowContainer>
              <PanelRowContainer className="px-0 justify-start w-full" layoutType="col" hintKey="positionRight" label={t('layoutSection.right')}>
                <NumberField
                  id="position-x-r"
                  aria-label={t('layoutSection.positionXRAria')}
                  className="col-span-1"
                  isDisabled={activeH !== 'right'}
                  value={CSSUtils.extractEmValue(style.right)}
                  onChange={(v) => canvas.updateNodeStyle({ right: CSSUtils.setEmValue(v), left: 'unset', transform: undefined })}
                >
                  <NumberFieldInput size="sm" />
                </NumberField>
              </PanelRowContainer>
            </PanelRowContainer>

            {positionValue !== 'sticky' && (
              <PanelRowContainer multiField className="px-2 justify-start items-start gap-3" layoutType="row" label="" htmlFor="position-y">
                <PanelRowContainer className="px-0 justify-start w-full" layoutType="col" hintKey="positionTop" label={t('layoutSection.top')}>
                  <NumberField
                    id="position-Y-T"
                    aria-label={t('layoutSection.positionYTAria')}
                    className="col-span-1"
                    isDisabled={activeV !== 'top'}
                    value={CSSUtils.extractEmValue(style.top)}
                    onChange={(v) => canvas.updateNodeStyle({ top: CSSUtils.setEmValue(v), bottom: 'unset', transform: undefined })}
                  >
                    <NumberFieldInput size="sm" />
                  </NumberField>
                </PanelRowContainer>

                <PanelRowContainer className="px-0 justify-start w-full" layoutType="col" hintKey="positionBottom" label={t('layoutSection.bottom')}>
                  <NumberField
                    id="position-Y-B"
                    aria-label={t('layoutSection.positionYBAria')}
                    className="col-span-1"
                    isDisabled={activeV !== 'bottom'}
                    value={CSSUtils.extractEmValue(style.bottom)}
                    onChange={(v) => canvas.updateNodeStyle({ bottom: CSSUtils.setEmValue(v), top: 'unset', transform: undefined })}
                  >
                    <NumberFieldInput size="sm" />
                  </NumberField>
                </PanelRowContainer>
              </PanelRowContainer>
            )}

            <PanelRowContainer className="px-2 py-2 justify-start w-full" layoutType="col" hintKey="zIndex" label={t('layoutSection.zIndex')} htmlFor="position-z-index">
              <NumberField
                id="position-z-index"
                aria-label={t('layoutSection.zIndexAria')}
                className="w-full"
                value={typeof style.zIndex === 'number' ? style.zIndex : Number(style.zIndex) || 0}
                onChange={(v) => canvas.updateNodeStyle({ zIndex: v })}
              >
                <NumberFieldInput size="sm" />
              </NumberField>
            </PanelRowContainer>
          </>
        )}
      </SectionContainer>
    </div>
  )
}
