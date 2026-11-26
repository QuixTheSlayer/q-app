import { useEffect, useState } from "react";
import ImageEditor from "./ImageEditor";
import Modal from "./Modal";
import { useModal } from "@/context/ModalContext";
import { useImageEditor } from "@/context/ImageEditorContext";
import { useImageEditorKonva } from "@/context/ImageEditorKonvaContext";
import useUploadToS3 from "@/hooks/useUploadToS3";
import { DropZone } from "@/components/ImageEditor/DropZone";
import { Icons } from "../icons copy/CloseIcon";
import { useEditor } from "@/context/EditorContext";
import { isValidUrl } from "@/utils/isValidUrl";
import { ContentNode } from "@/types/node.type";
import { getIdFromUrl } from "@/utils/getIdFromUrl";

const id = getIdFromUrl()
export default function EditorModal() {


    const { title, closeModal, hint, modalType, isOpen } = useModal()

    const {
        resetState,
        isProcessing,
        setIsProcessing

    } = useImageEditor()

    const { setImage, image, stageRef, handleCrop, croppedSrc,original } = useImageEditorKonva()

    const { handleUpload, selectedFile } = useUploadToS3({
        subFolder: `${id}`
    })

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (e.target === document.getElementById('modal-overlay')) closeModal();
    }

    // const logoUrlInput = document.getElementById(`${modalType}-url-input`) as HTMLInputElement

    // const logoUrlImage = document.getElementById('event-updated-image') as HTMLImageElement

    // const showUrltag = document.getElementById(`${modalType}-view-btn`) as HTMLLinkElement


    const toastEl = document.getElementById('toast')


    const canvas = useEditor()

    async function doUpload(type:'edit'|'original') {

        if (!stageRef?.current || isProcessing) return;

        setIsProcessing(true)

        const blob = await handleCrop()


        const file = new File([blob], "edited-image.png", {
            type: "image/png",
        });



        const { access_url } = await handleUpload(type ==='edit'? file:original)

        setIsProcessing(false)


        setImage(null)
        closeModal()

        resetState()




        modalType === 'image' ?
            canvas.updateNode((node) => {
                let tempNode = node;

                return {
                    ...tempNode,
                    children: access_url,
                    src: access_url
                } as ContentNode

            })
            :
            modalType === 'bg-image' ?
                canvas?.updateNodeStyle({
                    backgroundImage: `url(${access_url})`
                })
                : modalType === 'flip-image' ?
                    canvas?.updateNode((n) => ({
                        ...n,
                        imageUrl: access_url ?? "",
                    }) as ContentNode) : canvas?.updateNodeStyle({
                        backgroundImage: `url("${access_url}")`,
                        backgroundColor:'unset'
                    })


        toastEl?.classList.add('show')





        return access_url


    }

    if (isOpen)
        return (

            <Modal handleOverlayClick={handleOverlayClick} isOpen={true}>
                <Modal.Header title={title} onClose={() => {
                    closeModal()
                    resetState()
                    setImage(null)
                }} >

                </Modal.Header>
                <Modal.Body >
                    <div className="  relative min-w-full h-full   justify-start items-center " >

                        <DropZone >
                            {image && <ImageEditor />}
                        </DropZone>





                    </div>
                    {/* <ImageEditor/> */}
                </Modal.Body>
                <Modal.Footer prefix={Icons.upload({ size: 16 })} onCancel={closeModal} >
                    <span id="modal-footer-info" style={{ "fontSize": "12px", "color": "var(--text-muted)" }}>
                        {hint}
                    </span>
                    <div className="modal-footer-right">
                        <button className="btn-ghost"
                            onClick={() => {
                                closeModal()
                                resetState()
                                setImage(null)
                            }}
                        // onclick="closeModal()"
                        >Cancel</button>
                        <button className="btn-upload border text-foreground " id="upload-btn"
                            // onclick="doUpload()"
                            onClick={async () => {
                                await doUpload('edit')
                            }
                            }
                            disabled={!image || selectedFile?.status === 'loading'}
                        >
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M7 10l5-5 5 5M12 5v12" /></svg>
                            Save
                        </button>
                         <button className="btn-upload border text-foreground " id="upload-btn"
                            // onclick="doUpload()"
                            onClick={async () => {
                                await doUpload('original')
                            }
                            }
                            disabled={!image || selectedFile?.status === 'loading'}
                        >
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M7 10l5-5 5 5M12 5v12" /></svg>
                            Save Original
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        )
}

