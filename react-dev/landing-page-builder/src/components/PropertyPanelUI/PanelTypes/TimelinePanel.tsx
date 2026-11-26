import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { TimelineNode, TimelineStep, TimelineUiType } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import { cn } from '@/libs/cn'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { buildTimelineStepBlock, restyleTimelineChildren, setTimelineSlotText } from '@/utils/timelineSlots'
import { CanvasNode } from '@/types/node.type'

import withTemplateTabs from './withTemplateTabs'

const PREVIEW_ACTIVE = '#0f766e'
const PREVIEW_INACTIVE = '#d9d9d9'

/** Mirrors ClassicLineVariant: numbered circles joined by a straight line, labels below. */
function ClassicLinePreview() {
  return (
    <div className="flex w-[150px] items-start">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="flex items-center w-full">
            <div
              className="flex items-center justify-center rounded-full text-white text-[9px] font-semibold shrink-0"
              style={{ width: 20, height: 20, backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="flex-1 h-[2px]" style={{ backgroundColor: i < 1 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }} />}
          </div>
          <div className="mt-1 h-1.5 w-8 rounded-full bg-neutral-400" />
        </div>
      ))}
    </div>
  )
}

/** Mirrors ZigzagVariant: alternating up/down steps along a horizontal spine. */
function ZigzagPreview() {
  return (
    <div className="flex w-[150px] items-end h-[70px] gap-1">
      {[0, 1, 2].map((i) => {
        const isUp = i % 2 === 0
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end h-full">
            {isUp && <div className="h-1.5 w-8 rounded-full bg-neutral-400 mb-1" />}
            <div className="flex items-center w-full">
              <div className="flex-1 h-px" style={{ backgroundColor: i === 0 ? 'transparent' : PREVIEW_ACTIVE }} />
              <div
                className="flex items-center justify-center rounded-full text-white text-[9px] font-semibold shrink-0"
                style={{ width: 18, height: 18, backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }}
              >
                {i + 1}
              </div>
              <div className="flex-1 h-px" style={{ backgroundColor: i === 2 ? 'transparent' : PREVIEW_ACTIVE }} />
            </div>
            {!isUp && <div className="h-1.5 w-8 rounded-full bg-neutral-400 mt-1" />}
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors CardStackVariant: gradient-header cards fanned with slight rotation on a dark gallery backdrop. */
function CardStackPreview() {
  return (
    <div className="flex w-[150px] gap-1.5 items-start p-1.5 rounded-lg" style={{ backgroundColor: '#101014' }}>
      {[0, 1, 2].map((i) => {
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        return (
          <div
            key={i}
            className="flex-1 rounded-md overflow-hidden flex flex-col"
            style={{ backgroundColor: '#1c1c22', boxShadow: `0 4px 8px -3px ${color}88`, transform: i % 2 === 1 ? 'translateY(3px)' : 'none' }}
          >
            <div className="h-2.5 w-full" style={{ background: `linear-gradient(120deg, ${color}, ${color}99)` }} />
            <div className="flex flex-col gap-1 p-1.5">
              <div className="h-1 w-full rounded-full bg-neutral-500" />
              <div className="h-1 w-3/4 rounded-full bg-neutral-600" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors MinimalDotsVariant: small dots + hairline, no numbers, compact labels. */
function MinimalDotsPreview() {
  return (
    <div className="flex w-[150px] items-start">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="flex items-center w-full">
            <span className="rounded-full shrink-0" style={{ width: 6, height: 6, backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }} />
            {i < 2 && <div className="flex-1 h-px" style={{ backgroundColor: i < 1 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }} />}
          </div>
          <div className="mt-1.5 h-1 w-7 rounded-full bg-neutral-400" />
        </div>
      ))}
    </div>
  )
}

/** Mirrors NumberedCirclesVariant: oversized outlined circles as the focal element. */
function NumberedCirclesPreview() {
  return (
    <div className="flex w-[150px] items-start">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="flex items-center w-full">
            <div
              className="flex items-center justify-center rounded-full text-[10px] font-bold shrink-0"
              style={{ width: 26, height: 26, border: `2px solid ${i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE}`, color: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="flex-1 h-[2px]" style={{ backgroundColor: i < 1 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }} />}
          </div>
          <div className="mt-1 h-1.5 w-8 rounded-full bg-neutral-400" />
        </div>
      ))}
    </div>
  )
}

/** Mirrors VerticalRailVariant: always-vertical left rail with row-like entries. */
function VerticalRailPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-row items-stretch gap-2">
          <div className="flex flex-col items-center">
            <div
              className="flex items-center justify-center rounded-full text-white text-[8px] font-semibold shrink-0"
              style={{ width: 16, height: 16, backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-[2px] flex-1 my-0.5 rounded-full" style={{ backgroundColor: i < 1 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE, minHeight: 10 }} />}
          </div>
          <div className="flex flex-col justify-center gap-0.5 pb-2">
            <div className="h-1.5 w-14 rounded-full bg-neutral-400" />
            <div className="h-1 w-10 rounded-full bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Mirrors RoadmapVariant: chevron/hex milestone markers on a notched road bar. */
function RoadmapPreview() {
  return (
    <div className="flex w-[150px] items-start">
      {[0, 1, 2].map((i) => {
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="flex items-center justify-center text-white text-[8px] font-bold shrink-0 mb-1"
              style={{ width: 18, height: 18, backgroundColor: color, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
            />
            <div className="w-full h-2" style={{ backgroundColor: color, clipPath: 'polygon(0% 0%, 96% 0%, 100% 50%, 96% 100%, 0% 100%, 4% 50%)' }} />
            <div className="mt-1 h-1.5 w-8 rounded-full bg-neutral-400" />
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors CompactVariant: dense activity-log rows — numbered gradient chip + connecting rail, title/description stacked. */
function CompactPreview() {
  return (
    <div className="flex flex-col w-[150px]">
      {[0, 1, 2].map((i) => {
        const isLast = i === 2
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        return (
          <div key={i} className="flex flex-row items-stretch gap-1.5">
            <div className="flex flex-col items-center shrink-0">
              <span
                className="flex items-center justify-center rounded text-white font-bold text-[7px] shrink-0"
                style={{ width: 14, height: 14, background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
              >
                {i + 1}
              </span>
              {!isLast && <div className="w-[1.5px] flex-1 my-0.5" style={{ backgroundColor: PREVIEW_INACTIVE, minHeight: 6 }} />}
            </div>
            <div className="flex flex-col gap-0.5 pb-1.5">
              <div className="h-1.5 w-10 rounded-full bg-neutral-400" />
              <div className="h-1 w-14 rounded-full bg-neutral-200" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors SCurveSpineVariant: winding vertical spine, alternating left/right circle badges. */
function SCurveSpinePreview() {
  return (
    <div className="relative flex flex-col w-[150px] gap-3 items-center">
      {[0, 1, 2].map((i) => {
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        const alignRight = i % 2 === 1
        return (
          <div key={i} className="relative flex items-center w-full">
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full shrink-0" style={{ width: 14, height: 14, backgroundColor: color }} />
            <div className={cn('flex flex-col w-[45%] gap-0.5', alignRight ? 'ml-auto items-start' : 'mr-auto items-end')}>
              <div className="h-1.5 w-8 rounded-full bg-neutral-400" />
              <div className="h-1 w-6 rounded-full bg-neutral-200" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors WavyRibbonVariant: wavy connector with alternating up/down circle markers. */
function WavyRibbonPreview() {
  return (
    <svg width={150} height={70} viewBox="0 0 150 70">
      <path d="M 0 35 Q 20 15, 40 35 Q 60 55, 75 35 Q 95 15, 110 35 Q 125 55, 150 35" fill="none" stroke={PREVIEW_INACTIVE} strokeWidth={2} />
      {[20, 75, 130].map((x, i) => (
        <circle key={i} cx={x} cy={i % 2 === 0 ? 15 : 55} r={7} fill={i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE} />
      ))}
    </svg>
  )
}

/** Mirrors RibbonBannerVariant: flag/ribbon-shaped labels stacked vertically. */
function RibbonBannerPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-4 w-16"
          style={{ backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE, clipPath: 'polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)' }}
        />
      ))}
    </div>
  )
}

/** Mirrors IconBranchRailVariant: central spine with side branches to alternating labels. */
function IconBranchRailPreview() {
  return (
    <div className="relative flex flex-col w-[150px] gap-2">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: PREVIEW_INACTIVE }} />
      {[0, 1, 2].map((i) => {
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        const alignRight = i % 2 === 1
        return (
          <div key={i} className={cn('flex items-center w-full', alignRight ? 'justify-start pl-[52%]' : 'justify-end pr-[52%]')}>
            <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: color }} />
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors ArrowAxisVariant: single axis with alternating above/below labels. */
function ArrowAxisPreview() {
  return (
    <div className="flex w-[150px] items-center" style={{ height: 60 }}>
      {[0, 1, 2].map((i) => {
        const isUp = i % 2 === 0
        const color = i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            {isUp && <div className="h-1.5 w-6 rounded-full bg-neutral-400 mb-1" />}
            <div className="w-px h-2" style={{ backgroundColor: color }} />
            <div className="flex items-center w-full">
              <div className="flex-1 h-px" style={{ backgroundColor: PREVIEW_INACTIVE }} />
              <span className="rounded-full shrink-0" style={{ width: 8, height: 8, backgroundColor: color }} />
              <div className="flex-1 h-px" style={{ backgroundColor: PREVIEW_INACTIVE }} />
            </div>
            {!isUp && <div className="h-1.5 w-6 rounded-full bg-neutral-400 mt-1" />}
          </div>
        )
      })}
    </div>
  )
}

/** Mirrors WavyCirclesVariant: large outlined rings riding a sine-wave path. */
function WavyCirclesPreview() {
  return (
    <svg width={150} height={70} viewBox="0 0 150 70">
      <path d="M 0 35 Q 20 15, 40 35 Q 60 55, 75 35 Q 95 15, 110 35 Q 125 55, 150 35" fill="none" stroke={PREVIEW_INACTIVE} strokeWidth={1.5} />
      {[20, 75, 130].map((x, i) => (
        <circle key={i} cx={x} cy={35} r={10} fill="white" stroke={i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE} strokeWidth={3} />
      ))}
    </svg>
  )
}

/** Mirrors LoadingBarVariant: step markers on top, gradient progress bar beneath. */
function LoadingBarPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-2">
      <div className="flex items-center w-full">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <span className="rounded-full shrink-0" style={{ width: 8, height: 8, border: `2px solid ${i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE}` }} />
            {i < 2 && <div className="flex-1 h-px" style={{ borderTop: `1px dotted ${PREVIEW_INACTIVE}` }} />}
          </div>
        ))}
      </div>
      <div className="flex w-full h-3 rounded overflow-hidden" style={{ backgroundColor: `${PREVIEW_INACTIVE}44` }}>
        <div className="h-full" style={{ width: '65%', background: `linear-gradient(90deg, ${PREVIEW_ACTIVE}, ${PREVIEW_INACTIVE})` }} />
      </div>
    </div>
  )
}

/** Mirrors AxisPillsVariant: top axis with diamond markers, short stems to labels. */
function AxisPillsPreview() {
  return (
    <div className="flex flex-col w-[150px]">
      <div className="w-full h-px" style={{ backgroundColor: PREVIEW_INACTIVE }} />
      <div className="flex w-full mt-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="shrink-0" style={{ width: 6, height: 6, backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE, transform: 'rotate(45deg)' }} />
            <div className="w-px h-2" style={{ backgroundColor: i < 2 ? PREVIEW_ACTIVE : PREVIEW_INACTIVE }} />
            <div className="h-1.5 w-6 rounded-full bg-neutral-400" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * uiTypes whose TimelineVisual implementation actually branches on
 * node.orientation (see TimelineVisual.tsx — everything else renders one
 * fixed layout regardless of orientation, e.g. verticalRail/compact are
 * always a vertical list, wavyRibbon/arrowAxis/loadingBar/etc. are always a
 * horizontal spine/axis). The orientation toggle below is disabled outside
 * this set so it never implies a control that would silently do nothing.
 */
const ORIENTATION_AWARE_UI_TYPES: TimelineUiType[] = [
  'classicLine', 'zigzag', 'cardStack', 'minimalDots', 'numberedCircles', 'roadmap',
]

function TimelinePanel() {
  const canvas = useEditor()
  const node = canvas?.focusedNode as TimelineNode
  const { t } = useTranslation('propertyPanel')

  /** `steps` stays the seed and the legacy fallback; `childrenUpdater` keeps the
   * real child tree (if any) in step with it. */
  function updateSteps(
    updater: (steps: TimelineStep[]) => TimelineStep[],
    childrenUpdater?: (children: CanvasNode[], node: TimelineNode) => CanvasNode[],
  ) {
    canvas.updateNode((prevNode) => {
      const timelineNode = prevNode as TimelineNode
      const steps = updater(timelineNode.steps)
      return {
        ...timelineNode,
        steps,
        activeStepCount: Math.min(timelineNode.activeStepCount, steps.length),
        ...(timelineNode.children && childrenUpdater
          ? { children: childrenUpdater(timelineNode.children, timelineNode) }
          : {}),
      }
    })
  }

  function addStep() {
    const step = { title: t('timelinePanel.stepTitle', { number: node.steps.length + 1 }), description: t('timelinePanel.stepDescription') }
    updateSteps(
      (steps) => [...steps, step],
      // One block node per step.
      (children, timelineNode) => [...children, buildTimelineStepBlock(step, timelineNode.uiType)],
    )
  }

  function removeStep(index: number) {
    updateSteps(
      (steps) => steps.filter((_, i) => i !== index),
      (children) => children.filter((_, i) => i !== index),
    )
  }

  const uiTypeOptions: UiTypeOption[] = [
    { value: 'classicLine', label: t('timelinePanel.uiType.classicLine'), Preview: ClassicLinePreview },
    { value: 'zigzag', label: t('timelinePanel.uiType.zigzag'), Preview: ZigzagPreview },
    { value: 'cardStack', label: t('timelinePanel.uiType.cardStack'), Preview: CardStackPreview },
    { value: 'minimalDots', label: t('timelinePanel.uiType.minimalDots'), Preview: MinimalDotsPreview },
    { value: 'numberedCircles', label: t('timelinePanel.uiType.numberedCircles'), Preview: NumberedCirclesPreview },
    { value: 'verticalRail', label: t('timelinePanel.uiType.verticalRail'), Preview: VerticalRailPreview },
    { value: 'roadmap', label: t('timelinePanel.uiType.roadmap'), Preview: RoadmapPreview },
    { value: 'compact', label: t('timelinePanel.uiType.compact'), Preview: CompactPreview },
    { value: 'sCurveSpine', label: t('timelinePanel.uiType.sCurveSpine'), Preview: SCurveSpinePreview },
    { value: 'wavyRibbon', label: t('timelinePanel.uiType.wavyRibbon'), Preview: WavyRibbonPreview },
    { value: 'ribbonBanner', label: t('timelinePanel.uiType.ribbonBanner'), Preview: RibbonBannerPreview },
    { value: 'iconBranchRail', label: t('timelinePanel.uiType.iconBranchRail'), Preview: IconBranchRailPreview },
    { value: 'arrowAxis', label: t('timelinePanel.uiType.arrowAxis'), Preview: ArrowAxisPreview },
    { value: 'wavyCircles', label: t('timelinePanel.uiType.wavyCircles'), Preview: WavyCirclesPreview },
    { value: 'loadingBar', label: t('timelinePanel.uiType.loadingBar'), Preview: LoadingBarPreview },
    { value: 'axisPills', label: t('timelinePanel.uiType.axisPills'), Preview: AxisPillsPreview },
  ]

  if (node)
    return (
      <div className='w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar'>

        <SectionContainer label={t('timelinePanel.uiTypeLabel')}>
          <UiTypeSelector
            options={uiTypeOptions}
            value={node.uiType}
            onChange={(v) => canvas.updateNode((prevNode) => {
              const prev = prevNode as TimelineNode
              const uiType = v as TimelineUiType
              // Variants paint their text differently (light on dark, etc.), so
              // the child tree is re-skinned to match. Legacy timelines have no
              // children — nothing to restyle.
              return {
                ...prev,
                uiType,
                ...(prev.children ? { children: restyleTimelineChildren(prev.children, uiType) } : {}),
              }
            })}
          />
        </SectionContainer>

        <SectionContainer label={t('timelinePanel.arrangement')}>
          <PanelRowContainer className='px-0 py-2 gap-3' layoutType='col' label={t('timelinePanel.orientation')}>
            {(() => {
              const orientationSupported = ORIENTATION_AWARE_UI_TYPES.includes(node.uiType)
              return (
                <>
                  <div className={cn('flex gap-1 h-[38px] w-full relative justify-start items-center', !orientationSupported && 'opacity-40 pointer-events-none')}>
                    <div
                      onClick={() => orientationSupported && canvas.updateNode((prevNode) => ({ ...prevNode as TimelineNode, orientation: 'horizontal' }))}
                      style={{ backgroundColor: node.orientation !== 'vertical' ? 'rgb(80 205 137 / 0.4)' : '' }}
                      className={cn('text-center flex justify-center items-center text-sm border rounded-l-md w-1/2 h-full text-foreground', orientationSupported ? 'cursor-pointer' : 'cursor-not-allowed')}
                    >
                      {t('timelinePanel.horizontal')}
                    </div>
                    <div
                      onClick={() => orientationSupported && canvas.updateNode((prevNode) => ({ ...prevNode as TimelineNode, orientation: 'vertical' }))}
                      style={{ backgroundColor: node.orientation === 'vertical' ? 'rgb(80 205 137 / 0.4)' : '' }}
                      className={cn('text-center flex justify-center items-center text-sm border rounded-r-md w-1/2 h-full text-foreground', orientationSupported ? 'cursor-pointer' : 'cursor-not-allowed')}
                    >
                      {t('timelinePanel.vertical')}
                    </div>
                  </div>
                  {!orientationSupported && (
                    <span className="text-xs text-muted-foreground">{t('timelinePanel.orientationUnsupported')}</span>
                  )}
                </>
              )
            })()}
          </PanelRowContainer>
        </SectionContainer>

        <FoldList label={t('timelinePanel.content')}>
          <PanelRowContainer className='px-0 gap-3' layoutType='col' label={t('timelinePanel.stepsLabel')}>
          {node.steps.map((step, index) => (
            <div key={index} className='border rounded-lg overflow-hidden'>
              <div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
                <span className='text-sm font-medium text-foreground'>{t('timelinePanel.stepHeading', { number: index + 1 })}</span>
                {node.steps.length > 1 && (
                  <div
                    onClick={() => removeStep(index)}
                    className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
                  >
                    <FiTrash size={16} />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-2 p-2'>
                <PanelRowContainer className=' px-0 ' layoutType='col' label={t('timelinePanel.title')}>
                  <TextInput
                    size='sm'
                    value={step.title}
                    onChange={(e) => updateSteps(
                      (steps) => {
                        const next = [...steps]
                        next[index] = { ...next[index], title: e.target.value }
                        return next
                      },
                      // The slot is a real text node now, so write through to it.
                      (children) => setTimelineSlotText(children, index, 'title', e.target.value),
                    )}
                  />
                </PanelRowContainer>
                <PanelRowContainer className=' px-0 ' layoutType='col' label={t('timelinePanel.description')}>
                  <TextInput
                    size='sm'
                    value={step.description}
                    onChange={(e) => updateSteps(
                      (steps) => {
                        const next = [...steps]
                        next[index] = { ...next[index], description: e.target.value }
                        return next
                      },
                      // The slot is a real text node now, so write through to it.
                      (children) => setTimelineSlotText(children, index, 'description', e.target.value),
                    )}
                  />
                </PanelRowContainer>
              </div>
            </div>
          ))}
          <div
            onClick={addStep}
            className='flex gap-2 justify-center items-center w-full h-[38px] py-1 text-sm border-t border-border text-muted-foreground hover:bg-primary/5 cursor-pointer transition-colors'
          >
            <CirclePlusIcon size={20} />
            <span>{t('timelinePanel.addStep')}</span>
          </div>
        </PanelRowContainer>
        </FoldList>

        <FoldList label={t('timelinePanel.typography')}>
          <TypographyControl
            label={t('timelinePanel.title')}
            value={node.titleStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as TimelineNode,
              titleStyle: next,
            }))}
          />
          <TypographyControl
            label={t('timelinePanel.description')}
            value={node.descriptionStyle}
            defaultValue={{ fontSize: '12px', fontWeight: '400', color: '#6b6b6b' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as TimelineNode,
              descriptionStyle: next,
            }))}
          />
          <LineClampControl field="title" label={t('timelinePanel.title')} />
          <LineClampControl field="description" label={t('timelinePanel.description')} />
        </FoldList>

        <SectionContainer hintKey="colorPair" label={t('timelinePanel.appearance')}>
          <PanelRowContainer className='w-full px-0' layoutType='col' label={t('timelinePanel.activeSteps')}>
            <div className='flex items-center gap-3 w-full'>
              <input
                type='range'
                className='flex-1 accent-primary'
                min={0}
                max={node.steps.length}
                step={1}
                value={node.activeStepCount}
                onChange={(e) => canvas.updateNode((prevNode) => ({
                  ...prevNode as TimelineNode,
                  activeStepCount: Number(e.target.value),
                }))}
              />
              <span className='text-sm text-foreground w-12 text-right'>{node.activeStepCount}</span>
            </div>
          </PanelRowContainer>
          <PanelRowContainer className='w-full px-0' layoutType='col' hintKey="colorPair" label={t('timelinePanel.activeColor')}>
            <ColorPicker
              value={node.activeColor || '#0f766e'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as TimelineNode,
                activeColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className='w-full px-0' layoutType='col' hintKey="colorPair" label={t('timelinePanel.inactiveColor')}>
            <ColorPicker
              value={node.inactiveColor || '#d9d9d9'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as TimelineNode,
                inactiveColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className='w-full px-0' layoutType='col' label={t('timelinePanel.circleSize')}>
            <NumberField
              aria-label={t('timelinePanel.circleSizeAriaLabel')}
              minValue={16}
              maxValue={96}
              value={node.circleSize ?? 32}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as TimelineNode,
                circleSize: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer hintKey="styleGroup" label={t('timelinePanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('timelinePanel.background')}>
            <BackgroundPicker
              value={node.style?.backgroundColor || ''}
              onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
            />
          </PanelRowContainer>
          <BorderController />
        </SectionContainer>

        <Attributes />
      </div>
    )
}

export default withTemplateTabs(TimelinePanel)
