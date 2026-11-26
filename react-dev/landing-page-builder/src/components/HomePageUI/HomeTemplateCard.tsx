import React from 'react'
import moment from 'moment'

interface Props {
  title?: string
  onClick?: () => void
}

function TemplateCard({title, onClick}: Props) {

  return (
    <div>
      <div className=' w-[200px] h-[250px] border border-slate-200 rounded-md'
        onClick={onClick}
      >

      </div>
      <div className='mt-0.5 capitalize text-[0.9rem] text-gray-700 font-medium truncate'>{title || 'Untitled'}</div>
    </div>
  )
}

export default TemplateCard