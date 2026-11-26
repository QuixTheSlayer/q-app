import {LAYOUT} from "@/types/node.enum"
import {CanvasNode} from "../../types/node.type"

export const section_2: CanvasNode = {
  id: '1',
  type: 'container',
  contentType: 'section',
  layout: LAYOUT.Row,
  style: {
    display: 'grid',
    flexDirection: LAYOUT.Row,
    justifyItems: 'center',
    alignContent: 'center',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#00A35C',
    gap: '1.4em',
    minHeight: '28em'
  },
  children: [
    {
      id: '1.0',
      type: 'content',
      children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Ship site with style\"}]}]}",
      contentType: 'text',
      style: {
        fontSize: '2.59em',
        fontWeight: '700',
        color: '#FFFFFF',
      },
    },
    {
      id: '1.1',
      type: 'content',
      children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur\"}]}]}",
      contentType: 'text',
      style: {
        maxWidth: '28em',
        fontSize: '1.4em',
        fontWeight: 'normal',
        color: '#dfdfdf',
        textAlign: 'center'
      },
    },
    {
      id: '1.2',
      type: 'content',
      children: 'Learn more',
      contentType: 'button',
      style: {
        color: '#2f2f2f',
        backgroundColor: '#Fafafa',
        width: 'fit-content',
        height: '3em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: "1em",
        fontWeight: "semibold",
        borderRadius: "0.42em",
        paddingRight: "1em",
        paddingLeft: "1em",
      },
    },
  ]
}