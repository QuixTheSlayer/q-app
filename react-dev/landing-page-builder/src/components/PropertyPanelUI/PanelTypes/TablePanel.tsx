import React from 'react'
import { useTranslation } from 'react-i18next'
import {ToggleGroup, ToggleGroupItem} from '@/components/inputs/ToggleGroup'
import {ActionList, PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'
import {fonts, text_type} from '@/consts/propertyField.consts'
import {useEditor} from '@/context/EditorContext'
import CSSUtils from '@/utils/CSS.utils'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker';
import {Select, SelectOption} from '@/components/ui/Select'
import {LuBold, LuItalic} from "react-icons/lu";
import {PiList, PiListBullets, PiTextUnderlineBold} from "react-icons/pi";
import {RiAlignCenter, RiAlignJustify, RiAlignLeft, RiAlignRight} from "react-icons/ri";
import {AiOutlinePlus} from "react-icons/ai";
import {PiTrash} from "react-icons/pi";
import {ContentNode} from '@/types/node.type'
import {AiOutlineMergeCells, AiOutlineSplitCells} from "react-icons/ai";
import Link from '@/components/PropertyPanelUI/Sections/Link'
import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import withSizeGridTab from './withSizeGridTab'
import Typography from '../Sections/Typography'
import { UiTypeSelector } from '@/components/PropertyPanelUI/UiTypeSelector'
import { TableNode, TableUiType } from '@/types/node.type'
import { restyleTableColors } from '@/utils/tableUiTypeStyles'

/* ---------------------------------------------------------------------- *
 * Tiny static previews for each uiType option, shown in the UiTypeSelector
 * grid. Hardcoded sample content only — no live node data — approximating
 * the real CSS injected via <style> at render time (see tableUiTypeStyles.ts).
 * ---------------------------------------------------------------------- */

const previewCellText = { fontSize: 10 } as const

function ClassicBorderedPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th className="border px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#bbbbbb', borderColor: '#888888' }}>Name</th>
          <th className="border px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#bbbbbb', borderColor: '#888888' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-1.5 py-1" style={{ ...previewCellText, borderColor: '#888888' }}>Row 1</td>
          <td className="border px-1.5 py-1" style={{ ...previewCellText, borderColor: '#888888' }}>10</td>
        </tr>
        <tr>
          <td className="border px-1.5 py-1" style={{ ...previewCellText, borderColor: '#888888' }}>Row 2</td>
          <td className="border px-1.5 py-1" style={{ ...previewCellText, borderColor: '#888888' }}>8</td>
        </tr>
      </tbody>
    </table>
  )
}

function StripedPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1" style={{ ...previewCellText, fontWeight: 600, borderBottom: '2px solid #888888' }}>Name</th>
          <th className="px-1.5 py-1" style={{ ...previewCellText, fontWeight: 600, borderBottom: '2px solid #888888' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1.5 py-1" style={{ ...previewCellText, borderBottom: '1px solid #88888833' }}>Row 1</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, borderBottom: '1px solid #88888833' }}>10</td>
        </tr>
        <tr>
          <td className="px-1.5 py-1" style={{ ...previewCellText, borderBottom: '1px solid #88888833' }}>Row 2</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, borderBottom: '1px solid #88888833' }}>8</td>
        </tr>
      </tbody>
    </table>
  )
}

function MinimalBorderlessPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'collapse', backgroundColor: '#0b0f14' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#11161d', borderBottom: '2px solid #38bdf8', color: '#38bdf8', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#11161d', borderBottom: '2px solid #38bdf8', color: '#38bdf8', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1.5 py-1" style={{ ...previewCellText, color: '#e5e7eb', fontFamily: 'ui-monospace, monospace', borderBottom: '1px solid #ffffff14' }}>Row 1</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, color: '#e5e7eb', fontFamily: 'ui-monospace, monospace', borderBottom: '1px solid #ffffff14' }}>10</td>
        </tr>
        <tr style={{ backgroundColor: '#ffffff08' }}>
          <td className="px-1.5 py-1" style={{ ...previewCellText, color: '#e5e7eb', fontFamily: 'ui-monospace, monospace' }}>Row 2</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, color: '#e5e7eb', fontFamily: 'ui-monospace, monospace' }}>8</td>
        </tr>
      </tbody>
    </table>
  )
}

function DarkHeaderPreview() {
  return (
    <table className="w-[140px] text-left rounded-md overflow-hidden" style={{ borderCollapse: 'collapse', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#8855dd', color: '#ffffff', fontWeight: 700, boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}>Name</th>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#8855dd', color: '#ffffff', fontWeight: 700, boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1.5 py-1" style={previewCellText}>Row 1</td>
          <td className="px-1.5 py-1" style={previewCellText}>10</td>
        </tr>
        <tr style={{ backgroundColor: '#8855dd14' }}>
          <td className="px-1.5 py-1" style={previewCellText}>Row 2</td>
          <td className="px-1.5 py-1" style={previewCellText}>8</td>
        </tr>
      </tbody>
    </table>
  )
}

function CardRowsPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1 text-left" style={{ ...previewCellText, fontWeight: 700 }}>Name</th>
          <th className="px-1.5 py-1 text-left" style={{ ...previewCellText, fontWeight: 700 }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-0.5"><span className="rounded-full px-2 py-0.5" style={{ ...previewCellText, backgroundColor: '#8855dd1a', border: '1px solid #8855dd55' }}>Row 1</span></td>
          <td className="py-0.5"><span className="rounded-full px-2 py-0.5" style={{ ...previewCellText, backgroundColor: '#8855dd1a', border: '1px solid #8855dd55' }}>10</span></td>
        </tr>
      </tbody>
    </table>
  )
}

function CompactPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th className="px-1 py-0.5 text-center" style={{ fontSize: 9, fontWeight: 700, borderBottom: '2px solid #8855dd' }}>Name</th>
          <th className="px-1 py-0.5 text-center" style={{ fontSize: 9, fontWeight: 700, borderBottom: '2px solid #8855dd' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1 py-0.5" style={{ fontSize: 9, backgroundColor: '#8855dd0f', borderRight: '2px solid #8855dd55', fontWeight: 600 }}>Row 1</td>
          <td className="px-1 py-0.5 text-center" style={{ fontSize: 9, borderBottom: '1px solid #88888833' }}>10</td>
        </tr>
        <tr>
          <td className="px-1 py-0.5" style={{ fontSize: 9, backgroundColor: '#8855dd0f', borderRight: '2px solid #8855dd55', fontWeight: 600 }}>Row 2</td>
          <td className="px-1 py-0.5 text-center" style={{ fontSize: 9 }}>8</td>
        </tr>
      </tbody>
    </table>
  )
}

function RoundedSoftPreview() {
  return (
    <table className="w-[140px] text-left" style={{ borderCollapse: 'collapse', backgroundColor: '#04140a', border: '1px solid #0f3d20' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1" style={{ ...previewCellText, border: '1px solid #0f3d20', color: '#4ade80', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', textShadow: '0 0 4px rgba(74,222,128,0.6)' }}>Name</th>
          <th className="px-1.5 py-1" style={{ ...previewCellText, border: '1px solid #0f3d20', color: '#4ade80', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', textShadow: '0 0 4px rgba(74,222,128,0.6)' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1.5 py-1" style={{ ...previewCellText, border: '1px solid #0f3d20', color: '#86efac', fontFamily: 'ui-monospace, monospace' }}>Row 1</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, border: '1px solid #0f3d20', color: '#86efac', fontFamily: 'ui-monospace, monospace' }}>10</td>
        </tr>
      </tbody>
    </table>
  )
}

function HighContrastPreview() {
  return (
    <table className="w-[140px] text-left rounded-xl overflow-hidden" style={{ borderCollapse: 'separate', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.5)' }}>
      <thead>
        <tr>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#8855dd26', borderBottom: '1px solid #8855dd40', fontWeight: 600 }}>Name</th>
          <th className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: '#8855dd26', borderBottom: '1px solid #8855dd40', fontWeight: 600 }}>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: 'rgba(255,255,255,0.55)' }}>Row 1</td>
          <td className="px-1.5 py-1" style={{ ...previewCellText, backgroundColor: 'rgba(255,255,255,0.55)' }}>10</td>
        </tr>
      </tbody>
    </table>
  )
}

const uiTypeOptions: { value: TableUiType; label: string; Preview: React.ComponentType }[] = [
  { value: 'classicBordered', label: 'classicBordered', Preview: ClassicBorderedPreview },
  { value: 'striped', label: 'striped', Preview: StripedPreview },
  { value: 'minimalBorderless', label: 'minimalBorderless', Preview: MinimalBorderlessPreview },
  { value: 'darkHeader', label: 'darkHeader', Preview: DarkHeaderPreview },
  { value: 'cardRows', label: 'cardRows', Preview: CardRowsPreview },
  { value: 'compact', label: 'compact', Preview: CompactPreview },
  { value: 'roundedSoft', label: 'roundedSoft', Preview: RoundedSoftPreview },
  { value: 'highContrast', label: 'highContrast', Preview: HighContrastPreview },
]

function TablePanel() {
  const canvas = useEditor()
  const { t } = useTranslation('propertyPanel')

  const uiTypeSelectorOptions = uiTypeOptions.map((option) => ({
    ...option,
    label: t(`tablePanel.uiType.${option.value}`),
  }))

  if(canvas.focusedNode?.contentType === 'table' || canvas.focusedNode?.contentType === 'tableEnterprise')
  return (
    <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

      {/* <SectionContainer hintKey="styleGroup" label='Style'>
        <PanelRowContainer hintKey="borderColor" label='Border color'>
          <ColorPicker 
            value={canvas.textEditorObj?.getAttributes('textStyle').color || '#000000'}
            onChangeComplete={v => {
              canvas.textEditorObj?.chain().focus().setColor(v).run()
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer hintKey="backgroundColor" label='Header Cell Background'>
          <ColorPicker 
            value={canvas.textEditorObj?.getAttributes('textStyle').color || '#000000'}
            onChange={v => {
              canvas.textEditorObj?.chain().focus().setColor(v).run()
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer hintKey="backgroundColor" label='Body Cell Background'>
          <ColorPicker 
            value={canvas.textEditorObj?.getAttributes('textStyle').color || '#000000'}
            onChangeComplete={v => {
              canvas.textEditorObj?.chain().focus().setColor(v).run()
            }}
          />
        </PanelRowContainer>
      </SectionContainer> */}
      <SectionContainer label={t('tablePanel.addActions')}>
        <div className='flex flex-col'>
          <ActionList
          onClick={() => {
            canvas.textEditorObj?.chain().focus().addRowBefore().run()
          }}
          >
            <AiOutlinePlus size={16}/>
            {t('tablePanel.addRowAbove')}
          </ActionList>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().addRowAfter().run()
            }}
          >
            <AiOutlinePlus size={16}/>
            {t('tablePanel.addRowBelow')}
          </ActionList>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().addColumnBefore().run()
            }}
          >
            <AiOutlinePlus size={16}/>
            {t('tablePanel.addColumnLeft')}
          </ActionList>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().addColumnAfter().run()
            }}
          >
            <AiOutlinePlus size={16}/>
            {t('tablePanel.addColumnRight')}
          </ActionList>
        </div>
      </SectionContainer>

      <SectionContainer label={t('tablePanel.deleteActions')}>
        <div className='flex flex-col'>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().deleteRow().run()
            }}
          >
            <PiTrash size={17} />
            {t('tablePanel.deleteRow')}
          </ActionList>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().deleteColumn().run()
            }}
          >
            <PiTrash size={17} />
            {t('tablePanel.deleteColumn')}
          </ActionList>
        </div>
      </SectionContainer>

      <SectionContainer label={t('tablePanel.cellActions')}>
        <div className='flex flex-col'>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().mergeCells().run()
            }}
          >
            <AiOutlineMergeCells size={17} />
            {t('tablePanel.mergeCell')}
          </ActionList>
          <ActionList
            onClick={() => {
              canvas.textEditorObj?.chain().focus().splitCell().run()
            }}
          >
            <AiOutlineSplitCells size={17} />
            {t('tablePanel.splitCell')}
          </ActionList>
        </div>
      </SectionContainer>

      {/* <SectionContainer hintKey="typographyGroup" label='Typography'>
        <PanelRowContainer hintKey="typographyGroup" label='Font'>
          <Select
            id='panel-font'
            aria-label='Text Font'
            size='sm'
            placeholder=''
            className='col-span-2'
            items={fonts}
            selectedKey={fonts.map(font => font.value).find(font => canvas.textEditorObj?.isActive('textStyle', {fontFamily: font})) ?? 'Arial, sans-serif'}
            onSelectionChange={v => {
              canvas.textEditorObj?.chain().focus().setFontFamily(v as string).run()
            }}
          >
            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
          </Select>
        </PanelRowContainer>

        <PanelRowContainer hintKey="fontSize" label='Font Size'>
          <NumberField id='columns-number'
            aria-label='Columns number'
            minValue={0}
            className={'col-span-2'}
            value={CSSUtils.extractEmValue(canvas.textEditorObj?.getAttributes('textStyle').fontSize) || 16}
            onChange={v => {
              // console.log(v)
              canvas.textEditorObj?.chain().focus().setFontSize(`${CSSUtils.pxToEm(v)}em`).run()
            }}
          >
            <NumberFieldInput size="sm" hideStepper />
          </NumberField>
        </PanelRowContainer>

        <PanelRowContainer hintKey="typographyGroup" label='Text Style'>
          <ToggleGroup type='multiple' size="sm" className='col-span-2'
            value={['bold', 'italic', 'underline', 'bulletList'].filter(style => canvas.textEditorObj?.isActive(style))}
            onValueChange={v => {
              if(!canvas.textEditorObj) return;

              canvas.updateNode((node) => {
                let tempNode: ContentNode = {
                  ...node,
                  children: JSON.stringify(canvas.textEditorObj?.getJSON())
                } as ContentNode

                return tempNode
              }, canvas.focused?.path)
            }}
          >
            <ToggleGroupItem value='bold' aria-label='Bold' title='Bold'
              onClick={() => canvas.textEditorObj?.chain().focus().toggleBold().run()}
            >
              <LuBold />
            </ToggleGroupItem>
            <ToggleGroupItem value='italic' aria-label='Italic' title='Italic'
              onClick={() => canvas.textEditorObj?.chain().focus().toggleItalic().run()}
            >
              <LuItalic />
            </ToggleGroupItem>
            <ToggleGroupItem value='underline' aria-label='Underline' title='Underline'
              onClick={() => canvas.textEditorObj?.chain().focus().toggleUnderline().run()}
            >
              <PiTextUnderlineBold />
            </ToggleGroupItem>
            <ToggleGroupItem value='bulletList' aria-label='Bullet list' title='Bullet list'
              onClick={() => canvas.textEditorObj?.chain().focus().toggleBulletList().run()}
            >
              <PiListBullets />
            </ToggleGroupItem>
          </ToggleGroup>
        </PanelRowContainer>
        <PanelRowContainer hintKey="alignX" label='Align'>
          <ToggleGroup type='single' size="sm" className='col-span-2'
            value={['left', 'center', 'right', 'justify'].find(align => canvas.textEditorObj?.isActive({textAlign: align})) || 'left'}
          >
            <ToggleGroupItem value='left' aria-label='Align left' title='Align left' onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('left').run()}>
              <RiAlignLeft />
            </ToggleGroupItem>
            <ToggleGroupItem value='center' aria-label='Align center' title='Align center' onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('center').run()}>
              <RiAlignCenter />
            </ToggleGroupItem>
            <ToggleGroupItem value='right' aria-label='Align right' title='Align right' onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('right').run()}>
              <RiAlignRight />
            </ToggleGroupItem>
            <ToggleGroupItem value='justify' aria-label='Justify' title='Justify' onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('justify').run()}>
              <RiAlignJustify />
            </ToggleGroupItem>
          </ToggleGroup>
        </PanelRowContainer>

        <PanelRowContainer hintKey="colorPair" label='Color'>
          <ColorPicker 
            value={canvas.textEditorObj?.getAttributes('textStyle').color || '#000000'}
            onChangeComplete={v => {
              canvas.textEditorObj?.chain().focus().setColor(v).run()
            }}
          />
        </PanelRowContainer>
      </SectionContainer> */}

      <Typography/>

      <SectionContainer label={t('tablePanel.uiType.label')}>
        <UiTypeSelector
          options={uiTypeSelectorOptions}
          value={canvas.focusedNode?.uiType || 'classicBordered'}
          onChange={(v) => canvas.updateNode((prevNode) => {
            const prev = prevNode as TableNode
            const uiType = (v as TableUiType) || 'classicBordered'
            // Repaint colors to match this variant's own preview.
            const { tableHeadStyle, tableBodyStyle } = restyleTableColors(uiType)
            return {
              ...prev,
              uiType,
              tableHeadStyle: { ...prev.tableHeadStyle, ...tableHeadStyle },
              tableBodyStyle: { ...prev.tableBodyStyle, ...tableBodyStyle },
            }
          })}
        />
      </SectionContainer>

      <SectionContainer hintKey="styleGroup" label={t('tablePanel.headerStyle')}>
        <PanelRowContainer layoutType='col' hintKey="backgroundColor" label={t('tablePanel.backgroundColor')}>
          <ColorPicker 
            value={canvas.focusedNode?.tableHeadStyle?.backgroundColor}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableHeadStyle: {
                    ...node.tableHeadStyle,
                    backgroundColor: v
                  }
                }
              })
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer layoutType='col' hintKey="borderColor" label={t('tablePanel.borderColor')}>
          <ColorPicker 
            value={canvas.focusedNode?.tableHeadStyle?.borderColor || '#888888'}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableHeadStyle: {
                    ...node.tableHeadStyle,
                    borderColor: v
                  }
                }
              })
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer layoutType='col' hintKey="padding" label={t('tablePanel.padding')} htmlFor='layout-padding'>
          <NumberField id='layout-padding'
            aria-label={t('tablePanel.padding')}
            className='col-span-2'
            minValue={0}
            value={CSSUtils.extractEmValue(canvas.focusedNode?.tableHeadStyle?.padding) || 0}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableHeadStyle: {
                    ...node.tableHeadStyle,
                    padding: CSSUtils.setEmValue(v)
                  }
                }
              })

            }}
            formatOptions={{

            }}
          >
            <NumberFieldInput size="sm" />
          </NumberField>
        </PanelRowContainer>
      </SectionContainer >

      <SectionContainer hintKey="styleGroup" label={t('tablePanel.bodyStyle')}>
        <PanelRowContainer layoutType='col' hintKey="backgroundColor" label={t('tablePanel.backgroundColor')}>
          <ColorPicker 
            value={canvas.focusedNode?.tableBodyStyle?.backgroundColor}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableBodyStyle: {
                    ...node.tableBodyStyle,
                    backgroundColor: v
                  }
                }
              })
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer layoutType='col' hintKey="borderColor" label={t('tablePanel.borderColor')}>
          <ColorPicker 
            value={canvas.focusedNode?.tableBodyStyle?.borderColor || '#888888'}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableBodyStyle: {
                    ...node.tableBodyStyle,
                    borderColor: v
                  }
                }
              })
            }}
          />
        </PanelRowContainer>

        <PanelRowContainer layoutType='col' hintKey="padding" label={t('tablePanel.padding')} htmlFor='layout-padding'>
          <NumberField id='layout-padding'
            aria-label={t('tablePanel.padding')}
            className='col-span-2'
            minValue={0}
            value={CSSUtils.extractEmValue(canvas.focusedNode?.tableBodyStyle?.padding) || 0}
            onChange={v => {
              canvas.updateNode(node => {
                return {
                  ...node,
                  tableBodyStyle: {
                    ...node.tableBodyStyle,
                    padding: CSSUtils.setEmValue(v)
                  }
                }
              })

            }}
            formatOptions={{

            }}
          >
            <NumberFieldInput size="sm" />
          </NumberField>
        </PanelRowContainer>
      </SectionContainer >

      <Attributes />

    </div>
  )
}

export default withSizeGridTab(TablePanel)