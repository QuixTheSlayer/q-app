import { camelToSentenceCase } from "@/utils/string.utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/primitives/tooltip";
import React, { PropsWithChildren, ReactNode } from "react";

interface ToolTipPanelProps extends PropsWithChildren {
    label: string
}

export function ToolTipPanel(props: ToolTipPanelProps): JSX.Element {

    const { label, children } = props

    // console.log(label.length)

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200} >

                <TooltipTrigger   >
                    {children}
                </TooltipTrigger>

                <TooltipContent className=" z-[9999] " sideOffset={4}  >
                    <div  className={` px-2 py-1 border  rounded bg-popover text-popover-foreground text-[16px] `} >
                        {camelToSentenceCase(label)}
                    </div>
                </TooltipContent>

            </Tooltip>
        </TooltipProvider>


    )

}