import type Konva from "konva";
import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";




interface ImageEditorKonvaProps {
    stageRef: React.LegacyRef<Konva.Stage>,
    fileRef: React.RefObject<HTMLInputElement | null>,
    imgRef: React.LegacyRef<Konva.Image >
    updateImageProp: (prop: {
        rotation?: number
        scaleX?: number
        scaleY?: number
        imagesize?: { w: number, h: number }
    }) => void
    rotation: number
    scaleX: number
    scaleY: number
    imagesize: { w: number, h: number }
    image: HTMLImageElement | null
    setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
    loadFile: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSave: () => void
    trRef: React.LegacyRef<Konva.Transformer>
    cropRef: React.LegacyRef<Konva.Rect>
    handleCrop: () => Promise<Blob>,
    croppedSrc: Blob,
    original:File
    setOriginal:React.Dispatch<React.SetStateAction<File>>
}


// @ts-ignore
const ImageEditorKonvaContext = createContext<ImageEditorKonvaProps>(undefined);


const ImageEditorKonvaProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const [original,setOriginal] = useState<File|null>(null)
    const [image, setImage] = React.useState<HTMLImageElement | null>(null);
    const [editProp, setEditProp] = useState<{
        rotation: number
        scaleX: number
        scaleY: number
        imagesize: { w: number, h: number }
    }>({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        imagesize: { w: 200, h: 137 }
    })
    const [imageObj, setImageObj] = useState(null);

    const stageRef = React.useRef<Konva.Stage>(null);

    const fileRef = React.useRef<HTMLInputElement>(null);
    const imgRef = React.useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const cropRef = useRef<Konva.Rect>(null)

    const [croppedSrc, setCroppedSrc] = useState(null);


    const W = window.innerWidth;
    const H = window.innerHeight - 50;

    const { rotation, scaleX, scaleY, imagesize } = editProp



    useEffect(function () {
        if (cropRef.current && trRef.current) {
            (trRef.current).nodes([cropRef.current]);
            (trRef.current).getLayer().batchDraw();
        }
    }, [image]);

    const updateImageProp = (prop: {
        rotation?: number
        scaleX?: number
        scaleY?: number
        imagesize?: { w: number, h: number }
    }) => {
        setEditProp(prev => ({
            ...prev,
            ...prop
        }))
    }

    async function handleCrop(): Promise<Blob> {
        if (!stageRef.current || !cropRef.current) throw new Error("Stage not ready");
        (cropRef?.current)?.hide();
        trRef.current?.hide()
        const node = cropRef.current

        return await (stageRef?.current as Konva.Stage).toBlob({
            x: node.x(),
            y: node.y(),
            width: (node.width()) * node.scaleX(),
            height: (node.height()) * node.scaleY(),
        }) as Promise<Blob>

    };

    const loadFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new window.Image();
            img.onload = () => {

                updateImageProp({
                    imagesize: { w: img.width, h: img.height },
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1
                })
                setImage(img);

            };
            img.src = ev.target?.result as string
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        // hide checkerboard and export only the image area
        if (!imgRef.current || !stageRef.current) return;
        const rect = (imgRef.current as any).getClientRects();
        const dataURL = (stageRef.current as any).toDataURL({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = 'rotated-image.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // bgLayerRef.current.show();
    };


    return <ImageEditorKonvaContext.Provider value={{
        imgRef,
        stageRef,
        fileRef,
        updateImageProp,
        rotation,
        scaleX,
        scaleY,
        imagesize,
        image,
        setImage,
        loadFile,
        handleSave,
        trRef,
        cropRef,
        handleCrop,
        croppedSrc,
        original,setOriginal

    }}  >
        {children}
    </ImageEditorKonvaContext.Provider>

}



export default ImageEditorKonvaProvider;


export const useImageEditorKonva = () => (useContext(ImageEditorKonvaContext));