import { ActionList, PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker';
import { AiOutlinePlus } from "react-icons/ai";
import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import withSizeGridTab from './withSizeGridTab'
import { XIcon } from 'lucide-react'
import { Select, SelectOption } from '@/components/ui/Select'
import { CanvasNode, TabNode } from '@/types/node.type';
import { blockNode, textNode } from '@/utils/nodeBuilders';
import { useTranslation } from 'react-i18next'


function TabPanel() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas.focusedNode


  const tabType = [{
    value: 'vertical',
    label: t('tabPanel.vertical')
  },
  {
    value: 'horizontal',
    label: t('tabPanel.horizontal')
  }
  ]
  const tabLabels = node?.contentType === 'tab'
    ? (node.childrenAreTabs ? (node.children ?? []).map((c, i) => c?.name || `Tab ${i + 1}`) : node.tabs.map(t => t.name))
    : []

  if (node?.contentType === 'tab')

    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>
        <SectionContainer label={t('tabPanel.tabs')}>
          <div className='flex flex-col'>
            {tabLabels.map((label, idx) => (
              <PanelRowContainer key={idx} className='!py-[2px] relative'>
                <TextInput className='col-span-3' placeholder={t('tabPanel.urlPlaceholder')} size="sm"
                  value={label}
                  onChange={v => {
                    canvas.updateNode(prev => {
                      const tabNode = prev as TabNode
                      // With childrenAreTabs the label is the child's name.
                      if (tabNode.childrenAreTabs) {
                        const next = [...(tabNode.children ?? [])]
                        next[idx] = { ...next[idx], name: v.target.value }
                        return { ...tabNode, children: next }
                      }
                      const newTabs = [...tabNode.tabs];
                      newTabs[idx] = { ...newTabs[idx], name: v.target.value };
                      return { ...tabNode, tabs: newTabs };
                    })
                  }}
                />
                <button
                  onClick={() => {
                    canvas.updateNode(prev => {
                      const tabNode = prev as TabNode
                      if (tabNode.childrenAreTabs) {
                        return { ...tabNode, children: (tabNode.children ?? []).filter((_, i) => i !== idx) }
                      }
                      return { ...tabNode, tabs: tabNode.tabs.filter((_, i) => i !== idx) }
                    })
                  }}
                  className='absolute right-0 top-4 rounded-full p-1 flex items-center hover:text-destructive z-2'>
                  <XIcon size={16} />
                </button>
              </PanelRowContainer>
            ))}
            <ActionList
              className='mt-2'
              onClick={() => {
                canvas.updateNode((prev) => {
                  const node = prev as TabNode
                  if (node.childrenAreTabs) {
                    const name = t('tabPanel.newTabName', { number: (node.children?.length ?? 0) + 1 })
                    const panel = { ...blockNode([textNode(name)], { width: '100%', padding: '1em' }), name }
                    return { ...node, children: [...(node.children ?? []), panel] } as CanvasNode
                  }
                  const nextTabNum = node.tabs.length + 1;

                  const newTab = {
                    name: t('tabPanel.newTabName', { number: nextTabNum }),
                    children: [
                      {
                        id: `tab${nextTabNum}-text`,
                        type: "content",
                        contentType: "text",
                        style: {},
                        children:
                          `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"${t('tabPanel.newTabContent', { number: nextTabNum })}"}]}]}`,
                        collapsable: false,
                      },
                    ],
                  };

                  return {
                    ...node,
                    tabs: [...node.tabs, newTab],
                  } as CanvasNode;
                });
              }}
            >
              <AiOutlinePlus size={16} />
              {t('tabPanel.addNewTab')}
            </ActionList>
          </div>
        </SectionContainer>

        <SectionContainer label={t('tabPanel.type')}>
          <Select

            id="size-height-format"
            aria-label={t('tabPanel.heightFormat')}
            size="sm"
            placement="top start"
            placeholder=""
            className="col-span-1"
            items={tabType}
            selectedKey={node.tabType}
            onSelectionChange={(v) => {

              canvas.updateNode((prevNode) => ({
                ...prevNode,
                tabType: v as 'vertical' | 'horizontal'
              }))

            }}
          >
            {(item) => (
              <SelectOption id={item.value}>{item.label}</SelectOption>
            )}
          </Select>

        </SectionContainer>

            
          <PanelRowContainer layoutType='col' className=" w-full px-0 " hintKey="textColor" label={t('tabPanel.activeTabColor')}>
            <ColorPicker 
              value={node?.color?.active || '#1a85ff'}
              onChange={v => {
                canvas.updateNode((node) => ({
                  ...node as TabNode,
                  color:{
                    ...(node as TabNode)?.color,
                    active:v
                  }
                }))
              }}
            />
          </PanelRowContainer>

        <Attributes />

      </div>
    )
}

export default withSizeGridTab(TabPanel)