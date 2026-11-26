import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CropIcon, FlipHorizontal, FlipVertical, RectangleHorizontal, RotateCcw, RotateCw } from "lucide-react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Image } from 'react-konva';
import { useImage } from 'react-konva-utils';
import type Konva from "konva";
import { useImageEditor } from "@/context/ImageEditorContext";
import { useImageEditorKonva } from "@/context/ImageEditorKonvaContext";
import LabeledNumberInput from "@/components/ui/inputs/LabeledNumberInput";

// import { ProgressBar } from "judgify-react-ui/primitives";


const positions = [
    'left-top', 'center-top', 'right-top', '--',
    'left-middle', 'center-middle', 'right-middle', '--',
    'left-bottom', 'center-bottom', 'right-bottom'
];

function getCrop(image, size, clipPosition = 'center-middle') {
    const width = size.width;
    const height = size.height;
    const aspectRatio = width / height;

    let newWidth;
    let newHeight;

    const imageRatio = image.width / image.height;

    if (aspectRatio >= imageRatio) {
        newWidth = image.width;
        newHeight = image.width / aspectRatio;
    } else {
        newWidth = image.height * aspectRatio;
        newHeight = image.height;
    }

    let x = 0;
    let y = 0;
    if (clipPosition === 'left-top') {
        x = 0;
        y = 0;
    } else if (clipPosition === 'left-middle') {
        x = 0;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'left-bottom') {
        x = 0;
        y = image.height - newHeight;
    } else if (clipPosition === 'center-top') {
        x = (image.width - newWidth) / 2;
        y = 0;
    } else if (clipPosition === 'center-middle') {
        x = (image.width - newWidth) / 2;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'center-bottom') {
        x = (image.width - newWidth) / 2;
        y = image.height - newHeight;
    } else if (clipPosition === 'right-top') {
        x = image.width - newWidth;
        y = 0;
    } else if (clipPosition === 'right-middle') {
        x = image.width - newWidth;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'right-bottom') {
        x = image.width - newWidth;
        y = image.height - newHeight;
    }

    return {
        cropX: x,
        cropY: y,
        cropWidth: newWidth,
        cropHeight: newHeight,
    };
}


export default function ImageEditor() {

    const {
        resetState,
        setIsCrop,

        isProcessing,
        setCanvasBox,
        canvasBox,
        setCropBox,

        isCrop,

        setImageDetail,

        cropBox

    } = useImageEditor()






    const { updateImageProp, image, imagesize, imgRef, stageRef, setImage, scaleX, scaleY, rotation, trRef, cropRef, handleCrop } = useImageEditorKonva()



    function resetEditor() {
        setCanvasBox(prev => ({
            ...prev,
            scale: 1
        }))
        updateImageProp({
            rotation: 0,
            scaleX: 1,
            scaleY: 1,

        })

    }




    const getRotatedBounds = (
        width: number,
        height: number,
        degrees: number
    ) => {
        const radians = (degrees * Math.PI) / 180;

        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        return {
            width: width * cos + height * sin,
            height: width * sin + height * cos,
        };
    }



    const [isResize, setIsResize] = useState<boolean>(false)
    const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true)


    const { width, height } =  getRotatedBounds(imagesize.w, imagesize.h, rotation)

    // const [image] = useImage(orgImage?.src || '');

    const trRef2 = useRef<Konva.Transformer>(null)


    const [size, setSize] = useState({
        width: width,
        height: height
    })

    // const handleTransform = () => {
    //     const node = imgRef.current

    //     if (!node) return;
    //     const scaleX = node.scaleX();
    //     const scaleY = node.scaleY();

    //     node.scaleX(1);
    //     node.scaleY(1);
    //     setSize({
    //         width: Math.max(5, node.width() * scaleX),
    //         height: Math.max(5, node.height() * scaleY),
    //     });
    // };

    const crop = React.useMemo(() => {
        if (!image) return null;
        return getCrop(image, size, "center-middle");
    }, [image, size]);

    // useEffect(() => {
    //     setSize({
    //         width: width,
    //         height: height
    //     })
    // }, [width, height])


    // React.useEffect(() => {
    //     if (image && imgRef.current && trRef2.current) {
    //         trRef2?.current?.nodes([imgRef.current]);
    //     }
    // }, [image]);



    return (
        <div className=" min-w-[800px] border border-[#333333]  min-h-[450px] w-auto h-auto max-w-[800px]  max-h-[450px] overflow-hidden relative  gap-4  flex-col flex  justify-start items-center px-2 py-2  " >

            {
                isProcessing && <div className=" z-[999] absolute top-0 left-0 w-full h-full bg-card/50 backdrop-blur flex justify-center items-center " >
                    <div className=" w-auto h-auto  rounded-full " >
                        <div className="upload-progress" id="upload-progress">
                            <div className="spinner"></div>
                            <p style={{
                                "fontSize": "14px",
                                "fontWeight": "500"
                            }}>Processing</p>
                            <p style={{ "fontSize": "12px", "color": "rgb(var(--muted-foreground))" }}>Processing and optimising your image</p>
                        </div>
                    </div>
                </div>
            }
            <div style={{
                zoom: (canvasBox.scale),
                width: size.width/(canvasBox.scale),
                height: size.height/(canvasBox.scale),


            }} className=" transition-all min-w-[800px] min-h-[450px]       rounded  flex justify-center items-center " >




                <Stage ref={stageRef} width={width / canvasBox.scale} height={height / canvasBox.scale}  >
                    { (
                        <Layer width={(width/(canvasBox.scale))} height={height/(canvasBox.scale)}>
                           {image && <KonvaImage
                                preventDefault
                                ref={imgRef}
                                image={image}
                                x={(width/(canvasBox.scale)) / 2 }
                                y={height/(canvasBox.scale) / 2 }

                                width={size.width}
                                height={size.height}
                                offsetX={(size.width) / 2}
                                offsetY={size.height / 2}
                                rotation={rotation}
                                scaleX={scaleX}
                                scaleY={scaleY}
                                {...crop}
                                
                                draggable

                            />}
                            {/* { <Transformer
                                ref={trRef2}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />} */}
                            {<Rect
                                ref={cropRef}
                                x={(width / canvasBox.scale) / 2}
                                y={(height / canvasBox.scale) / 2}
                                width={(width / canvasBox.scale) * 0.35}
                                height={(height / canvasBox.scale) * 0.4}
                                fill="rgba(0, 150, 255, 0.15)"
                                stroke="#0088ff"
                                strokeWidth={2}

                                // dash={[6, 3]}
                                draggable={true}




                            />}
                            {<Transformer
                                ref={trRef}
                                anchorSize={4 / canvasBox.scale}
                                // enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                                boundBoxFunc={function (oldBox, newBox) {


                                    if (newBox.width < 20 || newBox.height < 20) return oldBox;
                                    return newBox;
                                }}
                            />}
                        </Layer>

                    )}
                </Stage>
                {/* <div className="  min-w-full min-h-full w-auto h-auto   "
                    style={{
                        position: "relative",
                        width: "auto",
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >

                    <canvas
                        className=" minw-full min-h-full "
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{
                            backgroundColor: "#d4d4d4",
                        }}
                        width={image?.naturalWidth}
                        height={image?.naturalHeight}
                        ref={canvasRef}
                    ></canvas>

                </div> */}


            </div>


            <div className=" flex flex-col w-full px-4 max-h-auto bg-[#333333]/30 text-white backdrop-blur-md min-h-[40px] transition-transform absolute bottom-[0px]  " >
                <div className=" w-full h-auto flex flex-col justify-start items-start max-h-[200px] overflow-y-scroll " >
                    {
                        isResize && <div className="ed-panel my-1" id="panel-resize">
                            <span className="panel-title">Resize</span>
                            <div className="panel-grid two">
                                <LabeledNumberInput id="rw" label="Width (px)" value={size.width}
                                    onValueChange={(width) => setSize(prev => lockAspectRatio
                                        ? { width, height: Math.round(width / (prev.width / prev.height)) }
                                        : { ...prev, width })}
                                />
                                <LabeledNumberInput id="rh" label="Height (px)" value={size.height}
                                    onValueChange={(height) => setSize(prev => lockAspectRatio
                                        ? { width: Math.round(height * (prev.width / prev.height)), height }
                                        : { ...prev, height })}
                                />
                            </div>
                            <label className="lock-row">
                                <input
                                    type="checkbox"
                                    id="lock-ar"
                                    checked={lockAspectRatio}
                                    onChange={(e) => setLockAspectRatio(e.target.checked)}
                                /> Lock aspect ratio
                            </label>
                            <button onClick={() => {
                                setImageDetail(prev => ({
                                    ...prev,
                                    width: size.width,
                                    height: size.height
                                }))
                            }} className="apply-btn"
                            // onclick="applyResize()"
                            >Apply resize</button>
                        </div>
                    }

                    {
                        // isCrop && <div className="ed-panel my-2 " id="panel-crop">
                        //     <span className="panel-title">Crop region</span>
                        //     <div className="panel-grid">
                        //         <div className="pf"><label>X</label><input type="number" id="cx" value={cropBox.positon.x}
                        //         //   oninput="updateCropHandle()"
                        //         /></div>
                        //         <div className="pf"><label>Y</label><input type="number" id="cy" value={cropBox.positon.y}
                        //         //   oninput="updateCropHandle()"
                        //         /></div>
                        //         <div className="pf"><label>Width</label><input type="number" id="cw" value={cropBox.size.width}
                        //         /></div>
                        //         <div className="pf"><label>Height</label><input type="number" id="ch" value={cropBox.size.height}
                        //         /></div>
                        //     </div>
                        //     {/* <button className="apply-btn"
                        // >Apply crop</button> */}
                        // </div>
                    }
                </div>
                <div className="  text-white cursor-default my-1   gap-4  flex w-full h-[48px] justify-center items-center   z-10  " >


                    <div onClick={() => {
                        setIsResize(prev => !prev)
                    }} className=" flex bg-card/80 cursor-pointer  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >

                        <div className="  rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <RectangleHorizontal size={14} />
                        </div>

                        <div className="  px-2 h-[12px]   text-[12px]  text-white text-pretty text-center flex justify-center items-center " >
                            Resize
                        </div>



                    </div>
                    <div className=" flex  bg-card/80  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >
                        <div onClick={() => {

                            setCanvasBox((prev) => ({
                                ...prev,
                                scale: prev.scale + 0.1
                            }))

                        }} className=" cursor-pointer rounded   p-[2px] w-[24px] h-[24px] flex justify-center items-center  " >
                            <FiPlus size={16} />
                        </div>

                        <div className=" cursor-default px-2 h-[12px] border-x-[1px] text-[12px] border-border/50 text-white text-pretty text-center flex justify-center items-center " >
                            Zoom {(canvasBox.scale * 100).toFixed(0)} <span className="  mt-[1px] ml-[1.2px] " >%</span>
                        </div>

                        <div onClick={() => {


                            setCanvasBox((prev) => ({
                                ...prev,
                                scale: canvasBox.scale >= 0.1 ? prev.scale - 0.1 : prev.scale
                            }))
                        }} className=" cursor-pointer rounded   p-[2px] w-[24px] h-[24px] flex justify-center items-center  " >
                            <FiMinus size={16} />
                        </div>
                    </div>


                    <div className=" flex  bg-card/80  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >

                        <div onClick={() => {
                            if (rotation > -360)
                                // setCanvasBox((prev) => ({
                                //     ...prev,
                                //     rotate: prev.rotate - 45
                                // }))
                                updateImageProp({
                                    rotation: rotation - 45
                                })
                        }} className=" cursor-pointer rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <RotateCcw size={16} />
                        </div>
                        <div className=" cursor-default px-2 h-[12px] border-x-[1px] text-[12px] border-border/50 text-white text-pretty text-center flex justify-center items-center " >
                            Rotate
                        </div>
                        <div onClick={() => {
                            // if (canvasBox.rotate < 360)
                            //     setCanvasBox((prev) => ({
                            //         ...prev,
                            //         rotate: prev.rotate + 45
                            //     }))

                            if (rotation < 360)
                                // setCanvasBox((prev) => ({
                                //     ...prev,
                                //     rotate: prev.rotate - 45
                                // }))
                                updateImageProp({
                                    rotation: rotation + 45
                                })
                        }} className=" cursor-pointer rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <RotateCw size={16} />
                        </div>

                    </div>



                    <div className=" flex bg-card/80  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >

                        <div onClick={() => {
                            // setCanvasBox((prev) => ({
                            //     ...prev,
                            //     isFlippedX: !prev.isFlippedX
                            // }))

                            updateImageProp({
                                scaleX: scaleX * -1
                            })
                        }} className=" cursor-pointer rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <FlipHorizontal size={16} />
                        </div>
                        <div className=" cursor-default px-2 h-[12px]  border-x-[1px] text-[12px] border-border/50 text-white text-pretty text-center flex justify-center items-center " >
                            Flip
                        </div>
                        <div onClick={() => {
                            // setCanvasBox((prev) => ({
                            //     ...prev,
                            //     isFlippedY: !prev.isFlippedY
                            // }))
                            updateImageProp({
                                scaleY: scaleY * -1
                            })
                        }} className=" cursor-pointer rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <FlipVertical size={16} />
                        </div>

                    </div>

                    {/* <div onClick={() => {
                        setIsCrop(prev => !prev)
                    }} className=" flex cursor-pointer  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >

                        <div className="  rounded   w-[24px] h-[24px] flex justify-center items-center text-slate-500 " >
                            <CropIcon size={16} />
                        </div>


                    </div> */}

                    <div onClick={() => {
                        resetEditor()
                    }} className=" flex  bg-card/80 cursor-pointer  px-2 rounded-md border-border border h-[40px] gap-3 justify-center items-center  " >

                        <div className="  rounded hover:border border border-border p-[2px] w-[24px] h-[24px] flex justify-center items-center text-white " >
                            <RotateCcw size={14} />
                        </div>

                        <div className="  px-2 h-[12px]   text-[12px]  text-white text-pretty text-center flex justify-center items-center " >
                            Reset
                        </div>



                    </div>


                </div>



            </div>







        </div>
    )
}