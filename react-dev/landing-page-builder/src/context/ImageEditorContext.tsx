import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";


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


interface ImageEditorProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>
    cropRef: React.RefObject<HTMLCanvasElement | null>
    setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
    resetState: () => void
    setIsCrop: React.Dispatch<React.SetStateAction<boolean>>
    exportWCrop: () => Promise<Blob>
    exportWTCrop: (source: HTMLCanvasElement, crop: cropBoxType) => Promise<Blob>
    handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void
    handlePointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void
    handlePointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void
    isProcessing: boolean
    setCanvasBox: React.Dispatch<React.SetStateAction<canvasBoxType>>,
    canvasBox: canvasBoxType
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
    isCrop: boolean
    imageWidth: number
    imageHeigth: number
    image: HTMLImageElement | null

    isEdit: boolean, setIsEdit: React.Dispatch<React.SetStateAction<boolean>>
    imageDetail: {
        fileName: string;
        width: number;
        height: number;
    }
    setImageDetail: React.Dispatch<React.SetStateAction<{
        fileName: string;
        width: number;
        height: number;

    }>>

    cropBox: cropBoxType
    setCropBox: React.Dispatch<React.SetStateAction<cropBoxType>>
}


// @ts-ignore
const ImageEditorContext = createContext<ImageEditorProps>(undefined);

interface imageType {
    image: HTMLImageElement
    naturalWidth: number,
    naturalHeight: number
}
const ImageEditorContextProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cropRef = useRef<HTMLCanvasElement>(null);

      const stageRef = useRef(null);
    const fileRef = useRef(null);

    const [rotation, setRotation] = React.useState(0);
    const [scaleX, setScaleX] = React.useState(1);
    const [scaleY, setScaleY] = React.useState(1);
    const [imgSize, setImgSize] = React.useState({ w: 200, h: 137 });

    const dragging = useRef(false);
    const lastPoint = useRef({ x: 0, y: 0 });
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [imageDetail, setImageDetail] = useState({
        fileName: '',
        width: 0,
        height: 0
    })
    const activeHandle = useRef<"tl" | "tr" | "bl" | "br" | null>(null);

    const [isProcessing, setIsProcessing] = useState(false)

    const [cropBox, setCropBox] = useState<cropBoxType>({
        positon: {
            x: 10,
            y: 10,
        },
        size: {
            width: 100,
            height: 100,
        },
    });



    const [canvasBox, setCanvasBox] = useState<canvasBoxType>({
        width: imageDetail?.width || 0,
        height: imageDetail?.height || 0,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        isFlippedX: false,
        isFlippedY: false,
    });

    function resetState() {

        setImageDetail(prev => ({
            ...prev,
            width: image?.naturalWidth || 450,
            height: image?.naturalHeight || 800
        }))
        setCropBox({
            positon: {
                x: 10,
                y: 10,
            },
            size: {
                width: 100,
                height: 100,
            },
        })
        setCanvasBox({
            width: imageDetail?.width || 0,
            height: imageDetail?.height || 0,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            isFlippedX: false,
            isFlippedY: false,
        })
    }

    const [isCrop, setIsCrop] = useState<boolean>(false);

    const imageWidth = imageDetail?.width || 0
    const imageHeigth = imageDetail?.height || 0






    async function exportWCrop(
    ): Promise<Blob> {

        if (!image) {
            throw new Error("Image is not ready")
        };


        const exportCanvas = document.createElement("canvas");


        exportCanvas.width = calculatedValueForCrop(1, getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).width);
        exportCanvas.height = calculatedValueForCrop(1, getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).height)

        const ctx = exportCanvas.getContext("2d");
        if (!ctx) {
            throw new Error("2d Context is not ready")
        };

        // Draw only the image (apply the same transforms you use in preview)
        ctx.save();

        ctx.translate(
            getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).width / 2 + canvasBox.x,
            getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).height / 2 + canvasBox.y

        );

        ctx.rotate((canvasBox.rotate * Math.PI) / 180);


        ctx.scale(
            canvasBox.isFlippedX ? -1 : 1,
            canvasBox.isFlippedY ? -1 : 1
        );


        // const fitScale = getFitScale(
        //     exportCanvas.width,
        //     exportCanvas.height,
        //     imageDetail?.width,
        //     imageDetail?.height,
        //     canvasBox.rotate
        // );

        const drawWidth = imageDetail?.width ;
        const drawHeight = imageDetail?.height ;

        ctx.drawImage(
            image,
            -drawWidth / 2,
            -drawHeight / 2,
            calculatedValueForCrop(1, drawWidth),
            calculatedValueForCrop(1, drawHeight),
        );
        ctx.restore()


        const displayWidth = calculatedValueForCrop(canvasBox.scale, cropBox.size.width)
        const displayHeight = calculatedValueForCrop(canvasBox.scale, cropBox.size.height)

        const centerX = (cropBox.positon.x + displayWidth/2) 
        const centerY = (cropBox.positon.y + displayHeight/2) 

        const newX = ((centerX - cropBox.size.width) / 2) - 100
        const newY = ((centerY - cropBox.size.height) / 2) - 100


        // const newX = cropBox.positon.x/canvasBox.scale

        // const newY =cropBox.positon.y/canvasBox.scale


        // const newX = (cropBox.positon.x + ((cropBox.size.width * canvasBox.scale) - (cropBox.size.width * 1)));
        // const newY = (cropBox.positon.y + ((cropBox.size.height * canvasBox.scale) - (cropBox.size.height * 1)));


      


        // 2. Crop from the rendered preview
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = displayWidth

        cropCanvas.height = displayHeight

        const cropCtx = cropCanvas.getContext("2d");
        if (!cropCtx) {
            throw new Error("Crop Box not ready!")
        };

        // cropCtx.drawImage(
        //     exportCanvas,
        //     (calculatedValueForCrop( canvasBox.scale, cropBox.positon.x) ),
        //     (calculatedValueForCrop( canvasBox.scale, cropBox.positon.y)) ,
        //     calculatedValueForCrop( canvasBox.scale, cropBox.size.width),
        //     calculatedValueForCrop( canvasBox.scale, cropBox.size.height),
        //     0,
        //     0,
        //     calculatedValueForCrop( canvasBox.scale, cropBox.size.width),
        //     calculatedValueForCrop(canvasBox.scale, cropBox.size.height),
        // );

        cropCtx.drawImage(
            exportCanvas,
            newX,
            newY,
            displayWidth,
            displayHeight,
            0,
            0,

            displayWidth,
            displayHeight
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
        exportCanvas.width = calculatedValueForCrop(1, getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).width);
        exportCanvas.height = calculatedValueForCrop(1, getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).height)

        const ctx = exportCanvas.getContext("2d");
        if (!ctx) {
            throw new Error("2d Context is not ready")
        };

        // Draw only the image (apply the same transforms you use in preview)
        ctx.save();

        ctx.translate(
            getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).width / 2 + canvasBox.x,
            getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate).height / 2 + canvasBox.y

        );

        ctx.rotate((canvasBox.rotate * Math.PI) / 180);


        ctx.scale(
            canvasBox.isFlippedX ? -1 : 1,
            canvasBox.isFlippedY ? -1 : 1
        );


        const fitScale = getFitScale(
            exportCanvas.width,
            exportCanvas.height,
            imageDetail?.width,
            imageDetail?.height,
            canvasBox.rotate
        );

        const drawWidth = imageDetail?.width * fitScale;
        const drawHeight = imageDetail?.height * fitScale;

        console.log(image)
        ctx.drawImage(
            image,
            -drawWidth / 2,
            -drawHeight / 2,
            calculatedValueForCrop(1, drawWidth),
            calculatedValueForCrop(1, drawHeight),
        );
        ctx.restore()



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
        w: number,
        h: number,
        degrees: number
    ) {
        const rad = (degrees * Math.PI) / 180;

        // const cos = Math.abs(Math.cos(radians));
        // const sin = Math.abs(Math.sin(radians));

        const newWidth =
            Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));

        const newHeight =
            Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));

        return {
            width: newWidth,
            height: newHeight,
        };
    }

    function drawCropBox(cropCtx: CanvasRenderingContext2D, cropRef: React.RefObject<HTMLCanvasElement | null>) {

        if (cropCtx && cropRef.current) {

            cropCtx.save()

            // Draw relative to the center
            // const left = -cropBox.size.width / 2;
            // const top = -cropBox.size.height / 2;
            // Dark overlay
            cropCtx.fillStyle = "rgba(0, 0, 0, 0.6)";

            // Top
            cropCtx.fillRect(0, 0, imageDetail?.width || 0, cropBox.positon.y + addYValue());

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

    useEffect(() => {
        if (!canvasRef?.current || !image) return;



        canvasRef.current!.width = imageDetail?.width;
        canvasRef.current!.height = imageDetail?.height;




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


        // console.log(image, canvasRef.current!.width, "drawImage")

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

    }, [image, isCrop, cropBox, canvasBox, imageDetail]);




    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragging.current = true;


        const rect = e.currentTarget.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // lastPoint.current = {
        //     x: x,
        //     y: y
        // };

        activeHandle.current = getHandle(x, y, cropBox);

        e.currentTarget.setPointerCapture(e.pointerId);
    };


    function calculatedValueForCrop(scale: number, scaledValue: number) {
        return scaledValue / (scale)
    }


    const rotatedSize = getRotatedBounds(imageDetail?.width, imageDetail?.height, canvasBox.rotate)

    function addYValue() {
        if (imageDetail?.height - 450 > 0) {
            return (imageDetail?.height - 450) / 2
        }
        return 0
    }
    function addXValue(cut?: number) {
        if (imageDetail?.width - 800 > 0) {
            return ((imageDetail?.width - 800) / 2) - (cut || 0)
        }
        return 0
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragging.current) return;

        const rect = e.currentTarget.getBoundingClientRect()

        const x = (e.clientX - rect.left) - lastPoint.current.x;
        const y = (e.clientY - rect.top) - lastPoint.current.y;

        // if (!isCrop) {

        //     const dx = (e.clientX - addXValue()-lastPoint.current.x) / 2
        //     const dy = (e.clientY - addYValue()-lastPoint.current.x) / 2

        //     setCanvasBox((prev) => ({
        //         ...prev,
        //         x: x/2,
        //         y: y/2
        //     }))


        // }





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

        // const rect = e.currentTarget.getBoundingClientRect();

        // const x = e.clientX - rect.left;
        // const y = e.clientY - rect.top;

        // lastPoint.current = {
        //     x: x,
        //     y: y
        // };


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
        if (imageDetail?.height - 450 > 0) {
            return y + (imageDetail?.height - 450) / 2
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
            tl: [crop.positon.x + addXValue(), PositionY(crop.positon.y)],
            tr: [crop.positon.x + crop.size.width + addXValue(), PositionY(crop.positon.y)],
            bl: [crop.positon.x + addXValue(), PositionY(crop.positon.y + crop.size.height)],
            br: [crop.positon.x + crop.size.width + addXValue(), PositionY(crop.positon.y + crop.size.height)],
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




    return <ImageEditorContext.Provider value={{
        canvasRef,
        cropRef,
        setImage,
        resetState,
        setIsCrop,
        exportWCrop,
        exportWTCrop,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        isProcessing,
        setCanvasBox,
        canvasBox,
        setIsProcessing,
        isCrop,
        imageWidth,
        imageHeigth,
        image,
        isEdit, setIsEdit,
        imageDetail, setImageDetail,
        cropBox, setCropBox
    }}  >
        {children}
    </ImageEditorContext.Provider>

}



export default ImageEditorContextProvider;


export const useImageEditor = () => (useContext(ImageEditorContext));