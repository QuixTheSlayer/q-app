import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	EventDeadline,
	EventRoute,
	PageFile,
	PageQueryData,
	RenderPageQueryData,
} from "@/types/contentFile.type";
import { getIdFromUrl } from "@/utils/getIdFromUrl";
import { getCsrfToken } from "@/utils/getCsrfToken";
import { isDev } from "@/libs/checkEnv";
import {CanvasNode, LayoutNode} from "@/types/node.type.ts";
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import { revealPageCode } from '@/utils/security/codeCrypto'
import { parsePageContent } from '@/utils/parsePageContent'
import { parseIsAllow, parseJsAllowed, readAllowFlag } from '@/utils/security/codePolicy'

const pageId = getIdFromUrl();

export interface componentType extends LayoutNode {
	id:string
}

export const editorQuery = createApi({
	reducerPath: "editorQuery",
	tagTypes: ['editorQuery'],
	baseQuery: fetchBaseQuery({
		baseUrl: `${isDev ? "http://localhost:3030" : ""}/landing-page-builder/`,
		prepareHeaders: (headers) => {
			const csrfToken = getCsrfToken();

			if (csrfToken) {
				headers.set("X-CSRF-Token", csrfToken);
			}
		},
	}),
	endpoints: (builder) => ({
		/**
		 * Get data for landing page Editor and Preview
		 */
		getPageData: builder.query<PageFile, string>({
			query: () => `get_landingpage_data/${pageId}`,
			transformResponse: async (
				response: {
					data: [PageQueryData];
				}
			) => {

				
				const data = isDev ? response as unknown as PageQueryData : response.data[0];

				console.log(data)
				return {
					id: data.id,
					title: data.title,
					content: sanitizeCanvasTree(await revealPageCode(parsePageContent(data.page_content))),
					created_at: data.created,
					updated_at: undefined,
					thumbnail: isDev ? data?.thumbnail: data?.page_thumbnail,
					user_id: data.user_id,
					is_free: data.is_free,
					is_boxed: data.is_boxed ?? 0,
					scrollToTop: data.scroll_to_top ?? undefined,
					isAllow: parseIsAllow(data.is_allow),

				};
			},
		}),

		/**
		 * Save changed landing page data
		 */
		savePageData: builder.mutation({
			query: (data) => ({
				url: `save/${pageId}`,
				method: isDev ? "PUT":"POST",
				body: data,

			}),

		}),
        saveComponentData: builder.mutation({
            query: (data:{content:string,thumbnail_url:string,title:string,plan_type:"Pro"|"Ent"}) => ({
                url: `subtemplates`,
                method: "POST",
                body: data
				

            }),
			
			

            invalidatesTags:["editorQuery"]

        }),

        getComponentsData: builder.query ({
            query: () => ({
                url: `subtemplates`,
                method: "GET",

            }),
            providesTags:['editorQuery']

        }),
		getComponentDataById: builder.query ({
            query: (id:string) => ({
                url: `subtemplates/${id}`,
                method: "GET",

            }),

        }),

        deleteComponent: builder.mutation<CanvasNode, string> ({
            query: (id:string) => ({
                url: `subtemplates/${id}`,
                method: "DELETE",

            }),
            invalidatesTags:['editorQuery']

        }),

		/**
		 * Get data for rendering landing page
		 */
		getRenderPageData: builder.query<
			{
				landingpage_data: PageFile;
				event_deadline: EventDeadline;
				event_route: EventRoute;
			},
			string
		>({
			query: (event_name) => `get_data_landingPage/${event_name}`,
			transformResponse: async (
				response: {
					data: RenderPageQueryData;
				}
			) => {


				const landingpage_data = response.data?.landingpage_data 

				return {
					landingpage_data: {
						id: landingpage_data.id,
						title: landingpage_data.title,
						content: sanitizeCanvasTree(await revealPageCode(parsePageContent(landingpage_data.page_content))),
						created_at: landingpage_data.created,
						updated_at: undefined,
						thumbnail: landingpage_data.page_thumbnail,
						user_id: landingpage_data.user_id,
						is_free: landingpage_data.is_free,
						is_boxed: landingpage_data.is_boxed ?? 0,
						scrollToTop: landingpage_data.scroll_to_top ?? undefined,
						isAllow: parseIsAllow(landingpage_data.is_allow),

					},
					event_deadline: response.data.event_deadline,
					event_route: response.data.event_route,
				};
			},
		}),

		/**
		 * Fetches the content staged by generateThumbnail() for a server-side
		 * capture. Only ever called by CaptureRender.page.tsx, which only ever
		 * runs inside the headless Playwright browser driving
		 * bin/capture-thumbnail.cjs - the token is the access control, not
		 * auth, so this is deliberately an unauthenticated route.
		 */
		getCaptureRenderData: builder.query<
			{ content: CanvasNode; is_boxed: 1 | 0; section_count?: number; isAllow?:boolean },
			string
		>({
			query: (token) => `capture-render-data/${token}`,
			// The content comes straight from the saved page (or the posted node), so its CSS and SVG may still be encrypted.
			transformResponse: async (response: {
				data: { content: CanvasNode; is_boxed: 1 | 0; section_count?: number; isAllow?:boolean };
			}) => ({ ...response.data, content: await revealPageCode(response.data.content) }),
		}),

		/**
		 * Server-side thumbnail capture - see documents/thumbnail-capture.md.
		 * Pass either `page_id` (an already-saved page) or `node` (a raw,
		 * unsaved CanvasNode, e.g. ActionMenu.tsx's in-progress focused node).
		 * `section_count` only applies to the `page_id` case - it's the same
		 * "how many sections should the thumbnail show" control the Create
		 * Thumbnail Image dialog already exposed.
		 */
		generateThumbnail: builder.mutation<
			{ access_url: string },
			{
				page_id?: number | string
				node?: CanvasNode
				subfolder: string
				section_count?: number
			}
		>({
			query: (body) => ({
				url: `generate-thumbnail`,
				method: "POST",
				body,
			}),
			transformResponse: (response: { data: { access_url: string } }) =>
				response.data,
		}),
	}),
});

export const {
	useGetPageDataQuery,
	useGetRenderPageDataQuery,
	useSavePageDataMutation,
    useSaveComponentDataMutation,
    useGetComponentsDataQuery,
    useDeleteComponentMutation,
	useGetComponentDataByIdQuery,
	useLazyGetComponentDataByIdQuery,
	useGetCaptureRenderDataQuery,
	useGenerateThumbnailMutation,
} = editorQuery;
