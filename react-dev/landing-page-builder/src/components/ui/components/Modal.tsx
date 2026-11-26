import type { ModalBodyProps, ModalComponent, ModalFooterProps, ModalHeaderProps, ModalProps } from "../../types/imageEdType"
import { Icons } from "../icons copy/CloseIcon"

export function ModalHeader(props: ModalHeaderProps) {

    const { onClose, title, prefix, children, style, titleStyle, buttonStye, className, titleClassName, buttonClassName } = props


    return (
        <div style={{
            ...style
        }} className={`${className || ''} modal-header`}>
            {
                children ? children : <>
                    <span style={{
                        ...titleStyle
                    }} className={`${titleClassName || ''} modal-title`} id="modal-title">{title || 'Modal Title'}</span>
                    <button style={{
                        ...buttonStye
                    }} className={`${buttonClassName || ''} modal-close`} onClick={onClose}>
                        {prefix || Icons.closeIcon({ size: 16 })}
                    </button>
                </>
            }

        </div>
    )
}

export function ModalBody(props: ModalBodyProps) {

    const { className, children } = props
    return (
        <div className={`${className || ''} w-full modal-body`}>

            {children ?? <></>}

        </div>
    )
}

export function ModalFooter(props: ModalFooterProps) {
    const { children, calcelText, className, style, submitText, onCancel, onSubmit, prefix } = props
    return (
        <div style={style} className={`${className} modal-footer`} id="modal-footer">

            {
                children ?? <> <span id="modal-footer-info" style={{ "fontSize": "12px", "color": "var(--text-muted)" }}></span>
                    <div className="modal-footer-right">
                        <button className={` btn-ghost`} onClick={(e) => {
                            if (!onCancel) return;
                            onCancel(e)
                        }}>{calcelText ?? "Cancel"}</button>
                        <button className="btn-upload" id="upload-btn" onClick={(e) => {
                            if (!onSubmit) return;
                            onSubmit(e)
                        }} disabled>
                            {prefix ?? ''}
                            {submitText ?? "Submit"}
                        </button>
                    </div></>
            }

        </div>
    )
}


const Modal: ModalComponent = Object.assign(
    (props: ModalProps) => {
        const { isOpen, children, className, handleOverlayClick } = props


        return <div className={`${className || ''}    w-[100vw] h-[100vh] flex justify-center items-center relative modal-overlay  `} id="modal-overlay" onClick={handleOverlayClick}>
            {
                 <div className={`${props.dislogClassName || ''}  modal-c `} role="dialog" aria-modal={isOpen}>
                        {children}
                    </div>

            }




        </div>;
    },
    {
        Header: ModalHeader,
        Body: ModalBody,
        Footer: ModalFooter
    }
);





export default Modal;