import { SquarePlus, SlidersVertical, Layers, Ellipsis } from "lucide-react"
import { PropsWithChildren, ReactNode, useState } from "react"

interface TabsType extends PropsWithChildren {
    icon: ({ size }: {
        size: number;
    }) => ReactNode;
    label: string;

}

type TabListType = Record<string, TabsType>

export default function Panel() {

    const tabs: TabListType = {
        "insert": {
            icon: ({
                size
            }: { size: number }): ReactNode => <SquarePlus size={size} />,
            label: 'Insert Element Panel',
            children: <></>

        },
        "properties": {
            icon: ({
                size
            }: { size: number }): ReactNode => <SlidersVertical size={size} />,
            label: 'Properties Panel',
            children: <></>
        },
        "layers": {
            icon: ({
                size
            }: { size: number }): ReactNode => <Layers size={size} />,
            label: 'Layer Panel',
            children: <></>
        },
        "page_setting": {
            icon: ({
                size
            }: { size: number }): ReactNode => <Ellipsis size={size} />,
            label: 'Page Setting Panel',
            children: <></>
        }
    }

    const [currentTab, setCurrentTab] = useState<keyof TabListType>('insert')

    const tabList = Object.keys(tabs)


    function changeTab(name: keyof TabListType) {
        if (name !== currentTab) {
            setCurrentTab(name)
        }
    }



    return (
        <div className=" relative p-2 left-0 top-0 h-[100dvh - 100px] w-[60px]  bg-background z-50 " >
            {/* TabWrapper */}
        <div className=" flex flex-col gap-3 justify-start items-start w-full h-auto min-h-[100px] " >
            {
                tabList.map(()=>{
                    return (
                        <div className={cn(' rounded ')} >

                        </div>
                    )
                })
            }
        </div>
        </div>
    )
}