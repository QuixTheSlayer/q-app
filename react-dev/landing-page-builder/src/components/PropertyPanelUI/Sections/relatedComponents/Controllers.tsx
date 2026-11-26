import BackgroundPicker from "@/components/ui/BackgroundPicker"
import { useEditor } from "@/context/EditorContext"
import { isValidUrl } from "@/utils/isValidUrl"
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import ColorPicker from '@/components/ui/ColorPicker'
import NumAndTextField from '@/components/ui/button/NumberAndTextField'

import { border_mode, height_mode, item_align } from "@/consts/propertyField.consts";
import { CONTENT_TYPE, LAYOUT, NODE_TYPE } from "@/types/node.enum";
import { LayoutNode } from "@/types/node.type";
import CSSUtils from "@/utils/CSS.utils";
import { flattenNodeTree } from "@/utils/editor.utils";
import { cornersOfRectangle } from "@dnd-kit/core/dist/utilities/algorithms/helpers";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from "@/components/ui/Select";
import { PropertyHint } from "@/components/PropertyPanelUI/hints/PropertyHint";
import { useDimensionField } from "@/components/PropertyPanelUI/Sections/useDimensionField";

export const CSSUtilsForBoxShadow = {
    // Existing functions...

    extractBoxShadowValues: (shadowString: string) => {
        if (!shadowString || shadowString === 'none') {
            return { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033' };
        }

        // Check if it's an inset shadow
        const inset = shadowString.includes('inset');
        let cleanString = shadowString.replace('inset', '').trim();

        // Extract color (supports rgba, hsla, hex)
        const colorMatch = cleanString.match(/((rgba|rgb|hsla|hsl)\([^)]+\)|#[a-fA-F0-9]+)/);
        const color = colorMatch ? colorMatch[0] : '#00000033';

        // Remove color to leave just the numeric measurements
        if (colorMatch) cleanString = cleanString.replace(colorMatch[0], '').trim();

        // Split remaining numbers (e.g., "0px 4px 8px 0px")
        const numbers = cleanString.split(/\s+/).map(val => parseFloat(val) || 0);

        return {
            x: numbers[0] || 0,
            y: numbers[1] || 0,
            blur: numbers[2] || 0,
            spread: numbers[3] || 0,
            color,
        };
    },
    buildBoxShadowString: ({ x, y, blur, spread, color }) => {
        // Converts numbers to 'em' or 'px' depending on your design token standards
        const xStr = `${x}px`;
        const yStr = `${y}px`;
        const blurStr = `${blur}px`;
        const spreadStr = `${spread}px`;

        return `${xStr} ${yStr} ${blurStr} ${spreadStr} ${color}`.trim();
    }
};
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { CSSProperties } from "styled-components"
import { CSS } from "styled-components/dist/types"
import { MinusIcon, PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { usePanelStyle } from '@/hooks/usePanelStyle';

export function BackgroundColorController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {

    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = isEffect ? content?.animation[animationIndex || 0].trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as Record<string, string> : node?.style || {}
   
    const backgroundColor = (style as any)[isEffect ? "background-color" : "backgroundColor"]
    const backgroundImage = (style as any)[isEffect ? "background-image" : "backgroundImage"]
    // console.log(content)

    const isHasValue = backgroundColor?.length > 1 || backgroundImage?.length > 1

    const [isShow, setIsShow] = useState(isHasValue || isEffect)

        const bgUrl = backgroundColor ==='unset'? backgroundImage?.split(`url("`)[1].split(`")`)[0]:''

        console.log( "Bg From Controller",bgUrl)


    return (
        <PanelRowContainer multiField className=" px-2 py-2 rounded  " layoutType="col" hintKey="backgroundColor" label={t('controllers.background')}>
            <div className=" flex h-[30px] justify-between w-[100%] items-center " >
                <label onClick={() => setIsShow(true)} className=" text-sm text-foreground/80 cursor-pointer " htmlFor="">{t('controllers.fill')}</label>
                <div className=" cursor-pointer text-foreground/80 " onClick={() => {
                    setIsShow((prev) => !prev)

                    if (isShow) {
                        if (isEffect) {
                            canvas.updateAnimationStyle({
                                propertyName: "background-color",
                                propertyValue: '',
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })

                        }
                        canvas.updateNodeStyle({
                            backgroundImage: '',

                            backgroundColor: ''
                        })
                    } else {
                        if (isEffect) {
                            canvas.updateAnimationStyle({
                                propertyName: "background-color",
                                propertyValue: '#ffffff',
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })

                        }
                        canvas.updateNodeStyle({
                            backgroundImage: '',

                            backgroundColor: '#ffffff'
                        })
                    }
                }} >
                    {isShow ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                </div>
            </div>
            {isShow &&
                <div className=" w-[90%] " >
                    <BackgroundPicker
                        value={isValidUrl(bgUrl)?bgUrl:backgroundColor}
                        onChange={v => {
                            if (isEffect) {
                                canvas.updateAnimationStyle({
                                    propertyName: isValidUrl(v) ? "background-image" : "background-color",
                                    propertyValue: v,
                                    animationIndex: animationIndex || 0,
                                    triggerIndex: triggerIndex || 0,
                                    effectItemIndex: effectItemIndex || 0
                                })

                            }
                            else {
                                canvas.updateNodeStyle(isValidUrl(v) ? {
                                    backgroundImage: v,
                                    backgroundColor:'unset'
                                } : {
                                    backgroundColor: v,
                                    backgroundImage:'unset'
                                })
                            }

                        }}
                    />
                </div>
            }

        </PanelRowContainer>
    )
}

export function BoxShadowController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {

    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content

    const style = isEffect ? content?.animation[animationIndex || 0].trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSS.PropertiesHyphen : node?.style as React.CSSProperties || {}

    const cssKey = 'box'
    const boxShadow = (style as any)[isEffect ? `${cssKey}-shadow` : `${cssKey}Shadow`]
    // console.log(boxShadow, content?.animation[animationIndex || 0].trigger_effect[triggerIndex || 0])

    const isHasValue = boxShadow?.length > 3


    const [isShow, setIsShow] = useState(isHasValue)

    const [shadowStyle, setShadowStyle] = useState<{
        x: number;
        y: number;
        blur: number;
        spread: number;
        color: string;
    }>({
        x: CSSUtilsForBoxShadow.extractBoxShadowValues(boxShadow || "").x,
        y: CSSUtilsForBoxShadow.extractBoxShadowValues(boxShadow || "").y,
        blur: CSSUtilsForBoxShadow.extractBoxShadowValues(boxShadow || "").blur,
        spread: CSSUtilsForBoxShadow.extractBoxShadowValues(boxShadow || "").spread,
        color: CSSUtilsForBoxShadow.extractBoxShadowValues(boxShadow || "").color,
    })

    const changeShadowStyle = useCallback(async (v: string | number, target: "x" | "y" | "blur" | "spread" | "color") => {

        try {
            setShadowStyle(prev => ({
                ...prev,
                [`${target}`]: (v)

            }))
        } finally { }

    }, [])



    useEffect(() => {

        if (isEffect) {
            canvas.updateAnimationStyle({
                propertyName: `${cssKey}-shadow`,
                propertyValue: isShow ? ` ${shadowStyle.x}px ${shadowStyle.y}px ${shadowStyle.blur}px ${shadowStyle.spread}px ${shadowStyle.color} ` : '',
                animationIndex: animationIndex || 0,
                triggerIndex: triggerIndex || 0,
                effectItemIndex: effectItemIndex || 0
            })


        }
        else {
            canvas?.updateNodeStyle({
                [`${cssKey}Shadow`]: isShow ? `${shadowStyle.x}px ${shadowStyle.y}px ${shadowStyle.blur}px ${shadowStyle.spread}px ${shadowStyle.color} ` : ''
            });
        }
    }, [shadowStyle, isShow])

    console.log(node?.style)



    if (canvas.focusedNode)
        return (
            <SectionContainer className="!border-none" label='' >
                <div className="  flex h-[30px] justify-between w-[95%] bg-muted rounded px-2 items-center " >
                    <label onClick={() => setIsShow(true)} className=" text-sm cursor-pointer " htmlFor="">{t('controllers.boxShadow')}</label>
                    <div className=" cursor-pointer " onClick={() => {
                        setIsShow((prev) => !prev)

                        if (isShow) {

                            canvas.updateNodeStyle({
                                [`${cssKey}Shadow`]: '',


                            })
                        } else {

                            canvas.updateNodeStyle({
                                [`${cssKey}Shadow`]: '3px 3px 3px 3px #d4d4d4',
                            })
                        }
                    }} >
                        {isShow ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                    </div>
                </div>
                {isShow && <PanelRowContainer className="  px-2 py-2" layoutType="col" >
                    <PanelRowContainer className=" p-2 w-[100%] my-1 justify-between " layoutType="row" hintKey="shadowOffset" label={t('controllers.offset')} multiField htmlFor='shadow-offset-x'>
                        <div className=" flex " >
                            {/* Offset X */}
                            <NumberField
                                id="shadow-offset-x"
                                aria-label={t('controllers.shadowOffsetX')}
                                className={' max-w-[100px]  '}
                                value={shadowStyle.x}
                                onChange={async (v: number) => {


                                    await changeShadowStyle(v, "x")

                                }}
                            >
                                <div className='flex w-[100%] justify-start gap-2 items-center'>
                                    <span className="text-xs text-muted-foreground">{t('controllers.x')}</span>
                                    <NumberFieldInput className={' w-[80%] '} hideStepper size="sm" />
                                </div>
                            </NumberField>

                            {/* Offset Y */}
                            <NumberField
                                id="shadow-offset-y"
                                aria-label={t('controllers.shadowOffsetY')}
                                className={' max-w-[100px]  '}
                                value={shadowStyle.y}
                                onChange={async (v: number) => {


                                    await changeShadowStyle(v, "y")

                                }}>
                                <div className='flex w-[100%] justify-start gap-2 items-center'>
                                    <span className="text-xs text-muted-foreground">{t('controllers.y')}</span>
                                    <NumberFieldInput className={' w-[80%] '} hideStepper size="sm" />
                                </div>
                            </NumberField>
                        </div>

                    </PanelRowContainer>

                    <PanelRowContainer className=" p-2 w-[100%] my-1 justify-between " layoutType="row" hintKey="shadowBlur" label={t('controllers.shadowBlur')} multiField htmlFor='shadow-blur'>
                        {/* Blur Radius */}
                        <NumAndTextField isNumber={true} props={{
                            id: 'shadow-blur',
                            "aria-label": t('controllers.shadowBlurAria'),
                            minValue: 0,
                            className: 'col-span-2',
                            value: (shadowStyle.blur),
                            onChange: async (v: number) => {

                                await changeShadowStyle(v, "blur")


                            }
                        }}>
                            <div className='flex justify-between gap-2 items-center'>
                                <NumberFieldInput hideStepper size="sm" />
                            </div>
                        </NumAndTextField>


                    </PanelRowContainer>

                    <PanelRowContainer className=" p-2 w-[100%] my-1 justify-between " layoutType="row" hintKey="shadowSpread" label={t('controllers.shadowSpread')} multiField htmlFor='shadow-blur'>


                        {/* Spread Radius */}
                        <NumAndTextField isNumber={true} props={{
                            id: 'shadow-spread',
                            "aria-label": t('controllers.shadowSpreadAria'),
                            className: 'col-span-2',
                            value: (shadowStyle.spread),
                            onChange: async (v: number) => {

                                await changeShadowStyle(v, "spread")

                            }
                        }}>
                            <div className='flex justify-between gap-2 items-center'>
                                {/* <span className="text-xs text-neutral-400">Spread</span> */}
                                <NumberFieldInput hideStepper size="sm" />
                            </div>
                        </NumAndTextField>
                    </PanelRowContainer>

                    <PanelRowContainer className=" p-2 w-[100%] my-1 justify-between " multiField layoutType="row" hintKey="shadowColor" label={t('controllers.shadowColor')}>
                        <div className=" w-[50%] flex justify-start px-2 " >
                            <ColorPicker


                                value={shadowStyle.color}

                                onChange={async (v) => {
                                    await changeShadowStyle(v, "color")


                                }}
                            />
                        </div>

                    </PanelRowContainer>
                </PanelRowContainer>}

            </SectionContainer>


        )
}

export function SizeController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {

    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = isEffect ? content?.animation[animationIndex || 0].trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSSProperties : node?.style || {}

    const setEffectStyle = (patch: Record<string, unknown>) => {
        Object.entries(patch).forEach(([propertyName, propertyValue]) => {
            canvas.updateAnimationStyle({
                propertyName,
                propertyValue: propertyValue as string | number,
                animationIndex: animationIndex || 0,
                triggerIndex: triggerIndex || 0,
                effectItemIndex: effectItemIndex || 0
            })
        })
    }

    const heightField = useDimensionField("height", { style, nodeId: node?.id, setStyle: setEffectStyle, syncMinHeightOnValueChange: false })
    const widthField = useDimensionField("width", { style, nodeId: node?.id, setStyle: setEffectStyle, syncMinHeightOnValueChange: false })

    if (node)
        return (
            <SectionContainer label={t('sizeSection.size')}>

                <PanelRowContainer className="px-2 py-2" layoutType="col" hintKey="height" label={t('sizeSection.height')} multiField htmlFor="size-height">
                    <div className=" flex w-full justify-start items-center gap-1 my-2 " >
                        <NumberField
                            id="size-height"
                            aria-label={t('sizeSection.height')}
                            minValue={0}
                            className={"col-span-1"}
                            isDisabled={heightField.isValueDisabled}
                            value={heightField.numericValue}
                            onChange={heightField.onValueChange}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField> -
                        <Select
                            id="size-height-format"
                            aria-label={t('sizeSection.heightFormat')}
                            size="sm"
                            placement="bottom end"
                            placeholder=""
                            className="col-span-1"
                            items={height_mode}
                            selectedKey={heightField.mode}
                            onSelectionChange={(v) => heightField.onModeChange(v as string)}
                        >
                            {(item) => (
                                <SelectOption id={item.value}>{item.label}</SelectOption>
                            )}
                        </Select>
                    </div>

                </PanelRowContainer>


                <PanelRowContainer className="px-2 py-2" layoutType="col" hintKey="width" label={t('sizeSection.width')} multiField htmlFor="size-width">
                    <div className=" flex w-full justify-start items-center gap-1 my-2 " >
                        <NumberField
                            id="size-width"
                            aria-label={t('sizeSection.width')}
                            minValue={0}
                            className={"col-span-1"}
                            isDisabled={widthField.isValueDisabled}
                            value={widthField.numericValue}
                            onChange={widthField.onValueChange}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField> -
                        <Select
                            id="size-width-format"
                            aria-label={t('sizeSection.widthFormat')}
                            size="sm"
                            placement="bottom end"
                            placeholder=""
                            className="col-span-1"
                            items={height_mode}
                            selectedKey={widthField.mode}
                            onSelectionChange={(v) => widthField.onModeChange(v as string)}
                        >
                            {(item) => (
                                <SelectOption id={item.value}>{item.label}</SelectOption>
                            )}
                        </Select>
                    </div>


                </PanelRowContainer>



            </SectionContainer>
        )

}


export function RadiusController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = content?.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSS.PropertiesHyphen


    return (
        <PanelRowContainer className=' w-full justify-start items-start ' layoutType='col' hintKey="borderRadius" label={t('borderRadiusController.borderRadius')} htmlFor='Corner-Radius'>
            {/* <PanelRowContainer className=' px-2 py-2 justify-start w-[100%] ' layoutType='col' multiField hintKey="borderRadius" label='Overall '>
                <NumberField id='padding-x-l'
                    aria-label='Padding-X-L'
                    className='col-span-1'
                    minValue={0}

                    value={CSSUtils.extractEmValue(style["border-radius"])||0}
                    onChange={v => {

                        const porpertys = ['border-radius', 'border-top-left-radius', "border-bottom-left-radius", 'border-top-right-radius', 'border-bottom-right-radius']

                         canvas.updateAnimationStyle({
                                propertyName: "border-radius",
                                propertyValue: CSSUtils.setEmValue(Number(v)),
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })
                      
                        // for (let index = 0; index < porpertys.length; index++) {
                        //     const property = porpertys[index];

                        //     canvas.updateAnimationStyle({
                        //         propertyName: property,
                        //         propertyValue: CSSUtils.setEmValue(Number(v)),
                        //         animationIndex: animationIndex || 0,
                        //         triggerIndex: triggerIndex || 0,
                        //         effectItemIndex: effectItemIndex || 0
                        //     })

                        // }


                    }}
                    formatOptions={{

                    }}
                >
                    <NumberFieldInput size="sm" />
                </NumberField>
            </PanelRowContainer> */}
            <div className=' flex flex-col w-full  justify-between items-start ' >

                <div className=' flex flex-col justify-start items-start w-[100%] gap-3 ' >

                    <PanelRowContainer className=' p-2 min-w-full justify-start items-start gap-2 ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                        <div className="flex items-center gap-1"><label className=' text-[12px]  text-muted-foreground ' htmlFor="">
                            {t('borderRadiusController.topLeft')}
                            </label>
                            <PropertyHint hintKey="borderRadiusTopLeft" />
                            </div>
                        <NumAndTextField isNumber={true} props={{
                            id: 'Corner-Radius-X-L',
                            "aria-label": t('controllers.borderTopLeftAria'),
                            minValue: 0,
                            className: 'w-[100%]',
                            value: String(CSSUtils.extractEmValue(style['border-top-left-radius']) || 0),
                            onChange: (v: number | string) => {

                                canvas.updateAnimationStyle({
                                    propertyName: 'border-top-left-radius',
                                    propertyValue: CSSUtils.setEmValue(Number(v)),
                                    animationIndex: animationIndex || 0,
                                    triggerIndex: triggerIndex || 0,
                                    effectItemIndex: effectItemIndex || 0
                                })

                            }
                        }}
                        >
                            <div className=' flex justify-between gap-2 items-center ' >
                                <NumberFieldInput hideStepper size="sm" />

                            </div>

                        </NumAndTextField>
                    </PanelRowContainer>

                    <PanelRowContainer className=' p-2  min-w-full justify-start items-start gap-2 ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                        <div className="flex items-center gap-1"><label className=' text-[12px] w-[80px] text-muted-foreground ' htmlFor="">
                            {t('borderRadiusController.bottomLeft')}
                            </label>
                            <PropertyHint hintKey="borderRadiusBottomLeft" />
                            </div>
                        <NumAndTextField isNumber={true} props={{
                            id: 'Corner-Radius-X-b',
                            "aria-label": t('controllers.borderBottomLeftAria'),
                            minValue: 0,
                            className: 'w-[100%]',
                            value: String(CSSUtils.extractEmValue(style['border-bottom-left-radius']) || 0),
                            onChange: (v: number | string) => {
                                canvas.updateAnimationStyle({
                                    propertyName: 'border-bottom-left-radius',
                                    propertyValue: CSSUtils.setEmValue(Number(v)),
                                    animationIndex: animationIndex || 0,
                                    triggerIndex: triggerIndex || 0,
                                    effectItemIndex: effectItemIndex || 0
                                })

                            }
                        }}
                        >
                            <div className=' flex justify-between gap-2 items-center ' >
                                <NumberFieldInput hideStepper size="sm" />
                            </div>

                        </NumAndTextField>
                    </PanelRowContainer>






                </div>

                <div className=' flex flex-col justify-start items-start w-[100%] gap-3 ' >

                    <PanelRowContainer className=' p-2 gap-2 min-w-full  justify-start items-start ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                        <div className="flex items-center gap-1"><label className=' text-[12px] w-[80px] text-muted-foreground ' htmlFor="">
                            {t('borderRadiusController.topRight')}
                            </label>
                            <PropertyHint hintKey="borderRadiusTopRight" />
                            </div>
                        <NumAndTextField isNumber={true} props={{
                            id: 'Corner-Radius-Y-R',
                            "aria-label": t('controllers.borderTopRightAria'),
                            minValue: 0,
                            className: 'w-[100%]',
                            value: String(CSSUtils.extractEmValue(style['border-top-right-radius']) || 0),
                            onChange: (v: number | string) => {
                                canvas.updateAnimationStyle({
                                    propertyName: 'border-top-right-radius',
                                    propertyValue: CSSUtils.setEmValue(Number(v)),
                                    animationIndex: animationIndex || 0,
                                    triggerIndex: triggerIndex || 0,
                                    effectItemIndex: effectItemIndex || 0
                                })

                            }
                        }}
                        >
                            <div className=' flex justify-between gap-2 items-center ' >
                                <NumberFieldInput hideStepper size="sm" />

                            </div>

                        </NumAndTextField>
                    </PanelRowContainer>

                    <PanelRowContainer className=' p-2 gap-2 min-w-full justify-start items-start ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                        <div className="flex items-center gap-1"><label className=' text-[12px] w-[80px] text-muted-foreground ' htmlFor="">
                            {t('borderRadiusController.bottomRight')}
                            </label>
                            <PropertyHint hintKey="borderRadiusBottomRight" />
                            </div>
                        <NumAndTextField isNumber={true} props={{
                            id: 'Corner-Radius-Y-b',
                            "aria-label": t('controllers.borderBottomRightAria'),
                            minValue: 0,
                            className: 'w-[100%]',
                            value: String(CSSUtils.extractEmValue(style['border-bottom-right-radius']) || 0),
                            onChange: (v: number | string) => {
                                canvas.updateAnimationStyle({
                                    propertyName: 'border-bottom-right-radius',
                                    propertyValue: CSSUtils.setEmValue(Number(v)),
                                    animationIndex: animationIndex || 0,
                                    triggerIndex: triggerIndex || 0,
                                    effectItemIndex: effectItemIndex || 0
                                })

                            }
                        }}
                        >
                            <div className=' flex justify-between gap-2 items-center ' >
                                <NumberFieldInput hideStepper size="sm" />
                            </div>

                        </NumAndTextField>
                    </PanelRowContainer>






                </div>
            </div>


        </PanelRowContainer>
    )
}


export function RotateController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = content?.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSS.PropertiesHyphen

    return (
        <SectionContainer hintKey="rotate" label={t('controllers.rotate')} >
            <PanelRowContainer multiField className=" flex-row-reverse justify-end px-2 py-2 " layoutType="row" hintKey="rotate" label={t('controllers.degree')} >
                <NumberField
                    id="rotate"
                    aria-label="rotate"
                    minValue={0}
                    className={"col-span-1"}
                    value={Number(style?.rotate) || 0}
                    onChange={(v) => {
                        canvas.updateAnimationStyle({
                            propertyName: 'rotate',
                            propertyValue: v,
                            animationIndex: animationIndex || 0,
                            triggerIndex: triggerIndex || 0,
                            effectItemIndex: effectItemIndex || 0
                        })


                    }}
                >
                    <NumberFieldInput size="sm" hideStepper />
                </NumberField>
            </PanelRowContainer>


        </SectionContainer>

    )
}

export function MoveController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = content?.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSS.PropertiesHyphen

    if (node)
        return (
            <SectionContainer hintKey="positionOffset" label={t('controllers.move')} >
                <PanelRowContainer className="  " layoutType="row" hintKey="positionOffsetX" label={t('controllers.moveX')} >
                    <NumberField
                        id="moveX"
                        aria-label="moveX"
                        className={"col-span-1"}
                        value={Number(style?.left) || 0}
                        onChange={(v) => {
                            // console.log(v,'moveX',style?.moveX)
                            canvas.updateAnimationStyle({
                                propertyName: 'left',
                                propertyValue: Number(v),
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })




                        }}
                    >
                        <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                </PanelRowContainer>
                <PanelRowContainer className="  " layoutType="row" hintKey="positionOffsetY" label={t('controllers.moveY')} >
                    <NumberField
                        id="moveY"
                        aria-label="moveY"
                        className={"col-span-1"}
                        value={Number(style?.top) || 0}
                        onChange={(v) => {
                            canvas.updateAnimationStyle({
                                propertyName: 'top',
                                propertyValue: v,
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })



                        }}
                    >
                        <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                </PanelRowContainer>


            </SectionContainer>

        )
}

/**
 * Handles every "prototype" effect (scrollTo/show/hide/toggle/slideIn/
 * fadeIn) — they all act on another node picked here, just with different
 * runtime behavior per animation_type. Kept as one controller (instead of
 * one per type) since the only thing that varies is which extra fields are
 * shown below the shared target picker.
 */
export function PrototypeEffectController({ isEffect, triggerIndex, animationIndex, effectItemIndex, type }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number, type: string }) {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const effect = content?.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0]

    const slide_from_options = [
        { value: 'bottom', label: t('controllers.bottom') },
        { value: 'top', label: t('controllers.top') },
        { value: 'left', label: t('controllers.left') },
        { value: 'right', label: t('controllers.right') },
    ]

    // Self-targeting is legitimate (e.g. fadeIn/toggle on the same node that
    // was clicked), so the focused node stays in its own target list — just
    // marked so it's easy to spot in a long flattened tree.
    const targets = useMemo(
        () => flattenNodeTree(canvas.content).map((item) =>
            item.id === node?.id ? { ...item, label: `${item.label} (self)` } : item
        ),
        [canvas.content, node?.id]
    )

    function updateField(fieldName: 'targetNodeId' | 'scrollBehavior' | 'highlightTarget' | 'slideFrom' | 'transitionDurationMs', fieldValue: string | boolean | number) {
        canvas.updateAnimationEffectField({
            fieldName,
            fieldValue,
            animationIndex: animationIndex || 0,
            triggerIndex: triggerIndex || 0,
            effectItemIndex: effectItemIndex || 0
        })
    }

    if (node)
        return (
            <SectionContainer hintKey="prototypeAction" label={t('controllers.prototype')} >
                <PanelRowContainer className="  " layoutType="col" label={t('controllers.target')} >
                    <Select
                        id="prototypeTarget"
                        aria-label="prototypeTarget"
                        size="sm"
                        placeholder={t('controllers.selectNode')}
                        className="col-span-2"
                        items={targets}
                        selectedKey={effect?.targetNodeId || null}
                        onSelectionChange={(v) => updateField('targetNodeId', v as string)}
                    >
                        {(item) => (<SelectOption id={item.id}>{item.label}</SelectOption>)}
                    </Select>
                </PanelRowContainer>

                {type === 'scrollTo' && (
                    <PanelRowContainer className="  " layoutType="row" label={t('controllers.highlightTarget')} >
                        <Checkbox
                            checked={effect?.highlightTarget ?? false}
                            onCheckedChange={(checked) => updateField('highlightTarget', checked === true)}
                        />
                    </PanelRowContainer>
                )}

                {(type === 'slideIn' || type === 'fadeIn') && (
                    <PanelRowContainer className="  " layoutType="row" label={t('controllers.durationMs')} >
                        <NumberField
                            id="transitionDurationMs"
                            aria-label="transitionDurationMs"
                            className={"col-span-1"}
                            minValue={0}
                            step={50}
                            value={effect?.transitionDurationMs ?? 400}
                            onChange={(v) => updateField('transitionDurationMs', Number(v))}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField>
                    </PanelRowContainer>
                )}

                {type === 'slideIn' && (
                    <PanelRowContainer className="  " layoutType="col" label={t('controllers.slideFrom')} >
                        <Select
                            id="slideFrom"
                            aria-label="slideFrom"
                            size="sm"
                            placeholder=""
                            className="col-span-2"
                            items={slide_from_options}
                            selectedKey={effect?.slideFrom || 'bottom'}
                            onSelectionChange={(v) => updateField('slideFrom', v as string)}
                        >
                            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                        </Select>
                    </PanelRowContainer>
                )}
            </SectionContainer>
        )
}

export function BorderController() {
    const { value: panelValue } = usePanelStyle()

    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const { borderWidth, borderStyle, borderColor, backgroundColor, backgroundImage } = node?.style || {}

    const isHasValue = (Number(borderWidth || 0) > 0 || (borderStyle as string)?.length > 1 || (borderColor as string)?.length > 1)

    const [isShow, setIsShow] = useState(isHasValue)

    if (node)
        return (
            <PanelRowContainer  className='  border-y px-2 py-2  ' layoutType='col' label='' htmlFor='size-height'>
                <div className=" flex h-[30px] border-b p-2 justify-between w-[100%] items-center " >
                    <label onClick={() => setIsShow(true)} className=" text-sm cursor-pointer text-foreground/80 " htmlFor="">{t('controllers.border')}</label>
                    <div className=" cursor-pointer text-foreground/80 " onClick={() => {
                        setIsShow((prev) => !prev)

                        if (isShow) {

                            canvas.updateNodeStyle({
                                borderStyle: '',

                                borderWidth: '',
                                borderColor: ''
                            })
                        } else {

                            canvas.updateNodeStyle({
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                borderColor: '#000000'
                            })
                        }
                    }} >
                        {isShow ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                    </div>
                </div>

                {isShow && <div className="bg-primary/30 rounded p-2" >
                    <div className='  flex w-[90%] justify-start gap-3 items-center ' >
                        <Select
                            id='size-height-format'
                            aria-label={t('sizeSection.heightFormat')}
                            size='sm'
                            placement='bottom end'
                            placeholder=''
                            className='w-[40%]'
                            items={border_mode}
                            selectedKey={borderStyle || 'none'}
                            onSelectionChange={v => {
                                canvas?.updateNodeStyle({
                                    borderStyle: v as string,
                                    borderWidth: borderWidth ?? (v === 'none' ? '' : CSSUtils.setEmValue(1)),
                                    borderColor: borderColor ?? (v === 'none' ? '' : '#000000')
                                })
                            }}
                        >
                            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                        </Select>
                        -
                        <NumberField id='border-width'
                            aria-label={t('controllers.borderWidthAria')}
                            minValue={1}
                            className={'w-[60%]'}
                            value={CSSUtils.extractEmValue(borderWidth)}
                            isDisabled={!borderWidth || borderWidth === 'none' || borderStyle === 'none'}
                            onChange={v => {
                                canvas?.updateNodeStyle({
                                    borderWidth: CSSUtils.setEmValue(v)
                                })
                            }}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField>


                    </div>

                    <PanelRowContainer className=' my-2 gap-2 px-0 w-[90%]  ' layoutType='col' hintKey="borderColor" label={t('controllers.borderColor')}>
                        <ColorPicker

                            value={borderColor}

                            onChange={v => {
                                canvas.updateNodeStyle({
                                    borderColor: v
                                })
                            }}
                        />
                    </PanelRowContainer >


                </div>
                }

                <PanelRowContainer className=' w-full px-0  justify-start items-start ' layoutType='col' hintKey="borderRadius" label={t('borderRadiusController.borderRadius')} htmlFor='Corner-Radius'>
                    <PanelRowContainer className=' px-2 py-2 justify-start w-[100%] ' layoutType='col' multiField hintKey="borderRadius" label={t('controllers.overall')}>
                        <NumberField id='padding-x-l'
                            aria-label={t('layoutSection.paddingXLAria')}
                            className='col-span-1'
                            minValue={0}

                            value={CSSUtils.extractEmValue(panelValue('borderRadius'))}
                            onChange={v => {
                                canvas?.updateNodeStyle({
                                    borderRadius: CSSUtils.setEmValue(v),
                                    borderTopLeftRadius: CSSUtils.setEmValue(v),
                                    borderTopRightRadius: CSSUtils.setEmValue(v),
                                    borderBottomLeftRadius: CSSUtils.setEmValue(v),
                                    borderBottomRightRadius: CSSUtils.setEmValue(v)
                                })


                            }}
                            formatOptions={{

                            }}
                        >
                            <NumberFieldInput size="sm" />
                        </NumberField>
                    </PanelRowContainer>
                    <div className=' flex w-full  justify-start gap-3 items-start ' >

                        <div className=' flex flex-col justify-start items-start w-[160px] gap-3 ' >

                            <PanelRowContainer className=' px-2 py-2  w-full justify-start items-start gap-2 ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                                <div className="flex items-center gap-1"><label className=' text-[12px]  text-foreground ' htmlFor="">
                                    {t('borderRadiusController.topLeft')}
                                    </label>
                                    <PropertyHint hintKey="borderRadiusTopLeft" />
                                    </div>
                                <NumAndTextField isNumber={true} props={{
                                    id: 'Corner-Radius-X-L',
                                    "aria-label": t('controllers.borderTopLeftAria'),
                                    minValue: 0,
                                    className: 'w-[150px]',
                                    value: String(CSSUtils.extractEmValue(panelValue('borderTopLeftRadius')) || 0),
                                    onChange: (v: number | string) => {
                                        canvas?.updateNodeStyle({
                                            borderTopLeftRadius: CSSUtils.setEmValue(Number(v)),

                                        })
                                    }
                                }}
                                >
                                    <div className=' flex justify-between gap-2 items-center ' >
                                        <NumberFieldInput hideStepper size="sm" />

                                    </div>

                                </NumAndTextField>
                            </PanelRowContainer>

                            <PanelRowContainer className=' px-2 py-2 w-full justify-start items-start gap-2 ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                                <div className="flex items-center gap-1"><label className=' text-[12px] w-[80px] text-foreground ' htmlFor="">
                                    {t('borderRadiusController.bottomLeft')}
                                    </label>
                                    <PropertyHint hintKey="borderRadiusBottomLeft" />
                                    </div>
                                <NumAndTextField isNumber={true} props={{
                                    id: 'Corner-Radius-X-b',
                                    "aria-label": t('controllers.borderBottomLeftAria'),
                                    minValue: 0,
                                    className: 'w-[150px]',
                                    value: String(CSSUtils.extractEmValue(panelValue('borderBottomLeftRadius')) || 0),
                                    onChange: (v: number | string) => {
                                        canvas?.updateNodeStyle({
                                            borderBottomLeftRadius: CSSUtils.setEmValue(Number(v)),

                                        })
                                    }
                                }}
                                >
                                    <div className=' flex w-full justify-between gap-2 items-center ' >
                                        <NumberFieldInput hideStepper size="sm" />
                                    </div>

                                </NumAndTextField>
                            </PanelRowContainer>






                        </div>

                        <div className=' flex flex-col justify-start items-start w-[160px] gap-3 ' >

                            <PanelRowContainer className=' px-2 py-2 gap-2 min-w-[100%]  justify-start items-start ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                                <div className="flex items-center gap-1"><label className=' text-[12px] text-foreground/80 w-[80px] text-muted-foreground ' htmlFor="">
                                    {t('borderRadiusController.topRight')}
                                    </label>
                                    <PropertyHint hintKey="borderRadiusTopRight" />
                                    </div>
                                <NumAndTextField isNumber={true} props={{
                                    id: 'Corner-Radius-Y-R',
                                    "aria-label": t('controllers.borderTopRightAria'),
                                    minValue: 0,
                                    className: 'w-[150px]',
                                    value: String(CSSUtils.extractEmValue(panelValue('borderTopRightRadius')) || 0),
                                    onChange: (v: number | string) => {
                                        canvas?.updateNodeStyle({
                                            borderTopRightRadius: CSSUtils.setEmValue(Number(v)),

                                        })
                                    }
                                }}
                                >
                                    <div className=' flex justify-between gap-2 items-center ' >
                                        <NumberFieldInput hideStepper size="sm" />

                                    </div>

                                </NumAndTextField>
                            </PanelRowContainer>

                            <PanelRowContainer className='  px-2 py-2 gap-2 min-w-full justify-start items-start ' layoutType='col' label='' multiField htmlFor='Corner-Radius'>
                                <div className="flex items-center gap-1"><label className=' text-foreground/80 text-[12px] w-[80px] text-muted-foreground ' htmlFor="">
                                    {t('borderRadiusController.bottomRight')}
                                    </label>
                                    <PropertyHint hintKey="borderRadiusBottomRight" />
                                    </div>
                                <NumAndTextField isNumber={true} props={{
                                    id: 'Corner-Radius-Y-b',
                                    "aria-label": t('controllers.borderBottomRightAria'),
                                    minValue: 0,
                                    className: 'w-[150px]',
                                    value: String(CSSUtils.extractEmValue(panelValue('borderBottomRightRadius')) || 0),
                                    onChange: (v: number | string) => {
                                        canvas?.updateNodeStyle({
                                            borderBottomRightRadius: CSSUtils.setEmValue(Number(v)),

                                        })
                                    }
                                }}
                                >
                                    <div className=' flex justify-between gap-2 items-center ' >
                                        <NumberFieldInput hideStepper size="sm" />
                                    </div>

                                </NumAndTextField>
                            </PanelRowContainer>






                        </div>
                    </div>


                </PanelRowContainer>
            </PanelRowContainer>
        )
}


export function ZoomController({ isEffect, triggerIndex, animationIndex, effectItemIndex }: { isEffect?: boolean | false, triggerIndex?: number, animationIndex?: number, effectItemIndex?: number }) {
    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const content = canvas.content
    const style = content?.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects[effectItemIndex || 0].style as CSS.PropertiesHyphen

    if (node)
        return (
            <SectionContainer label='' >
                <PanelRowContainer className="  justify-center items-center " layoutType="row" hintKey="scaleZoom" label={t('controllers.zoom')} >
                    <NumberField
                        id="zoom"
                        aria-label="zoom"
                        className={"col-span-1"}
                        value={Number(style?.zoom) || 0}
                        step={0.1}
                        // minValue={0.1}
                        onChange={(v) => {
                            // console.log(v,'moveX',style?.moveX)
                            canvas.updateAnimationStyle({
                                propertyName: 'zoom',
                                propertyValue: Number(v),
                                animationIndex: animationIndex || 0,
                                triggerIndex: triggerIndex || 0,
                                effectItemIndex: effectItemIndex || 0
                            })




                        }}
                    >
                        <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                </PanelRowContainer>



            </SectionContainer>

        )
}
