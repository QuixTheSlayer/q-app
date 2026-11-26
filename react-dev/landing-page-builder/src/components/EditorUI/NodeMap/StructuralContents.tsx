import React from "react"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import useFileDrop from "@/hooks/useFileDrop"
import useUploadToS3 from "@/hooks/useUploadToS3"
import { useGetPageDataQuery } from "@/store/query"
import RenderNode from "@/components/EditorUI/RenderNode"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"
import { TbCarouselHorizontal } from "react-icons/tb"
import {
	BlockCarouselNode,
	ContentNode,
	ImageCarouselItem,
	ImageCarouselNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../Nodes"
import DragWrapper from "../NodeWrapper/DragContainer"
import MotionWrapper from "../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../NodeWrapper/PopoverWrapper"


export function BlockCarousel({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<BlockCarouselNode>) {
	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

	/**
	 * Upload
	 */
	const { data } = useGetPageDataQuery("");

	const { handleUpload, selectedFile } = useUploadToS3({
		subFolder: `${data?.user_id}/${data?.id}`,
	});

	const handleFileChange = async (files: FileList) => {
		if (!files.length) return;

		const uploads = await Promise.all(
			[...files].map((file) => handleUpload(file)),
		);

		const newImages: ImageCarouselItem[] = uploads
			.filter(Boolean)
			.map((res) => ({ url: res!.access_url }));

		canvas?.updateNode((n) => {
			return {
				...n,
				images: [...(n as ImageCarouselNode).images, ...newImages],
			} as ContentNode;
		}, path);
	};

	const { dragHandlers, isDragging: fileIsDragging } =
		useFileDrop(handleFileChange);

	if (!canvas) return null;

	//console.log(style);

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					style={node.style}
					className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden"
				>
					{node.images[0] && (
						<img
							src={node.images[0].url}
							className="w-full h-full object-cover"
						/>
					)}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="">
					<MotionWrapper
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						{...dragHandlers}
						id={node.id}
						data-id={node.id}
						style={{
							...style,
							fontSize: "1em",
							height: "fit-content",
							// maxHeight: "none",
						}}
						data-node-path={path}
						className={cn(
							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px]",
							canvas.focused?.id === node.id && "outline-[1.5px]",
							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
							isDragging && "invisible",
						)}
					>
						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
						{node.blockes?.length ? (
							<Carousel
								className="h-fit text-[1em] flex items-center justify-center"
								style={{
									fontSize: "1em",
									height: style.height || "auto",
								}}
								opts={{
									loop: true,
									autoPlay: node.autoPlay,
									slidesToScroll: node.slidesPerScroll || 1,
								}}
								autoPlayOptions={{
									delay: node.delay || 3000,
								}}
							>
								<CarouselContent className="h-full w-full -ml-[0em]">
									{node.blockes.map((BlockNode, index) => (
										<CarouselItem
											key={index}
											className="flex items-center justify-center basis-[25%]"
											style={{
												flexBasis: `${100 / (node.blockesPerView || 4)}%`,
												paddingInline: `${(node.gap ?? 0) / 2}px`,
											}}
										>
											<RenderNode path="container" node={BlockNode} />
										</CarouselItem>
									))}
								</CarouselContent>
								<>
									<CarouselPrevious />
									<CarouselNext />
									{/* <CarouselDots /> */}
								</>
							</Carousel>
						) : (
							<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
								<TbCarouselHorizontal
									strokeWidth={1.3}
									size="40%"
									className="text-blue-300"
								/>
							</div>
						)}
						{/* </div> */}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
