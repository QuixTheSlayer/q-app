import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui';
import { Maximize2, Square, type LucideIcon } from 'lucide-react';
import { PanelSection } from '@/components/PropertyPanelUI/kit/PanelSection';
import { item_align_x, item_align_y } from '@/consts/propertyField.consts';
import { useEditor } from '@/context/EditorContext';
import { ALIGN_ITEMS, FLEX_DIRECTION, FLEX_WRAP, JUSTIFY_CONTENT, LAYOUT, LAYOUT_TYPE, NODE_TYPE } from '@/types/node.enum';
import CSSUtils from '@/utils/CSS.utils';
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Select, SelectOption } from '@/components/ui/Select';
import React, { useEffect, CSSProperties, useState } from 'react';
import NumAndTextField from '@/components/ui/button/NumberAndTextField';
import { icons } from '@/components/ui/icons/Icons';
import AligmentSection from './PositionSection';
import SizeSection from './SizeSection';
import PositionControlSection from './PositionControlSection';
import { cn } from '@/libs/cn';
import { EnterIcon } from '@radix-ui/react-icons';
import { IoEnter, IoEnterOutline } from 'react-icons/io5';
import { LuPointer } from 'react-icons/lu';
import { CornerDownLeft, CornerDownLeftIcon, Monitor, Smartphone, Tablet } from 'lucide-react';
import { ToolTipPanel } from '@/components/ui/ToolTipPanel';
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { camelToSentenceCase } from '@/utils/string.utils';
import { DeviceScope } from '@/types/node.type';
import editorConfig from '@/configs/editor.config';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { usePanelStyle } from '@/hooks/usePanelStyle';

type layoutPropsType = 'row' | 'column' | 'grid'

const layoutType: layoutPropsType[] = ['row', 'column', 'grid']

const DEVICE_SCOPE_ICON: Record<DeviceScope, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
}

/** Desktop has no override bucket of its own — it IS the base style, so it never counts as "overridden". */
function hasResponsiveOverride(node: { style: React.CSSProperties; responsiveStyle?: { tablet?: React.CSSProperties; mobile?: React.CSSProperties } }, scope: DeviceScope, prop: keyof React.CSSProperties): boolean {
  if (scope === 'desktop') return false
  return node.responsiveStyle?.[scope]?.[prop] !== undefined
}

/**
 * Label suffix for a grid field that shows which device it's currently
 * editing (Columns/Rows Count write through the same responsive system as
 * every other style control — this just makes that scoping visible here,
 * since it isn't obvious from the plain NumberField alone) and whether this
 * specific property already has an override at that scope.
 */
function ResponsiveFieldHint({ scope, hasOverride, t }: { scope: DeviceScope; hasOverride: boolean; t: TFunction }) {
  if (!editorConfig.enable_responsive_editing) return null
  const Icon = DEVICE_SCOPE_ICON[scope]
  return (
    <ToolTipPanel label={hasOverride ? t('layoutSection.customValueSetFor', { scope }) : t('layoutSection.editingFor', { scope })}>
      <span className={cn('inline-flex items-center justify-center w-4 h-4 rounded-full', hasOverride ? 'text-primary' : 'text-muted-foreground/60')}>
        <Icon size={11} />
      </span>
    </ToolTipPanel>
  )
}



/** Padding and margin fold away in the redesigned panel; otherwise shown as before. */
function Fold({ title, icon, defaultOpen, children,className }: {className?:string; title: string; icon: LucideIcon; defaultOpen?: boolean; children: React.ReactNode }) {
  return editorConfig.enable_panel_redesign ? <PanelSection className={className} title={title} icon={icon} defaultOpen={defaultOpen}>{children}</PanelSection> : <>{children}</>
}

function LayoutSection() {
  const canvas = useEditor()
  const node = canvas?.focusedNode
  const panelStyle = usePanelStyle()
  const { t } = useTranslation('propertyPanel')

  const layoutItem: Record<layoutPropsType, { icon: () => React.ReactNode; label: string; func: () => void }> = {
    'row': {
      icon: () => icons.flexRow(),
      label: t('layoutSection.row'),
      func: () => canvas.updateNodeStyle({
        display: 'flex',
        flexDirection: "row",
        gridTemplateColumns: undefined,
        gridTemplateRows: undefined,
        justifyContent:'center'
      })
    },
    'column': {
      icon: () => icons.flexCol(),
      label: t('layoutSection.column'),
      func: () => canvas.updateNodeStyle({
        display: 'flex',
        flexDirection: "column",
        gridTemplateColumns: undefined,
        gridTemplateRows: undefined,
        alignItems:"center"
      })
    },
    'grid': {
      icon: () => icons.grid(),
      label: t('layoutSection.grid'),
      func: () => canvas.updateNodeStyle({
        display: 'grid',
        gridTemplateColumns: node?.style?.gridTemplateColumns || "repeat(2, 1fr)",
        gridTemplateRows: node?.style?.gridTemplateRows || "repeat(2, 1fr)",
        justifyItems: "center"

      })
    },
  }

  const [layoutMode, setLayoutMode] = useState<layoutPropsType>(
    node?.style?.display === 'grid' ? 'grid' : (node?.style.flexDirection as layoutPropsType) || 'row'
  )

  const [isWrap, setIsWrap] = useState(node?.style.flexWrap === 'wrap')

  if (!node) return <></>

  if (node.type !== NODE_TYPE.Container) return <PositionControlSection />

  return (
      <>
        <PositionControlSection />
        <SectionContainer hintKey="layoutType" label={t('layoutSection.layout')}>

          <PanelRowContainer layoutType='col' hintKey="layoutType" label={t('layoutSection.layoutType')} htmlFor='layout-type'>

            <div className=' flex gap-1 h-[30px] w-full relative  justify-start items-center ' >
              {
                layoutType.map((layout, index) => <div style={{
                  backgroundColor: layoutMode === layout ? "#50cd89e4" : "",

                }} onClick={() => {
                  setLayoutMode(layout)
                  layoutItem[layout].func()
                }} className={cn(' relative cursor-pointer flex justify-center items-center h-full w-[33%] bg-accent hover:bg-input text-foreground  ', index === 0 ? 'rounded-l-[6px]' : index === layoutType.length - 1 ? 'rounded-r-[6px] ' : '')} >

                  <ToolTipPanel label={layoutItem[layout].label}  >
                    <div style={{
                      color: "var(--forground)",

                    }} className='  min-w-[60px] w-full h-[30px] flex justify-center items-center ' >
                      {layoutItem[layout].icon()}
                    </div>

                  </ToolTipPanel>

                </div>



                )
              }

              {layoutMode !== 'grid' && <ToolTipPanel label={t('layoutSection.wrap')}  >

                <div
                  onClick={() => {
                    setIsWrap(prev => !prev)

                    canvas.updateNodeStyle({
                      flexWrap: isWrap ? 'nowrap' : 'wrap'
                    })
                  }} className={cn(' cursor-pointer w-[35px] h-[30px] flex justify-center items-center border border-primary rounded text-primary/90 ', isWrap ? ' bg-primary/80 text-white  ' : '')} >

                  <CornerDownLeftIcon size={16} />
                </div>
              </ToolTipPanel>}

            </div>
          </PanelRowContainer>



          {layoutMode !== 'grid' && <AligmentSection />}
          {
            layoutMode !== 'grid' && <PanelRowContainer layoutType="col" multiField className=" p-2 gap-3 " label={t('layoutSection.justifyContent')}>
              <div className="flex flex-col gap-1 w-full">
                <Select
                  aria-label={t('layoutSection.justifyContent')}
                  size="sm"
                  placement="bottom end"
                  items={JUSTIFY_CONTENT}
                  selectedKey={node.style.justifyContent ?? null}
                  onSelectionChange={(v) => canvas?.updateSelectedNodesStyle({ justifyContent: v as React.CSSProperties['justifyContent'] })}
                >
                  {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                </Select>

              </div>
            </PanelRowContainer>
          }
          <span className=" h-5 w-[100%] flex justify-start items-center " >
            <span className=" bg-muted h-[1px] w-[90%] " >

            </span>
          </span>

          <PanelRowContainer multiField className=' px-2 py-2 ' layoutType='col' hintKey="gap" props={['gap']} label={t('layoutSection.gap')} htmlFor='layout-gap'>
            <NumberField id='layout-gap'
              aria-label={t('layoutSection.gap')}
              className='w-[100%] '
              minValue={0}
              onCompositionEnd={v => console.log(v)}
              value={CSSUtils.extractEmValue(panelStyle.value('gap'))}
              onChange={v => {
                canvas?.updateNodeStyle({
                  gap: CSSUtils.setEmValue(v)
                })
              }}
              formatOptions={{

              }}
            >
              <NumberFieldInput className={'   '} size="sm" />
            </NumberField>
          </PanelRowContainer>

          {layoutMode === 'grid' && <>
            <span className=" h-5 w-[100%] flex justify-start items-center " >
              <span className=" bg-muted h-[1px] w-[90%] " ></span>
            </span>

            <PanelRowContainer className=' p-2 ' layoutType='col' hintKey="columns" label={t('layoutSection.columnsCount')} multiField htmlFor='grid-columns-count'>
              <NumberField id='grid-columns-count'
                aria-label={t('layoutSection.columnsCountAria')}
                minValue={1}
                className={'col-span-1'}
                value={CSSUtils.getGridCount(node.style?.gridTemplateColumns as string) || 1}
                onChange={v => {
                  canvas?.updateNodeStyle({
                    gridTemplateColumns: `repeat(${v}, 1fr)`,
                  })
                }}
              >
                <NumberFieldInput size="sm" hideStepper />
              </NumberField>
              <ResponsiveFieldHint scope={canvas.deviceScope} hasOverride={hasResponsiveOverride(node, canvas.deviceScope, 'gridTemplateColumns')} t={t} />
            </PanelRowContainer>

            {/* <PanelRowContainer layoutType='col' hintKey="columns" label='Column tracks' htmlFor='grid-columns-tracks'>
              <TextInput
                id='grid-columns-tracks'
                aria-label='Column track sizes'
                size='sm'
                className='col-span-2'
                placeholder='e.g. 1fr 2fr 100px'
                defaultValue={(node.style?.gridTemplateColumns as string) || ''}
                onBlur={(e) => {
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (!value) return
                  canvas?.updateNodeStyle({ gridTemplateColumns: value })
                }}
              />
            </PanelRowContainer> */}

            <PanelRowContainer className=' p-2 ' layoutType='col' hintKey="rows" label={t('layoutSection.rowsCount')} multiField htmlFor='grid-rows-count'>
              <NumberField id='grid-rows-count'
                aria-label={t('layoutSection.rowsCountAria')}
                minValue={1}
                className={'col-span-1'}
                value={CSSUtils.getGridCount(node.style?.gridTemplateRows as string) || 1}
                onChange={v => {
                  canvas?.updateNodeStyle({
                    gridTemplateRows: `repeat(${v}, 1fr)`,
                  })
                }}
              >
                <NumberFieldInput size="sm" hideStepper />
              </NumberField>
              <ResponsiveFieldHint scope={canvas.deviceScope} hasOverride={hasResponsiveOverride(node, canvas.deviceScope, 'gridTemplateRows')} t={t} />
            </PanelRowContainer>

            {/* <PanelRowContainer layoutType='col' hintKey="rows" label='Row tracks' htmlFor='grid-rows-tracks'>
              <TextInput
                id='grid-rows-tracks'
                aria-label='Row track sizes'
                size='sm'
                className='col-span-2'
                placeholder='e.g. auto 1fr 60px'
                defaultValue={(node.style?.gridTemplateRows as string) || ''}
                onBlur={(e) => {
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (!value) return
                  canvas?.updateNodeStyle({ gridTemplateRows: value })
                }}
              />
            </PanelRowContainer> */}

            <PanelRowContainer layoutType='col' hintKey="gridAutoFlow" label={t('layoutSection.autoFlow')} htmlFor='grid-auto-flow'>
              <Select
                id='grid-auto-flow'
                aria-label={t('layoutSection.gridAutoFlowAria')}
                size='sm'
                placeholder=''
                className='col-span-2'
                items={[
                  { value: 'row', label: t('layoutSection.row') },
                  { value: 'column', label: t('layoutSection.column') },
                  { value: 'dense', label: t('layoutSection.dense') },
                ]}
                selectedKey={node.style.gridAutoFlow || 'row'}
                onSelectionChange={v => {
                  canvas?.updateNodeStyle({
                    gridAutoFlow: v as React.CSSProperties['gridAutoFlow'],
                  })
                }}
              >
                {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
              </Select>
            </PanelRowContainer>

            <PanelRowContainer layoutType='col' hintKey="alignX" label={t('layoutSection.alignX')} htmlFor='layout-align-x'>
              <Select
                id='layout-align-x'
                aria-label={t('layoutSection.alignXAria')}
                size='sm'
                placeholder=''
                className='col-span-2'
                items={item_align_x}
                selectedKey={node.style.justifyItems ?? 'stretch'}
                onSelectionChange={(v) => {
                  canvas?.updateNodeStyle({
                    justifyItems: v as React.CSSProperties['justifyItems']
                  })
                }}
              >
                {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
              </Select>
            </PanelRowContainer>

            <PanelRowContainer layoutType='col' hintKey="alignY" label={t('layoutSection.alignY')} htmlFor='layout-align-y'>
              <Select
                id='layout-align-y'
                aria-label={t('layoutSection.alignYAria')}
                size='sm'
                placeholder=''
                className='col-span-2'
                items={item_align_y}
                selectedKey={node.style.alignItems ?? 'stretch'}
                onSelectionChange={v => {
                  canvas?.updateNodeStyle({
                    alignItems: v as React.CSSProperties['alignItems']
                  })
                }}
              >
                {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
              </Select>
            </PanelRowContainer>
          </>}

          <div className=' w-full '>
            {/* <SizeSection /> */}
          </div>




          <div className='w-full ' >
            <Fold  title={t('layoutSection.padding')} icon={Square}>
            <SectionContainer className=' border-b-none ' direction='col' hintKey="padding" label={t('layoutSection.padding')} >
              <PanelRowContainer className=' px-2 py-2 justify-start w-[100%] ' layoutType='col' multiField hintKey="padding" props={['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']} label={t('layoutSection.overall')}>
                <NumberField id='padding-x-l'
                  aria-label={t('layoutSection.paddingXLAria')}
                  className='col-span-1'
                  minValue={0}

                  value={CSSUtils.extractEmValue(panelStyle.value('padding'))}
                  onChange={v => {
                    canvas?.updateNodeStyle({
                      padding: CSSUtils.setEmValue(v),
                      paddingLeft: CSSUtils.setEmValue(v),
                      paddingRight: CSSUtils.setEmValue(v),
                      paddingTop: CSSUtils.setEmValue(v),
                      paddingBottom: CSSUtils.setEmValue(v)
                    })


                  }}
                  formatOptions={{

                  }}
                >
                  <NumberFieldInput size="sm" />
                </NumberField>
              </PanelRowContainer>
              <PanelRowContainer className='  px-2 py-0 justify-start items-center gap-3 ' layoutType='col' label=' ' multiField htmlFor='' >

                <PanelRowContainer className=' w-full  px-0 py-0 justify-start items-start gap-3  ' layoutType='row' label='' htmlFor='padding-x'>
                  <PanelRowContainer className=' px-0 py-0 justify-start w-[45%] ' layoutType='col' hintKey="paddingLeft" props={['paddingLeft']} label={t('layoutSection.left')}>
                    <NumberField id='padding-x-l'
                      aria-label={t('layoutSection.paddingXLAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('paddingLeft'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          paddingLeft: CSSUtils.setEmValue(v),

                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>
                  <PanelRowContainer className=' px-0 py-0 justify-start w-[45%] ' layoutType='col' hintKey="paddingRight" props={['paddingRight']} label={t('layoutSection.right')}>
                    <NumberField id='padding-x-r'
                      aria-label={t('layoutSection.paddingXRAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('paddingRight'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          paddingRight: CSSUtils.setEmValue(v),

                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>

                </PanelRowContainer>

                <PanelRowContainer className=' w-full  px-0 pb-1 justify-start items-start  gap-3 ' layoutType='row' label='' htmlFor='position-y'>

                  <PanelRowContainer className=' px-0 py-1 justify-start w-[45%] ' layoutType='col' hintKey="paddingTop" props={['paddingTop']} label={t('layoutSection.top')}>
                    <NumberField id='padding-Y-T'
                      aria-label={t('layoutSection.paddingYTAria')}
                      // className='col-span-1'
                      minValue={0}

                      onCompositionEnd={v => console.log(v)}
                      value={CSSUtils.extractEmValue(panelStyle.value('paddingTop'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          paddingTop: CSSUtils.setEmValue(v),
                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>

                  <PanelRowContainer className=' px-0 py-1 justify-start w-[45%] ' layoutType='col' hintKey="paddingBottom" props={['paddingBottom']} label={t('layoutSection.bottom')}>
                    <NumberField id='padding-Y-B'
                      aria-label={t('layoutSection.paddingYBAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('paddingBottom'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          paddingBottom: CSSUtils.setEmValue(v),
                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>


                </PanelRowContainer>
              </PanelRowContainer>


            </SectionContainer>
            </Fold>

            <Fold className="border-none" title={t('layoutSection.margin')} icon={Maximize2} defaultOpen={false}>
            <SectionContainer className=' border-none ' direction='col' hintKey="margin" label={t('layoutSection.margin')} >
              <PanelRowContainer className=' px-2 py-2 justify-start w-[100%] ' layoutType='col' multiField hintKey="margin" props={['margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']} label={t('layoutSection.overall')}>
                <NumberField id='padding-x-l'
                  aria-label={t('layoutSection.paddingXLAria')}
                  className='col-span-1'
                  minValue={0}
                  value={CSSUtils.extractEmValue(panelStyle.value('margin'))}
                  onChange={v => {
                    canvas?.updateNodeStyle({
                      margin: CSSUtils.setEmValue(v),
                      marginLeft: CSSUtils.setEmValue(v),
                      marginRight: CSSUtils.setEmValue(v),
                      marginTop: CSSUtils.setEmValue(v),
                      marginBottom: CSSUtils.setEmValue(v)
                    })


                  }}
                  formatOptions={{

                  }}
                >
                  <NumberFieldInput size="sm" />
                </NumberField>
              </PanelRowContainer>
              <PanelRowContainer className='  px-2 py-0 justify-start items-center gap-3 ' layoutType='col' label=' ' multiField htmlFor='' >

                <PanelRowContainer className=' w-full  px-0 py-0 justify-start items-start gap-3  ' layoutType='row' label='' htmlFor='margin-x'>
                  <PanelRowContainer className=' px-0 py-0 justify-start w-[45%] ' layoutType='col' hintKey="marginLeft" props={['marginLeft']} label={t('layoutSection.left')}>
                    <NumberField id='margin-x-l'
                      aria-label={t('layoutSection.marginXLAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('marginLeft'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          marginLeft: CSSUtils.setEmValue(v),

                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>
                  <PanelRowContainer className=' px-0 py-0 justify-start w-[45%] ' layoutType='col' hintKey="marginRight" props={['marginRight']} label={t('layoutSection.right')}>
                    <NumberField id='margin-x-r'
                      aria-label={t('layoutSection.marginXRAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('marginRight'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          marginRight: CSSUtils.setEmValue(v),

                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>

                </PanelRowContainer>

                <PanelRowContainer className=' w-full  px-0 pb-1 justify-start items-start  gap-3 ' layoutType='row' label='' htmlFor='position-y'>

                  <PanelRowContainer className=' px-0 py-1 justify-start w-[45%] ' layoutType='col' hintKey="marginTop" props={['marginTop']} label={t('layoutSection.top')}>
                    <NumberField id='margin-Y-T'
                      aria-label={t('layoutSection.marginYTAria')}
                      // className='col-span-1'
                      minValue={0}

                      onCompositionEnd={v => console.log(v)}
                      value={CSSUtils.extractEmValue(panelStyle.value('marginTop'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          marginTop: CSSUtils.setEmValue(v),
                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>

                  <PanelRowContainer className=' px-0 py-1 justify-start w-[45%] ' layoutType='col' hintKey="marginBottom" props={['marginBottom']} label={t('layoutSection.bottom')}>
                    <NumberField id='margin-Y-B'
                      aria-label={t('layoutSection.marginYBAria')}
                      className='col-span-1'
                      minValue={0}

                      value={CSSUtils.extractEmValue(panelStyle.value('marginBottom'))}
                      onChange={v => {
                        canvas?.updateNodeStyle({
                          marginBottom: CSSUtils.setEmValue(v),
                        })


                      }}
                      formatOptions={{

                      }}
                    >
                      <NumberFieldInput size="sm" />
                    </NumberField>
                  </PanelRowContainer>


                </PanelRowContainer>
              </PanelRowContainer>


            </SectionContainer>
            </Fold>


          </div>




        </SectionContainer>

      </>

    )
}

export default LayoutSection
