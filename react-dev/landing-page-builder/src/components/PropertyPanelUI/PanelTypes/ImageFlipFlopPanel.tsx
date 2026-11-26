import SizeSection from "@/components/PropertyPanelUI/Sections/SizeSection";
import { PanelRowContainer, SectionContainer } from "@/components/PropertyPanelUI/ui";
import BackgroundPicker from "@/components/ui/BackgroundPicker";
import { useEditor } from "@/context/EditorContext";
import useFileDrop from "@/hooks/useFileDrop";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { cn } from "@/libs/cn";
import { useGetPageDataQuery } from "@/store/query";
import { ContentNode, ImageFlipFlopNode } from "@/types/node.type";
import { isValidUrl } from "@/utils/isValidUrl";
import { Button, buttonVariants } from "@/components/ui/primitives/button";
import { TextArea } from "@/components/ui/primitives/text-area";
import { TextInput } from "@/components/ui/primitives/text-input";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker';
import { ProgressBar } from "@/components/ui/primitives/progress-bar";
import FileUploadInput from "@/components/ui/inputs/FileUploadInput";
import { CiCirclePlus } from "react-icons/ci";
import { useTranslation } from "react-i18next";

import withSizeGridTab from './withSizeGridTab'
function ImageFlipFlopPanel() {
	const { t } = useTranslation("propertyPanel");
	const canvas = useEditor();
	const node = canvas?.focusedNode as ImageFlipFlopNode;

	const { data } = useGetPageDataQuery("");

	const { handleUpload, selectedFile } = useUploadToS3({
		subFolder: `${data?.id}`,
	});

	const handleFileChange = async (files: FileList) => {
		if (!files.length) return;
		const file = files[0];
		const response = await handleUpload(file);
		canvas?.updateNode((n) => ({
			...n,
			imageUrl: response?.access_url ?? "",
		}) as ContentNode);
	};

	const { dragHandlers, isDragging } = useFileDrop(handleFileChange);

	if (!node) return null;

	return (
		<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>
			<SectionContainer label={t('imageFlipFlopPanel.frontImage')}>
				<div {...dragHandlers}>
					{node.imageUrl || selectedFile ? (
						<div
							className={cn(
								"group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border border-border bg-muted hover:border-primary/80 cursor-pointer overflow-hidden",
								isDragging && "border-dashed !border-primary/80 border-2 !bg-primary/20",
							)}
						>
							<img
								src={node.imageUrl || selectedFile?.object_url}
								className="size-full object-cover"
							/>
							{selectedFile?.status === "loading" && (
								<div className="bg-slate-800/40 absolute flex flex-col w-full h-full items-center justify-center gap-2">
									<div className="text-white">{t('imageFlipFlopPanel.uploading')}</div>
									<ProgressBar
										value={Math.round(selectedFile.progress)}
										className="w-[7.5rem] h-[0.25rem]"
									/>
								</div>
							)}
							{selectedFile?.status === "error" && (
								<div className="bg-slate-800/50 absolute flex flex-col w-full h-full items-center justify-center gap-2">
									<div className="text-destructive font-medium">{t('imageFlipFlopPanel.errorUploadingPhoto')}</div>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => handleUpload(selectedFile.cachedFile)}
									>
										{t('imageFlipFlopPanel.retry')}
									</Button>
								</div>
							)}
							{(node.imageUrl || selectedFile?.status === "success") && (
								<div className="bg-slate-800/20 hidden absolute group-hover:flex w-full h-full items-center justify-center">
									<label
										htmlFor="flipflop-panel-uploader"
										className={cn(
											buttonVariants({ size: "sm", variant: "primary" }),
											"bg-primary items-center cursor-pointer",
										)}
									>
										{t('imageFlipFlopPanel.changeImage')}
									</label>
								</div>
							)}
						</div>
					) : (
						<label
							htmlFor="flipflop-panel-uploader"
							className={cn(
								"group flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-border bg-muted hover:border-primary/80 hover:border-2 cursor-pointer",
								isDragging && "!border-primary/80 border-2 !bg-primary/20",
							)}
						>
							<CiCirclePlus size={35} className="text-muted-foreground group-hover:text-primary" />
							<p className="text-muted-foreground text-[0.8rem] font-semibold mt-1">{t('imageFlipFlopPanel.uploadAnImage')}</p>
							<p className="text-[0.75rem] text-muted-foreground">{t('imageFlipFlopPanel.maxFileSize')}</p>
						</label>
					)}
					<FileUploadInput
						id="flipflop-panel-uploader"
						onFilesSelected={handleFileChange}
					/>
				</div>
			</SectionContainer>

			<SectionContainer hintKey="flip" label={t('imageFlipFlopPanel.backFace')}>
				<PanelRowContainer className=" w-[90%] " layoutType="col" label={t('imageFlipFlopPanel.text')} htmlFor="flipflop-text">
					<TextArea
						id="flipflop-text"
						className="col-span-3"
						value={node.flipText ?? ""}
						onChange={(e) => {
							canvas?.updateNode((n) => ({ ...n, flipText: e.target.value } as unknown as ContentNode));
						}}
					/>
				</PanelRowContainer>

				 <PanelRowContainer layoutType="col"
							hintKey="backgroundColor" label={t('imageFlipFlopPanel.background')}>
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

				<PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="textColor" label={t('imageFlipFlopPanel.textColor')} htmlFor="flipflop-text-color">
					<div className="col-span-2">
						<ColorPicker
							value={(node.flipTextStyle?.color as string) ?? "#ffffff"}
							onChange={(v) => {
								canvas?.updateNode((n) => ({
									...n,
									flipTextStyle: { ...(n as ImageFlipFlopNode).flipTextStyle, color: v },
								}) as ContentNode);
							}}
						/>
					</div>
				</PanelRowContainer>

				<PanelRowContainer className=" w-[90%] " layoutType="col" hintKey="fontSize" label={t('imageFlipFlopPanel.fontSize')} htmlFor="flipflop-font-size">
					<NumberField
						id="flipflop-font-size"
						aria-label={t('imageFlipFlopPanel.fontSizeAriaLabel')}
						minValue={0.5}
						step={0.1}
						className="col-span-2"
						value={parseFloat((node.flipTextStyle?.fontSize as string) ?? "1.25") || 1.25}
						onChange={(v) => {
							canvas?.updateNode((n) => ({
								...n,
								flipTextStyle: {
									...(n as ImageFlipFlopNode).flipTextStyle,
									fontSize: `${v}em`,
								},
							}) as ContentNode);
						}}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
				</PanelRowContainer>
			</SectionContainer>

		</div>
	);
}

export default withSizeGridTab(ImageFlipFlopPanel)
