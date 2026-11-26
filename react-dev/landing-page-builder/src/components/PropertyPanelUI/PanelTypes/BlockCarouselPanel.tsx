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
    BlockCarouselNode,
    LayoutNode,
} from "@/types/node.type";
import CSSUtils from "@/utils/CSS.utils";
import { Button, buttonVariants } from "@/components/ui/primitives/button";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { TextInput } from "@/components/ui/primitives/text-input";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/primitives/progress-bar";
import React, { useMemo, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import RenderNode from "@/components/EditorUI/RenderNode";
import { useTranslation } from "react-i18next";

import withSizeGridTab from './withSizeGridTab'
import ColorPicker from "@/components/ui/ColorPicker";
function BlockCarouselPanel() {
    const { t } = useTranslation("propertyPanel");
    const canvas = useEditor();
    const node = canvas?.focusedNode as BlockCarouselNode;

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

    const [selectedNodes,setSelectedNode] = useState<LayoutNode[]> ([])

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

    const updateBlockes = (blockes: LayoutNode[]) => {
        canvas.updateNode((n) => ({ ...n, blockes }) as ContentNode);
    };

    if (node)
        return (
            <div className=' w-full max-h-[100%] no-scrollbar overflow-auto '>
                <SectionContainer hintKey="gap" label={t("blockCarouselPanel.images")}>
                    <div {...dragHandlers} className="flex flex-col gap-2">
                        {/* Image List */}
                        <div className="grid grid-cols gap-2">
                            {node.blockes.map((blockNode,i) => (
                                <CarouselItem
                                    key={i}
                                    block={blockNode}
                                    index={i}
                                    onRemove={() =>
                                        updateBlockes(node.blockes.filter((_, x) => x !== i))
                                    }
                                    onMoveUp={() => {
                                        if (i === 0) return;
                                        const list = [...node.blockes];
                                        [list[i - 1], list[i]] = [list[i], list[i - 1]];
                                        updateBlockes(list);
                                    }}
                                    onMoveDown={() => {
                                        if (i === node.blockes.length - 1) return;
                                        const list = [...node.blockes];
                                        [list[i + 1], list[i]] = [list[i], list[i + 1]];
                                        updateBlockes(list);
                                    }}
                                />
                            ))}
                            {/* {selectedNodes.length && (
                                <div
                                    className={cn(
                                        "group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border  border-gray-400 bg-gray-50 hover:border-blue-500/80  cursor-pointer overflow-hidden",
                                    )}
                                >
                                  {  selectedNodes.map((blockNode)=>{
                                    return (
                                         <RenderNode path="container" node={blockNode} />
                                    )
                                    })}
                                  
                                   
                                </div>
                            )} */}
                        </div>

                        {/* Upload Area */}
                        {/* <label
                            htmlFor="carousel-uploader"
                            className={cn(
                                "group h-[8rem] rounded-[0.65rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-gray-400 bg-gray-50 hover:border-blue-500/80 hover:border-2 cursor-pointer",
                                isDragging && "border-2 !border-blue-500/80 !bg-blue-100/60",
                            )}
                        >
                            <CiCirclePlus
                                size={32}
                                className="text-gray-400 group-hover:text-blue-500"
                            />
                            <p className="text-gray-500 text-[0.8rem] font-semibold">
                                Add Images
                            </p>
                            <p className="text-[0.75rem] text-gray-500">15 MB Max</p>
                        </label> */}

                        {/* <input
                            id="carousel-uploader"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                e.target.files && handleFileChange(e.target.files)
                            }
                        /> */}
                    </div>
                </SectionContainer>

                <SectionContainer label={t("blockCarouselPanel.controls")}>
                    <div className="py-[6px]">
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
                            {t("blockCarouselPanel.autoplay")}
                        </Checkbox>
                    </div>
                    <PanelRowContainer layoutType="col"
                        hintKey="columns" label={t("blockCarouselPanel.imagesPerView")}
                        multiField
                        htmlFor="images-per-view"
                    >
                        <NumberField
                            id="images-per-view"
                            aria-label={t("blockCarouselPanel.imagesPerView")}
                            minValue={1}
                            maxValue={10}
                            className={"col-span-2"}
                            // isDisabled={!node.autoPlay}
                            value={node?.imagesPerView || 1}
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

                    <PanelRowContainer layoutType="col"
                        hintKey="columns" label={t("blockCarouselPanel.slidesPerScroll")}
                        multiField
                        htmlFor="slides-per-scroll"
                    >
                        <NumberField
                            id="slides-per-scroll"
                            aria-label={t("blockCarouselPanel.slidesPerScroll")}
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

                    <PanelRowContainer layoutType="col" hintKey="scaleZoom" label={t("blockCarouselPanel.delay")} multiField htmlFor="scroll-delay">
                        <NumberField
                            id="scroll-delay"
                            aria-label={t("blockCarouselPanel.scrollDelay")}
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


                <SectionContainer hintKey="styleGroup" label={t("blockCarouselPanel.style")}>
                    <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t("blockCarouselPanel.background")}>
                        <ColorPicker
                            value={node.style.backgroundColor || ""}
                            onChange={(v) => {
                                canvas.updateNodeStyle({
                                    backgroundColor: v,
                                });
                            }}
                        />
                    </PanelRowContainer>

                    <PanelRowContainer layoutType="col" hintKey="gap" label={t("blockCarouselPanel.gap")} multiField htmlFor="image-gap">
                        <NumberField
                            id="image-gap"
                            aria-label={t("blockCarouselPanel.gapBetweenImages")}
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

                    <PanelRowContainer layoutType="col" hintKey="objectFit" label={t("blockCarouselPanel.objectFit")} multiField htmlFor="object-fit">
                        <Select
                            id="object-fit"
                            aria-label={t("blockCarouselPanel.objectFit")}
                            size="sm"
                            placement="bottom end"
                            placeholder=""
                            className="col-span-2"
                            selectedKey={node?.objectFit || "contain"}
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
                            <SelectOption id="contain">{t("blockCarouselPanel.contain")}</SelectOption>
                            <SelectOption id="cover">{t("blockCarouselPanel.cover")}</SelectOption>
                        </Select>
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
    block,
    index,
    onRemove,
    onMoveUp,
    onMoveDown,
}: {
    block: LayoutNode;
    index: number;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    return (
        <div className="group relative h-[9rem] rounded-lg overflow-hidden border bg-muted">
           <RenderNode node={block} path="container" />

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

export default withSizeGridTab(BlockCarouselPanel)
