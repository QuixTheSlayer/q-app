import {  SectionContainer } from "../ui";
import { Select, SelectOption } from "@/components/ui/Select";
import { animation_type, trigger_mode } from "@/consts/propertyField.consts";
import { useEditor } from "@/context/EditorContext";
import { TriggerModeType } from "@/types/otherTypes";
import { CirclePlusIcon } from "lucide-react";
import TriggerEffectController from "./relatedComponents/TriggerEffectController";
import { CiTrash } from "react-icons/ci";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import editorConfig from "@/configs/editor.config";
import { ENHANCED_EFFECT_TYPES } from "@/consts/animationEffects";
import { EffectTimingEditor } from "./relatedComponents/animation/EffectTimingEditor";
import { TriggerTimeline } from "./relatedComponents/animation/TriggerTimeline";

// "Prototype" effects drive navigation/interaction (currently just scrollTo);
// everything else in animation_type is a visual style effect. Purely a UI
// grouping — both kinds still live in the same trigger_effect.effects[]
// array and share the same add/remove/update editor-context calls.
const PROTOTYPE_ANIMATION_TYPES = new Set(['scrollTo', 'show', 'hide', 'toggle', 'slideIn', 'fadeIn'])
const style_animation_type = animation_type.filter((item) =>
    !PROTOTYPE_ANIMATION_TYPES.has(item.value) && item.value !== 'none' && (editorConfig.enable_animation_timing || !ENHANCED_EFFECT_TYPES.has(item.value)))
const prototype_animation_type = animation_type.filter((item) => PROTOTYPE_ANIMATION_TYPES.has(item.value))

export default function AnimationSection() {

    const { t } = useTranslation("propertyPanel");
    const canvas = useEditor()
    const node = canvas?.focusedNode

    // console.log(canvas.content)

    const animation = useMemo(() => canvas.content?.animation?.find((animate, index) => animate.id === node?.id), [node, canvas])

    const animationIndex = useMemo(() => canvas.content?.animation?.findIndex((animate, index) => animate.id === node?.id), [canvas])

    return (
        <SectionContainer hintKey="animation" label={t('animationSection.animation')} >


            <div className=" px-4 " >
                <div className=" flex flex-col min-w-full w-auto gap-6 " >
                    {
                        // canvas.content?.animation && canvas.content?.animation?.length > 0 && canvas.content?.animation?.map((animation, animationIndex) => {
                        (animation) ?
                            animation?.trigger_effect?.map((trigger_effects, triggerIndex) => {
                                // console.log(trigger_effects.animation_type)
                                return (
                                    <div key={triggerIndex} className=" px-3  bg-primary/10 flex flex-col border-primary/50 border py-3 rounded w-[100%] gap-6 justify-end items-center " >
                                        <div className=" flex flex-col gap-2 w-full h-auto  " >
                                            <div className=" flex gap-2 justify-between items-center " >
                                                
                                                <p className=" text-sm text-center text-muted-foreground " >{t('animationSection.trigger')}</p>

                                                <div onClick={() => {
                                                    canvas.removeTrigger({
                                                        animationIndex: animationIndex || 0,
                                                        triggerIndex: triggerIndex || 0
                                                    })

                                                }} className=" cursor-pointer  min-w-[22px] flex text-destructive-foreground bg-destructive justify-center place-items-center h-[22px] border border-destructive rounded  " >
                                                    <CiTrash size={14} />
                                                </div>
                                            </div>
                                            {/* <PanelRowContainer  > */}
                                            <Select
                                            
                                                id='triggerMode'
                                                aria-label='triggerMode'
                                                size='sm'
                                                // placement="start top"
                                                placeholder=''
                                                className='col-span-2'
                                                items={trigger_mode}
                                                selectedKey={trigger_effects.trigger || 'auto'}
                                                onSelectionChange={(v) => {

                                                    canvas.updateAnimationTrigger({
                                                        triggerValue: v as TriggerModeType,
                                                        animationIndex: animationIndex || 0,
                                                        triggerIndex: triggerIndex || 0,
                                                    })


                                                }}
                                            >
                                                {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                                            </Select>
                                            {/* </PanelRowContainer> */}
                                        </div>


                                        {(() => {
                                            const effects = canvas.content.animation[animationIndex || 0]?.trigger_effect[triggerIndex || 0]?.effects ?? []
                                            const styleIndexes: number[] = []
                                            const prototypeIndexes: number[] = []
                                            effects.forEach((effectItem, effectItemIndex) => {
                                                if (PROTOTYPE_ANIMATION_TYPES.has(effectItem.animation_type)) prototypeIndexes.push(effectItemIndex)
                                                else styleIndexes.push(effectItemIndex)
                                            })

                                            const renderEffectRow = (effectItemIndex: number) => {
                                                const effectItem = effects[effectItemIndex]
                                                const isPrototype = PROTOTYPE_ANIMATION_TYPES.has(effectItem.animation_type)
                                                return (
                                                    <div key={effectItemIndex} className=" pl-8 border-b border-b-primary/30 py-2 flex flex-col gap-2 w-full h-auto  " >
                                                        <div className=" flex gap-2 justify-between items-center " >

                                                            <p className=" text-sm text-center text-muted-foreground " >{t('animationSection.triggerEffect')}</p>
                                                            <div onClick={() => {

                                                                canvas.removeTriggerEffect({
                                                                    animationIndex: animationIndex || 0,
                                                                    triggerIndex: triggerIndex || 0,
                                                                    effectItemIndex: effectItemIndex || 0
                                                                })


                                                            }
                                                } className=" cursor-pointer  min-w-[22px] flex text-destructive-foreground bg-destructive justify-center place-items-center h-[22px] border border-destructive rounded  " >
                                                                <CiTrash size={14} />
                                                            </div>
                                                        </div>

                                                        {/* <SectionContainer  > */}

                                                        <Select
                                                            id='animationType'
                                                            aria-label='animationType'
                                                            size='sm'
                                                            placement='bottom end'
                                                            placeholder=''
                                                            className='col-span-2'
                                                            items={isPrototype ? prototype_animation_type : style_animation_type}
                                                            selectedKey={effectItem.animation_type || (isPrototype ? 'scrollTo' : 'none')}
                                                            onSelectionChange={(v) => {


                                                                canvas.updateAnimationType({
                                                                    animationType: v as string,
                                                                    animationIndex: animationIndex || 0,
                                                                    triggerIndex: triggerIndex || 0,
                                                                    effectItemIndex: effectItemIndex || 0
                                                                })



                                                            }
                                                            }
                                                        >
                                                            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                                                        </Select>

                                                        <TriggerEffectController type={effectItem.animation_type} animationIndex={animationIndex} triggerIndex={triggerIndex} effectItemIndex={effectItemIndex} />
                                                        {editorConfig.enable_animation_timing && !isPrototype && effectItem.animation_type !== 'none' &&
                                                            <EffectTimingEditor animationIndex={animationIndex} triggerIndex={triggerIndex} effectItemIndex={effectItemIndex} />}
                                                        {/* </SectionContainer> */}
                                                    </div>
                                                )
                                            }

                                            return (
                                                <>
                                                    <div className=" flex flex-col gap-2 w-full " >
                                                        <p className=" text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-8 " >{t('animationSection.styleEffects')}</p>
                                                        {styleIndexes.length === 0 && <p className=" text-xs text-muted-foreground pl-8 " >{t('animationSection.noEffectsYet')}</p>}
                                                        {styleIndexes.map(renderEffectRow)}
                                                        <div onClick={() => {
                                                            canvas.addNewAnimationEffect({
                                                                animationIndex: animationIndex || 0,
                                                                triggerIndex: triggerIndex || 0,
                                                            })
                                                        }} className=" gap-2 text-base flex text-center w-[95%]  border-[2px] border-primary text-primary rounded-md h-[38px] justify-center items-center cursor-pointer self-center " >
                                                            <CirclePlusIcon size={24} /> <p className=" text-primary " >{t('animationSection.newEffect')}</p>
                                                        </div>
                                                        {editorConfig.enable_animation_timing && <TriggerTimeline animationIndex={animationIndex} triggerIndex={triggerIndex} />}
                                                    </div>

                                                    <div className=" flex flex-col gap-2 w-full border-t border-t-primary/30 pt-4 " >
                                                        <p className=" text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-8 " >{t('animationSection.prototypeEffects')}</p>
                                                        {prototypeIndexes.length === 0 && <p className=" text-xs text-muted-foreground pl-8 " >{t('animationSection.noEffectsYet')}</p>}
                                                        {prototypeIndexes.map(renderEffectRow)}
                                                        <div onClick={() => {
                                                            canvas.addNewAnimationEffect({
                                                                animationIndex: animationIndex || 0,
                                                                triggerIndex: triggerIndex || 0,
                                                                defaultAnimationType: 'scrollTo',
                                                            })
                                                        }} className=" gap-2 text-base flex text-center w-[95%]  border-[2px] border-primary text-primary rounded-md h-[38px] justify-center items-center cursor-pointer self-center " >
                                                            <CirclePlusIcon size={24} /> <p className=" text-primary " >{t('animationSection.newPrototypeEffect')}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })()}


                                    </div>

                                )
                            })

                            :
                            <></>

                        // })
                    }

                    <div onClick={() => {

                        canvas.addNewAnimationTrigger({
                            animationIndex: animationIndex || 0

                        })

                    }} className=" gap-2 text-base flex text-center w-[90%]  border-[2px]  border-primary text-primary rounded-md h-[38px] justify-center items-center cursor-pointer " >
                        <CirclePlusIcon size={24} /> <p className=" text-primary  " >{t('animationSection.newTrigger')}</p>
                    </div>
                </div>

            </div>

        </SectionContainer>
    )
}