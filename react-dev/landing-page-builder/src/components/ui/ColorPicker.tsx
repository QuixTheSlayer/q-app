import { rgbaToHexa } from '@uiw/color-convert';
import React, { useRef, useState } from 'react'
import { Button, Dialog, DialogTrigger, OverlayArrow, Popover, ProgressBar, Switch, } from 'react-aria-components';
import { SketchPicker } from 'react-color';
import { getIdFromUrl } from '@/utils/getIdFromUrl';
import PlainTextInput from './inputs/PlainTextInput';

const id = getIdFromUrl()
export interface Props {
  value?: string
  onChange?: (value: string) => void
  onChangeCompete?: (value: string) => void
}

function ColorPicker({
  value, onChange, onChangeCompete
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState('#000000')



  const indicatorRef = useRef(null)
  const onChangeHandler = (v: string) => {
    if (typeof onChange === 'function') {
      onChange(v)
    } else {
      setLocalValue(v)
    }
    if (indicatorRef.current) {
      const indicator = indicatorRef.current as HTMLButtonElement
      indicator.style.backgroundColor = v
    }
  }





  return (
    <DialogTrigger>

      <span className='w-full h-8 rounded-md text-foreground border-border  border focus-within:outline-ring focus-within:outline focus-within:outline-1 flex items-center px-[0.4rem] gap-2'>
        <Button ref={indicatorRef} aria-label='Open color picker' title='Open color picker' className='w-5 h-5 rounded border border-border bg-popover' style={{
          backgroundColor: value ?? localValue
        }}
          onPress={() => setIsOpen(prev => !prev)}
        ></Button>
        <PlainTextInput className='text-foreground/80' value={value ?? localValue}
          onChange={(e) => {
            const value = e.target.value;

            if (onChange) {
              onChange(value)
            } else {
              setLocalValue(value)
            }
          }}
        />
      </span>
      {/* Radix Dialog sets body { pointer-events: none } while any modal Dialog is open, re-enabling
          pointer-events only on its own DialogContent. Since this Popover portals to document.body as a
          sibling (not a descendant) of that DialogContent, it inherits pointer-events: none and becomes
          inert when this ColorPicker is used inside a modal Dialog (e.g. RandomLayoutDialog) — hence the
          explicit override here. z-index is likewise bumped above any dialog's own z-index override. */}
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} style={{ zIndex: 2147483647, pointerEvents: 'auto' }}>
        <OverlayArrow>
          <svg width={12} height={12} viewBox="0 0 12 12">
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
        <Dialog>

          <SketchPicker

            color={value ?? localValue}
            disableAlpha={false}
            onChangeComplete={(colors) => {
              onChangeHandler(rgbaToHexa({ r: colors.rgb.r, g: colors.rgb.g, b: colors.rgb.b, a: colors.rgb.a }))


            }}


          />




        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

export default ColorPicker