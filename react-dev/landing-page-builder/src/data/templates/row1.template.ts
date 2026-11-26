import {gridTemplateColumns} from "@/consts/defaultNodeStyle";
import {CanvasNode} from "../../types/node.type";

export const row_template_1: CanvasNode = {
  id: '2',
  type: 'container',
  contentType: 'section',
  layout: 'column',
  style: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns['column'],
    gridAutoFlow: 'column',
    gap: '0.5em',
    minHeight: '28em',
    padding: '1.5em',
    height: '',
    width: ''
  },
  children: [
    {
      id: 'block 1',
      type: 'container',
      contentType: 'block',
      layout: 'row',
      style: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns['row'],
        // gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        // gridTemplateColumns: '1fr',
        gridAutoFlow: 'row',
        gap: '0.5em',
        padding: '1em',
        height: '100%',
        width: '100%'
      },
      children: []
    },
    {
      id: 'block 2',
      type: 'container',
      contentType: 'block',
      layout: 'row',
      style: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns['row'],
        // gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        // gridTemplateColumns: '1fr',
        gridAutoFlow: 'row',
        gap: '0.5em',
        padding: '1em',
        height: '100%',
        width: '100%'
      },
      children: []
    },
    {
      id: 'block 3',
      type: 'container',
      contentType: 'block',
      layout: 'row',
      style: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns['row'],
        // gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        // gridTemplateColumns: '1fr',
        gridAutoFlow: 'row',
        gap: '0.5em',
        padding: '1em',
        height: '100%',
        width: '100%'
      },
      children: []
    },
    {
      id: 'block 4',
      type: 'container',
      contentType: 'block',
      layout: 'row',
      style: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns['row'],
        // gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        // gridTemplateColumns: '1fr',
        gridAutoFlow: 'row',
        gap: '0.5em',
        padding: '1em',
        height: '100%',
        width: '100%'
      },
      children: []
    },
  ]
}