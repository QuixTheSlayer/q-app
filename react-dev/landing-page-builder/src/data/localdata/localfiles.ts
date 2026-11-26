import {sampleData1} from "@/data/sample1";
import {newPage} from "@/data/file-templates/new-page.template";
import {PageFile} from "@/types/contentFile.type";
import {sample_page_2} from "@/data/localdata/sample-pages/strategy_and_effectiveness_award";

export const localFiles: PageFile[] = [
  sample_page_2,
  {
    id: '1',
    title: 'Sample Page 1',
    content: sampleData1,
    created_at: new Date('04-05-2025'),
    updated_at: new Date('05-13-2025'),
    thumbnail: ''
  },
]

