import {ToggleGroup, ToggleGroupItem} from '@/components/inputs/ToggleGroup';
import Attributes from '@/components/PropertyPanelUI/Sections/Attributes';
import withSizeGridTab from './withSizeGridTab';
import {PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'
import NumAndTextField from '@/components/ui/button/NumberAndTextField';
import {useEditor} from '@/context/EditorContext';
import {AccordionNode} from '@/types/node.type';

import { withTextContent } from '@/utils/nodeBuilders';
import CSSUtils from '@/utils/CSS.utils';
import {TextInput} from '@/components/ui/primitives/text-input';
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
// import ColorPicker from '@/components/ui/ColorPicker';
import  { useMemo} from 'react'
import {LuBold, LuItalic} from 'react-icons/lu';
import {PiTextUnderlineBold} from 'react-icons/pi';
import { BorderController } from '../Sections/relatedComponents/Controllers';
import BackgroundPicker from '@/components/ui/BackgroundPicker';
import { isValidUrl } from '@/utils/isValidUrl';
import { useTranslation } from 'react-i18next';
import ColorPicker from '@/components/ui/ColorPicker';

function AccordionPanel () {
  const canvas = useEditor()
  const { t } = useTranslation('propertyPanel')
  // useEffect(() => {
  // //console.log(canvas.focusedNode)
  // },[canvas.focusedNode])
  const node = canvas?.focusedNode as AccordionNode
  // const {height, minHeight, maxHeight, width, minWidth, maxWidth} = node?.style || {}

    const headerTextStyleValues = useMemo(() => {
      if(!node || !node.style) return []
      return ['bold', 'italic', 'underline', 'bulletList'].filter(style => {
        if(style === 'bold') return node.style.fontWeight === 'bold';
        if(style === 'italic') return node.style.fontStyle === 'italic';
        if(style === 'underline') return node.style.textDecoration?.toString()?.includes('underline');
        return false;
      })
    }, [node])
    
    const contentTextStyleValues = useMemo(() => {
      if(!node || !node.contentStyle) return []
      return ['bold', 'italic', 'underline', 'bulletList'].filter(style => {
        if(style === 'bold') return node.contentStyle.fontWeight === 'bold';
        if(style === 'italic') return node.contentStyle.fontStyle === 'italic';
        if(style === 'underline') return node.contentStyle.textDecoration?.toString()?.includes('underline');
        return false;
      })
    }, [node])
    
  if(node)
    return (
      <div className=' w-fullh-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  overflow-auto '>
        <SectionContainer >
          <PanelRowContainer className=" w-[90%] " layoutType="col" label={t('accordionPanel.header')}>
            <TextInput
              size='sm'
              className='col-span-3'
              value={node.header as string}
              onChange={v => {
                canvas.updateNode(prev => {
                  const acc = prev as AccordionNode
                  const text = v.target.value
                  // Keep the flat field in step; it's the legacy fallback.
                  if (!acc.headerIsNode || !acc.children?.length) return { ...acc, header: text }
                  return {
                    ...acc,
                    header: text,
                    children: [withTextContent(acc.children[0], text), ...acc.children.slice(1)],
                  }
                })
              }}
            />
          </PanelRowContainer>
          {/* <PanelRowContainer label='Content'>
            <TextArea
              className='col-span-3'
              value={node.content as string}
              onChange={v => {
                canvas.updateNode(node => {
                  return {
                    ...node,
                    content: v.target.value
                  }
                })
              }}
            />
          </PanelRowContainer> */}
        </SectionContainer>
        <SectionContainer hintKey="styleGroup" label={t('accordionPanel.style')}>
         <PanelRowContainer layoutType="col"
							hintKey="backgroundColor" label={t('accordionPanel.background')}>
							<BackgroundPicker
								value={node.style.backgroundColor || ""}
								onChange={(v) => {
									canvas.updateNodeStyle(isValidUrl(v) ? {
										backgroundImage: `url("${v}")`
									} : {
										backgroundColor: v
									})
								}}
							/>
						</PanelRowContainer>

         <BorderController />

         

           <SectionContainer direction='row' hintKey="padding" label={t('accordionPanel.padding')} >
                        <PanelRowContainer className='w-[40%]' layoutType='col' label=' ' multiField htmlFor=''>
          
                          <NumAndTextField isNumber={true} props={{
          
                            id: 'Padding-X-L',
                            "aria-label": 'Padding-left',
                            minValue: 0,
                            className: ' min-w-[200px] ',
                            value: String(CSSUtils.extractEmValue(node.style.paddingLeft) || 0),
                            onChange: (v: number | string) => {
                              canvas?.updateNodeStyle({
                                paddingLeft: CSSUtils.setEmValue(Number(v)),
          
                              })
                            }
                          }}
                          >
                            <PanelRowContainer layoutType='col' className=' w-full flex justify-between gap-2 items-start ' hintKey="paddingLeft" label={t('accordionPanel.left')} >
          
                              <NumberFieldInput hideStepper size="sm" />
          
                            </PanelRowContainer>
          
                          </NumAndTextField>
          
                          <NumAndTextField isNumber={true} props={{
                            id: 'Padding-X-R',
                            "aria-label": 'Padding-right',
                            minValue: 0,
                            className: ' min-w-[200px] ',
                            value: String(CSSUtils.extractEmValue(node.style.paddingRight) || 0),
                            onChange: (v: number | string) => {
                              canvas?.updateNodeStyle({
                                paddingRight: CSSUtils.setEmValue(Number(v)),
          
                              })
                            }
                          }}
                          >
                            <PanelRowContainer layoutType='col' className=' flex justify-between gap-2 items-start ' hintKey="paddingRight" label={t('accordionPanel.right')} >
          
                              <NumberFieldInput hideStepper size="sm" />
          
                            </PanelRowContainer>
          
                          </NumAndTextField>
          
          
          
          
                        </PanelRowContainer>
                        <PanelRowContainer className=' w-[40%] ' layoutType='col' label='' multiField htmlFor='Padding-Y'>
          
                          <NumAndTextField isNumber={true} props={{
                            id: 'Padding-Y-T',
                            "aria-label": 'Padding-Top',
                            minValue: 0,
                            className: ' min-w-[100px] ',
                            value: String(CSSUtils.extractEmValue(node.style.paddingTop) || 0),
                            onChange: (v: number | string) => {
                              canvas?.updateNodeStyle({
          
                                paddingTop: CSSUtils.setEmValue(Number(v)),
                              })
                            }
                          }}
                          >
                            <PanelRowContainer layoutType='col' className=' flex justify-between gap-2 items-start ' hintKey="paddingTop" label={t('accordionPanel.top')} >
          
                              <NumberFieldInput hideStepper size="sm" />
          
                            </PanelRowContainer>
          
                          </NumAndTextField>
          
          
                          <NumAndTextField isNumber={true} props={{
                            id: 'Padding-Y-B',
                            "aria-label": 'Padding-Bottom',
                            minValue: 0,
                            className: ' min-w-[100px] ',
                            value: String(CSSUtils.extractEmValue(node.style.paddingBottom) || 0),
                            onChange: (v: number | string) => {
                              canvas?.updateNodeStyle({
          
                                paddingBottom: CSSUtils.setEmValue(Number(v)),
                              })
                            }
                          }}
                          >
                            <PanelRowContainer layoutType='col' className=' flex justify-between gap-2 items-start ' hintKey="paddingBottom" label={t('accordionPanel.bottom')} >
          
                              <NumberFieldInput hideStepper size="sm" />
          
                            </PanelRowContainer>
          
                          </NumAndTextField>
          
          
          
          
                        </PanelRowContainer>
                      </SectionContainer>

        </SectionContainer>

        <SectionContainer hintKey="typographyGroup" label={t('accordionPanel.headerTypography')}>
          <PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="fontSize" label={t('accordionPanel.fontSize')}>
            <NumberField id='columns-number'
              aria-label={t('accordionPanel.columnsNumber')}
              minValue={0}
              className={'col-span-2'}
              value={CSSUtils.extractEmValue(node.style.fontSize) || 15}
              onChange={v => canvas.updateNodeStyle({fontSize: CSSUtils.setEmValue(v)})}
            >
              <NumberFieldInput size="sm" />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="typographyGroup" label={t('accordionPanel.textStyle')}>
            <ToggleGroup type='multiple' size="sm" className='col-span-2'
              value={headerTextStyleValues}
              onValueChange={v => {

              }}
            >
              <ToggleGroupItem value='bold' aria-label={t('accordionPanel.bold')} title={t('accordionPanel.bold')} onClick={(e) => {
                canvas.updateNodeStyle({fontWeight: headerTextStyleValues.includes('bold') ? 'normal' : 'bold'})
              }}
              >
                <LuBold />
              </ToggleGroupItem>
              <ToggleGroupItem value='italic' aria-label={t('accordionPanel.italic')} title={t('accordionPanel.italic')}
                onClick={() => {
                  canvas.updateNodeStyle({fontStyle: headerTextStyleValues.includes('italic') ? 'normal' : 'italic'})
                }}
              >
                <LuItalic />
              </ToggleGroupItem>
              <ToggleGroupItem value='underline' aria-label={t('accordionPanel.underline')} title={t('accordionPanel.underline')}
                onClick={() => {
                  canvas.updateNodeStyle({textDecoration: headerTextStyleValues.includes('underline') ? 'none' : 'underline'})
                }}
              >
                <PiTextUnderlineBold />
              </ToggleGroupItem>
            </ToggleGroup>
          </PanelRowContainer>

          <PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="colorPair" label={t('accordionPanel.color')}>
            <ColorPicker 
              value={node.style.color || '#000000'}
              onChange={v => {
                canvas.updateNodeStyle({color: v})
              }}
            />
          </PanelRowContainer>
        </SectionContainer>

        <Attributes />
      </div>
    )
}

export default withSizeGridTab(AccordionPanel)