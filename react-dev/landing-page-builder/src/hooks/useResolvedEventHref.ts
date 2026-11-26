import { useCallback, useMemo } from "react"
import { useGetRenderPageDataQuery } from "@/store/query"
import { EventRoute } from "@/types/contentFile.type"
import { getIdFromUrl } from "@/utils/getIdFromUrl"

/**
 * These CTA hrefs also render inside the editor's hidden off-screen
 * thumbnail-capture preview (Canvas.tsx's previewRef div, driven by
 * canvas.focusedNode) AND on the Preview page (/landing-page-builder/preview/<id>)
 * — neither has a real event, and getIdFromUrl()'s generic last-path-segment
 * parse resolves to the numeric landing-page-builder page id in both cases
 * (e.g. "/landing-page-builder/editor/11" or ".../preview/11" -> "11"),
 * which is truthy but not a real event name. Force it empty on both routes
 * so useResolvedEventHref's useGetRenderPageDataQuery(eventName, { skip: !eventName })
 * correctly skips fetching there — every real insert (a Ready Made
 * Template's Button/EventWidgetsGroupTemplate/NavBar/Hero CTA) was
 * otherwise re-mounting fresh subscriptions to a nonsense query on every
 * render, spamming get_data_landingPage. Only the real published page
 * (RenderPage.page.tsx, matched by neither prefix) has a genuine event
 * name in its URL — it computes eventName itself and doesn't use this
 * module-level constant.
 */
export const eventName = /\/landing-page-builder\/(editor|preview)(\/|$)/.test(window.location.pathname)
	? ''
	: getIdFromUrl();

/** Maps a CTA field's `{{event_...}}` placeholder token to the matching key on RenderPageQueryData's event_route. */
export const eventRouteMap: Record<string, keyof EventRoute> = {
	"{{event_submit_entry_url}}": "submit_an_entry_url",
	"{{event_register_url}}": "register_url",
	"{{view_entries}}": "view_entries",
};

/**
 * Same resolution as useResolvedEventHref, but returns a plain resolver
 * function instead of resolving one fixed href — for a template with a
 * *list* of links (e.g. FooterTemplate's columns[].links[]), where the
 * per-href hook can't be called once per link inside a .map() (Rules of
 * Hooks), but the underlying query only needs to be fetched once either way.
 */
export function useEventRouteResolver() {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName })

	return useCallback((href: string | undefined) => {
		if (!href) return href
		if (!data) return href

		const route = eventRouteMap[href]
		if (!route) return href

		const routeUrl = data.event_route[route]
		return routeUrl === "#" ? undefined : routeUrl
	}, [data?.event_route])
}

/**
 * Resolves a CTA href field that may be one of the `{{event_...}}`
 * placeholder tokens (see eventRouteMap) into the real event URL — e.g.
 * NavBarTemplate/HeroTemplate/EventWidgetsGroupTemplate's submitEntryHref/
 * registerHref/ctaHref fields, which render as plain `<a href>` with no
 * page-context access of their own to resolve the placeholder themselves.
 *
 * Only ever resolves on the real published page (RenderPage.page.tsx) —
 * see this module's eventName doc comment for why the editor/preview
 * routes are excluded. Elsewhere the placeholder token is returned as-is
 * (or the href unchanged if it isn't a recognized placeholder).
 *
 * For a *list* of hrefs (e.g. FooterTemplate's columns[].links[]) use
 * useEventRouteResolver instead — calling this hook once per link inside a
 * .map() would violate the Rules of Hooks.
 */
export function useResolvedEventHref(href: string | undefined) {
	const resolve = useEventRouteResolver()
	return useMemo(() => resolve(href), [href, resolve])
}
