import {LAYOUT} from "@/types/node.enum";
import {CanvasNode} from "@/types/node.type";
import DndWebsite from "@/assets/demo/dnd-website.png"

export const section_1: CanvasNode = {
  id: '0',
  type: 'container',
  contentType: 'section',
  layout: LAYOUT.Column,
  style: {
    display: 'grid',
    minHeight: '28em',
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
  },
  children: [
    {
      id: '0.0',
      type: 'container',
      contentType: 'block',
      layout: LAYOUT.Row,
      style: {
        boxSizing: 'border-box',
        paddingTop: "5.6em",
        paddingRight: "2.8em",
        paddingBottom: "5.6em",
        paddingLeft: "5.6em",
        display: 'grid',
        gridTemplateColumns: '1fr',
        alignItems: 'center',
        gap: '1.4em'
      },
      children: [
        {
          id: '0.0.0',
          type: 'content',
          children: "{\"type\":\"doc\",\"content\":[{\"type\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":1},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":\"\",\"fontFamily\":\"\",\"fontSize\":\"2.13em\"}},{\"type\":\"bold\"}],\"text\":\"Landing Page Builder\"}]}]}",
          contentType: 'text',
          style: {
            // fontSize: '2.45em',
            // fontWeight: '700',
            // color: '#080808'
          },
        },
        {
          id: '0.0.1',
          type: 'content',
          children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":\"\",\"fontFamily\":\"\",\"fontSize\":\"1.33333em\"}}],\"text\":\"Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur exercitationem earum dolorum placeat\"}]}]}",
          contentType: 'text',
          style: {
            // fontSize: '1.4em',
            // fontWeight: 'normal',
            // color: '#7f7f7f'
          },
        },
        {
          id: '0.0.2',
          type: 'content',
          children: 'Get started',
          contentType: 'button',
          style: {
            width: 'fit-content',
            height: '3em',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: "1em",
            fontWeight: "semibold",
            color: "#F0F0F0",
            backgroundColor: "#2f2f2f",
            borderRadius: "0.42em",
            paddingRight: "1em",
            paddingLeft: "1em",
          },
        },
      ]
    },
    {
      id: '0.1',
      type: 'content',
      contentType: 'image',
      style: {
        display: 'grid',
        gap: '0.5em',
        gridTemplateColumns: '1fr',
        // justifyItems: 'center',
        // alignContent: 'center',
        paddingTop: '5em',
        paddingRight: '5em',
        paddingBottom: '5em',
        paddingLeft: '5em',
      },
      children: DndWebsite
    },
  ]
}

// const sortingStrategyMap = {
//   row: verticalListSortingStrategy,
//   column: horizontalListSortingStrategy,
//   grid: rectSwappingStrategy
// }