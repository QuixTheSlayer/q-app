import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { ChartDataset, ChartNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { Select, SelectOption } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const DEFAULT_POINT_COLOR = '#50cd89'

import withSizeGridTab from './withSizeGridTab'
function Chart() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as ChartNode

  const CHART_TYPE_OPTIONS = [
    { value: 'bar', label: t('chartPanel.chartTypeBar') },
    { value: 'pie', label: t('chartPanel.chartTypePie') },
    { value: 'line', label: t('chartPanel.chartTypeLine') },
  ]

  const LEGEND_POSITION_OPTIONS = [
    { value: 'top', label: t('chartPanel.legendPositionTop') },
    { value: 'bottom', label: t('chartPanel.legendPositionBottom') },
    { value: 'left', label: t('chartPanel.legendPositionLeft') },
    { value: 'right', label: t('chartPanel.legendPositionRight') },
  ]

  function updateDatasets(updater: (datasets: ChartDataset[]) => ChartDataset[]) {
    canvas.updateNode((prevNode) => ({
      ...prevNode as ChartNode,
      datasets: updater((prevNode as ChartNode).datasets),
    }))
  }

  function updateLabel(labelIndex: number, value: string) {
    canvas.updateNode((prevNode) => {
      const chartNode = prevNode as ChartNode
      const labels = [...chartNode.labels]
      labels[labelIndex] = value
      return { ...chartNode, labels }
    })
  }

  function addLabel() {
    canvas.updateNode((prevNode) => {
      const chartNode = prevNode as ChartNode
      const labels = [...chartNode.labels, t('chartPanel.defaultLabelName', { number: chartNode.labels.length + 1 })]
      const datasets = chartNode.datasets.map((dataset) => ({
        ...dataset,
        data: [...dataset.data, 0],
        backgroundColor: [...dataset.backgroundColor, DEFAULT_POINT_COLOR],
      }))
      return { ...chartNode, labels, datasets }
    })
  }

  function removeLabel(labelIndex: number) {
    canvas.updateNode((prevNode) => {
      const chartNode = prevNode as ChartNode
      const labels = chartNode.labels.filter((_, i) => i !== labelIndex)
      const datasets = chartNode.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.filter((_, i) => i !== labelIndex),
        backgroundColor: dataset.backgroundColor.filter((_, i) => i !== labelIndex),
      }))
      return { ...chartNode, labels, datasets }
    })
  }

  function addDataset() {
    if(node.datasets.length < 5){
    updateDatasets((datasets) => [
      ...datasets,
      {
        label: t('chartPanel.defaultSeriesName', { number: datasets.length + 1 }),
        data: node.labels.map(() => 0),
        backgroundColor: node.labels.map(() => DEFAULT_POINT_COLOR),
      },
    ])}
  }

  function removeDataset(datasetIndex: number) {
    updateDatasets((datasets) => datasets.filter((_, i) => i !== datasetIndex))
  }

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('chartPanel.chartTypeSectionLabel')}>
          <PanelRowContainer layoutType='col'>
            <Select
              aria-label={t('chartPanel.chartTypeAriaLabel')}
              size='sm'
              placement='bottom end'
              className='w-full'
              items={CHART_TYPE_OPTIONS}
              selectedKey={node.chartType}
              onSelectionChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as ChartNode,
                chartType: v as ChartNode['chartType'],
              }))}
            >
              {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
            </Select>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer label={t('chartPanel.legendSectionLabel')}>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showLegend}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as ChartNode,
                showLegend: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('chartPanel.showLegend')}</span>
          </PanelRowContainer>
          {node.showLegend && (
            <PanelRowContainer layoutType='col' label={t('chartPanel.legendPositionLabel')}>
              <Select
                aria-label={t('chartPanel.legendPositionAriaLabel')}
                size='sm'
                placement='bottom end'
                className='w-full'
                items={LEGEND_POSITION_OPTIONS}
                selectedKey={node.legendPosition}
                onSelectionChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as ChartNode,
                  legendPosition: v as ChartNode['legendPosition'],
                }))}
              >
                {(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
              </Select>
            </PanelRowContainer>
          )}
        </SectionContainer>

        <PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('chartPanel.labelsSectionLabel')}>
          {node.labels.map((label, labelIndex) => (
            <div key={labelIndex} className='flex items-center gap-2 px-2'>
              <TextInput
                className='flex-1'
                size='sm'
                value={label}
                onChange={(e) => updateLabel(labelIndex, e.target.value)}
              />
              <div
                onClick={() => removeLabel(labelIndex)}
                className='cursor-pointer text-destructive-foreground p-1.5 border border-destructive bg-destructive rounded'
              >
                <FiTrash size={16} />
              </div>
            </div>
          ))}
          <div
            onClick={addLabel}
            className=' gap-2 text-base flex text-center w-[100%] my-2 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
          >
            <CirclePlusIcon size={24} />
          </div>
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('chartPanel.dataSeriesSectionLabel')}>
          {node.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className='border rounded-lg overflow-hidden'>
              <div className='relative h-[48px] gap-3 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
                <TextInput
                  className='flex-1'
                  size='sm'
                  value={dataset.label}
                  onChange={(e) => updateDatasets((datasets) => {
                    const next = [...datasets]
                    next[datasetIndex] = { ...next[datasetIndex], label: e.target.value }
                    return next
                  })}
                />
                {node.datasets.length > 1 && (
                  <div
                   
                    className='  cursor-pointer rounded-r-lg min-w-[40px] flex  text-destructive justify-center items-center h-full'
                  >
                   
                  </div>
                )}
                {node.datasets.length > 1 && (
                  <div
                    onClick={() => removeDataset(datasetIndex)}
                    className=' absolute right-0 cursor-pointer rounded-r-lg min-w-[40px] flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center h-full'
                  >
                    <FiTrash size={18} />
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-2 p-2'>
                {node.labels.map((label, pointIndex) => (
                  <div key={pointIndex} className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground w-1/3 truncate'>{label}</span>
                    <input
                      type='number'
                      className='flex-1 h-8 px-2 text-sm rounded-md border border-input bg-input'
                      value={dataset.data[pointIndex] ?? 0}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        updateDatasets((datasets) => {
                          const next = [...datasets]
                          const data = [...next[datasetIndex].data]
                          data[pointIndex] = value
                          next[datasetIndex] = { ...next[datasetIndex], data }
                          return next
                        })
                      }}
                    />
                    <ColorPicker
                      value={dataset.backgroundColor[pointIndex] ?? DEFAULT_POINT_COLOR}
                      onChange={(v) => updateDatasets((datasets) => {
                        const next = [...datasets]
                        const backgroundColor = [...next[datasetIndex].backgroundColor]
                        backgroundColor[pointIndex] = v
                        next[datasetIndex] = { ...next[datasetIndex], backgroundColor }
                        return next
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
       { node.datasets.length < 5 &&  <div
            onClick={addDataset}
            className=' gap-2 text-base flex text-center w-[100%] my-2 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
          >
            <CirclePlusIcon size={24} />
          </div>}
        </PanelRowContainer>


        <SectionContainer hintKey="styleGroup" label={t('chartPanel.styleSectionLabel')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('chartPanel.background')}>
            <BackgroundPicker
              value={node.style?.backgroundColor || ''}
              onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
            />
          </PanelRowContainer>
          <BorderController />
        </SectionContainer>

        <Attributes />
      </div>
    )
}

export default withSizeGridTab(Chart)
