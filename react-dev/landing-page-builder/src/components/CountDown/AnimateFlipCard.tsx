import { useEffect, useRef, useState } from "react";
import './flipcard.css'
interface FlipCardProps {
  val: number;
  label: string,
  accent: boolean
}

// export default function FlipCard( {value} :{value: FlipCardProps}) {
//     const [display, setDisplay] = useState(value.val);
//     const [prev, setPrev] = useState(value.val);
//     const [flip, setFlip] = useState(false);

//     const first = useRef(true);

//     useEffect(() => {
//         if (first.current) {
//             first.current = false;
//             return;
//         }

//         if (value.val === display) return;

//         setPrev(display);
//         setFlip(true);

//         const t = setTimeout(() => {
//             setDisplay(value.val);
//             setFlip(false);
//         }, 400);

//         return () => clearTimeout(t);
//     }, [value]);

//     return (
//         <div className={` flip-card  rounded-md flex justify-center items-center    border ${value.accent
//             ? "bg-[#EEEDFE] border-[rgba(108,92,231,.25)]"
//             : "bg-muted border-border"
//             }`}>
//             {/* top static */}
//             <div className={` top  rounded-md flex      ${value.accent
//             ? "bg-[#EEEDFE] border-[rgba(108,92,231,.25)]"
//             : "bg-muted border-border"
//             }`}>{}</div>

//             <span className=" h-[2px] w-[90%] bg-slate-300/80 absolute z-10 " ></span>

//             {/* bottom static */}
//             <div className={` bottom  rounded-md flex      ${value.accent
//             ? "bg-[#EEEDFE] border-[rgba(108,92,231,.25)]"
//             : "bg-muted border-border"
//             }`}>{display}</div>

//             {/* animated top */}
//             {flip && (
//                 <div className={` flip-top  rounded-md flex      ${value.accent
//             ? "bg-[#EEEDFE] border-[rgba(108,92,231,.25)]"
//             : "bg-muted border-border"
//             }`}>
//                     {prev}
//                 </div>
//             )}

//             {/* animated bottom */}
//             {flip && (
//                 <div className={` flip-bottom  rounded-md      ${value.accent
//             ? "bg-[#EEEDFE] border-[rgba(108,92,231,.25)]"
//             : "bg-muted border-border"
//             }`}>
//                     {display}
//                 </div>
//             )}
//         </div>
//     );
// }




export default function FlipCard({ value }: { value: FlipCardProps }) {
  const [current, setCurrent] = useState(value.val);
  const [previous, setPrevious] = useState(value.val);
  const [flipping, setFlipping] = useState(false);

  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    if (value.val === current) return;

    setPrevious(current);
    setFlipping(true);

    const timer = setTimeout(() => {
      setCurrent(value.val);
      setFlipping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const oldText = String(previous).padStart(2, "0");
  const newText = String(current).padStart(2, "0");

  return (
    <div className="relative w-[76px] h-[76px] rounded-md overflow-hidden perspective-[1200px]">

      {/* Top */}
      <div style={{
        backgroundColor: "var(--countdown-secondary)",
        // backgroundBlendMode: 'color-dodge'

      }} className="absolute top-0 h-1/2 w-full flex justify-center items-end overflow-hidden rounded-t-md ">
        <div style={{
          color: "var(--countdown-primary)"
        }} className="flex justify-center transition-all items-end h-full absolute top-[65%] text-[32px] font-semibold ">
          {flipping ? Number(oldText) : Number(newText)}
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        backgroundColor: "var(--countdown-secondary)",
        // backgroundBlendMode: 'color-dodge'

      }} className="absolute bottom-0 h-1/2 w-full flex justify-center items-start overflow-hidden rounded-b-md ">
        <div style={{
          color: "var(--countdown-primary)"
        }} className="flex justify-center items-start h-full absolute bottom-[10%] text-[32px]   font-semibold  -translate-y-1/2">
          {flipping ? Number(oldText) : Number(newText)}
        </div>
      </div>

      {flipping && (
        <>
          {/* Top animation */}
          <div style={{
            backgroundColor: "var(--countdown-secondary)",
            // backgroundBlendMode: 'color-dodge'

          }} className="flip-top absolute top-0 h-1/2 w-full flex justify-center items-end overflow-hidden rounded-t-md ">
            <div style={{
              color: "var(--countdown-primary)"
            }} className="flex justify-center items-end h-full absolute top-[65%] text-[32px] font-semibold ">
              {Number(oldText)}
            </div>
          </div>

          {/* Bottom animation */}
          <div style={{
            backgroundColor: "var(--countdown-secondary)",
            // backgroundBlendMode: 'color-dodge'

          }} className="flip-bottom absolute bottom-0 h-1/2 w-full flex justify-center items-start overflow-hidden rounded-b-md ">
            <div style={{
              color: "var(--countdown-primary)"
            }} className="flex justify-center items-start h-full absolute bottom-[10%] text-[32px] font-semibold  -translate-y-1/2">
              {Number(oldText)}
            </div>
          </div>
        </>
      )}

      <div style={{
        backgroundColor: "var(--countdown-primary)"
      }} className="absolute left-0 z-10 right-0 top-1/2 h-px " />
    </div>
  );
}