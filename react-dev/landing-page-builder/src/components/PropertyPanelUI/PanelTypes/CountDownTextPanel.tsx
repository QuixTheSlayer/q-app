import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CountDownTextNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Select, SelectOption } from '@/components/ui/Select'
import React, { type CSSProperties } from 'react'
import AnimationSection from '../Sections/AnimationSection'
import StyleSection from '../Sections/StyleSection'
import CSSUtils from '@/utils/CSS.utils'
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker'
import { fonts } from '@/consts/propertyField.consts'
import SizeSection from '../Sections/SizeSection'
import withSizeGridTab from './withSizeGridTab'
import { useTranslation } from 'react-i18next'
function CountDownTextPanel() {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()

    const node = canvas.focusedNode as CountDownTextNode


    const countDownType = [
        {
            label: t('countDownTextPanel.day'),
            value: 'day'
        },
        {
            label: t('countDownTextPanel.hour'),
            value: 'hour'
        },
        {
            label: t('countDownTextPanel.minute'),
            value: 'minute'
        },

        {
            label: t('countDownTextPanel.second'),
            value: 'second'
        },
    ]

    if (canvas.focusedNode)
        return (
            <div className=' h-[85vh] max-h-[90vh] overflow-y-auto no-scrollbar  ' >
                <SectionContainer label={t('countDownTextPanel.type')}>
                    <Select

                        id="size-height-format"
                        aria-label={t('countDownTextPanel.heightFormat')}
                        size="sm"
                        placement="top start"
                        placeholder=""
                        className="col-span-1"
                        items={countDownType}
                        selectedKey={node.countDownType}
                        onSelectionChange={(v) => {

                            canvas.updateNode((prevNode) => ({
                                ...prevNode,
                                countDownType: v as "day" | "month" | "year" | "hour" | "second" | "minute"
                            }))

                        }}
                    >
                        {(item) => (
                            <SelectOption id={item.value}>{item.label}</SelectOption>
                        )}
                    </Select>

                </SectionContainer>

                <SectionContainer hintKey="typographyGroup" label={t('countDownTextPanel.typography')} >

                     <PanelRowContainer className=' px-0 py-0 ' layoutType='col' hintKey="typographyGroup" label={t('countDownTextPanel.font')}>
                            <Select
                              id='panel-font'
                              aria-label={t('countDownTextPanel.textFont')}
                              size='sm'
                              placeholder=''
                              className='col-span-2'
                              items={fonts}
                              selectedKey={fonts.map(font => font.value).find(font => (node.style.fontFamily) === font ) ?? 'Arial, sans-serif'}
                              onSelectionChange={v => {
                                canvas?.updateNodeStyle({
                                    fontFamily:v as unknown as CSSProperties['fontFamily'] ,
                                });
                              }}
                            >
                              {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                            </Select>
                          </PanelRowContainer>

                    <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="fontSize" label={t('countDownTextPanel.fontSize')} >
                        <NumberField
                            id="font-size"
                            aria-label={t('countDownTextPanel.fontSizeAria')}
                            // className="min-w-[50%]"
                            minValue={0}
                            // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
                            value={CSSUtils.extractEmValue(node.style.fontSize) || 16}
                            onChange={(v) => {
                                canvas?.updateNodeStyle({
                                    fontSize: CSSUtils.setEmValue(v),
                                });
                            }}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField>
                    </PanelRowContainer>

                    <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="fontWeight" label={t('countDownTextPanel.fontWeight')} >
                        <NumberField
                            id="font-width"
                            aria-label={t('countDownTextPanel.fontWidthAria')}
                            // className="min-w-[50%]"
                            minValue={400}
                            // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
                            value={Number(node.style.fontWeight) || 400}
                            onChange={(v) => {
                                canvas?.updateNodeStyle({
                                    fontWeight: `${v as unknown as CSSProperties['fontWeight']}`,
                                });
                            }}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField>
                    </PanelRowContainer>

                    <PanelRowContainer className=' my-2 gap-2 px-0 w-[90%]  ' layoutType='col' hintKey="textColor" label={t('countDownTextPanel.textColor')}>
                        <ColorPicker

                            value={node.style.color}

                            onChange={v => {
                                canvas.updateNodeStyle({
                                    color: v
                                })
                            }}
                        />
                    </PanelRowContainer >

                </SectionContainer>


                {/* <AnimationSection /> */}

                <StyleSection />
            </div>


        )
}

export default withSizeGridTab(CountDownTextPanel, SizeSection)