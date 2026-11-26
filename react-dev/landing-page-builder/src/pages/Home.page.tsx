import FilePreviewCard from '@/components/HomePageUI/FilePreviewCard'
import TemplateCard from '@/components/HomePageUI/HomeTemplateCard'
import {newPage} from '@/data/file-templates/new-page.template'
import {localFiles} from '@/data/localdata/localfiles'
import {PageFile} from '@/types/contentFile.type'
import {NEW_NODES} from '@/consts/defaultNodeStyle'
import generateCryptoUID from '@/utils/generateCryptoUID'
import React from 'react'
import {useLocalStorage} from 'usehooks-ts'

function Home() {

  const [files, setFiles] = useLocalStorage('page-files', localFiles)

  const createNewPage = () => {
    const newFile: PageFile = {
      ...newPage,
      content: {
        ...newPage.content,
        children: [{
          ...NEW_NODES.section,
          id: generateCryptoUID()
        }]
      },
      id: generateCryptoUID(),
      created_at: new Date(),
      updated_at: new Date()
    }

    setFiles(files => {
      return [newFile, ...files]
    })

    // navigate(`editor/${newFile.id}`)
  }

  return (
    <div>
      <nav className='h-[60px] border-b'>
      </nav>
      <div className='overflow-y-scroll h-[calc(100vh-60px)]'>
        <div className='mt-6'>
          <div className='px-7 flex justify-between'>
            <div className='font-semibold text-lg'>Templates</div>
            {/* <button className='font-semibold text-[0.9rem] text-primary'>See More</button> */}
          </div>
          <div className='flex gap-5 mt-4 px-7 overflow-auto no-scrollbar '>
            <TemplateCard title='New Page' onClick={createNewPage} />
          </div>
        </div>
        <div className='mt-7 px-7 mb-4'>
          <div className='font-semibold text-lg'>My Pages</div>
          <div className='gap-y-6 gap-x-7 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 '>
            {/* <div className='mt-4 px-6 flex gap-5 flex-wrap '> */}
            {files.map(file => (
              <a href={`editor/${file.id}`} key={file.id}>
                <FilePreviewCard
                  thumbnailUrl={file.thumbnail}
                  title={file.name}
                  updatedAt={file.updated_at}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home