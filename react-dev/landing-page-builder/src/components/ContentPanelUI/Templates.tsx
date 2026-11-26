import React from 'react'
import MyComponent from './MyComponent'
import { useTranslation } from 'react-i18next'

function Templates () {
  const { t } = useTranslation('insert')
  return (
    <div className='p-4 bg-transparent  h-full gap-3 w-full'>
      <div className='pb-3'>
        <div className='font-medium text-[14px] text-foreground'>{t('templates.heading')}</div>
        <div className='text-xs text-muted-foreground'>{t('templates.description')}</div>
      </div>
      <MyComponent/>
    </div>
  )
}

export default Templates