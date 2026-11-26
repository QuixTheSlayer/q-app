import { useImageEditor } from "@/context/ImageEditorContext";
import { useImageEditorKonva } from "@/context/ImageEditorKonvaContext";
import { loadSignedUrl } from "@/hooks/useHandleIMageUrl";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { getIdFromUrl } from "@/utils/getIdFromUrl";
import { useRef, type PropsWithChildren } from "react";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

const id = getIdFromUrl()
function DropZone(props: PropsWithChildren) {

    const fileInput = useRef<HTMLInputElement>(null)
    const { isProcessing, setIsProcessing, setImageDetail, imageDetail } = useImageEditor()


    const { handleUpload, selectedFile } = useUploadToS3({
        subFolder: `${id}`
    })


    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB



    const { handleSave, fileRef, setImage, image, imagesize, updateImageProp, setOriginal } = useImageEditorKonva()



    const loadFile = (e) => {
        const file = e.target.files[0];


        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            toast.warning("File size must not exceed 10 MB.")
            e.target.value = ""; // Clear the selected file
            return;
        }

        setOriginal(file)
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

    // ── File load ──
    async function handleFile(file: File) {
        if (!file) return;

        setImageDetail(prev => ({
            ...prev,
            fileName: file.name + ' · ' + (file.size / 1024).toFixed(0) + ' KB'
        }))

        setIsProcessing(true)
        const { access_url, signedUrl } = await handleUpload(file)


        const reader = new FileReader();
        reader.onload = (ev) => {
            const tempImage = new Image()

            if (!ev.target) return;
            tempImage.src = ev.target?.result as string

            const img = loadSignedUrl(signedUrl)


            tempImage.onload = () => {
                setImage(tempImage)


                updateImageProp({
                    imagesize: {
                        w: tempImage.naturalWidth,
                        h: tempImage.naturalHeight
                    }
                })
                // setImageDetail(prev => ({
                //     ...prev,
                //     width: tempImage.naturalWidth,
                //     height: tempImage.naturalHeight



                // }))

                setIsProcessing(false)

            }
        }

        reader.readAsDataURL(file);

    }


    // ── Drop zone ──
    function dzOver(e: React.DragEvent<HTMLDivElement>) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
    function dzLeave(e: React.DragEvent<HTMLDivElement>) { e.currentTarget.classList.remove('drag-over'); }
    function dzDrop(e: React.DragEvent<HTMLDivElement>) {

        e.preventDefault(); e.currentTarget.classList.remove('drag-over');
        const f = e.dataTransfer.files[0];
        if (f && f.type.startsWith('image/')) handleFile(f);
    }


    // console.log(selectedFile?.progress)

    return (
        <div className=" w-auto h-auto  justify-center items-center flex-col relative " >
            {/* <!-- Info --> */}
            <div className={`info-bar ${image ? 'active' : ''} `} id="info-bar">
                <span>Dimensions: <span className="dim" id="dim-label">—</span> {imagesize?.w}x{imagesize?.h} </span>
                <span id="file-name-label" style={{ "color": "var(--text-muted)", "fontSize": "11px" }}>{imageDetail.fileName} </span>
            </div>
            {<div style={{
                display: image ? 'none' : 'flex'
            }} className="drop-zone" id="drop-zone"
                onClick={() => {
                    if (!fileRef) return;
                    fileRef.current?.click()
                }}
                onDragOver={dzOver}
                onDragLeave={dzLeave}
                onDrop={dzDrop}
            >
                <div className="drop-zone-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M7 10l5-5 5 5M12 5v12" /></svg>
                </div>
                <p className="drop-zone-title">Drag & drop or <a className="drop-link">click to browse</a></p>
                <p className="drop-zone-sub">PNG, JPG, WEBP, GIF — max 10 MB</p>
                <input ref={fileRef} type="file" id="file-input" accept="image/*" style={{ "display": "none" }}
                    onChange={loadFile}
                />
            </div>}
            {props.children
            }


            {/* <!-- Uploading --> */}
            {isProcessing && !image && <div className="upload-progress" id="upload-progress">
                <div className="spinner"></div>
                <p style={{
                    "fontSize": "14px",
                    "fontWeight": "500"
                }}>Processing</p>
                <p style={{ "fontSize": "12px", "color": "var(--text-muted)" }}>Processing and optimising your image</p>
            </div>}
        </div>

    )
}

export {
    DropZone
}