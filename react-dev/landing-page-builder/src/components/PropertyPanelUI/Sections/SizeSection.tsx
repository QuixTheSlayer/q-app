import {
	PanelRowContainer,
	SectionContainer,
} from "@/components/PropertyPanelUI/ui";
import { height_mode } from "@/consts/propertyField.consts";
import { useEditor } from "@/context/EditorContext";
import { LayoutNode } from "@/types/node.type";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from "@/components/ui/Select";
import { useDimensionField } from "./useDimensionField";
import { useTranslation } from "react-i18next";
import { ToolTipPanel } from "@/components/ui/ToolTipPanel";
import { XIcon } from "lucide-react";

function UnsetButton({ label, onUnset }: { label: string; onUnset: () => void }) {
	return (
		<ToolTipPanel label={label}>
			<button
				type="button"
				aria-label={label}
				onClick={onUnset}
				className=" flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 "
			>
				<XIcon size={11} />
			</button>
		</ToolTipPanel>
	);
}

function SizeSection() {
	const canvas = useEditor();
	const node = canvas?.focusedNode as LayoutNode;
	const { t } = useTranslation("propertyPanel");

	const heightField = useDimensionField("height");
	const widthField = useDimensionField("width");

	return (
		<SectionContainer label={t('sizeSection.size')}>
			{/**
			 * Height
			 */}
			<PanelRowContainer className=" px-2 py-2 " layoutType="col" hintKey="height" label={t('sizeSection.height')} multiField htmlFor="size-height">
				<div className=" w-[100%] flex gap-1 ">
					<NumberField
						id="size-height"
						aria-label={t('sizeSection.height')}
						minValue={0}
						className={"w-[67%]"}
						isDisabled={heightField.isValueDisabled}
						value={heightField.numericValue}
						onChange={heightField.onValueChange}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
					<Select
						id="size-height-format"
						aria-label={t('sizeSection.heightFormat')}
						size="sm"
						placement="bottom end"
						placeholder=""
						className="col-span-1 w-[28%]"
						items={height_mode}
						selectedKey={heightField.mode}
						onSelectionChange={(v) => heightField.onModeChange(v as string)}
					>
						{(item) => (
							<SelectOption id={item.value}>{item.label}</SelectOption>
						)}
					</Select>
				</div>

				<div className=" flex gap-2 w-[100%] ">
					<PanelRowContainer className=" min-w-[33%] w-auto px-0 " layoutType="col" hintKey="minHeight" label={t('sizeSection.minHeightPx')}>
						<div className=" flex items-center gap-1 w-auto ">
							<NumberField
								id="min-Height"
								aria-label={t('sizeSection.minHeight')}
								minValue={0}
								className="w-[150px]"
								isDisabled={heightField.isMinMaxDisabled}
								value={heightField.minValue}
								onChange={heightField.onMinChange}
							>
								<NumberFieldInput size="sm" hideStepper />
							</NumberField>
							{!heightField.isMinMaxDisabled && heightField.hasMinValue && (
								<UnsetButton label={t('sizeSection.unsetMin')} onUnset={heightField.onUnsetMin} />
							)}
						</div>
					</PanelRowContainer>
					<PanelRowContainer className=" min-w-[33%] w-auto px-0" layoutType="col" hintKey="maxHeight" label={t('sizeSection.maxHeightPx')}>
						<div className=" flex items-center gap-1 w-auto ">
							<NumberField
								id="max-Height"
								aria-label={t('sizeSection.maxHeight')}
								minValue={0}
								className="w-[150px]"
								isDisabled={heightField.isMinMaxDisabled}
								value={heightField.maxValue}
								onChange={heightField.onMaxChange}
							>
								<NumberFieldInput size="sm" hideStepper />
							</NumberField>
							{!heightField.isMinMaxDisabled && heightField.hasMaxValue && (
								<UnsetButton label={t('sizeSection.unsetMax')} onUnset={heightField.onUnsetMax} />
							)}
						</div>
					</PanelRowContainer>
				</div>
			</PanelRowContainer>

			<span className=" h-5 w-[100%] flex justify-start items-center ">
				<span className=" bg-muted h-[1px] w-[90%] "></span>
			</span>

			{/**
			 * Width
			 */}
			{/* The root's width is set by the Desktop/Tablet/Mobile switcher, not edited here. */}
			{node.contentType && node.contentType !== 'root' && (
				<PanelRowContainer className=" px-2 py-2 " layoutType="col" hintKey="width" label={t('sizeSection.width')} multiField htmlFor="size-width">
					<div className=" w-[100%] flex gap-1 ">
						<NumberField
							id="size-width"
							aria-label={t('sizeSection.width')}
							minValue={0}
							className={"w-[68%]"}
							isDisabled={widthField.isValueDisabled}
							value={widthField.numericValue}
							onChange={widthField.onValueChange}
						>
							<NumberFieldInput size="sm" hideStepper />
						</NumberField>
						<Select
							id="size-width-format"
							aria-label={t('sizeSection.widthFormat')}
							size="sm"
							placement="bottom end"
							placeholder=""
							className="col-span-1 w-[28%]"
							items={height_mode}
							selectedKey={widthField.mode}
							onSelectionChange={(v) => widthField.onModeChange(v as string)}
						>
							{(item) => (
								<SelectOption id={item.value}>{item.label}</SelectOption>
							)}
						</Select>
					</div>

					<div className=" flex gap-2 w-[100%] ">
						<PanelRowContainer className=" min-w-[33%] w-auto px-0 " layoutType="col" hintKey="minWidth" label={t('sizeSection.minWidthPx')}>
							<div className=" flex items-center gap-1 w-auto ">
								<NumberField
									id="min-width"
									aria-label={t('sizeSection.minWidth')}
									minValue={0}
									className="w-[150px]"
									isDisabled={widthField.isMinMaxDisabled}
									value={widthField.minValue}
									onChange={widthField.onMinChange}
								>
									<NumberFieldInput size="sm" hideStepper />
								</NumberField>
								{!widthField.isMinMaxDisabled && widthField.hasMinValue && (
									<UnsetButton label={t('sizeSection.unsetMin')} onUnset={widthField.onUnsetMin} />
								)}
							</div>
						</PanelRowContainer>
						<PanelRowContainer className="  min-w-[33%] w-auto px-0 " layoutType="col" hintKey="maxWidth" label={t('sizeSection.maxWidthPx')}>
							<div className=" flex items-center gap-1 w-auto ">
								<NumberField
									id="max-width"
									aria-label={t('sizeSection.max')}
									minValue={0}
									className="w-[150px]"
									isDisabled={widthField.isMinMaxDisabled}
									value={widthField.maxValue}
									onChange={widthField.onMaxChange}
								>
									<NumberFieldInput size="sm" hideStepper />
								</NumberField>
								{!widthField.isMinMaxDisabled && widthField.hasMaxValue && (
									<UnsetButton label={t('sizeSection.unsetMax')} onUnset={widthField.onUnsetMax} />
								)}
							</div>
						</PanelRowContainer>
					</div>
				</PanelRowContainer>
			)}

			{node.contentType === "section" && (
				<div className="py-[6px]">
					<Checkbox
						className="!size-5 !rounded-[0.3rem]"
						checked={node.style.maxWidth === "100%"}
						onCheckedChange={(checked) => {
							canvas.updateNode((node) => {
								const tempNode = {
									...node,
									collapsable: true,
									style: {
										...node.style,
										maxWidth: checked ? "100%" : undefined,
									},
								};
								return tempNode;
							});
						}}
					>
						{t('sizeSection.maximizeWidth')}
					</Checkbox>
				</div>
			)}
		</SectionContainer>
	);
}

export default SizeSection;
