export default function ProgressBar({ className, progressWidth, fill, width }: { className: string, progressWidth: number, fill?: string, width?: number }) {
    return (
        <div style={{
            width: width ?? 200
        }} className={`${className||''}  h-[3px] border rounded-x-full relative `} >
            <div style={{
                width: progressWidth,
                backgroundColor: fill ?? 'rgb(var(--primary))'
            }} className={` w-[1px] h-full  rounded-x-full relative `} >

            </div>
        </div>
    )
}