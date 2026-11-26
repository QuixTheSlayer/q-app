import editorConfig from "@/configs/editor.config";
import { CanvasNode } from "@/types/node.type";
import { hasChildNode } from "@/utils/hasChildNode";
import { isTabNode } from "@/utils/editor.utils";

export type PlanTier = 'Pro' | 'Ent'

export interface PlanTierUsage {
	nodeId: string
	path: string
	contentType: string
	tier: PlanTier
}

/**
 * Walks a page's node tree and reports every node whose content type is
 * tagged pro/enterprise in editorConfig.content_type_plan_tier — e.g. to
 * check "is this page using anything above the free plan" before letting a
 * free/pro user save or publish it.
 *
 * There's no real account/subscription-plan signal anywhere in this app yet
 * (see content_type_plan_tier's own doc comment), so this only answers
 * "what gated content does this page contain" — comparing that against the
 * user's actual plan is left to whatever real plan source gets wired up
 * later (e.g. call this after fetching the user's plan from your auth/
 * billing API, then diff the returned tiers against what they're allowed).
 */
export function findPlanTierUsage(root: CanvasNode, path = 'root'): PlanTierUsage[] {
	const usages: PlanTierUsage[] = []

	function visit(node: CanvasNode, nodePath: string) {
		const tier = editorConfig.content_type_plan_tier[node.contentType as keyof typeof editorConfig.content_type_plan_tier]
		if (tier) {
			usages.push({ nodeId: node.id, path: nodePath, contentType: node.contentType, tier })
		}

		if (isTabNode(node)) {
			node.tabs.forEach((tab, tabIndex) => {
				tab.children.forEach((child, childIndex) => visit(child, `${nodePath}.${tabIndex}.${childIndex}`))
			})
			return
		}

		if (hasChildNode(node)) {
			node.children.forEach((child, index) => visit(child, `${nodePath}.${index}`))
		}
	}

	visit(root, path)
	return usages
}

/**
 * Convenience check for "does this page use anything above the free plan,
 * and if so does it exceed the given plan" — e.g.
 * exceedsPlanTier(pageRoot, 'free') is true if the page contains any
 * pro/enterprise node; exceedsPlanTier(pageRoot, 'pro') is true only if it
 * contains an enterprise node.
 */
export function exceedsPlanTier(root: CanvasNode, currentPlan: 'Pro' | PlanTier): boolean {
	const usages = findPlanTierUsage(root)
	if (usages.length === 0) return false
	// if (currentPlan === 'Pro') return true
	if (currentPlan === 'Pro') return usages.some((usage) => usage.tier === 'Ent')
	return false
}
