import {PageFile} from "@/types/contentFile.type";
import {LAYOUT} from "@/types/node.enum";
import {NEW_NODES} from "@/consts/defaultNodeStyle";
import generateCryptoUID from "@/utils/generateCryptoUID";

export const newPage: PageFile = {
  id: 'sample_page_2',
  title: '',
  content: {
      id: 'root',
      type: 'container',
      contentType: 'root',
      layout: 'row',
      style: {
        width: '75em'
      },
    children: [
    ]
  },
  created_at: new Date(),
  updated_at: new Date(),
  thumbnail: ''
}