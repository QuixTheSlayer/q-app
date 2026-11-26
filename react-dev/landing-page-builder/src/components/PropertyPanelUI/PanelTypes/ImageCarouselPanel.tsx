import Attributes from "@/components/PropertyPanelUI/Sections/Attributes";
import {
	PanelRowContainer,
	SectionContainer,
} from "@/components/PropertyPanelUI/ui";
import { height_mode } from "@/consts/propertyField.consts";
import { useEditor } from "@/context/EditorContext";
import useFileDrop from "@/hooks/useFileDrop";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { cn } from "@/libs/cn";
import { useGetPageDataQuery } from "@/store/query";
import {
	ImageCarouselItem,
	ContentNode,
	ImageCarouselNode,
} from "@/types/node.type";
import CSSUtils from "@/utils/CSS.utils";
import { Button, buttonVariants } from "@/components/ui/primitives/button";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { TextInput } from "@/components/ui/primitives/text-input";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/primitives/progress-bar";
import FileUploadInput from "@/components/ui/inputs/FileUploadInput";
import React, { useMemo, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import BackgroundPicker from "@/components/ui/BackgroundPicker";
import { isValidUrl } from "@/utils/isValidUrl";
import { useTranslation } from "react-i18next";

import withSizeGridTab from './withSizeGridTab'
function ImageCarouselPanel() {
	const { t } = useTranslation("propertyPanel");
	const canvas = useEditor();
	const node = canvas?.focusedNode as ImageCarouselNode;

	const { data } = useGetPageDataQuery("");
	const nodeElement = useMemo(() => {
		const element = document.querySelector(`[data-id="${node?.id || ""}"]`);
		return element;
	}, [node?.id]);

	/**
	 * File Handindling
	 */
	const { handleUpload, selectedFile, clearFile } = useUploadToS3({
		subFolder: `${data?.id}`,
	});

	const handleFileChange = async (files: FileList) => {
		const uploads = await Promise.all(
			[...files].map((file) => handleUpload(file)),
		);

		const newImages: ImageCarouselItem[] = uploads
			.filter(Boolean)
			.map((res) => ({ url: res!.access_url }));

		canvas.updateNode(
			(n) =>
				({
					...n,
					images: [...node.images, ...newImages],
				}) as ContentNode,
		);

		clearFile();
	};

	const { dragHandlers, isDragging } = useFileDrop(handleFileChange);

	const updateImages = (images: ImageCarouselItem[]) => {
		canvas.updateNode((n) => ({ ...n, images }) as ContentNode);
	};

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>
				<SectionContainer hintKey="gap" label={t("imageCarouselPanel.images")}>
					<div {...dragHandlers} className="flex  flex-col gap-2">
						{/* Image List */}
						<div className="flex flex-wrap gap-2">
							{node.images.map((img, i) => (
								<CarouselItem
									key={i}
									img={img}
									index={i}
									onRemove={() =>
										updateImages(node.images.filter((_, x) => x !== i))
									}
									onMoveUp={() => {
										if (i === 0) return;
										const list = [...node.images];
										[list[i - 1], list[i]] = [list[i], list[i - 1]];
										updateImages(list);
									}}
									onMoveDown={() => {
										if (i === node.images.length - 1) return;
										const list = [...node.images];
										[list[i + 1], list[i]] = [list[i], list[i + 1]];
										updateImages(list);
									}}
								/>
							))}
							{selectedFile && (
								<div
									className={cn(
										"group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border  border-border bg-muted hover:border-primary/80  cursor-pointer overflow-hidden",
									)}
								>
									<img
										src={selectedFile?.object_url}
										className=" h-[100px] w-[100px] object-cover"
									/>
									{selectedFile?.status === "loading" && (
										<div className="bg-slate-800/40 absolute flex flex-col w-full h-full items-center justify-center gap-2">
											<div className="text-white">{t("imageCarouselPanel.uploading")}</div>
											<ProgressBar
												value={Math.round(selectedFile.progress)}
												className="w-[7.5rem] h-[0.25rem]"
											/>
										</div>
									)}
									{selectedFile?.status === "error" && (
										<div className="bg-slate-800/50 absolute flex flex-col w-full h-full items-center justify-center gap-2">
											<div className="text-destructive font-medium">
												{t("imageCarouselPanel.errorUploadingPhoto")}
											</div>
											<div className="flex items-center gap-1.5">
												<Button
													size={"sm"}
													variant="secondary"
													onClick={() =>
														handleFileChange([
															selectedFile.cachedFile,
														] as unknown as FileList)
													}
												>
													{t("imageCarouselPanel.retry")}
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() => clearFile()}
													className="text-white"
												>
													✕
												</Button>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Upload Area */}
						<label
							htmlFor="carousel-uploader"
							className={cn(
								"group h-[8rem] rounded-[0.65rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-border bg-muted hover:border-primary/80 hover:border-2 cursor-pointer",
								isDragging && "border-2 !border-primary/80 !bg-primary/20",
							)}
						>
							<CiCirclePlus
								size={32}
								className="text-muted-foreground group-hover:text-primary"
							/>
							<p className="text-muted-foreground text-[0.8rem] font-semibold">
								{t("imageCarouselPanel.addImages")}
							</p>
							<p className="text-[0.75rem] text-muted-foreground">{t("imageCarouselPanel.maxFileSize")}</p>
						</label>

						<FileUploadInput
							id="carousel-uploader"
							multiple
							onFilesSelected={handleFileChange}
						/>
					</div>
				</SectionContainer>

				<SectionContainer label={t("imageCarouselPanel.controls")}>
					<div className="py-[6px]  ">
						<Checkbox
							className="!size-5 !rounded-[0.3rem]"
							checked={node?.autoPlay}
							onCheckedChange={(checked) => {
								if (checked === true) {
									canvas.updateNode((node) => {
										if (node.contentType !== "imageCarousel") return node;
										const tempNode: ImageCarouselNode = {
											...node,
											autoPlay: true,
										};
										return tempNode;
									});
								} else {
									canvas.updateNode((node) => {
										if (node.contentType !== "imageCarousel") return node;
										const tempNode: ImageCarouselNode = {
											...node,
											autoPlay: false,
										};
										return tempNode;
									});
								}
							}}
						>
							{t("imageCarouselPanel.autoplay")}
						</Checkbox>
					</div>
					<PanelRowContainer className=" p-2 w-[90%] "
						layoutType="col"
						hintKey="columns" label={t("imageCarouselPanel.imagesPerView")}
						multiField
						htmlFor="images-per-view"
					>
						<NumberField
							id="images-per-view"
							aria-label={t("imageCarouselPanel.imagesPerView")}
							minValue={1}
							maxValue={10}
							className={"col-span-2"}
							// isDisabled={!node.autoPlay}
							value={node.imagesPerView || 1}
							onChange={(v) => {
								canvas.updateNode((node) => {
									if (node.contentType !== "imageCarousel") return node;
									const tempNode: ImageCarouselNode = {
										...node,
										imagesPerView: v,
									};
									return tempNode;
								});
							}}
						>
							<NumberFieldInput size="sm" hideStepper />
						</NumberField>
					</PanelRowContainer>

					<PanelRowContainer className=" p-2 w-[90%] "
						layoutType="col"

						hintKey="columns" label={t("imageCarouselPanel.slidesPerScroll")}
						multiField
						htmlFor="slides-per-scroll"
					>
						<NumberField
							id="slides-per-scroll"
							aria-label={t("imageCarouselPanel.slidesPerScroll")}
							className={"col-span-2"}
							// isDisabled={!node.autoPlay}
							value={node.slidesPerScroll || 1}
							minValue={1}
							maxValue={10}
							onChange={(v) => {
								canvas.updateNode((node) => {
									if (node.contentType !== "imageCarousel") return node;
									const tempNode: ImageCarouselNode = {
										...node,
										slidesPerScroll: v,
									};
									return tempNode;
								});
							}}
						>
							<NumberFieldInput size="sm" hideStepper />
						</NumberField>
					</PanelRowContainer>

					<PanelRowContainer className=" p-2 w-[90%] " layoutType="col"
						hintKey="scaleZoom" label={t("imageCarouselPanel.delay")} multiField htmlFor="scroll-delay">
						<NumberField
							id="scroll-delay"
							aria-label={t("imageCarouselPanel.scrollDelay")}
							className={"col-span-2"}
							isDisabled={!node.autoPlay}
							value={node.delay || 300}
							minValue={300}
							maxValue={5000}
							onChange={(v) => {
								canvas.updateNode((node) => {
									if (node.contentType !== "imageCarousel") return node;
									const tempNode: ImageCarouselNode = {
										...node,
										delay: v,
									};
									return tempNode;
								});
							}}
						>
							<NumberFieldInput size="sm" hideStepper />
						</NumberField>
					</PanelRowContainer>
				</SectionContainer>


				<SectionContainer hintKey="styleGroup" label={t("imageCarouselPanel.style")}>
					<div  >
						<PanelRowContainer layoutType="col"
							hintKey="backgroundColor" label={t("imageCarouselPanel.background")}>
							<BackgroundPicker
								value={node.style.backgroundColor || ""}
								onChange={(v) => {
									canvas.updateNodeStyle(isValidUrl(v) ? {
										backgroundImage: `url("${v}")`
									} : {
										backgroundColor: v
									})
								}}
							/>
						</PanelRowContainer>

						<PanelRowContainer className=" p-2 w-[90%] " layoutType="col"
							hintKey="gap" label={t("imageCarouselPanel.gap")} multiField htmlFor="image-gap">
							<NumberField
								id="image-gap"
								aria-label={t("imageCarouselPanel.gapBetweenImages")}
								className={"col-span-2"}
								minValue={0}
								maxValue={100}
								value={node.gap ?? 0}
								onChange={(v) => {
									canvas.updateNode((node) => {
										if (node.contentType !== "imageCarousel") return node;
										const tempNode: ImageCarouselNode = {
											...node,
											gap: v,
										};
										return tempNode;
									});
								}}
							>
								<NumberFieldInput size="sm" hideStepper />
							</NumberField>
						</PanelRowContainer>

						<PanelRowContainer className=" p-2 w-[90%] " layoutType="col"
							hintKey="objectFit" label={t("imageCarouselPanel.objectFit")} multiField htmlFor="object-fit">
							<Select
								id="object-fit"
								aria-label={t("imageCarouselPanel.objectFit")}
								size="sm"
								placement="bottom end"
								placeholder=""
								className="col-span-2"
								selectedKey={node.objectFit || "contain"}
								onSelectionChange={(v) => {
									canvas.updateNode((node) => {
										if (node.contentType !== "imageCarousel") return node;
										const tempNode: ImageCarouselNode = {
											...node,
											objectFit: v as "cover" | "contain",
										};
										return tempNode;
									});
								}}
							>
								<SelectOption id="contain">{t("imageCarouselPanel.contain")}</SelectOption>
								<SelectOption id="cover">{t("imageCarouselPanel.cover")}</SelectOption>
							</Select>
						</PanelRowContainer>
					</div>



				</SectionContainer>
				{/* <Link /> */}
				<Attributes />
			</div>
		);
}

function CarouselItem({
	img,
	index,
	onRemove,
	onMoveUp,
	onMoveDown,
}: {
	img: ImageCarouselItem;
	index: number;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}) {
	return (
		<div className=" h-[100px] group w-[150px] relative rounded-lg overflow-hidden border bg-muted">
			<img src={img.url} className=" h-[100px] w-[100%] object-cover" />

			<div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-2 bg-black/30">
				<Button size="sm" variant="secondary" onClick={onMoveUp}>
					↑
				</Button>
				<Button size="sm" variant="secondary" onClick={onMoveDown}>
					↓
				</Button>
				<Button
					size="sm"
					variant="destructive"
					onClick={onRemove}
					className="text-white"
				>
					✕
				</Button>
			</div>
		</div>
	);
}

export default withSizeGridTab(ImageCarouselPanel)
