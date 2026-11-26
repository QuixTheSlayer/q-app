import editorConfig from "@/configs/editor.config";
import { ContentType } from "@/types/node.type";
import { ChevronDown } from "lucide-react";
import { PropsWithChildren, useState } from "react";

interface FoldListProps extends PropsWithChildren {
    label: string,
    defaultFold?:boolean
}

export default function FoldList(props: FoldListProps) {
    const {label,defaultFold} = props
    const [fold, setFold] = useState(defaultFold??true)

    const childCount = (props.children as JSX.Element[] ).length

    	if (editorConfig.enabled_content_types[(props.label.toLocaleLowerCase() as ContentType )] === false) return null;


    return (
        <div style={{
            width: '100%',
            height: !fold ? 'fit-content' : '40px',
             transition:'0.3s all'
        }} className="h-[0px]   transition-transform flex flex-col justify-start items-start " >
            <div onClick={()=>{
                setFold(prev => !prev)
            }} className=" cursor-pointer flex justify-start w-full gap-2 h-[36px] items-center px-2  py-2 " >
               {<div style={{
                    rotate: fold ? '-90deg' : '0deg',
                    transition:'0.3s all'
                }} >
                    <ChevronDown className="text-forground" size={16} />
                </div>}
                <legend className=" text-[14px] tracking-wide text-forground " >{props.label} </legend>

                
            </div>
               { !fold && <div className=" flex flex-wrap  w-full  justify-start items-center p-2 gap-3" >
                {props.children}
                </div>}
            
        </div>
    )
}