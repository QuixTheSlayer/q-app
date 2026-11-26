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
import { useDimensionField } from "@/components/PropertyPanelUI/Sections/useDimensionField";
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

function ContentSizeSection() {
    const { t } = useTranslation("propertyPanel");
    const canvas = useEditor();
    const node = canvas?.focusedNode as LayoutNode;

    const heightField = useDimensionField("height");
    const widthField = useDimensionField("width");

    return (
        <SectionContainer label={t('contentSizeSection.size')}>
            {/**
             * Height
             */}
            <PanelRowContainer className="px-2 py-2" layoutType="col" hintKey="height" label={t('contentSizeSection.height')} multiField htmlFor="size-height">
                <div className="w-full flex gap-1">
                    <NumberField
                        id="size-height"
                        aria-label={t('contentSizeSection.height')}
                        minValue={0}
                        className="w-[67%]"
                        isDisabled={heightField.isValueDisabled}
                        value={heightField.numericValue}
                        onChange={heightField.onValueChange}
                    >
                        <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                    <Select
                        id="size-height-format"
                        aria-label={t('contentSizeSection.heightFormat')}
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

                <div className="flex gap-2 w-full">
                    <PanelRowContainer className="min-w-[33%] w-auto px-0" layoutType="col" hintKey="minHeight" label={t('contentSizeSection.minHeightPx')}>
                        <div className="flex items-center gap-1 w-auto">
                            <NumberField
                                id="min-Height"
                                aria-label={t('contentSizeSection.minHeight')}
                                minValue={0}
                                className="w-[150px]"
                                isDisabled={heightField.isMinMaxDisabled}
                                value={heightField.minValue}
                                onChange={heightField.onMinChange}
                            >
                                <NumberFieldInput size="sm" hideStepper />
                            </NumberField>
                            {!heightField.isMinMaxDisabled && heightField.hasMinValue && (
                                <UnsetButton label={t('contentSizeSection.unsetMin')} onUnset={heightField.onUnsetMin} />
                            )}
                        </div>
                    </PanelRowContainer>
                    <PanelRowContainer className="min-w-[33%] w-auto px-0" layoutType="col" hintKey="maxHeight" label={t('contentSizeSection.maxHeightPx')}>
                        <div className="flex items-center gap-1 w-auto">
                            <NumberField
                                id="max-Height"
                                aria-label={t('contentSizeSection.maxHeight')}
                                minValue={0}
                                className="w-[150px]"
                                isDisabled={heightField.isMinMaxDisabled}
                                value={heightField.maxValue}
                                onChange={heightField.onMaxChange}
                            >
                                <NumberFieldInput size="sm" hideStepper />
                            </NumberField>
                            {!heightField.isMinMaxDisabled && heightField.hasMaxValue && (
                                <UnsetButton label={t('contentSizeSection.unsetMax')} onUnset={heightField.onUnsetMax} />
                            )}
                        </div>
                    </PanelRowContainer>
                </div>
            </PanelRowContainer>

            <span className="h-5 w-full flex justify-start items-center">
                <span className="bg-muted h-[1px] w-[90%]"></span>
            </span>

            {/**
             * Width
             */}
            {node.contentType && (
                <PanelRowContainer className="px-2 py-2" layoutType="col" hintKey="width" label={t('contentSizeSection.width')} multiField htmlFor="size-width">
                    <div className="w-full flex gap-1">
                        <NumberField
                            id="size-width"
                            aria-label={t('contentSizeSection.width')}
                            minValue={0}
                            className="w-[68%]"
                            isDisabled={widthField.isValueDisabled}
                            value={widthField.numericValue}
                            onChange={widthField.onValueChange}
                        >
                            <NumberFieldInput size="sm" hideStepper />
                        </NumberField>
                        <Select
                            id="size-width-format"
                            aria-label={t('contentSizeSection.widthFormat')}
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

                    <div className="flex gap-2 w-full">
                        <PanelRowContainer className="min-w-[33%] w-auto px-0" layoutType="col" hintKey="minWidth" label={t('contentSizeSection.minWidthPx')}>
                            <div className="flex items-center gap-1 w-auto">
                                <NumberField
                                    id="min-width"
                                    aria-label={t('contentSizeSection.minWidth')}
                                    minValue={0}
                                    className="w-[150px]"
                                    isDisabled={widthField.isMinMaxDisabled}
                                    value={widthField.minValue}
                                    onChange={widthField.onMinChange}
                                >
                                    <NumberFieldInput size="sm" hideStepper />
                                </NumberField>
                                {!widthField.isMinMaxDisabled && widthField.hasMinValue && (
                                    <UnsetButton label={t('contentSizeSection.unsetMin')} onUnset={widthField.onUnsetMin} />
                                )}
                            </div>
                        </PanelRowContainer>
                        <PanelRowContainer className="min-w-[33%] w-auto px-0" layoutType="col" hintKey="maxWidth" label={t('contentSizeSection.maxWidthPx')}>
                            <div className="flex items-center gap-1 w-auto">
                                <NumberField
                                    id="max-width"
                                    aria-label={t('contentSizeSection.max')}
                                    minValue={0}
                                    className="w-[150px]"
                                    isDisabled={widthField.isMinMaxDisabled}
                                    value={widthField.maxValue}
                                    onChange={widthField.onMaxChange}
                                >
                                    <NumberFieldInput size="sm" hideStepper />
                                </NumberField>
                                {!widthField.isMinMaxDisabled && widthField.hasMaxValue && (
                                    <UnsetButton label={t('contentSizeSection.unsetMax')} onUnset={widthField.onUnsetMax} />
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
                        {t('contentSizeSection.maximizeWidth')}
                    </Checkbox>
                </div>
            )}
        </SectionContainer>
    );
}

export default ContentSizeSection;
