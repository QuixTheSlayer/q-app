import React, {ReactNode} from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import {GrAdd} from "react-icons/gr";
import {IoShapesOutline} from "react-icons/io5";
import {PiTreeViewLight} from "react-icons/pi";
import {cn} from '@/libs/cn';
import Insert from '@/components/ContentPanelUI/Insert';
import Layers from '@/components/ContentPanelUI/Layers';
import Templates from '@/components/ContentPanelUI/Templates';
import { useTranslation } from 'react-i18next';

function ContentPanel () {
  const { t } = useTranslation('insert')

  return (
    <div  className='h-[100%] bg-card w-full  border-l border-border '>
      <TabsPrimitive.Root  orientation='vertical' defaultValue='insert'
        className=' flex flex-col  h-full w-full justify-center items-center !bg-card/80 '
      >
        <TabsPrimitive.List className=' flex justify-around  items-center  border-b gap-5 w-[80%] overflow-auto py-2'>
          <TabTrigger
            value='insert'
            label={t('tabs.insertLabel')}
            icon={<GrAdd size={20} />}
          />
          <TabTrigger
            value='layers'
            label={t('tabs.layersLabel')}
            icon={<PiTreeViewLight size={24} />}
          />
          <TabTrigger
            value='templates'
            label={t('tabs.templatesLabel')}
            icon={<IoShapesOutline size={23} />}
          />
        </TabsPrimitive.List>

        <TabContent
          value='insert'
          title={t('tabs.insertTitle')}
          className='shadow-none'
          >
          <Insert />
        </TabContent>
        <TabContent
          value='templates'
          title={t('tabs.templatesTitle')}
          className='shadow-none'
          >
          <Templates />
        </TabContent>
        <TabContent
          value='layers'
          title={t('tabs.layersTitle')}
          className='shadow-none'
          >

          <Layers />
        </TabContent>
      </TabsPrimitive.Root>
    </div>
  )
}

export default ContentPanel


function TabTrigger ({label, icon, ...props}: TabsPrimitive.TabsTriggerProps & {
  label: string
  icon: ReactNode,
}) {
  return (
    <TabsPrimitive.Trigger {...props}
      className='flex flex-col items-center gap-0.5 group'
    >
      <div className='w-[42px] aspect-square group-hover:bg-primary/20 rounded-md flex items-center justify-center text-muted-foreground group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary'>
        {icon}
      </div>
      <div className='text-xs text-muted-foreground group-data-[state=active]:text-primary '>{label}</div>
    </TabsPrimitive.Trigger>
  )
}

function TabContent ({title, children, className, ...props}: TabsPrimitive.TabsContentProps & {
  title: string
}) {
  return (
    <TabsPrimitive.Content className={cn('h-full w-full bg-card/40 flex flex-col items-stretch justify-stretch shadow-sm border-r data-[state=inactive]:hidden', className)} {...props}>
      <div className='p-4 text-[16px] pb-3 font-semibold'>
        {title}
      </div>
      {children}
    </TabsPrimitive.Content>
  )
}
