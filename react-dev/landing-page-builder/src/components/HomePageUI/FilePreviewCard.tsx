import React from 'react'
import moment from 'moment'

interface Props {
  thumbnailUrl: string
  title?: string
  updatedAt: Date
}

function FilePreviewCard ({thumbnailUrl, title, updatedAt}: Props) {
  return (
    <div className='min-w-[150px] '>
      <div className='h-[250px] border border-slate-200 rounded-md overflow-hidden bg-gray-100/70'
      >
        <img src={thumbnailUrl} className='mx-auto w-[85%] max-w-[180px] mt-4 '
          style={{
            boxShadow: '0px 0px 0px 1px rgba(64,87,109,.04),0px 2px 4px -1px rgba(64,87,109,.3),inset 0 0 0 1px rgba(0,0,0,.1)'
          }}
        />
      </div>
      <div className='mt-0.5 capitalize text-[0.9rem] text-gray-700 font-medium truncate'>{title || 'Untitled'}</div>
      <div className='mt-0.25 text-sm text-gray-500 truncate'>Edited {moment(updatedAt).fromNow()}</div>
    </div>
  )
}

export default FilePreviewCard