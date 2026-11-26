import React from "react"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import useFileDrop from "@/hooks/useFileDrop"
import useUploadToS3 from "@/hooks/useUploadToS3"
import { useGetPageDataQuery } from "@/store/query"
import {
	Slider,
	SliderContent,
	SliderDots,
	SliderItem,
	SliderNext,
	SliderPrevious,
} from "@/components/ui/Slider"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"
import { CiImageOn } from "react-icons/ci"
import { TbCarouselHorizontal } from "react-icons/tb"
import FileUploadInput from "@/components/ui/inputs/FileUploadInput"
import {
	ContentNode,
	ImageCarouselItem,
	ImageCarouselNode,
	ImageFlipFlopNode,
	ImageSliderItem,
	ImageSliderNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"


export function ImageSlider({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<ImageSliderNode>) {
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

		const newImages: ImageSliderItem[] = uploads
			.filter(Boolean)
			.map((res) => ({ url: res!.access_url }));

		canvas?.updateNode((n) => {
			return {
				...n,
				images: [...(n as ImageSliderNode).images, ...newImages],
			} as ContentNode;
		}, path);
	};

	const { dragHandlers, isDragging: fileIsDragging } =
		useFileDrop(handleFileChange);

	if (!canvas) return null;

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
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
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
							maxHeight: "none",
						}}
						data-node-path={path}
						className={cn(
							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px] w-full",
							canvas.focused?.id === node.id && "outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
							isDragging && "invisible",
						)}
					>
						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
						{node.images?.length || selectedFile?.object_url ? (
							<Slider
								className="w-full h-full"
								opts={{ loop: true, autoPlay: false }}
							>
								<SliderContent>
									{node.images.map((img, index) => (
										<SliderItem key={index}>
											<img
												src={img.url}
												alt={img.altText || ""}
												className="w-full h-full max-h-[30em] m"
												style={{
													objectFit: node.objectFit || "contain",
													backgroundColor:
														node.imageBackground || "transparent",
													height: CSSUtils.extractEmValue(style.height),
													maxHeight: CSSUtils.extractEmValue(style.maxHeight),
													// maxHeight:
													// 	CSSUtils.extractEmValue(style.maxHeight) *
													// 		(editorConfig.root_font_size * canvas.zoomLevel) +
													// 	"px",
												}}
											/>
										</SliderItem>
									))}
								</SliderContent>
								<>
									<SliderPrevious />
									<SliderNext />
									<SliderDots />
								</>
							</Slider>
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


export function ImageCarousel({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<ImageCarouselNode>) {
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
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
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
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
							isDragging && "invisible",
						)}
					>
						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
						{node.images?.length || selectedFile?.object_url ? (
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
									{node.images.map((img, index) => (
										<CarouselItem
											key={index}
											className="flex items-center justify-center basis-[25%]"
											style={{
												flexBasis: `${100 / (node.imagesPerView || 4)}%`,
												paddingInline: `${(node.gap ?? 0) / 2}px`,
											}}
										>
											<img
												src={img.url}
												alt={img.altText || ""}
												className="w-full h-full max-none"
												style={{ objectFit: node.objectFit || "contain" }}
											/>
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


export function ImageFlipFlop({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<ImageFlipFlopNode>) {
	const { data } = useGetPageDataQuery("");

	const { handleUpload, selectedFile } = useUploadToS3({
		subFolder: `${data?.user_id}/${data?.id}`,
	});

	const handleFileChange = async (files: FileList) => {
		if (!files.length) return;
		const file = files[0];
		const response = await handleUpload(file);
		canvas?.updateNode((n) => {
			return { ...n, imageUrl: response?.access_url ?? "" } as ContentNode;
		}, path);
	};

	const { dragHandlers, isDragging: fileIsDragging } =
		useFileDrop(handleFileChange);

	if (!canvas) return null;

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

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
					{node.imageUrl && (
						<img
							src={node.imageUrl}
							className="w-full h-full object-cover"
						/>
					)}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						{...dragHandlers}
						id={node.id}
						data-id={node.id}
						style={style}
						data-node-path={path}
						className={cn(
							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px] group/flipflop",
							"[perspective:800px]",
							canvas.focused?.id === node.id && "outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
							isDragging && "invisible",
						)}
					>
						{/* Flip container */}
						<div
							className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover/flipflop:[transform:rotateY(180deg)]"
							style={{ transformStyle: "preserve-3d" }}
						>
							{/* Front face – image */}
							<div
								className="absolute inset-0 w-full h-full [backface-visibility:hidden]"
								style={{ backfaceVisibility: "hidden" }}
							>
								{node.imageUrl ? (
									<img
										src={node.imageUrl}
										alt="flip-flop"
										className="w-full h-full object-cover"
									/>
								) : (
									<label
										htmlFor={`flipflop-uploader-${node.id}`}
										className="flex flex-col items-center justify-center w-full h-full bg-blue-200/50 cursor-pointer gap-2"
									>
										<CiImageOn size={40} className="text-blue-400" />
										<span className="text-[0.8em] text-blue-500 font-medium">
											Upload Image
										</span>
									</label>
								)}
							</div>

							{/* Back face – text */}
							<div
								className="absolute inset-0 w-full h-full flex items-center justify-center px-4 [backface-visibility:hidden] [transform:rotateY(180deg)]"
								style={{
									backfaceVisibility: "hidden",
									backgroundColor: node.flipBackgroundColor || "#1e293b",
									transform: "rotateY(180deg)",
								}}
							>
								<p style={node.flipTextStyle}>{node.flipText}</p>
							</div>
						</div>

						<FileUploadInput
							id={`flipflop-uploader-${node.id}`}
							onFilesSelected={handleFileChange}
						/>
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
