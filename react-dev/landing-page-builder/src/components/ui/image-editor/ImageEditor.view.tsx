import { PanelRowContainer, SectionContainer } from "@/components/PropertyPanelUI/ui";
import { RootState, useAppDispatch } from "@/store";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { Switch } from "@/components/ui/primitives/switch";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from "@/components/ui/Select";
import { noPan, pan, reset, rotate, setCrop, setImage, setImageFile, setScale, toggleFlipX, toggleFlipY, toggleIsEdit } from "@/store/imageEditor/image.editor.slice";
import { CropIcon, FlipHorizontal, FlipVertical, Loader, PlusIcon, RotateCcw, RotateCw } from "lucide-react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { CropRect } from "@/store/imageEditor/types";
import { AsyncLocalStorage } from "async_hooks";
import { useEditor } from "@/context/EditorContext";
import { CanvasNode } from "@/types/node.type";
import CSSUtils from "@/utils/CSS.utils";
import { changeImageUrlFromElement } from "@/utils/convertToCanvas";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { getIdFromUrl } from "@/utils/getIdFromUrl";
import { ProgressBar } from "@/components/ui/primitives/progress-bar";

const id = getIdFromUrl()

interface cropBoxType {
    positon: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
}

interface canvasBoxType {
    width: number;
    height: number;

    x: number;
    y: number;

    scale: number;
    rotate: number;
    isFlippedX: boolean;
    isFlippedY: boolean;
}


export function ImageEditorView({ image, isBg }: { image: HTMLImageElement, isBg: boolean }) {
    const canvas = useEditor()

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cropRef = useRef<HTMLCanvasElement>(null);
    const dragging = useRef(false);
    const lastPoint = useRef({ x: 0, y: 0 });

    const activeHandle = useRef<"tl" | "tr" | "bl" | "br" | null>(null);

    const [isProcessing, setIsProcessing] = useState(false)

    const [cropBox, setCropBox] = useState<cropBoxType>({
        positon: {
            x: 50,
            y: 50,
        },
        size: {
            width: image.naturalWidth < 300 ? image.naturalWidth / 2 : 300,
            height: image.naturalHeight < 300 ? image.naturalHeight / 2 : 300,
        },
    });

    const [canvasBox, setCanvasBox] = useState<canvasBoxType>({
        width: image.naturalWidth,
        height: image.naturalHeight,
        x: 0,
        y: 0,
        scale: 0.9,
        rotate: 0,
        isFlippedX: false,
        isFlippedY: false,
    });

    function resetState() {
        setCropBox({
            positon: {
                x: 50,
                y: 50,
            },
            size: {
                width: image.naturalWidth < 300 ? image.naturalWidth / 2 : 300,
                height: image.naturalHeight < 300 ? image.naturalHeight / 2 : 300,
            },
        })
        setCanvasBox({
            width: image.naturalWidth,
            height: image.naturalHeight,
            x: 0,
            y: 0,
            scale: 0.9,
            rotate: 0,
            isFlippedX: false,
            isFlippedY: false,
        })
    }

    const [isCrop, setIsCrop] = useState<boolean>(false);
    // const [image, setImage] = useState<HTMLImageElement>();
    // const [imageSrc, setImageSrc] = useState<string>();

    // const [file, setFile] = useState<File>();

    const imageWidth = image.naturalWidth
    const imageHeigth = image.naturalHeight



    async function exportCrop(
        source: HTMLCanvasElement,
        crop: cropBoxType
    ): Promise<Blob> {

        if (!canvasRef.current || !image) {
            throw new Error("Canvas not ready!")
        };

        // Your preview size
        const previewWidth = canvasRef.current.width + (canvasBox.x);
        const previewHeight = canvasRef.current.height + canvasBox.y

        // 1. Render the transformed image to an offscreen canvas
        const renderCanvas = document.createElement("canvas");
        renderCanvas.width = previewWidth + addXValue();
        renderCanvas.height = PositionY(previewHeight)

        const renderCtx = renderCanvas.getContext("2d");
        if (!renderCtx) {
            throw new Error("Render Canvas not ready!")
        };

        renderCtx.clearRect(0, 0, previewWidth, previewHeight);

        renderCtx.save();

        renderCtx.translate(
            (previewWidth / 2) + canvasBox.x,
            (previewHeight / 2) + canvasBox.y
        );

        renderCtx.rotate((canvasBox.rotate * Math.PI) / 180);

        renderCtx.scale(
            canvasBox.isFlippedX ? -canvasBox.scale : canvasBox.scale,
            canvasBox.isFlippedY ? -canvasBox.scale : canvasBox.scale
        );

        // Compute the fitted display size
        const fitScale = Math.min(
            previewWidth / image.naturalWidth,
            previewHeight / image.naturalHeight
        );

        const drawWidth = image.naturalWidth * fitScale;
        const drawHeight = image.naturalHeight * fitScale;

        renderCtx.drawImage(
            image,
            -drawWidth / 2,
            -(drawHeight / 2),
            drawWidth,
            drawHeight
        );

        renderCtx.restore();

        // 2. Crop from the rendered preview
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = cropBox.size.width;
        cropCanvas.height = cropBox.size.height;

        const cropCtx = cropCanvas.getContext("2d");
        if (!cropCtx) {
            throw new Error("Crop Box not ready!")
        };

        cropCtx.drawImage(
            renderCanvas,
            cropBox.positon.x + addXValue(),
            PositionY(crop.positon.y),
            cropBox.size.width,
            cropBox.size.height,
            0,
            0,
            cropBox.size.width,
            cropBox.size.height
        );



        return getCanvasBlob(cropCanvas);
    }


    async function exportWCrop(
    ): Promise<Blob> {

        if (!image) {
            throw new Error("Image is not ready")
        };

        const previewWidth = getRotatedBounds(image.naturalWidth + (canvasBox.x), image.naturalHeight + (canvasBox.y), canvasBox.rotate).width
        const previewHeight = getRotatedBounds(image.naturalWidth + canvasBox.x, image.naturalHeight + (canvasBox.y), canvasBox.rotate).height

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = previewWidth;
        exportCanvas.height = previewHeight

        const ctx = exportCanvas.getContext("2d");
        if (!ctx) {
            throw new Error("2d Context is not ready")
        };

        // Draw only the image (apply the same transforms you use in preview)
        ctx.save();

        ctx.translate(
            getRotatedBounds(previewWidth + canvasBox.x, previewHeight + canvasBox.y, canvasBox.rotate).width / 2,
            getRotatedBounds(previewWidth + canvasBox.x, previewHeight + canvasBox.y, canvasBox.rotate).height / 2

        );

        ctx.rotate((canvasBox.rotate * Math.PI) / 180);


        ctx.scale(
            canvasBox.isFlippedX ? -canvasBox.scale : canvasBox.scale,
            canvasBox.isFlippedY ? -canvasBox.scale : canvasBox.scale
        );


        const fitScale = getFitScale(
            exportCanvas.width,
            exportCanvas.height,
            image.naturalWidth,
            image.naturalHeight,
            canvasBox.rotate
        );

        const drawWidth = image.naturalWidth * fitScale;
        const drawHeight = image.naturalHeight * fitScale;

        console.log(image)

        ctx.drawImage(
            image,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight,
        );

        ctx.restore();

        // 2. Crop from the rendered preview
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = calculatedValueForCrop(canvasBox.scale, cropBox.size.width)

        cropCanvas.height = calculatedValueForCrop(canvasBox.scale, cropBox.size.height)

        const cropCtx = cropCanvas.getContext("2d");
        if (!cropCtx) {
            throw new Error("Crop Box not ready!")
        };

        cropCtx.drawImage(
            exportCanvas,
            (calculatedValueForCrop(1, cropBox.positon.x) + addXValue()),
            (calculatedValueForCrop(1, cropBox.positon.y)) + addYValue(),
            calculatedValueForCrop(canvasBox.scale, cropBox.size.width),
            calculatedValueForCrop(canvasBox.scale, cropBox.size.height),
            0,
            0,
            calculatedValueForCrop(canvasBox.scale, cropBox.size.width),
            calculatedValueForCrop(canvasBox.scale, cropBox.size.height),
        );



        return getCanvasBlob(cropCanvas);

    }

    async function exportWTCrop(
        source: HTMLCanvasElement,
        crop: cropBoxType
    ): Promise<Blob> {

        if (!image) {
            throw new Error("Image is not ready")
        };



        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = calculatedValueForCrop(canvasBox.scale, getRotatedBounds(image.naturalWidth, image.naturalHeight, canvasBox.rotate).width);
        exportCanvas.height = calculatedValueForCrop(canvasBox.scale, getRotatedBounds(image.naturalWidth, image.naturalHeight, canvasBox.rotate).height)

        const ctx = exportCanvas.getContext("2d");
        if (!ctx) {
            throw new Error("2d Context is not ready")
        };

        // Draw only the image (apply the same transforms you use in preview)
        ctx.save();

        ctx.translate(
            getRotatedBounds(image.naturalWidth, image.naturalHeight, canvasBox.rotate).width / 2 + canvasBox.x,
            getRotatedBounds(image.naturalWidth, image.naturalHeight, canvasBox.rotate).height / 2 + canvasBox.y

        );

        ctx.rotate((canvasBox.rotate * Math.PI) / 180);


        ctx.scale(
            canvasBox.isFlippedX ? -canvasBox.scale : canvasBox.scale,
            canvasBox.isFlippedY ? -canvasBox.scale : canvasBox.scale
        );


        const fitScale = getFitScale(
            exportCanvas.width,
            exportCanvas.height,
            image.naturalWidth,
            image.naturalHeight,
            canvasBox.rotate
        );

        const drawWidth = image.naturalWidth * fitScale;
        const drawHeight = image.naturalHeight * fitScale;

        console.log(image)
        ctx.drawImage(
            image,
            -drawWidth / 2,
            -drawHeight / 2,
            calculatedValueForCrop(canvasBox.scale, drawWidth),
            calculatedValueForCrop(canvasBox.scale, drawHeight),
        );

        ctx.restore();



        return getCanvasBlob(exportCanvas);
    }

    function getFitScale(
        canvasWidth: number,
        canvasHeight: number,
        imageWidth: number,
        imageHeight: number,
        degrees: number
    ) {
        const r = (degrees * Math.PI) / 180;

        const cos = Math.abs(Math.cos(r));
        const sin = Math.abs(Math.sin(r));

        const rotatedWidth = imageWidth * cos + imageHeight * sin;
        const rotatedHeight = imageWidth * sin + imageHeight * cos;

        return Math.min(
            canvasWidth / rotatedWidth,
            canvasHeight / rotatedHeight
        );
    }

    function getRotatedBounds(
        width: number,
        height: number,
        degrees: number
    ) {
        const radians = (degrees * Math.PI) / 180;

        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        return {
            width: width * cos + height * sin,
            height: width * sin + height * cos,
        };
    }


    const HANDLE_SIZE = 24;

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!canvasRef?.current || !image) return;
        canvasRef.current!.width = image.naturalWidth;
        canvasRef.current!.height = image.naturalHeight;


        const ctx = canvasRef.current.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        ctx.save();

        ctx.translate(
            canvasRef.current!.width / 2,
            canvasRef.current!.height / 2,
        );

        ctx.translate(canvasBox.x, canvasBox.y);

        ctx.rotate((canvasBox.rotate * Math.PI) / 180);

        ctx.scale(
            canvasBox.isFlippedX ? -canvasBox.scale : canvasBox.scale,
            canvasBox.isFlippedY ? -canvasBox.scale : canvasBox.scale,
        );

        ctx.drawImage(
            image,
            -canvasRef.current!.width / 2,
            -canvasRef.current!.height / 2,
            imageWidth,
            imageHeigth
        );

        ctx.restore();


        if (isCrop && canvasRef.current) drawCropBox(ctx, canvasRef);

        ctx.restore();

    }, [image, isCrop, cropBox, canvasBox]);


    function drawCropBox(cropCtx: CanvasRenderingContext2D, cropRef: React.RefObject<HTMLCanvasElement | null>) {





        if (cropCtx && cropRef.current) {

            cropCtx.save()

            // Draw relative to the center
            // const left = -cropBox.size.width / 2;
            // const top = -cropBox.size.height / 2;
            // Dark overlay
            cropCtx.fillStyle = "rgba(0, 0, 0, 0.6)";

            // Top
            cropCtx.fillRect(0, 0, image.naturalWidth, cropBox.positon.y + addYValue());

            // Bottom
            cropCtx.fillRect(
                0,
                (cropBox.positon.y + cropBox.size.height + addYValue()),
                cropRef.current.width,
                cropRef.current.height - (cropBox.positon.y + cropBox.size.height),
            );

            // Left
            cropCtx.fillRect(
                0,
                (cropBox.positon.y + addYValue()),
                cropBox.positon.x + addXValue(),
                cropBox.size.height,
            );

            // Right
            cropCtx.fillRect(
                cropBox.positon.x + cropBox.size.width + addXValue(),
                (cropBox.positon.y + addYValue()),
                cropRef.current.width - (cropBox.positon.x + cropBox.size.width + addXValue()),
                cropBox.size.height,
            );
            // Clear crop area
            // cropCtx.clearRect(
            //     editorState.crop.x,
            //     editorState.crop.y,
            //     editorState.crop.width,
            //     editorState.crop.height
            // );

            // Border
            cropCtx.strokeStyle = "#ffffff00";
            cropCtx.lineWidth = 2;
            cropCtx.strokeRect(
                cropBox.positon.x + addXValue(),
                (cropBox.positon.y + cropBox.size.width + addYValue()),
                -(cropRef.current.width - 50) / 2,
                -(cropRef.current.width - 50) / 2,
            );
            // Handles
            // Top-left
            drawHandle(cropCtx, cropBox.positon.x + addXValue(), (cropBox.positon.y + addYValue()));

            // Top-right
            drawHandle(
                cropCtx,
                cropBox.positon.x + cropBox.size.width + addXValue(),
                (cropBox.positon.y + addYValue()),
            );

            // Bottom-left
            drawHandle(
                cropCtx,
                cropBox.positon.x + addXValue(),
                (cropBox.positon.y + cropBox.size.height + addYValue()),
            );

            // Bottom-right
            drawHandle(
                cropCtx,
                cropBox.positon.x + cropBox.size.width + addXValue(),
                (cropBox.positon.y + cropBox.size.height + addYValue()),
            );
            cropCtx.restore();
        }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragging.current = true;

        // lastPoint.current = {
        //   x: cropBox.positon.x,
        //   y: cropBox.positon.y,
        // };

        const rect = e.currentTarget.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        activeHandle.current = getHandle(x, y, cropBox);

        e.currentTarget.setPointerCapture(e.pointerId);
    };


    function calculatedValueForCrop(scale: number, scaledValue: number) {
        return scaledValue / (scale)
    }



    function addYValue() {
        if (image.naturalHeight - 600 > 0) {
            return (image.naturalHeight - 600) / 2
        }
        return 0
    }
    function addXValue(cut?: number) {
        if (image.naturalWidth - 800 > 0) {
            return ((image.naturalWidth - 800) / 2) - (cut || 0)
        }
        return 0
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragging.current) return;

        lastPoint.current = {
            x: cropBox.positon.x,
            y: cropBox.positon.y,
        };

        const rect = e.currentTarget.getBoundingClientRect()

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const l = e.clientX - rect.left;
        const t = e.clientY - rect.top;

        const b = e.clientY - rect.bottom;
        const r = e.clientX - rect.right;


        switch (activeHandle.current) {
            case "br":

                setCropBox(resizeBottomRight(cropBox, x - addXValue(), y - addYValue()));

                break;
            case "tr":

                setCropBox(resizeTopRight(cropBox, x - addXValue(), y - addYValue()));

                break;

            case "tl":

                setCropBox(resizeTopLeft(cropBox, x - addXValue(), y - addYValue()));

                break;
            case "bl":

                setCropBox(resizeBottomLeft(cropBox, x - addXValue(), y - addYValue()));

                break;
        }
    };

    // console.log(cropBox.positon);

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragging.current = false;

        activeHandle.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
        e.target.removeEventListener(('drag'), handlePointerMove.bind(this, e))
    };

    function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
        if (!ctx) return;

        const size = 30;

        ctx.fillStyle = "#fff";
        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    }

    function resizeBottomRight(
        crop: cropBoxType,
        mouseX: number,
        mouseY: number,
    ): cropBoxType {
        return {
            ...crop,
            size: {
                ...crop.size,
                width: Math.max(20, mouseX - crop.positon.x),
                height: Math.max(20, mouseY - crop.positon.y),
            },
        };
    }
    function resizeTopRight(
        crop: cropBoxType,
        mouseX: number,
        mouseY: number,
    ): cropBoxType {
        const left = crop.positon.x;
        const bottom = crop.positon.y + crop.size.height;

        const width = Math.max(20, mouseX - left);
        const height = Math.max(20, bottom - mouseY);

        return {
            ...crop,
            positon: {
                x: left,
                y: bottom - height,
            },
            size: {
                ...crop.size,
                width,
                height,
            },
        };
    }

    function resizeTopLeft(
        crop: cropBoxType,
        mouseX: number,
        mouseY: number,
    ): cropBoxType {
        const right = crop.positon.x + crop.size.width;
        const bottom = crop.positon.y + crop.size.height;

        return {
            ...crop,
            positon: {
                x: mouseX,
                y: mouseY,
            },
            size: {
                ...crop.size,
                width: Math.max(20, right - mouseX),
                height: Math.max(20, bottom - mouseY),
            },
        };
    }

    function resizeBottomLeft(
        crop: cropBoxType,
        mouseX: number,
        mouseY: number,
        minSize = 20,
    ): cropBoxType {
        const right = crop.positon.x + crop.size.width;
        const top = crop.positon.y;

        return {
            ...crop,
            positon: {
                x: right - Math.max(minSize, right - mouseX),
                y: top,
            },
            size: {
                ...crop.size,
                width: Math.max(20, right - mouseX),
                height: Math.max(20, mouseY - top),
            },
        };
    }


    function PositionY(y: number) {
        if (image.naturalHeight - 600 > 0) {
            return y + (image.naturalHeight - 600) / 2
        }
        return y
    }

    function getHandle(
        mouseX: number,
        mouseY: number,
        crop: cropBoxType,
    ): "tl" | "tr" | "bl" | "br" | null {
        const s = 60;

        const points = {
            tl: [crop.positon.x + addXValue(15), PositionY(crop.positon.y)],
            tr: [crop.positon.x + crop.size.width + addXValue(15), PositionY(crop.positon.y)],
            bl: [crop.positon.x + addXValue(15), PositionY(crop.positon.y + crop.size.height)],
            br: [crop.positon.x + crop.size.width + addXValue(15), PositionY(crop.positon.y + crop.size.height)],
        } as const;

        for (const [key, [hx, hy]] of Object.entries(points)) {
            if (Math.abs(mouseX - hx) <= s && Math.abs(mouseY - hy) <= s) {
                return key as "tl" | "tr" | "bl" | "br";
            }
        }

        return null;
    }

    const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {

        return new Promise((resolve, reject) => {

            try {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        setIsProcessing(false)
                        reject(new Error('Canvas toBlob conversion failed'));
                    }
                }, 'image/png')
            }
            catch (error) {
                setIsProcessing(false)
                reject(error);
            }

        });
    };


    /**
      * File Handindling
      */
    const { handleUpload, selectedFile } = useUploadToS3({
        subFolder: `${id}`
    })

    return (
        <div style={{
            zoom: !isBg ? '120%' : ""
        }} className=" min-w-[100%] min-h-[100%] w-screen h-screen bg-muted/30 backdrop-blur-sm flex  z-[999999] bottom-0 right-0 justify-center items-center px-2 py-2  fixed " >
            <div className="  min-w-[102vw] min-h-[102vh] max-h-[100vh] max-w-[100vw]  overflow-clip  rounded relative flex justify-center items-center " >


                <div className="  min-w-full min-h-full   "
                    style={{
                        position: "relative",
                        width: "auto",
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {
                        isProcessing && selectedFile && <div className=" absolute w-full h-full bg-[#23232320] backdrop-blur flex justify-center items-center " >
                            <div className=" w-auto h-auto  rounded-full " >
                                <div className='text-foreground'>Processing...</div>
                                <ProgressBar value={Math.round(selectedFile.progress)} className="w-[7.5rem] h-[0.25rem]" />
                            </div>
                        </div>
                    }
                    <canvas
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{
                            backgroundColor: "rgb(var(--muted))",
                        }}
                        width={800}
                        height={600}
                        ref={canvasRef}
                    ></canvas>

                </div>


            </div>
            {/* <div className=" border border-slate-500 px-3 py-2 rounded-lg h-auto min-w-[400px] w-auto justify-start items-center " > */}
            {/* <SectionContainer direction="col" label="" >
                        <PanelRowContainer className=" py-0 " layoutType="col" >
                            <PanelRowContainer layoutType="col" label="Scale" >
                                <NumberField
                                    id="min-Height"
                                    aria-label="Min Height"
                                    // className="min-w-[50%]"
                                    step={0.1}
                                    value={canvasBox.scale}
                                    onChange={(v) => {
                                        setCanvasBox((prev) => ({
                                            ...prev,
                                            scale: v
                                        }))
                                    }}

                                >
                                    <NumberFieldInput size="sm" hideStepper />
                                </NumberField>
                            </PanelRowContainer>

                            <PanelRowContainer layoutType="col" label="Rotate" >
                                <NumberField
                                    id="min-Height"
                                    aria-label="Min Height"
                                    // className="min-w-[50%]"
                                    value={canvasBox.rotate}
                                    onChange={(v) => {
                                        setCanvasBox((prev) => ({
                                            ...prev,
                                            rotate: v
                                        }))
                                    }}
                                >
                                    <NumberFieldInput size="sm" hideStepper />
                                </NumberField>
                            </PanelRowContainer>
                        </PanelRowContainer>


                        <PanelRowContainer className="  " layoutType="col" label="Flip " >

                            <PanelRowContainer className=" px-0 " layoutType="row" label="X :" >

                                <Switch



                                    id="min-Height"
                                    aria-label="Min Height"
                                    // className="min-w-[50%]"
                                    value={"false"}
                                    onCheckedChange={(v) => {
                                        console.log(v)
                                        // dispatch(setScale(-editorState.scale))

                                        setCanvasBox((prev) => ({
                                            ...prev,
                                            isFlippedX: v
                                        }))

                                    }}
                                // onChange={(v) => {


                                // }}
                                >
                                </Switch>
                            </PanelRowContainer>

                            <PanelRowContainer className=" px-0 " layoutType="row" label="Y :" >

                                <Switch



                                    id="min-Height"
                                    aria-label="Min Height"
                                    // className="min-w-[50%]"
                                    value={"false"}
                                    onCheckedChange={(v) => {
                                        console.log(v)
                                        // dispatch(setScale(-editorState.scale))

                                        setCanvasBox((prev) => ({
                                            ...prev,
                                            isFlippedY: v
                                        }))

                                    }}
                                // onChange={(v) => {
                                //     dispatch(setScale(-editorState.scale))
                                // }}
                                >
                                </Switch>
                            </PanelRowContainer>
                        </PanelRowContainer>
                    </SectionContainer> */}

            {/* <div className=" flex w-full gap-4 justify-center items-end h-[60px] " >
                        <div onClick={async () => {
                            if (!canvasRef?.current) return;

                            const blob = await exportCrop(canvasRef?.current, cropBox)

                            const file = new File([blob], "edited-image.png", {
                                type: "image/png",
                            });

                            const { access_url, signedUrl } = await handleUpload(file)


                            dispatch(toggleIsEdit())

                            canvas.updateNodeStyle({
                                backgroundImage: `url(${access_url})`
                            })
                            resetState()


                        }} className=" border cursor-pointer rounded-md px-4 text-primary-foreground py-2 bg-primary flex justify-center items-center " >
                            <p>
                                Save
                            </p>
                        </div>

                        <div onClick={async () => {

                            dispatch(toggleIsEdit())
                            resetState()




                        }} className=" border cursor-pointer rounded-md px-4 text-primary-foreground py-2 bg-primary flex justify-center items-center " >
                            <p>
                                Cancel
                            </p>
                        </div>
                    </div> */}
            {/* </div> */}
            {/* <div className=" flex  w-full h-auto relative justify-start items-start p-4 gap-4 " >
                    


                    
                </div> */}


            <div className=" cursor-default bg-popover/90    flex w-auto h-[48px] justify-start items-center  border-border/50 rounded-lg backdrop-blur-sm absolute z-10 bottom-10 " >
                {
                    isProcessing && <div className=" absolute w-full h-full bg-[#23232320] backdrop-blur flex justify-center items-center " >
                        <div className=" w-auto h-auto  transition-all rounded-full " >
                            {/* <Loader size={24} /> */}
                        </div>
                    </div>
                }
                <div className=" flex border-y border-l rounded-l-md mr-2 border-border/30 h-full py-2  px-3 gap-3 justify-center items-center  " >
                    <div onClick={() => {
                        setCanvasBox((prev) => ({
                            ...prev,
                            scale: prev.scale + 0.1
                        }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <FiPlus size={16} />
                    </div>

                    <div className=" cursor-default px-2 h-[12px] text-[16px] border-x-[2px] border-border/50 text-muted-foreground text-pretty text-center flex justify-center items-center " >
                        {(canvasBox.scale * 100).toFixed(0)} <span className=" text-[15px] mt-[1px] ml-[1.2px] " >%</span>
                    </div>

                    <div onClick={() => {
                        setCanvasBox((prev) => ({
                            ...prev,
                            scale: prev.scale - 0.1
                        }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <FiMinus size={16} />
                    </div>
                </div>

                <span className=" min-w-[1px] h-[70%] bg-border/30 " >

                </span>

                <div className=" flex border-y  ml-2 border-border/30 h-full py-2  px-1 gap-3 justify-center items-center  " >
                    <div onClick={() => {
                        if (canvasBox.rotate > -360)
                            setCanvasBox((prev) => ({
                                ...prev,
                                rotate: prev.rotate - 45
                            }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <RotateCcw size={16} />
                    </div>

                    <div className=" cursor-default px-2 h-[12px] text-[16px] border-x-[2px] border-border/50 text-muted-foreground text-pretty text-center flex justify-center items-center " >
                        {(canvasBox.rotate).toFixed(0)} <span className=" text-[15px] mt-[1px] ml-[1.2px] " >&deg;</span>
                    </div>

                    <div onClick={() => {
                        if (canvasBox.rotate < 360)
                            setCanvasBox((prev) => ({
                                ...prev,
                                rotate: prev.rotate + 45
                            }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <RotateCw size={16} />
                    </div>
                </div>
                <span className=" min-w-[1px] h-[70%] bg-border/30 " >

                </span>

                <div className=" flex border-y  ml-2 border-border/30 h-full py-2  px-1 gap-3 justify-center items-center  " >
                    <div onClick={() => {
                        setCanvasBox((prev) => ({
                            ...prev,
                            isFlippedX: !prev.isFlippedX
                        }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <FlipHorizontal size={16} />
                    </div>



                    <div onClick={() => {
                        setCanvasBox((prev) => ({
                            ...prev,
                            isFlippedY: !prev.isFlippedY
                        }))
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <FlipVertical size={16} />
                    </div>
                </div>

                <span className=" min-w-[1px] h-[70%] bg-border/30 " >

                </span>

                <div className=" flex border-y border-r rounded-r-md ml-2 border-border/30 h-full py-2 px-3   gap-3 justify-center items-center  " >
                    <div onClick={() => {
                        setIsCrop(prev => !prev)
                    }} className=" cursor-pointer rounded hover:border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-popover-foreground " >
                        <CropIcon size={16} />
                    </div>

                    {/* <div className=" cursor-default px-2 h-[12px] text-[16px] border-x-[2px] border-gray-400/50 text-slate-300 text-pretty text-center flex justify-center items-center " >
                                    {(canvasBox.rotate).toFixed(0)} <span className=" text-[15px] mt-[1px] ml-[1.2px] " >&deg;</span>
                                </div>

                                <div onClick={() => {
                                    if (canvasBox.rotate < 360)
                                        setCanvasBox((prev) => ({
                                            ...prev,
                                            scale: prev.rotate - 45
                                        }))
                                }} className=" cursor-pointer rounded hover:border border-gray-500 p-[2px] w-[24px] h-[24px] flex justify-center items-center text-slate-50 " >
                                    <RotateCw size={16} />
                                </div> */}
                </div>


            </div>

            <div className=" absolute flex w-auto px-2 gap-4 justify-center items-end top-10 right-10 py-2 h-[60px] " >
                <div
                 onClick={
                    async () => {
                    if (!canvasRef?.current || isProcessing) return;

                    setIsProcessing(true)

                    const blob = await (isCrop ? exportWCrop() : exportWTCrop(canvasRef?.current, {
                        positon: {
                            x: 0,
                            y: 0
                        },
                        size: {
                            width: imageWidth,
                            height: imageHeigth
                        }
                    }))

                    const file = new File([blob], "edited-image.png", {
                        type: "image/png",
                    });

                    const { access_url, signedUrl } = await handleUpload(file)


                    setIsProcessing(false)
                    dispatch(toggleIsEdit())

                    isBg ? canvas.updateNodeStyle({
                        backgroundImage: `url(${access_url})`
                    }) :

                        canvas.updateNode((node) => ({
                            ...node,
                            children: access_url
                        }))

                    resetState()


                }
            } 
                className=" border cursor-pointer rounded-md px-4 gap-2 text-primary-foreground py-2 bg-primary flex justify-center items-center " >
                    <p>
                        Save
                    </p> {isProcessing && <Loader size={16} />}
                </div>

                <div onClick={async () => {
                    if (isProcessing) return;
                    dispatch(toggleIsEdit())
                    resetState()




                }} className=" border cursor-pointer rounded-md px-4 text-primary-foreground py-2 bg-primary flex justify-center items-center " >
                    <p>
                        Cancel
                    </p>
                </div>
            </div>


        </div>

    )
}