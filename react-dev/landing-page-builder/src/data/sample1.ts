import {section_1} from "@/data/templates/section1.template";
import {CanvasNode} from "../types/node.type";
import {grid_template_1} from "./templates/grid1.template";
import {section_2} from "./templates/section2.template";
import {row_template_1} from "./templates/row1.template";

export const sampleData1: CanvasNode = {
  id: 'root',
  type: 'container',
  contentType: 'root',
  layout: 'row',
  style: {
    width: '75em'
  },
  children: [
    section_1,
    section_2,
    grid_template_1,
    // row_template_1,
  ]
};
