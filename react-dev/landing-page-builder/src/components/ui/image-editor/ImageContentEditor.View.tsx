import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { fetchImg } from "@/utils/convertToCanvas";
import useUploadToS3, { AsyncFile } from "@/hooks/useUploadToS3";
import { getIdFromUrl } from "@/utils/getIdFromUrl";
import { useEditor } from "@/context/EditorContext";
import { ContentNode } from "@/types/node.type";
import { reset } from "@/store/imageEditor/image.editor.slice";

const id = getIdFromUrl()

interface ImageEditorViewProps {
    img: HTMLImageElement | null
    localImg: string
    loadSignedUrl: (url: string) => Promise<HTMLImageElement>
    loadUrl: (url: string) => Promise<HTMLImageElement>
    handleFileChange: (file: FileList) => Promise<{
        url: string,
        image: HTMLImageElement
    }>
    selectedFile: AsyncFile | null
    handleUpload: (file: File) => Promise<{
        access_url: any;
        signedUrl: any;
    }>
    setImg: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
}

export default function useImageEditorContentView(): ImageEditorViewProps {

    const canvas = useEditor()

    const [localImg, setLocalImg] = useState('')
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const { isEdit, imageUrl, imageFile } = useSelector((state: RootState) => state.imageEditor)

    const dispatch = useAppDispatch()

    function loadSignedUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.src = url
        });
    }

    function loadUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const image = new Image();


            // image.onload = () => resolve(image);

            // console.log(url, "url from loadUrl Func")

            image.src = url


            const key = new URL(image.src).pathname.slice(1).split('/').slice(1).join('/')

            const realUrl = `/landing-page-builder/genereate_signed_url?key=${(key)}`
            fetchImg(realUrl).then(async (data) => {


                const response = await fetch(data);
                const file = await response.blob();

                const url = URL.createObjectURL(file);
                image.src = url
                image.crossOrigin = 'anonymous'

            })

            image.onload = () => resolve(image);


        });
    }

    /**
      * File Handindling
      */
    const { handleUpload, selectedFile } = useUploadToS3({
        subFolder: `${id}`
    })

    const handleFileChange = async (files: FileList): Promise<{
        url: string,
        image: HTMLImageElement
    }> => {
        if (files.length > 1) {
            throw new Error('Multiple files detected. PLease select only one file.')
            ;
        }

        const file = files[0]

        const { access_url, signedUrl } = await handleUpload(file)


        // fetch( response?.signedUrl)
        const url = access_url

        canvas.updateNode((node) => {
            let tempNode = node;

            return {
                ...tempNode,
                children: url,
                src: url
            } as ContentNode

        })

        setLocalImg(`${url}`)

        const image = await loadSignedUrl(signedUrl);
        setImg(image);



        dispatch(reset())


        return {
            url,
            image
        }

    }



    return {
        img: img,
        localImg: localImg,
        loadSignedUrl: loadSignedUrl,
        loadUrl: loadUrl,
        handleFileChange: handleFileChange,
        selectedFile: selectedFile,
        handleUpload: handleUpload,
        setImg
    }
}