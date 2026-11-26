import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import Link from '@/components/PropertyPanelUI/Sections/Link'
import SizeSection from '@/components/PropertyPanelUI/Sections/SizeSection'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { border_mode, height_mode } from '@/consts/propertyField.consts'
import { useEditor } from '@/context/EditorContext'
import useFileDrop from '@/hooks/useFileDrop'
import useUploadToS3 from '@/hooks/useUploadToS3'
import { cn } from '@/libs/cn'
import { useGetPageDataQuery } from '@/store/query'
import { CanvasNode, ContentNode, CountDownNode, CustomeCountDownNode, GoogleMapNode, ImageNode } from '@/types/node.type'
import CSSUtils from '@/utils/CSS.utils'
import { Button, buttonVariants } from '@/components/ui/primitives/button'
import { TextInput } from '@/components/ui/primitives/text-input'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from '@/components/ui/Select'
import React, { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { CiCirclePlus } from "react-icons/ci";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/DropDownMenu'
import NumAndTextField from '@/components/ui/button/NumberAndTextField'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import StyleSection from '../Sections/StyleSection'
import LayoutSection from '../Sections/LayoutSection'
import { CornerDownLeftIcon } from 'lucide-react'
import AligmentSection from '../Sections/PositionSection'
import { icons } from '@/components/ui/icons/Icons'
import { ToolTipPanel } from '@/components/ui/ToolTipPanel';
import { TooltipProvider } from '@/components/ui/primitives/tooltip'
import { Dialog } from 'react-aria-components'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/primitives/switch'


type layoutPropsType = 'block' | 'row' | 'column'

const layoutType: layoutPropsType[] = ['block', 'row', 'column',]

type CountDownDateParts = { day: number; month: number; year: number; hour: number; minute: number }

import withSizeGridTab from './withSizeGridTab'
function isDateUnset(date?: Record<string, number>) {
    if (!date) return true
    return !date.day && !date.month && !date.year
}

function dateToParts(m: moment.Moment): CountDownDateParts {
    return { day: m.date(), month: m.month() + 1, year: m.year(), hour: m.hour(), minute: m.minute() }
}

function defaultStartDate() {
    return dateToParts(moment().startOf('day'))
}

function defaultEndDate() {
    return dateToParts(moment().add(7, 'days').startOf('day'))
}

function CountDownPanel() {

    const { t } = useTranslation('propertyPanel')
    const canvas = useEditor()
    const node = canvas?.focusedNode as CountDownNode

    const content = canvas?.content

    // Countdown needs a valid start/end date to calculate anything meaningful —
    // default to today → next week the first time a page has no date set yet.
    useEffect(() => {
        if (!content) return
        if (isDateUnset(content.startDate) || isDateUnset(content.endDate)) {
            canvas.updateContent((content) => ({
                ...content,
                startDate: isDateUnset(content.startDate) ? defaultStartDate() : content.startDate,
                endDate: isDateUnset(content.endDate) ? defaultEndDate() : content.endDate,
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content?.startDate, content?.endDate])


    const dateController = [
        {
            type: 'Day',
            value: (type: 'start' | 'end') => content[`${type}Date`]?.day || 0,
            updateDate: (val: number, type: 'start' | 'end') => {
                //      canvas?.updateNode((oldNode) => ({
                //     ...oldNode,
                //     [`${type}Date`]: {
                //         ...(oldNode as CountDownNode | CustomeCountDownNode)[`${type}Date`],
                //         day: val
                //     }
                // }))

                canvas.updateContent((content) => ({
                    ...content,
                    [`${type}Date`]: {
                        ...(content as CanvasNode)[`${type}Date`],
                        day: val
                    }
                }))
            }
        },
        {
            type: 'Month',
            value: (type: 'start' | 'end') => content[`${type}Date`]?.month || 0,
            updateDate: (val: number, type: 'start' | 'end') => {
                //     canvas?.updateNode((oldNode) => ({
                //     ...oldNode,
                //     [`${type}Date`]: {
                //         ...(oldNode as CountDownNode| CustomeCountDownNode)[`${type}Date`],
                //         month: val
                //     }
                // }))

                canvas.updateContent((content) => ({
                    ...content,
                    [`${type}Date`]: {
                        ...(content as CanvasNode)[`${type}Date`],
                        month: val
                    }
                }))
            }
        },
        {
            type: 'Year',
            value: (type: 'start' | 'end') => content[`${type}Date`]?.year || 0,
            updateDate: (val: number, type: 'start' | 'end') => {
                //     canvas?.updateNode((oldNode) => ({
                //     ...oldNode,
                //     [`${type}Date`]: {
                //         ...(oldNode as CountDownNode| CustomeCountDownNode)[`${type}Date`],
                //         year: val
                //     }
                // }))
                canvas.updateContent((content) => ({
                    ...content,
                    [`${type}Date`]: {
                        ...(content as CanvasNode)[`${type}Date`],
                        year: val
                    }
                }))
            }
        },
        {
            type: 'Hour',
            value: (type: 'start' | 'end') => content[`${type}Date`]?.hour || 0,
            updateDate: (val: number, type: 'start' | 'end') => {
                //     canvas?.updateNode((oldNode) => ({
                //     ...oldNode,
                //     [`${type}Date`]: {
                //         ...(oldNode as CountDownNode| CustomeCountDownNode)[`${type}Date`],
                //         hour: val
                //     }
                // }))
                canvas.updateContent((content) => ({
                    ...content,
                    [`${type}Date`]: {
                        ...(content as CanvasNode)[`${type}Date`],
                        hour: val
                    }
                }))
            }
        },
        {
            type: 'Minute',
            value: (type: 'start' | 'end') => content[`${type}Date`]?.minute || 0,
            updateDate: (val: number, type: 'start' | 'end') => {
                //     canvas?.updateNode((oldNode) => ({
                //     ...oldNode,
                //     [`${type}Date`]: {
                //         ...(oldNode as CountDownNode| CustomeCountDownNode)[`${type}Date`],
                //         minute: val
                //     }
                // }))
                canvas.updateContent((content) => ({
                    ...content,
                    [`${type}Date`]: {
                        ...(content as CanvasNode)[`${type}Date`],
                        minute: val
                    }
                }))
            }
        }
    ]


    const uiType =
        [
            { label: t('countDownPanel.uiType.boldBlock'), value: "boldBlocks" },
            { label: t('countDownPanel.uiType.ringArc'), value: "ringArc" },
            // { label: "Minimal Pill", value: "minimalPill" },
            // { label: "Banner Bar", value: "bannerBar" },
            { label: t('countDownPanel.uiType.slideCard'), value: "slideCards" },
            { label: t('countDownPanel.uiType.progressBar'), value: "progressBar" },
            { label: t('countDownPanel.uiType.mechanicalFlipClock'), value: "mechanicalFlipClock" },
            { label: t('countDownPanel.uiType.neumorphism'), value: "neumorphism" },
            { label: t('countDownPanel.uiType.brutalist'), value: "brutalist" },
            { label: t('countDownPanel.uiType.editorial'), value: "editorial" },
            { label: t('countDownPanel.uiType.gradientGlow'), value: "gradientGlow" },
            { label: t('countDownPanel.uiType.splitFlap'), value: "splitFlap" },
        ]

    const layoutItem = {
        'block': {
            icon: () => icons.freeForm(),
            func: () => canvas.updateNodeStyle({
                display: 'block',

            })
        },
        'row': {
            icon: () => icons.flexRow(),
            func: () => canvas.updateNodeStyle({
                display: 'flex',
                flexDirection: "row"

            })
        },
        'column': {
            icon: () => icons.flexCol(),
            func: () => canvas.updateNodeStyle({
                display: 'flex',
                flexDirection: "column"

            })
        },
        // 'grid': {
        //   icon: () => icons.grid(),
        //   func: () => canvas.updateNodeStyle({
        //     display: 'grid',
        //     // gridTemplateColumns: "repeat(auto-fill,1fr)",
        //     // gridTemplateRows: "repeat(auto-fill,1fr)"


        //   })
        // },
    }

    const [layoutMode, setLayoutMode] = useState<layoutPropsType>(node?.style?.display === 'flex' ? node?.style?.flexDirection : 'block')


    const [isWrap, setIsWrap] = useState(node?.style.flexWrap === 'wrap')


    // console.log(node.endDate)


    const date = ['Day', 'Month', 'Year', 'Hour', 'Minute', 'Second']

    

    if (node)
        return (
            <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

                {/* {node.contentType === 'customCountDownWrapper' && <SectionContainer hintKey="direction" label='Layout' >


                    <PanelRowContainer layoutType='col' hintKey="direction" label='Layout Type' htmlFor='layout-type'>

                        <div className=' flex gap-1 h-[30px] w-full relative  justify-start items-center ' >
                            {
                                layoutType.map((layout, index) => <div onClick={() => {
                                    setLayoutMode(layout)
                                    layoutItem[layout].func()
                                }} className={cn(' relative cursor-pointer flex justify-center items-center h-full w-[33%] bg-muted  ', layoutMode === layout ? 'bg-accent' : '', index === 0 ? 'rounded-l-[6px]' : index === layoutType.length - 1 ? 'rounded-r-[6px] ' : '')} >

                                    <ToolTipPanel label={(layout)}  >
                                        <div className='   min-w-[60px] w-full h-[30px] flex justify-center items-center ' >
                                            {layoutItem[layout].icon()}
                                        </div>

                                    </ToolTipPanel>

                                </div>



                                )
                            }

                            <ToolTipPanel label={'Wrap'}  >

                                <div
                                    onClick={() => {
                                        setIsWrap(prev => !prev)

                                        canvas.updateNodeStyle({
                                            flexWrap: isWrap ? 'nowrap' : 'wrap'
                                        })
                                    }} className={cn(' cursor-pointer w-[35px] h-[30px] flex justify-center items-center border rounded text-muted-foreground ', isWrap ? ' bg-primary/20   ' : '')} >

                                    <CornerDownLeftIcon size={16} />
                                </div>
                            </ToolTipPanel>

                        </div>
                    </PanelRowContainer>

                    <AligmentSection />
                    <span className=" h-5 w-[100%] flex justify-start items-center " >
                        <span className=" bg-border h-[1px] w-[90%] " >

                        </span>
                    </span>

                    <PanelRowContainer multiField className=' px-2 py-2 ' layoutType='col' hintKey="gap" label='Gap' htmlFor='layout-gap'>
                        <NumberField id='layout-gap'
                            aria-label='Gap'
                            className='w-[100%]'
                            minValue={0}
                            onCompositionEnd={v => console.log(v)}
                            value={CSSUtils.extractEmValue(node.style.gap)}
                            onChange={v => {
                                canvas?.updateNodeStyle({
                                    gap: CSSUtils.setEmValue(v)
                                })
                            }}
                            formatOptions={{

                            }}
                        >
                            <NumberFieldInput size="sm" />
                        </NumberField>
                    </PanelRowContainer>

                </SectionContainer>} */}

                <SectionContainer label={t('countDownPanel.details')}>
                    <PanelRowContainer className=" px-0 " layoutType='row' label={t('countDownPanel.showTitle')}>
                        <Switch
                            checked={(canvas.focusedNode as CountDownNode)?.showTitle !== false}
                            onCheckedChange={(v) => canvas.updateNode((node: any) => ({
                                ...node,
                                showTitle: v,
                            }))}
                        />
                    </PanelRowContainer>
                    <PanelRowContainer className=" w-[100%] " layoutType='col' label={t('countDownPanel.title')}>
                        <TextInput style={{
                            position: "initial"
                        }} className='col-span-2' size="sm"
                            value={(canvas.focusedNode as CountDownNode)?.title || ''}
                            onChange={v => {

                                // const clasList: string[] = v.target.value.split(" ")

                                // const positionExist = clasList?.find((value) => positions.includes(value as positionType)) as positionType



                                canvas.updateNode((node: any) => {
                                    return {
                                        ...node,
                                        title: v.target.value
                                    }
                                })


                            }}
                        />
                    </PanelRowContainer>
                    <PanelRowContainer className=" px-0 " layoutType='row' label={t('countDownPanel.showDescription')}>
                        <Switch
                            checked={(canvas.focusedNode as CountDownNode)?.showDescription !== false}
                            onCheckedChange={(v) => canvas.updateNode((node: any) => ({
                                ...node,
                                showDescription: v,
                            }))}
                        />
                    </PanelRowContainer>
                    <PanelRowContainer className=" w-[100%] " layoutType='col' label={t('countDownPanel.description')}>
                        <TextInput className='col-span-2' size="sm"
                            value={(canvas.focusedNode as CountDownNode)?.description || ''}
                            onChange={v => {
                                canvas.updateNode((node: any) => {
                                    return {
                                        ...node,
                                        description: v.target.value
                                    }
                                })
                            }}
                        />
                    </PanelRowContainer>
                    <PanelRowContainer className=" px-0 " layoutType='row' label={t('countDownPanel.showFooter')}>
                        <Switch
                            checked={(canvas.focusedNode as CountDownNode)?.showFooter !== false}
                            onCheckedChange={(v) => canvas.updateNode((node: any) => ({
                                ...node,
                                showFooter: v,
                            }))}
                        />
                    </PanelRowContainer>
                    <PanelRowContainer className=" w-[100%] " layoutType='col' label={t('countDownPanel.footer')}>
                        <TextInput className='col-span-2' size="sm"
                            value={(canvas.focusedNode as CountDownNode)?.footer || ''}
                            onChange={v => {
                                canvas.updateNode((node: any) => {
                                    return {
                                        ...node,
                                        footer: v.target.value
                                    }
                                })
                            }}
                        />
                    </PanelRowContainer>
                </SectionContainer>


                <SectionContainer direction='col' label={t('countDownPanel.startDate')}>

                    <PanelRowContainer className=' py-0 px-0 gap-2 ' layoutType='row'  >

                        {
                            dateController.map(({ type, value, updateDate }) => {
                                return (
                                    <PanelRowContainer className=' w-[15%] py-0 px-0 justify-start items-start ' layoutType='col' label={t(`countDownPanel.dateUnit.${type}`)} >

                                        <NumberField id={`end-${type}`}
                                            aria-label={`end-${type}`}
                                            className='w-[100%]'
                                            minValue={0}
                                            onCompositionEnd={v => console.log(v)}
                                            value={value('start')}

                                            onChange={v => updateDate(v, 'start')}
                                            formatOptions={{

                                            }}
                                        >
                                            <NumberFieldInput prefix={t('countDownPanel.day')} hideStepper size="sm" />
                                        </NumberField>
                                    </PanelRowContainer>
                                )
                            })
                        }
                        <PanelRowContainer className=' w-[15%] py-0 px-0 justify-start items-start ' layoutType='col' label={t('countDownPanel.reset')} >

                            <Button onClick={() => {
                                canvas.updateContent((content) => ({
                                    ...content,
                                    startDate: defaultStartDate()
                                }))
                            }} variant={"link"}  className=' !text-primary '   >{t('countDownPanel.reset')}</Button>
                        </PanelRowContainer>

                    </PanelRowContainer>

                </SectionContainer>

                <SectionContainer direction='col' label={t('countDownPanel.endDate')}>

                    <PanelRowContainer className=' py-0 px-0 gap-2 ' layoutType='row' label=' ' >

                        {
                            dateController.map(({ type, value, updateDate }) => {
                                return (
                                    <PanelRowContainer className=' w-[15%] py-0 px-0 justify-center items-start ' layoutType='col' label={t(`countDownPanel.dateUnit.${type}`)} >

                                        <NumberField id={`end-${type}`}
                                            aria-label={`end-${type}`}
                                            className='w-[100%]'
                                            minValue={0}
                                            onCompositionEnd={v => console.log(v)}
                                            value={value('end')}

                                            onChange={v => updateDate(v, 'end')}
                                            formatOptions={{

                                            }}
                                        >
                                            <NumberFieldInput prefix={t('countDownPanel.day')} hideStepper size="sm" />
                                        </NumberField>
                                    </PanelRowContainer>
                                )
                            })
                        }

                        <PanelRowContainer className=' w-[15%] py-0 px-0 justify-start items-start ' layoutType='col' label={t('countDownPanel.reset')} >

                            <Button onClick={() => {
                                canvas.updateContent((content) => ({
                                    ...content,
                                    endDate: defaultEndDate()
                                }))
                            }} variant={"link"} className=' !text-primary '  >{t('countDownPanel.reset')}</Button>
                        </PanelRowContainer>
                    </PanelRowContainer>





                </SectionContainer>

                {
                    <SectionContainer label={t('countDownPanel.ui')}>


                        <Select

                            id="size-height-format"
                            aria-label={t('countDownPanel.heightFormat')}
                            size="sm"
                            placement="top start"
                            placeholder=""
                            className="col-span-1"
                            items={uiType}
                            selectedKey={node.uiType}
                            onSelectionChange={(v) => {

                                canvas.updateNode((prevNode) => ({
                                    ...prevNode,
                                    uiType: v as CountDownNode['uiType']
                                }))

                            }}
                        >
                            {(item) => (
                                <SelectOption id={item.value}>{item.label}</SelectOption>
                            )}
                        </Select>


                    </SectionContainer>
                }

                <SectionContainer hintKey="colorPair" label={t('countDownPanel.colors')} >

                    <PanelRowContainer layoutType='col' hintKey="textColor" label={t('countDownPanel.titleColor')} >
                        <BackgroundPicker
                            value={node.colors?.title || '#1E2129'}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        title: v
                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>
                    <PanelRowContainer layoutType='col' hintKey="textColor" label={t('countDownPanel.descriptionColor')} >
                        <BackgroundPicker
                            value={node.colors?.description || '#1E2129'}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        description: v
                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>
                    <PanelRowContainer layoutType='col' hintKey="textColor" label={t('countDownPanel.footerColor')} >
                        <BackgroundPicker
                            value={node.colors?.footer || '#1E2129'}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        footer: v
                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>
                    <PanelRowContainer layoutType='col' hintKey="colorPair" label={t('countDownPanel.basicColor')} >
                        <BackgroundPicker
                            value={node.colors?.countDown?.basic}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        countDown: {
                                            ...(prevNode as CountDownNode).colors.countDown,
                                            basic: v
                                        }

                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>
                    <PanelRowContainer layoutType='col' hintKey="colorPair" label={t('countDownPanel.primaryColor')} >
                        <BackgroundPicker
                            value={node.colors.countDown.primary || '#50cd89'}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        countDown: {
                                            ...(prevNode as CountDownNode).colors.countDown,
                                            primary: v
                                        }

                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>
                    <PanelRowContainer layoutType='col' hintKey="colorPair" label={t('countDownPanel.secondaryColor')} >
                        <BackgroundPicker
                            value={node.colors.countDown.secondary || '#adadb8e5'}
                            isNotHasImage={true}
                            onChange={(v) => {
                                canvas.updateNode((prevNode) => ({
                                    ...prevNode as CountDownNode,
                                    colors: {
                                        ...(prevNode as CountDownNode).colors,
                                        countDown: {
                                            ...(prevNode as CountDownNode).colors.countDown,
                                            secondary: v
                                        }

                                    }
                                }))
                            }}
                        />

                    </PanelRowContainer>


                </SectionContainer>



                {/* Size Section  */}



                <StyleSection />



                {/* <Link /> */}
                {/* <Attributes /> */}
            </div>
        )
}

export default withSizeGridTab(CountDownPanel)
