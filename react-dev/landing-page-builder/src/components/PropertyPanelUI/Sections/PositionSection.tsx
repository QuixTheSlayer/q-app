import { icons } from "@/components/ui/icons/Icons";
import { PanelRowContainer, SectionContainer } from "../ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/primitives/tooltip";
import { useState } from "react";
import { useEditor } from "@/context/EditorContext";
import { cn } from "@/libs/cn";
import { ToolTipPanel } from '@/components/ui/ToolTipPanel';
import { useTranslation } from "react-i18next";


const AligmentType = ['start', 'center', 'end']

export default function AligmentSection() {

    const { t } = useTranslation('propertyPanel')

    const canvas = useEditor()
    const node = canvas?.focusedNode

    const [aligment1Mode, setAligment1mode] = useState(node?.style?.justifyContent)

    const [aligment2Mode, setAligment2mode] = useState(node?.style?.alignItems)


 
    const AligmentItems1Key = node?.style.flexDirection === 'row' ? 'justifyContent' : 'alignItems'
    const AligmentItems2Key = node?.style.flexDirection === 'row' ? 'alignItems' : 'justifyContent'



    const AligmentItems1: Record<string, { label: string, func: () => void, icon: JSX.Element }> = {
        "start": {
            label: t('positionSection.alignLeft'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems1Key]: 'start',
            }),
            icon: icons.alignLeft()
        },
        "center": {
            label: t('positionSection.alignVerticallyCenter'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems1Key]: 'center',
            }),
            icon: icons.alignCenterX()
        },
        "end": {
            label: t('positionSection.alignRight'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems1Key]: 'end',
            }),
            icon: icons.alignRight()
        }
    }

    const AligmentItems2: Record<string, { label: string, func: () => void, icon: JSX.Element }> = {
        "start": {
            label: t('positionSection.alignTop'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems2Key]: 'start',

            }),
            icon: icons.alignTop()
        },
        "center": {
            label: t('positionSection.alignHorizontallyCenter'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems2Key]: 'center'
            }),
            icon: icons.alignCenterY()
        },
        "end": {
            label: t('positionSection.alignBottom'),
            func: () => canvas.updateNodeStyle({
                [AligmentItems2Key]: 'end'
            }),
            icon: icons.alignBottom()
        }

    }

    return (
        // <SectionContainer hintKey="positionOffset" label="Position" >

        <PanelRowContainer layoutType="col" hintKey="alignX" label={t('positionSection.alignment')} >
            <div className=" flex px-0  relative justify-between h-[30px] " >
                {
                    node?.style.display == 'block' && <div className=" absolute top-0 left-0 w-full h-full z-[10] " >

                    </div>
                }


                <div className=" flex w-[48%] justify-between h-full gap-[1px]   " >
                    {
                        AligmentType.map((aligment, index) => {
                            return (
                                <div style={{
                                    backgroundColor: aligment1Mode === aligment ? "#50cd89e4" : "",

                                }}
                                    onClick={() => {
                                        setAligment1mode(aligment)
                                         AligmentItems1[aligment].func()

                                    }}

                                    className={cn(' relative cursor-pointer flex justify-center hover:bg-input items-center h-full w-[100%] bg-accent  ', index === 0 ? 'rounded-l-[6px]' : index === AligmentType.length - 1 ? 'rounded-r-[6px] ' : '')} >
                                    <ToolTipPanel label={AligmentItems1[aligment].label}  >
                                        <div style={{
                                            color: "var(--forground)",

                                        }} className={cn(" cursor-pointer w-full  h-full   flex justify-center items-center ")} >
                                            {AligmentItems1[aligment].icon}
                                        </div>
                                    </ToolTipPanel>
                                </div>


                            )
                        })
                    }





                </div>


                <div className=" flex w-[48%] justify-between h-full gap-[1px]   " >
                    {
                        AligmentType.map((aligment, index) => {
                            return (
                                <div style={{
                                    backgroundColor: aligment2Mode === aligment ? "#50cd89e4" : "",

                                }}
                                    onClick={() => {
                                        setAligment2mode(aligment)
                                         AligmentItems2[aligment].func()

                                    }}
                                    className={cn(' relative cursor-pointer flex justify-center hover:bg-input items-center h-full w-[100%] bg-accent  ', index === 0 ? 'rounded-l-[6px]' : index === AligmentType.length - 1 ? 'rounded-r-[6px] ' : '')} >
                                    <ToolTipPanel label={AligmentItems2[aligment].label}  >
                                        <div style={{
                                            color: "var(--forground)",

                                        }} className={cn(" cursor-pointer w-full  h-full   flex justify-center items-center ")} >
                                            {AligmentItems2[aligment].icon}
                                        </div>
                                    </ToolTipPanel>
                                </div>


                            )
                        })
                    }





                </div>
            </div>


        </PanelRowContainer>

        // </SectionContainer>
    )

}