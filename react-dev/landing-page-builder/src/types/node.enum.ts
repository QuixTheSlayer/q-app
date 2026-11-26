import { Row } from "react-aria-components"

export const NODE_TYPE = {
  Container: "container",
  Content: "content",
} as const
// export type NODE_TYPE = keyof typeof NODE_TYPE


export const CONTENT_TYPE = {
  Root: "root",
  Section: "section",
  Block: "block",
  Text: "text",
  Image: "image",
  Button: "button",
  Table: "table",
} as const
// export type CONTENT_TYPE = keyof typeof CONTENT_TYPE


export const LAYOUT = {
  Row: "row",
  Column: "column",
  Grid: "grid",
} as const

export const LAYOUT_TYPE = [
  {
    value: "flex",
    label: "Flex",
  },
  {
    value: "grid",
    label: "Grid",
  }
]
export const FLEX_DIRECTION = [{

  value: "row",
  label: "Row",
},
{

  value: "column",
  label: "Column",
},
{

  value: "column-reverse",
  label: "Column Reverse",
},
{
  value: "row-reverse",
  label: "Row Reverse",
}
]

export const JUSTIFY_CONTENT = [
  {
    value: "flex-start",
    label: "Start",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "flex-end",
    label: "End",
  },
  {
    value: "space-between",
    label: "Space Between",
  },
  {
    value: "space-around",
    label: "Space Around",
  },
  {
    value: "space-evenly",
    label: "Space Evenly",
  },

]

export const ALIGN_ITEMS = [
  {
    value: "stretch",
    label: "Auto",
  },
  {
    value: "flex-start",
    label: "Start",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "flex-end",
    label: "End",
  },
]

export const ALIGN_CONTENT = [
  {
    value: "stretch",
    label: "Auto",
  },
  {
    value: "flex-start",
    label: "Start",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "flex-end",
    label: "End",
  },
  {
    value: "space-between",
    label: "Space Between",
  },
  {
    value: "space-around",
    label: "Space Around",
  },
  {
    value: "space-evenly",
    label: "Space Evenly",
  },
]

export const FLEX_WRAP = [
  {
    value: "nowrap",
    label: "No Wrap",
  },
  {
    value: "wrap",
    label: "Wrap",
  },
  {
    value: "wrap-reverse",
    label: "Wrap Reverse",
  },
]


// export type LAYOUT = keyof typeof LAYOUT