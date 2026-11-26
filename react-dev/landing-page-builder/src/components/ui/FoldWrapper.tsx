import { useState } from "react";
import { ChevronLeft, ChevronRight} from "lucide-react";

export default function FoldWrapper({
    direction,
    defaultSize,
    changeTo,
    children,
    defaultFold,
    dataTour,
    isFold: controlledIsFold,
    onFoldChange,
}: {
    direction: "left" | "right" ,
    defaultSize?: number
    changeTo: number
    children: React.ReactNode
    defaultFold?:boolean
    dataTour?: string
    /** Optional controlled fold state — e.g. the onboarding tour needs to
     * force this panel open, and it has no other way to reach state that's
     * otherwise entirely internal to this component. Omit both props to
     * keep the original uncontrolled (click-to-toggle-own-state) behavior. */
    isFold?: boolean
    onFoldChange?: (isFold: boolean) => void
}) {
    const [internalIsFold, setInternalIsFold] = useState(defaultFold??false);
    const isFold = controlledIsFold ?? internalIsFold

    const isonDirection = (dir: typeof direction) => direction === dir

    return (
        <div style={{
            transition: "0.3s all"
        }} className={"builder-panel bg-card relative  h-full w-auto "} >

            {<div data-tour={dataTour} onClick={() => {
                const next = !isFold
                onFoldChange?.(next)
                if (controlledIsFold === undefined) setInternalIsFold(next)
            }} style={{
                top: 0,
                left: direction === "left" ? -30 : "unset",
                right: direction === "right" ? -30 : "unset",
                bottom:  "",
                transform: isonDirection("left") ? "scale(-1)" : "",

                width: 30,
                height: 60

            }} className={" cursor-pointer flex justify-center items-center absolute  rounded-r-lg z-[9999] text-primary   border !border-foreground bg-card "} >
                {!isFold ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>}

            {<div className={' bg-card  '} style={{
                width: isFold ? changeTo : defaultSize,
                transition: "0.3s "
            }} >
                {!isFold && children}
            </div>}

        </div>
    )
}
