import { ToggleGroup, ToggleGroupItem } from '@/components/inputs/ToggleGroup'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { fonts, text_type } from '@/consts/propertyField.consts'
import { useEditor } from '@/context/EditorContext'
import CSSUtils from '@/utils/CSS.utils'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from '@/components/ui/Select'
import { LuBold, LuItalic } from "react-icons/lu";
import { PiList, PiListBullets, PiListNumbers, PiTextSubscriptBold, PiTextSuperscriptBold, PiTextUnderlineBold } from "react-icons/pi";
import { RiAlignCenter, RiAlignJustify, RiAlignLeft, RiAlignRight } from "react-icons/ri";
import { ContentNode } from '@/types/node.type'
import { SketchPicker } from 'react-color'
import { rgbaToHexa } from '@uiw/color-convert'
import { useRef } from 'react'
import { useEditorState } from '@tiptap/react'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { useTranslation } from 'react-i18next'

function Typography() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const indicatorRef = useRef(null)


  const onChangeHandler = (v: string) => {
    canvas.textEditorObj?.chain().focus().setColor(v).run()
  }

  // The text editor changes without React knowing (a click in the text, a toolbar action), so the panel
  // subscribes to it: every control below shows what the selection has right now.
  const active = useEditorState({
    editor: canvas.textEditorObj ?? null,
    selector: ({ editor }) => {
      if (!editor) return null
      const textStyle = editor.getAttributes('textStyle')
      return {
        marks: ['bold', 'italic', 'underline', 'orderedList', 'bulletList', 'superscript', 'subscript'].filter((name) => editor.isActive(name)),
        align: ['left', 'center', 'right', 'justify'].find((align) => editor.isActive({ textAlign: align })) ?? 'left',
        fontFamily: textStyle.fontFamily as string | undefined,
        fontSize: textStyle.fontSize as string | undefined,
        lineHeight: textStyle.lineHeight as string | undefined,
        color: textStyle.color as string | undefined,
        highlight: editor.getAttributes('highlight').color as string | undefined,
        headingLevel: editor.getAttributes('heading').level as number | undefined,
      }
    },
  })

  return (
    <SectionContainer hintKey="typographyGroup" label={t('typography.typography')}>
      <PanelRowContainer layoutType='col' hintKey="typographyGroup" label={t('typography.font')}>
        <Select
          id='panel-font'
          aria-label={t('typography.textFont')}
          size='sm'
          placeholder=''
          className='col-span-2'
          items={fonts}
          selectedKey={fonts.map(font => font.value).find(font => font === active?.fontFamily) ?? 'Arial, sans-serif'}
          onSelectionChange={v => {
            canvas.textEditorObj?.chain().focus().setFontFamily(v as string).run()
          }}
        >
          {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
        </Select>
      </PanelRowContainer>

      <PanelRowContainer layoutType='col' label={t('typography.type')}>
        <Select
          id='panel-text-type'
          aria-label={t('typography.textType')}
          size='sm'
          placeholder=''
          className='col-span-2'
          items={text_type}
          selectedKey={active?.headingLevel || 'paragraph'}
          onSelectionChange={v => {
            if (v === 'paragraph') {
              canvas.textEditorObj?.chain().focus().setParagraph().run()
            } else {
              canvas.textEditorObj?.chain().focus().setHeading({ level: v  }).run()
              canvas.textEditorObj?.chain().focus().setFontSize(CSSUtils.pxToEm(text_type.find(text => text.value == v)?.fontSize || 16) + 'em').run()
            }
          }}
        >
          {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
        </Select>
      </PanelRowContainer>

      <PanelRowContainer layoutType='col' hintKey="fontSize" label={t('typography.fontSize')}>
        <NumberField id='columns-number'
          aria-label={t('typography.columnsNumber')}
          minValue={0}
          className={'col-span-2'}
          value={CSSUtils.extractEmValue(active?.fontSize) || 16}
          onChange={v => {
            // console.log(v)
            canvas.textEditorObj?.chain().focus().setFontSize(`${CSSUtils.pxToEm(v)}em`).run()
          }}
        >
          <NumberFieldInput size="sm" hideStepper />
        </NumberField>
      </PanelRowContainer>
      <PanelRowContainer layoutType='col' hintKey="lineHeight" label={t('typography.lineHeight')}>
        <Select
          id='panel-font'
          aria-label={t('typography.textFont')}
          size='sm'
          placeholder=''
          className='col-span-2'
          items={[
            {
              label: '1.1',
              value: '1.1'

            },
            {
              label: '1.5',
              value: '1.5'

            },
            {
              label: '2.0',
              value: '2'

            },
            {
              label: '4.0',
              value: '4'

            }
          ]}
          selectedKey={active?.lineHeight || '1.1'}
          onSelectionChange={v => {

            //  canvas.textEditorObj?.chain().focus().toggleTextStyle({
            //   lineHeight:v as string
            //  })
            canvas.textEditorObj?.commands.setLineHeight(v as string)


          }}
        >
          {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
        </Select>
      </PanelRowContainer>

      <PanelRowContainer layoutType='col' hintKey="textStyle" label={t('typography.textStyle')}>
        <ToggleGroup type='multiple' size="sm" className='col-span-2'
          value={(active?.marks ?? []).filter(style => ['bold', 'italic', 'underline', 'orderedList', 'bulletList'].includes(style))}
          onValueChange={v => {
            if (!canvas.textEditorObj) return;

            const isTableNode = canvas.focusedNode?.contentType === 'table' || canvas.focusedNode?.contentType === 'tableEnterprise'

            canvas.updateNode((node) => {
              let tempNode: ContentNode = {
                ...node,
                children: isTableNode
                  ? canvas.textEditorObj?.getJSON()
                  : JSON.stringify(canvas.textEditorObj?.getJSON())
              } as ContentNode

              return tempNode
            }, canvas.focused?.path)
          }}
        >
          <ToggleGroupItem value='bold' aria-label={t('typography.bold')} title={t('typography.bold')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleBold().run()}
          >
            <LuBold />
          </ToggleGroupItem>
          <ToggleGroupItem value='italic' aria-label={t('typography.italic')} title={t('typography.italic')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleItalic().run()}
          >
            <LuItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value='underline' aria-label={t('typography.underline')} title={t('typography.underline')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleUnderline().run()}
          >
            <PiTextUnderlineBold />
          </ToggleGroupItem>
          <ToggleGroupItem value='bulletList' aria-label={t('typography.bulletList')} title={t('typography.bulletList')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleBulletList().run()}
          >
            <PiListBullets />
          </ToggleGroupItem>
          <ToggleGroupItem value='orderedList' aria-label={t('typography.numberedList')} title={t('typography.numberedList')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleOrderedList().run()}
          >
            <PiListNumbers />
          </ToggleGroupItem>
        </ToggleGroup>
      </PanelRowContainer>
      <PanelRowContainer layoutType='col' hintKey="textAlign" label={t('typography.align')}>
        <ToggleGroup type='single' size="sm" className='col-span-2'
          value={active?.align ?? 'left'}
        >
          <ToggleGroupItem value='left' aria-label={t('typography.alignLeft')} title={t('typography.alignLeft')} onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('left').run()}>
            <RiAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value='center' aria-label={t('typography.alignCenter')} title={t('typography.alignCenter')} onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('center').run()}>
            <RiAlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value='right' aria-label={t('typography.alignRight')} title={t('typography.alignRight')} onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('right').run()}>
            <RiAlignRight />
          </ToggleGroupItem>
          <ToggleGroupItem value='justify' aria-label={t('typography.justify')} title={t('typography.justify')} onClick={() => canvas.textEditorObj?.chain().focus().setTextAlign('justify').run()}>
            <RiAlignJustify />
          </ToggleGroupItem>
        </ToggleGroup>
      </PanelRowContainer>
      <PanelRowContainer layoutType='col' hintKey="script" label={t('typography.script')}>
        <ToggleGroup type='multiple' size="sm" className='col-span-2'
          value={(active?.marks ?? []).filter(format => ['superscript', 'subscript'].includes(format))}
        >
          <ToggleGroupItem value='superscript'
            aria-label={t('typography.toggleSuperscript')}
            title={t('typography.superscript')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleSuperscript().run()}
          >
            <PiTextSuperscriptBold />
          </ToggleGroupItem>
          <ToggleGroupItem value='subscript'
            aria-label={t('typography.toggleSubscript')}
            title={t('typography.subscript')}
            onClick={() => canvas.textEditorObj?.chain().focus().toggleSubscript().run()}
          >
            <PiTextSubscriptBold />
          </ToggleGroupItem>
        </ToggleGroup>
      </PanelRowContainer>

      <PanelRowContainer layoutType='col' hintKey="colorPair" label={t('typography.color')}>

        <BackgroundPicker value={active?.color || '#000000'} onChange={(v) => {
          canvas.textEditorObj?.chain().focus().setColor(v).run()
        }} />


      </PanelRowContainer>
      <PanelRowContainer layoutType='col' label={t('typography.highlight')}>
        <BackgroundPicker value={active?.highlight || '#000000'}
          onChange={(v) => {
          canvas.textEditorObj?.chain().focus().toggleHighlight({ color: v }).run()
          }} />
      </PanelRowContainer>
    </SectionContainer>
  )
}

export default Typography