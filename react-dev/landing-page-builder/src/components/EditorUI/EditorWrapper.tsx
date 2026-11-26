import {ArrowUturnLeftIcon, ArrowUturnRightIcon, MagnifyingGlassCircleIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon} from '@heroicons/react/24/outline';
import React, {createContext, KeyboardEvent, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState} from 'react'
import {useEditor} from '../../context/EditorContext';
import editorConfig from '@/configs/editor.config';
import {Toaster} from '@/components/ui/sonner';
import { delegate } from '@/utils/canvas.utils';
import { Grid2x2, Grid2x2X } from 'lucide-react';

function EditorWrapper ({children}: PropsWithChildren) {
  const canvas = useEditor()
  // const [zoomLevel, canvas?.setZoomLevel] = useState(0.6)

  useEffect(() => {
    if (!editorConfig.enable_zoom_controls) return

    const handleZoomControl = (event: KeyboardEvent) => {
      if((event.metaKey || event.ctrlKey) && event.key === '=') {
        // Increase zoom level
        canvas?.setZoomLevel(prev => {
          if(prev <= 1.5) return prev + 0.1
          else return prev
        })
        event.preventDefault(); // Prevent default browser zoom
      } else if((event.metaKey || event.ctrlKey) && event.key === '-') {
        // Decrease zoom level
        canvas?.setZoomLevel(prev => {
          if(prev >= 0.5) return prev - 0.1
          else return prev
        })
        event.preventDefault(); // Prevent default browser zoom
      } else if((event.metaKey || event.ctrlKey) && event.key === '0') {
        // Reset zoom level
        canvas?.setZoomLevel(1)
        event.preventDefault(); // Prevent default browser zoom
      }
    }

    document.addEventListener('keydown', handleZoomControl);

    return () => {
      document.removeEventListener('keydown', handleZoomControl)
    }
  }, [canvas?.zoomLevel, canvas?.setZoomLevel])

  const canvasRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if(canvasRef.current) {
      canvasRef.current.scrollIntoView({behavior: "instant", block: "nearest", inline: "center"});
    }
  }, [])

  /**
   * Keeps whichever node is focused visible on the canvas — click-to-focus
   * already puts the clicked node in view, but non-pointer focus changes
   * (arrow-key reorder, select-parent, group, keyboard-driven navigation)
   * have no cursor position to scroll toward, so without this the focused
   * node can silently move outside the visible canvas. `block: 'nearest'`
   * makes this a no-op when the node is already fully visible.
   */
  useEffect(() => {
    if (!canvas?.focused) return
    const focusedId = canvas.focused.id

    const scrollFocusedIntoView = () => {
      document.querySelector(`[data-id="${focusedId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }

    // Reordered nodes animate to their new spot via motion.div's layout
    // transition (250ms, see Nodes.tsx) — scrolling immediately targets the
    // element's pre-animation bounding box, which undershoots for a
    // downward move (the box is still above where it's animating to) while
    // happening to still land close enough for an upward move. Scroll once
    // right away for the already-in-place cases (click focus, etc.), then
    // again once the layout animation has settled.
    scrollFocusedIntoView()
    const timeoutId = setTimeout(scrollFocusedIntoView, 260)
    return () => clearTimeout(timeoutId)
  }, [canvas?.focused?.id, canvas?.focused?.path])

  return (
    <div onClick={(e)=>{

  if (e.currentTarget.tagName.toLocaleLowerCase() !== 'canvas') {
    canvas.clearFocus()
    if (editorConfig.enable_multi_select) canvas.clearSelection()
  }
    }}  className='h-full flex-1   bg-secondary-background relative overflow-auto'>
      {/* <div id='editor-wrapper' className='w-full h-full text-[16px] origin-center mx-auto absolute overflow-auto no-scrollbar' */}
      <div id='editor-wrapper' className='w-full h-full origin-center mx-auto  overflow-hidden no-scrollbar'
        style={{
          fontSize: `${editorConfig.root_font_size * canvas.zoomLevel}px`
        }}
      >
        {/* <div className='w-fit h-fit py-[400px] pt-[250px] px-[450px] mx-auto'> */}
        <div className='w-full  h-full   mx-auto flex items-start justify-start'>
          <div  ref={canvasRef} className='    '>
            {children}
          </div>
        </div>
      </div> 

      <div className='absolute z-[100] bottom-8 left-[45%]  flex rounded-lg shadow-floating bg-popover p-1 text-muted-foreground border border-border'>

        {editorConfig.enable_undo_redo && <div className='flex items-center gap-1 px-2 border-r border-border'>
          <button type='button' aria-label='Undo' title='Undo (Ctrl+Z)' className='w-9 h-9 flex items-center justify-center  rounded-md cursor-pointer hover:text-primary'
            onClick={() => canvas?.undo()}
          >
            <ArrowUturnLeftIcon width={20} height={20} className=' -rotate-45' />
          </button>
          <button type='button' aria-label='Redo' title='Redo (Ctrl+Shift+Z)' className='w-9 h-9 flex items-center justify-center  rounded-md cursor-pointer hover:text-primary'
            onClick={() => canvas?.redo()}
          >
            <ArrowUturnRightIcon width={20} height={20} className='rotate-45' />
          </button>
        </div>}
        {editorConfig.enable_zoom_controls && <div className='flex items-center gap-3 px-3'>
          <button type='button' aria-label='Zoom out' title='Zoom out (Ctrl+-)' className='text-muted-foreground hover:text-primary'
            onClick={() => {
              if(canvas?.zoomLevel > 0.4) canvas?.setZoomLevel(prev => prev - 0.1)
            }}
          >
            <MagnifyingGlassMinusIcon width={20} height={20} />
          </button>
          <span className='w-10 text-end text-foreground'>{Math.round(canvas?.zoomLevel * 100)}%</span>
          <button type='button' aria-label='Zoom in' title='Zoom in (Ctrl+=)' className='text-muted-foreground hover:text-primary'
            onClick={() => {
              if(canvas?.zoomLevel <= 1.5) canvas?.setZoomLevel(prev => prev + 0.1)
            }
            }
          >
            <MagnifyingGlassPlusIcon width={20} height={20} />
          </button>
        </div>}
        <div onClick={()=>canvas.setShowCanvasGridBg(!canvas.showCanvasGridBg)} className=' cursor-pointer flex items-center gap-1 px-2 border-l border-border ' >
            {  canvas.showCanvasGridBg ? <Grid2x2X size={17} /> : <Grid2x2 size={17} />}
        </div>
      </div>

      <Toaster position="top-center" richColors theme='light' />
      {/* <div className='flex'>
        <div className='w-[300px]'></div>
        <div className='flex-1 relative'>
          <div className='w-full h-full overflow-scroll'>
            <div className='w-[1440px] h-[2000px]'></div>
            <div className='w-[1440px] h-[2000px]'></div>
            <div className='w-[1440px] h-[2000px]'></div>
            <div className='w-[1440px] h-[2000px]'></div>
          </div>
          <div className='absolute bottom-4 z-10'></div>
        </div>
        <div className='w-[300px]'></div>
      </div> */}
    </div>

  )
}

export default EditorWrapper
