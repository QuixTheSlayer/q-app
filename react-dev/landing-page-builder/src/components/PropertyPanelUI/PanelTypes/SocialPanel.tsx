import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CountDownTextNode, SocialNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Select, SelectOption } from '@/components/ui/Select'
import React, { type CSSProperties } from 'react'
import AnimationSection from '../Sections/AnimationSection'
import StyleSection from '../Sections/StyleSection'
import withSizeGridTab from './withSizeGridTab'
import CSSUtils from '@/utils/CSS.utils'
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker'
import { fonts } from '@/consts/propertyField.consts'
import { useTranslation } from 'react-i18next'
function SocialPanel() {
    const canvas = useEditor()
    const { t } = useTranslation('propertyPanel')

    const node = canvas.focusedNode as SocialNode


    const socialType = [
        {
            label: t('socialPanel.facebook'),
            value: 'facebook'
        },
        {
            label: t('socialPanel.linkedin'),
            value: 'linkedin'
        },
        {
            label: t('socialPanel.telegram'),
            value: 'telegram'
        },

        {
            label: t('socialPanel.x'),
            value: 'x'
        },
        {
            label: t('socialPanel.instagram'),
            value: 'instagram'
        },
        {
            label: t('socialPanel.github'),
            value: 'github'
        },
        {
            label: t('socialPanel.youtube'),
            value: 'youtube'
        },
        {
            label: t('socialPanel.mail'),
            value: 'mail'
        },
        {
            label: t('socialPanel.web'),
            value: 'web'
        },
    ]

    if (canvas.focusedNode)
        return (
            <div className=' h-[85vh] max-h-[90vh] overflow-y-auto no-scrollbar  ' >
                <SectionContainer label={t('socialPanel.type')}>
                    <Select

                        id="size-height-format"
                        aria-label={t('socialPanel.heightFormat')}
                        size="sm"
                        placement="top start"
                        placeholder=""
                        className="col-span-1"
                        items={socialType}
                        selectedKey={node.socialType}
                        onSelectionChange={(v) => {

                            canvas.updateNode((prevNode) => ({
                                ...prevNode,
                                socialType: v as string
                            }))

                        }}
                    >
                        {(item) => (
                            <SelectOption id={item.value}>{item.label}</SelectOption>
                        )}
                    </Select>

                </SectionContainer>


                <PanelRowContainer className=" w-[100%] px-0 " layoutType='col' label={ node.socialType ==='mail'? t('socialPanel.mailAddress'): t('socialPanel.link')}>
                    <TextInput style={{
                        position: "initial"
                    }} className='col-span-2' size="sm"
                        value={(canvas.focusedNode as SocialNode)?.link || ''}
                        onChange={v => {

                            // const clasList: string[] = v.target.value.split(" ")

                            // const positionExist = clasList?.find((value) => positions.includes(value as positionType)) as positionType



                            canvas.updateNode((node) => {
                                return {
                                    ...node as SocialNode,
                                    link: v.target.value as string
                                }
                            })


                        }}
                    />
                </PanelRowContainer>

                   <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="fontSize" label={t('socialPanel.iconSize')} >
                                        <NumberField
                                            id="size"
                                            aria-label={t('socialPanel.size')}
                                            // className="min-w-[50%]"
                                            minValue={0}
                                            // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
                                            value={(node.size)||16 }
                                            onChange={(v) => {
                                                canvas?.updateNode((node)=>({
                                                    ...node,
                                                    size:v as number
                                                }))
                                            }}
                                        >
                                            <NumberFieldInput size="sm" hideStepper />
                                        </NumberField>
                    </PanelRowContainer>

            </div>


        )
}

export default withSizeGridTab(SocialPanel)