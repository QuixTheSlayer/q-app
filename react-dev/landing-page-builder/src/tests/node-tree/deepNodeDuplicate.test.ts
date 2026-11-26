import { describe, it, expect } from 'vitest'
import deepNodeDuplicate from '@/utils/deepNodeDuplicate'
import type { CanvasNode, LayoutNode, ContentNode, ChartNode } from '@/types/node.type'

function textNode(id: string, text = 'hi'): ContentNode {
  return { id, type: 'content', contentType: 'text', style: { color: 'red' }, children: text } as ContentNode
}

function containerNode(id: string, children: CanvasNode[]): LayoutNode {
  return { id, type: 'container', contentType: 'section', layout: 'row', style: {}, children } as LayoutNode
}

function chartNode(id: string): ChartNode {
  return {
    id,
    type: 'content',
    contentType: 'chart',
    style: {},
    chartType: 'bar',
    labels: ['A', 'B'],
    datasets: [{ label: 'Series 1', data: [1, 2], backgroundColor: ['#111', '#222'] }],
    showLegend: true,
    legendPosition: 'top',
  } as ChartNode
}

describe('deepNodeDuplicate', () => {
  it('assigns a new id to a leaf node while preserving other fields', () => {
    const original = textNode('leaf-1', 'hello')
    const duplicate = deepNodeDuplicate(original) as ContentNode

    expect(duplicate.id).not.toBe(original.id)
    expect(duplicate.children).toBe('hello')
    expect(duplicate.contentType).toBe('text')
  })

  it('assigns a new id to a container node and its children', () => {
    const child = textNode('child-1')
    const original = containerNode('container-1', [child])
    const duplicate = deepNodeDuplicate(original) as LayoutNode

    expect(duplicate.id).not.toBe(original.id)
    expect(duplicate.children).toHaveLength(1)
    expect(duplicate.children[0].id).not.toBe(child.id)
  })

  it('recursively duplicates deeply nested children', () => {
    const grandchild = textNode('grandchild-1')
    const child = containerNode('child-1', [grandchild])
    const root = containerNode('root-1', [child])

    const duplicate = deepNodeDuplicate(root) as LayoutNode
    const duplicatedChild = duplicate.children[0] as LayoutNode
    const duplicatedGrandchild = duplicatedChild.children[0] as ContentNode

    expect(duplicatedChild.id).not.toBe(child.id)
    expect(duplicatedGrandchild.id).not.toBe(grandchild.id)
  })

  it('produces unique ids for every node in the duplicated tree', () => {
    const root = containerNode('root-1', [textNode('a'), textNode('b')])
    const duplicate = deepNodeDuplicate(root) as LayoutNode

    const ids = [duplicate.id, ...duplicate.children.map((c) => c.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('deep clones nested style objects so mutating the duplicate does not affect the original', () => {
    const original = textNode('leaf-1')
    const duplicate = deepNodeDuplicate(original) as ContentNode

    duplicate.style.color = 'blue'

    expect(original.style.color).toBe('red')
  })

  it('does not mutate the original node tree', () => {
    const original = containerNode('root-1', [textNode('a')])
    const originalSnapshot = structuredClone(original)

    deepNodeDuplicate(original)

    expect(original).toEqual(originalSnapshot)
  })

  it('deep clones a ChartNode\'s labels/datasets arrays so editing the duplicate leaves the original untouched', () => {
    const original = chartNode('chart-1')
    const duplicate = deepNodeDuplicate(original) as ChartNode

    expect(duplicate.id).not.toBe(original.id)
    expect(duplicate.labels).toEqual(original.labels)
    expect(duplicate.datasets).toEqual(original.datasets)

    duplicate.labels.push('C')
    duplicate.datasets[0].data.push(3)
    duplicate.datasets[0].backgroundColor.push('#333')

    expect(original.labels).toEqual(['A', 'B'])
    expect(original.datasets[0].data).toEqual([1, 2])
    expect(original.datasets[0].backgroundColor).toEqual(['#111', '#222'])
  })
})
