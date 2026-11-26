import Attributes from "@/components/PropertyPanelUI/Sections/Attributes";
import Link from "@/components/PropertyPanelUI/Sections/Link";
import SizeSection from "@/components/PropertyPanelUI/Sections/SizeSection";
import {
	PanelRowContainer,
	SectionContainer,
} from "@/components/PropertyPanelUI/ui";
import { border_mode, height_mode } from "@/consts/propertyField.consts";
import { useEditor } from "@/context/EditorContext";
import useFileDrop from "@/hooks/useFileDrop";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { cn } from "@/libs/cn";
import { useGetPageDataQuery } from "@/store/query";
import {
	ImageSliderItem,
	ContentNode,
	ImageSliderNode,
} from "@/types/node.type";
import CSSUtils from "@/utils/CSS.utils";
import { Button, buttonVariants } from "@/components/ui/primitives/button";
import { TextInput } from "@/components/ui/primitives/text-input";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker';
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { Select, SelectOption } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/primitives/progress-bar";
import FileUploadInput from "@/components/ui/inputs/FileUploadInput";
import React, { useMemo, useState } from "react";
import {set} from "react-hook-form";
import { CiCirclePlus } from "react-icons/ci";
import { BorderController } from "../Sections/relatedComponents/Controllers";
import { useTranslation } from "react-i18next";

import withSizeGridTab from './withSizeGridTab'
function ImageSliderPanel() {
	const { t } = useTranslation("propertyPanel");
	const canvas = useEditor();
	const node = canvas?.focusedNode as ImageSliderNode;

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
			[...files].map((file) => handleUpload(file))
		);

		const newImages: ImageSliderItem[] = uploads
			.filter(Boolean)
			.map((res) => ({ url: res!.access_url }));

		canvas.updateNode(
			(n) =>
				({
					...n,
					images: [...node.images, ...newImages],
				} as ContentNode)
		);

		clearFile();
	};

	const { dragHandlers, isDragging } = useFileDrop(handleFileChange);

	const updateImages = (images: ImageSliderItem[]) => {
		canvas.updateNode((n) => ({ ...n, images } as ContentNode));
	};

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>
				<SectionContainer hintKey="gap" label={t("imageSliderPanel.images")}>
					<div {...dragHandlers} className="flex flex-col gap-2">
						{/* Image List */}
						<div className="flex flex-wrap w-full gap-2">
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
										"group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border  border-border bg-muted hover:border-primary/80  cursor-pointer overflow-hidden"
									)}
								>
									<img
										src={selectedFile?.object_url}
										className="size-full object-cover"
									/>
									{selectedFile?.status === "loading" && (
										<div className="bg-slate-800/40 absolute flex flex-col w-full h-full items-center justify-center gap-2">
											<div className="text-white">{t("imageSliderPanel.uploading")}</div>
											<ProgressBar
												value={Math.round(selectedFile.progress)}
												className="w-[7.5rem] h-[0.25rem]"
											/>
										</div>
									)}
									{selectedFile?.status === "error" && (
										<div className="bg-slate-800/50 absolute flex flex-col w-full h-full items-center justify-center gap-2">
											<div className="text-destructive font-medium">
												{t("imageSliderPanel.errorUploadingPhoto")}
											</div>
											<div className="flex items-center gap-1.5">
												<Button
													size={"sm"}
													variant="secondary"
													onClick={() => handleFileChange([selectedFile.cachedFile] as unknown as FileList)}
												>
													{t("imageSliderPanel.retry")}
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
								isDragging && "border-2 !border-primary/80 !bg-primary/20"
							)}
						>
							<CiCirclePlus
								size={32}
								className="text-muted-foreground group-hover:text-primary"
							/>
							<p className="text-muted-foreground text-[0.8rem] font-semibold">
								{t("imageSliderPanel.addImages")}
							</p>
							<p className="text-[0.75rem] text-muted-foreground">{t("imageSliderPanel.maxFileSize")}</p>
						</label>

						<FileUploadInput
							id="carousel-uploader"
							multiple
							onFilesSelected={handleFileChange}
						/>
					</div>
				</SectionContainer>
				

				<SectionContainer hintKey="styleGroup" label={t("imageSliderPanel.style")}>
					<PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t("imageSliderPanel.background")}>
						<BackgroundPicker
							value={node.style?.backgroundColor || ''}
							onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
						/>
					</PanelRowContainer>
					<BorderController/>

					<PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="objectFit" label={t("imageSliderPanel.objectFit")} multiField htmlFor="object-fit">
						<Select
							id="object-fit"
							aria-label={t("imageSliderPanel.objectFit")}
							size="sm"
							placement="bottom end"
							placeholder=""
							className="col-span-2"
							selectedKey={node.objectFit || "contain"}
							onSelectionChange={(v) => {
								canvas.updateNode((n) => {
									if (n.contentType !== "imageSlider") return n;
									return { ...n, objectFit: v as "cover" | "contain" };
								});
							}}
						>
							<SelectOption id="contain">{t("imageSliderPanel.contain")}</SelectOption>
							<SelectOption id="cover">{t("imageSliderPanel.cover")}</SelectOption>
						</Select>
					</PanelRowContainer>

					<PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="backgroundColor" label={t("imageSliderPanel.imageBackground")}>
						<ColorPicker
							
							value={node.imageBackground || ""}
							onChange={(v) => {
								canvas.updateNode((n) => {
									if (n.contentType !== "imageSlider") return n;
									return { ...n, imageBackground: v };
								});
							}}
						/>
					</PanelRowContainer>

					{/* <PanelRowContainer hintKey="margin" label='Margin' htmlFor='layout-margin'>
          <NumberField id='layout-margin'
            aria-label='Margin'
            className='col-span-2'
            minValue={0}
            value={CSSUtils.extractEmValue(node.style.margin) || 0}
            onChange={v => {
              canvas?.updateNodeStyle({
                margin: CSSUtils.setEmValue(v),
              })
            }}
            formatOptions={{

            }}
          >
            <NumberFieldInput size="sm" />
          </NumberField>
        </PanelRowContainer> */}
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
	img: ImageSliderItem;
	index: number;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}) {
	return (
		<div className="group relative h-[9rem] w-[9rem] rounded-lg overflow-hidden border bg-muted">
			<img src={img.url} className="size-full object-cover" />

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

export default withSizeGridTab(ImageSliderPanel)
