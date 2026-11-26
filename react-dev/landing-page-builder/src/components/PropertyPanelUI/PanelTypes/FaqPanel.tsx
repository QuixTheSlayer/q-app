import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { FaqNode, FaqUiType } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector } from '@/components/PropertyPanelUI/UiTypeSelector'

import withTemplateTabs from './withTemplateTabs'
import { buildFaqItemBlock, restyleFaqChildren, setFaqSlotText } from '@/utils/faqSlots'

/* ---------------------------------------------------------------------- *
 * Tiny static previews for each uiType option, shown in the UiTypeSelector
 * grid. Hardcoded sample content only — no live node data — scaled to fit
 * the selector's ~150x100 preview box.
 * ---------------------------------------------------------------------- */

const previewQuestion = { fontSize: 13, fontWeight: 600, color: '#1e40af' } as const
const previewAnswer = { fontSize: 11, color: '#4a4a4a' } as const
const previewIcon = '#4a4a4a'
const previewDivider = '#e5e0d8'

function ClassicAccordionPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left rounded-lg p-1.5" style={{ background: `linear-gradient(160deg, ${previewIcon}14, transparent 60%)` }}>
      <div
        className="rounded-md px-1.5 py-1.5 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${previewIcon}22, ${previewDivider}44)`, boxShadow: `inset 0 0 0 1.5px ${previewIcon}55` }}
      >
        <span style={previewQuestion}>What is this?</span>
        <span className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: previewIcon, color: '#fff' }}>×</span>
      </div>
      <span className="pl-1.5" style={previewAnswer}>A short answer line here.</span>
      <div className="rounded-md px-1.5 py-1.5 flex items-center justify-between" style={{ backgroundColor: `${previewDivider}33` }}>
        <span style={previewQuestion}>Another one?</span>
        <span className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: previewIcon, color: '#fff' }}>+</span>
      </div>
    </div>
  )
}

function PlusMinusPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left rounded-lg p-1.5" style={{ backgroundColor: `${previewDivider}22` }}>
      <div className="flex items-center gap-1.5 rounded-md px-1 py-1" style={{ backgroundColor: '#ffffffcc', boxShadow: `0 3px 8px -4px ${previewIcon}66` }}>
        <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${previewIcon}, ${previewIcon}99)` }}>−</span>
        <span style={previewQuestion}>What is this?</span>
      </div>
      <span className="pl-5" style={previewAnswer}>A short answer line.</span>
      <div className="flex items-center gap-1.5 px-1">
        <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${previewIcon}, ${previewIcon}99)` }}>+</span>
        <span style={previewQuestion}>Another one?</span>
      </div>
    </div>
  )
}

function BoxedPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-2 text-left">
      <div className="rounded-md overflow-hidden" style={{ borderTop: `3px solid ${previewIcon}`, boxShadow: `0 6px 14px -8px ${previewIcon}66` }}>
        <div className="flex items-center justify-between px-1.5 py-1" style={{ backgroundColor: `${previewIcon}12` }}>
          <span style={previewQuestion}>What is this?</span>
          <span className="shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: previewIcon }}>▲</span>
        </div>
        <div className="px-1.5 py-1" style={{ borderTop: `1px dashed ${previewDivider}` }}>
          <span style={previewAnswer}>A short answer.</span>
        </div>
      </div>
      <div className="rounded-md px-1.5 py-1" style={{ borderTop: `3px solid ${previewIcon}`, boxShadow: `0 3px 8px -6px ${previewDivider}` }}>
        <span style={previewQuestion}>Another one?</span>
      </div>
    </div>
  )
}

function NumberedPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-2 text-left">
      <div className="flex gap-1.5">
        <span className="shrink-0 w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black text-white" style={{ background: `linear-gradient(160deg, ${previewIcon}, ${previewIcon}77)` }}>01</span>
        <div className="flex flex-col">
          <span style={previewQuestion}>What is this?</span>
          <span style={previewAnswer}>A short answer.</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <span className="shrink-0 w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black text-white" style={{ background: `linear-gradient(160deg, ${previewIcon}, ${previewIcon}77)` }}>02</span>
        <span style={previewQuestion}>Another one?</span>
      </div>
    </div>
  )
}

function TwoColumnPreview() {
  return (
    <div className="flex w-[150px] gap-0 text-left rounded-md overflow-hidden" style={{ boxShadow: `0 4px 12px -6px ${previewIcon}66` }}>
      <div className="flex flex-col gap-1 w-1/2 p-1.5" style={{ background: `linear-gradient(160deg, ${previewIcon}, ${previewIcon}bb)` }}>
        <div className="rounded px-1 py-0.5" style={{ backgroundColor: '#fff' }}>
          <span style={{ ...previewQuestion, fontSize: 11 }}>Q1</span>
        </div>
        <div className="px-1 py-0.5">
          <span style={{ ...previewQuestion, fontSize: 11, color: '#fff' }}>Q2</span>
        </div>
      </div>
      <div className="flex-1 p-1.5" style={{ backgroundColor: '#fff' }}>
        <span style={previewAnswer}>Answer panel content.</span>
      </div>
    </div>
  )
}

function MinimalDividerPreview() {
  return (
    <div className="flex flex-col w-[150px] text-left">
      <div className="relative overflow-hidden">
        <span className="absolute -top-2 -left-0.5 select-none pointer-events-none" style={{ fontSize: 32, fontWeight: 900, color: `${previewIcon}14`, lineHeight: 1 }}>01</span>
        <div className="relative pl-4">
          <span style={previewQuestion}>What is this?</span>
          <div style={previewAnswer}>A short answer line.</div>
        </div>
      </div>
      <div className="h-[2px] w-full my-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${previewIcon}, ${previewDivider}, transparent)` }} />
      <div className="relative overflow-hidden">
        <span className="absolute -top-2 -left-0.5 select-none pointer-events-none" style={{ fontSize: 32, fontWeight: 900, color: `${previewIcon}14`, lineHeight: 1 }}>02</span>
        <div className="relative pl-4">
          <span style={previewQuestion}>Another one?</span>
        </div>
      </div>
    </div>
  )
}

function CardGridPreview() {
  return (
    <div className="grid grid-cols-2 gap-1.5 w-[150px] text-left p-1.5 rounded-lg" style={{ backgroundColor: '#12131a' }}>
      <div className="rounded-md p-1.5" style={{ background: `linear-gradient(160deg, ${previewIcon}33, #ffffff0d)`, boxShadow: `0 0 0 1.5px ${previewIcon}` }}>
        <span style={{ ...previewQuestion, color: '#fff', fontSize: 11 }}>Q1?</span>
      </div>
      <div className="rounded-md p-1.5" style={{ backgroundColor: '#ffffff08' }}>
        <span style={{ ...previewQuestion, color: '#fff', fontSize: 11 }}>Q2?</span>
      </div>
    </div>
  )
}

function ChatBubblePreview() {
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left p-1.5 rounded-lg" style={{ backgroundColor: `${previewDivider}26` }}>
      <div className="self-start max-w-[85%] rounded-xl rounded-bl-sm px-1.5 py-1" style={{ background: `linear-gradient(135deg, ${previewIcon}, ${previewIcon}cc)`, boxShadow: `0 4px 10px -6px ${previewIcon}99` }}>
        <span style={{ ...previewQuestion, color: '#fff', fontSize: 11 }}>What is this?</span>
      </div>
      <div className="self-end max-w-[85%] rounded-xl rounded-br-sm px-1.5 py-1" style={{ backgroundColor: '#fff', boxShadow: `0 3px 8px -6px ${previewDivider}` }}>
        <span style={previewAnswer}>A short answer.</span>
      </div>
    </div>
  )
}

function CredentialListPreview() {
  return (
    <div className="flex flex-col w-[150px] text-left rounded-lg overflow-hidden" style={{ backgroundColor: '#EAF2EE', border: '1px solid #d8e4de' }}>
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: previewIcon, color: '#fff' }}>Q01</span>
        <span style={{ ...previewQuestion, color: '#1B1D22', fontSize: 11 }}>What is this?</span>
      </div>
      <div className="flex items-center px-1.5" style={{ height: 1 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="rounded-full shrink-0 mx-[3px]" style={{ width: 2, height: 2, backgroundColor: previewDivider }} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: previewIcon, color: '#fff' }}>Q02</span>
        <span style={{ ...previewQuestion, color: '#1B1D22', fontSize: 11 }}>Another one?</span>
      </div>
    </div>
  )
}

const uiTypeOptions: { value: FaqUiType; label: string; Preview: React.ComponentType }[] = [
  { value: 'classicAccordion', label: 'classicAccordion', Preview: ClassicAccordionPreview },
  { value: 'plusMinus', label: 'plusMinus', Preview: PlusMinusPreview },
  { value: 'boxed', label: 'boxed', Preview: BoxedPreview },
  { value: 'numbered', label: 'numbered', Preview: NumberedPreview },
  { value: 'twoColumn', label: 'twoColumn', Preview: TwoColumnPreview },
  { value: 'minimalDivider', label: 'minimalDivider', Preview: MinimalDividerPreview },
  { value: 'cardGrid', label: 'cardGrid', Preview: CardGridPreview },
  { value: 'chatBubble', label: 'chatBubble', Preview: ChatBubblePreview },
  { value: 'credentialList', label: 'credentialList', Preview: CredentialListPreview },
]
function FaqPanel() {
  const canvas = useEditor()
  const node = canvas?.focusedNode as FaqNode
  const { t } = useTranslation('propertyPanel')

  const uiTypeSelectorOptions = uiTypeOptions.map((option) => ({
    ...option,
    label: t(`faqPanel.uiType.${option.value}`),
  }))

  // Each question/answer is a real child node now, so these write through to
  // the child tree; `items` is kept in step as the seed and legacy fallback.
  function updateItemField(index: number, field: 'question' | 'answer', value: string) {
    canvas.updateNode((prevNode) => {
      const faqNode = prevNode as FaqNode
      const items = [...faqNode.items]
      items[index] = { ...items[index], [field]: value }
      return {
        ...faqNode,
        items,
        ...(faqNode.children ? { children: setFaqSlotText(faqNode.children, index, field, value) } : {}),
      }
    })
  }

  function addItem() {
    canvas.updateNode((prevNode) => {
      const faqNode = prevNode as FaqNode
      const item = { question: t('faqPanel.newQuestion', { number: faqNode.items.length + 1 }), answer: t('faqPanel.defaultAnswer') }
      const items = [...faqNode.items, item]
      return {
        ...faqNode,
        items,
        defaultOpenIndex: Math.min(faqNode.defaultOpenIndex, items.length - 1),
        // Each item is one block node, so a new item appends one child.
        ...(faqNode.children ? { children: [...faqNode.children, buildFaqItemBlock(item, faqNode.uiType)] } : {}),
      }
    })
  }

  function removeItem(index: number) {
    canvas.updateNode((prevNode) => {
      const faqNode = prevNode as FaqNode
      const items = faqNode.items.filter((_, i) => i !== index)
      return {
        ...faqNode,
        items,
        defaultOpenIndex: Math.min(faqNode.defaultOpenIndex, items.length - 1),
        ...(faqNode.children ? { children: faqNode.children.filter((_, i) => i !== index) } : {}),
      }
    })
  }

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('faqPanel.ui')}>
          <UiTypeSelector
            options={uiTypeSelectorOptions}
            value={node.uiType}
            onChange={(v) => canvas.updateNode((prevNode) => {
              const prev = prevNode as FaqNode
              const uiType = v as FaqUiType
              // Variants paint their slots differently (light question text on
              // the dark ones), so the child tree is re-skinned to match.
              return {
                ...prev,
                uiType,
                ...(prev.children ? { children: restyleFaqChildren(prev.children, uiType) } : {}),
              }
            })}
          />
        </SectionContainer>

        <FoldList label={t('faqPanel.content')}>
        <PanelRowContainer className=' px-0 py-2 ' layoutType='col' label={t('faqPanel.allowMultipleOpen')}>
          <div className='flex gap-1 h-[38px] w-full relative justify-start items-center'>
            <div
              onClick={() => canvas.updateNode((prevNode) => ({ ...prevNode as FaqNode, allowMultipleOpen: false }))}
              style={{ backgroundColor: !node.allowMultipleOpen ? 'rgb(80 205 137 / 0.4)' : '' }}
              className='text-center cursor-pointer flex justify-center items-center text-sm border rounded-l-md w-1/2 h-full text-foreground'
            >
              {t('faqPanel.single')}
            </div>
            <div
              onClick={() => canvas.updateNode((prevNode) => ({ ...prevNode as FaqNode, allowMultipleOpen: true }))}
              style={{ backgroundColor: node.allowMultipleOpen ? 'rgb(80 205 137 / 0.4)' : '' }}
              className='text-center cursor-pointer flex justify-center items-center text-sm border rounded-r-md w-1/2 h-full text-foreground'
            >
              {t('faqPanel.multiple')}
            </div>
          </div>
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('faqPanel.questions')}>
          {node.items.map((item, index) => (
            <div key={index} className='border rounded-lg overflow-hidden'>
              <div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
                <span className='text-sm font-medium text-foreground'>{t('faqPanel.questionNumber', { number: index + 1 })}</span>
                {node.items.length > 1 && (
                  <div
                    onClick={() => removeItem(index)}
                    className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
                  >
                    <FiTrash size={16} />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-2 p-2'>
                <PanelRowContainer className=' px-0 ' layoutType='col' label={t('faqPanel.question')}>
                  <TextInput
                    size='sm'
                    value={item.question}
                    onChange={(e) => updateItemField(index, 'question', e.target.value)}
                  />
                </PanelRowContainer>
                <PanelRowContainer className=' px-0 ' layoutType='col' label={t('faqPanel.answer')}>
                  <TextInput
                    size='sm'
                    value={item.answer}
                    onChange={(e) => updateItemField(index, 'answer', e.target.value)}
                  />
                </PanelRowContainer>
              </div>
            </div>
          ))}
          <div
            onClick={addItem}
            className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
          >
            <CirclePlusIcon size={24} />
            <span className='text-sm'>{t('faqPanel.addQuestion')}</span>
          </div>
        </PanelRowContainer>
        </FoldList>

        <FoldList label={t('faqPanel.typography')}>
          <TypographyControl
            label={t('faqPanel.question')}
            value={node.questionStyle}
            defaultValue={{ fontSize: '15px', fontWeight: '500', color: '#1e40af' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as FaqNode,
              questionStyle: next,
            }))}
          />
          <TypographyControl
            label={t('faqPanel.answer')}
            value={node.answerStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#4a4a4a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as FaqNode,
              answerStyle: next,
            }))}
          />
          <LineClampControl field="question" label={t('faqPanel.question')} />
          <LineClampControl field="answer" label={t('faqPanel.answer')} />
        </FoldList>

        <SectionContainer hintKey="colorPair" label={t('faqPanel.appearance')}>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('faqPanel.defaultOpen')}>
            <NumberField
              aria-label={t('faqPanel.defaultOpenIndex')}
              minValue={-1}
              maxValue={node.items.length - 1}
              value={node.defaultOpenIndex}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as FaqNode,
                defaultOpenIndex: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('faqPanel.dividerColor')}>
            <ColorPicker
              value={node.dividerColor || '#e5e0d8'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as FaqNode,
                dividerColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('faqPanel.iconColor')}>
            <ColorPicker
              value={node.iconColor || '#4a4a4a'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as FaqNode,
                iconColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('faqPanel.cardColor')}>
            <ColorPicker
              value={node.cardColor || '#ffffff'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as FaqNode,
                cardColor: v,
              }))}
            />
          </PanelRowContainer>
        </SectionContainer>


        <SectionContainer hintKey="styleGroup" label={t('faqPanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('faqPanel.background')}>
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

export default withTemplateTabs(FaqPanel)
