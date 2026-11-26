import { cn } from "@/libs/cn"
import { CSSProperties, useState } from "react"

interface InputProps {
    value: number,
    onChange: (value: number) => void
    className: string
    style: CSSProperties
}

export default function NumberInput(props: InputProps) {

    const { value, onChange, className, style } = props

    const [val, setVal] = useState<number>(value)

    return <div style={style} className={cn(className, " relative flex justify-between items-center cursor-text bg-primary/50 px-2 py-2 h-[40px] rounded w-full border border-primary/80 hover:border-primary ")} >
       
       <input step={2} className=" !bg-primary/80 p-2 " type="number" />
       
       
    </div>
}