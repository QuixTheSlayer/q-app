import type { CanvasNode } from '@/types/node.type'

/** The page tree from `page_content`, which is a JSON string from the API but can already be an object. */
export function parsePageContent(raw: string | Record<string, unknown>): CanvasNode {
  return (typeof raw === 'string' ? JSON.parse(raw) : raw) as CanvasNode
}
