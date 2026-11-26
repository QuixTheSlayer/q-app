import { describe, it, expect } from 'vitest'
import { buildChartConfig } from '@/utils/chart.utils'
import type { ChartNode } from '@/types/node.type'

function chartNode(overrides: Partial<ChartNode> = {}): ChartNode {
  return {
    id: 'chart-1',
    type: 'content',
    contentType: 'chart',
    style: {},
    chartType: 'bar',
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Series 1',
        data: [10, 20, 30],
        backgroundColor: ['#111111', '#222222', '#333333'],
      },
    ],
    showLegend: true,
    legendPosition: 'top',
    ...overrides,
  } as ChartNode
}

describe('buildChartConfig', () => {
  it('maps node labels straight through to chart data', () => {
    const { data } = buildChartConfig(chartNode())
    expect(data.labels).toEqual(['Jan', 'Feb', 'Mar'])
  })

  it('maps each dataset field to the chart.js dataset shape', () => {
    const { data } = buildChartConfig(chartNode())
    expect(data.datasets).toHaveLength(1)
    expect(data.datasets[0]).toMatchObject({
      label: 'Series 1',
      data: [10, 20, 30],
      backgroundColor: ['#111111', '#222222', '#333333'],
    })
  })

  it('maps multiple datasets independently', () => {
    const node = chartNode({
      datasets: [
        { label: 'A', data: [1, 2, 3], backgroundColor: ['#111'] },
        { label: 'B', data: [4, 5, 6], backgroundColor: ['#222'] },
      ],
    })
    const { data } = buildChartConfig(node)
    expect(data.datasets).toHaveLength(2)
    expect(data.datasets[0].label).toBe('A')
    expect(data.datasets[1].label).toBe('B')
  })

  it('carries optional borderColor/borderWidth through when present', () => {
    const node = chartNode({
      datasets: [{
        label: 'Series 1',
        data: [1, 2],
        backgroundColor: ['#111', '#222'],
        borderColor: ['#000', '#fff'],
        borderWidth: 2,
      }],
    })
    const { data } = buildChartConfig(node)
    expect(data.datasets[0].borderColor).toEqual(['#000', '#fff'])
    expect(data.datasets[0].borderWidth).toBe(2)
  })

  it('leaves borderColor/borderWidth undefined when not set on the dataset', () => {
    const { data } = buildChartConfig(chartNode())
    expect(data.datasets[0].borderColor).toBeUndefined()
    expect(data.datasets[0].borderWidth).toBeUndefined()
  })

  it('always sets responsive and maintainAspectRatio for the fixed-size wrapper div', () => {
    const { options } = buildChartConfig(chartNode())
    expect(options.responsive).toBe(true)
    expect(options.maintainAspectRatio).toBe(false)
  })

  it('reflects showLegend into the legend plugin display flag', () => {
    expect(buildChartConfig(chartNode({ showLegend: true })).options.plugins.legend.display).toBe(true)
    expect(buildChartConfig(chartNode({ showLegend: false })).options.plugins.legend.display).toBe(false)
  })

  it('reflects legendPosition into the legend plugin position', () => {
    expect(buildChartConfig(chartNode({ legendPosition: 'bottom' })).options.plugins.legend.position).toBe('bottom')
    expect(buildChartConfig(chartNode({ legendPosition: 'right' })).options.plugins.legend.position).toBe('right')
  })

  it('handles an empty labels/datasets chart without throwing', () => {
    const node = chartNode({ labels: [], datasets: [] })
    expect(() => buildChartConfig(node)).not.toThrow()
    const { data } = buildChartConfig(node)
    expect(data.labels).toEqual([])
    expect(data.datasets).toEqual([])
  })
})
