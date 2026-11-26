import { AnimationValueType, TriggerModeType } from "@/types/otherTypes";
import React from "react";

export const item_align: {
  value: React.CSSProperties['justifyItems'];
  label: string
}[] = [
    { value: 'stretch', label: 'Auto' },
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
  ];

export const item_align_x: {
  value: React.CSSProperties['placeContent'];
  label: string
}[] = [
    { value: "center", label: 'Center' },
    { value: "end", label: 'End' },
    { value: "start", label: 'Start' },
    { value: "space-between", label: 'Space Between' },
    { value: "space-around", label: 'Space Around' },
    { value: "space-evenly", label: 'Space Evenly' },
    { value: "stretch", label: 'Auto' },
  ];

export const grid_align_x: {
  value: React.CSSProperties['placeContent'];
  label: string
}[] = [
    { value: "center", label: 'Center' },
    { value: "end", label: 'End' },
    { value: "start", label: 'Start' },
    { value: "space-between", label: 'Space Between' },
    { value: "space-around", label: 'Space Around' },
    { value: "space-evenly", label: 'Space Evenly' },
    { value: "stretch", label: 'Auto' },
  ];

/** "static" is a sentinel, not a real CSS value — PositionControlSection maps it back to `undefined` so picking it fully clears position/offset/z-index styling instead of writing the literal string "static". */
export const item_position: {
  value: "static" | Exclude<React.CSSProperties["position"], undefined>;
  label: string
}[] = [
    {
      value: "static",
      label: "Static (Default)"
    },
    {
      value: "relative",
      label: "Relative"
    },
    {
      value: "sticky",
      label: "Sticky"
    },
    {
      value: "fixed",
      label: "Fixed"
    },
    {
      value: "absolute",
      label: "Absolute"
    },
  ]

export const item_align_y: {
  value: React.CSSProperties['justifyItems'];
  label: string
}[] = [
    { value: 'stretch', label: 'Auto' },
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
  ];


export const content_align: {
  value: React.CSSProperties['alignContent'];
  label: string
}[] = [
    { value: 'stretch', label: 'Auto' },
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' },
    { value: 'space-evenly', label: 'Space Evenly' },
  ]

export const height_mode: {
  keyValue: React.CSSProperties['height'];
  label: string,
  value: string
}[] = [
    { keyValue: '100%', label: 'Fill Container', value: "full" },
    { keyValue: 'fixed', label: 'Fixed', value: "fixed" },
    { keyValue: 'fit-content', label: 'Fit', value: "fit" },
    { keyValue: '90%', label: 'Percentage', value: "percentage" }
  ]

export const border_mode: {
  value: React.CSSProperties['border'];
  label: string
}[] = [
    { value: 'none', label: 'None' },
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
  ]

export const background_size: {
  value: React.CSSProperties["backgroundSize"];
  label: string
}[] = [
    { value: 'cover', label: 'Fit' },
    { value: 'contain', label: 'Contain' },
    { value: "auto", label: 'Auto' },
  ]

export const background_repeat: {
  value: React.CSSProperties["backgroundRepeat"];
  label: string
}[] = [
    { value: 'repeat', label: 'Repeat' },
    { value: 'no-repeat', label: 'No Repeat' },
  ]

export const background_position: {
  value: React.CSSProperties["backgroundPosition"];
  label: string
}[] = [
    { value: 'center', label: 'Center' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ]

export const trigger_mode: {
  value: TriggerModeType;
  label: string
}[] = [
    { value: 'active', label: 'Click' },
    { value: 'hover', label: 'Hover' },
    { value: 'auto', label: 'Auto' },
    { value: 'onView', label: 'On View' },
  ]


export const animation_type: {
  value: string;
  label: string
}[] = [ 
    { value: "backgroundColor", label: 'Background Color' },
    { value: "rotate", label: 'Rotate' },
    { value: "move", label: 'Move' },
    { value: "boxShadow", label: 'Box Shadow' },
    { value: "size", label: 'Size' },
    { value: "radius", label: 'Corner Radius' },
            { value: "zoom", label: 'Zoom' },
    { value: "opacity", label: 'Opacity' },
    { value: "scale", label: 'Scale' },
    { value: "translate", label: 'Translate' },
    { value: "skew", label: 'Skew' },
    { value: "blur", label: 'Blur' },
    { value: "textColor", label: 'Text Color' },
    { value: "preset", label: 'Animation Preset' },
    { value: "scrollTo", label: 'Scroll To' },
    { value: "show", label: 'Show' },
    { value: "hide", label: 'Hide' },
    { value: "toggle", label: 'Toggle' },
    { value: "slideIn", label: 'Slide In' },
    { value: "fadeIn", label: 'Fade In' },

        { value: "none", label: 'None' },

  ]

export const grid_mode: {
  value: React.CSSProperties['grid']
  label: string
}[] = [
    {
      value: 'auto',
      label: 'Auto'
    },
    {
      value: 'fixed',
      label: 'Fixed',
    }
  ]

export const fonts: {
  value: React.CSSProperties['fontFamily']
  label: string
}[] = [
    {
      value: 'Arial, sans-serif',
      label: 'Arial'
    },
    {
      value: 'serif',
      label: 'Serif'
    },
    {
      value: '"Helvetica Neue", Helvetica, sans-serif',
      label: 'Helvetica'
    },
    {
      value: '"Times New Roman", Times, serif',
      label: 'Times New Roman'
    },
    {
      value: 'Georgia, serif',
      label: 'Georgia'
    },
    {
      value: '"Courier New", Courier, monospace',
      label: 'Courier New'
    },
    {
      value: 'Verdana, sans-serif',
      label: 'Verdana'
    },
    {
      value: 'Tahoma, sans-serif',
      label: 'Tahoma'
    },
    {
      value: '"Trebuchet MS", sans-serif',
      label: 'Trebuchet MS'
    },
    {
      value: '"Lucida Sans", "Lucida Grande", sans-serif',
      label: 'Lucida Sans'
    },
    {
      value: '"Comic Sans MS", cursive, sans-serif',
      label: 'Comic Sans MS'
    }
  ];

export const text_type: {
  value: string | number,
  label: string,
  fontSize?: number,
}[] = [
    {
      value: 'paragraph',
      label: 'paragraph'
    },
    {
      value: 1,
      label: 'Heading 1',
      fontSize: 32,
    },
    {
      value: 2,
      label: 'Heading 2',
      fontSize: 22,
    },
    {
      value: 3,
      label: 'Heading 3',
      fontSize: 18,
    },
    {
      value: 4,
      label: 'Heading 4',
      fontSize: 16,
    },
  ]

// const CONTENT_ALIGN_DEFAULT = 'stretch'

// #ff00f5