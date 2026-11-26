import type React from "react";
import type { CSSProperties, JSX, PropsWithChildren } from "react";
import type { ModalBody, ModalFooter, ModalHeader } from "../ui/components/Modal";

export interface ModalProps extends PropsWithChildren {
    isOpen?: boolean
    handleOverlayClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    className?: string
    dislogClassName?: string
}
export type ModalComponent = React.FC<ModalProps> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody
    Footer: typeof ModalFooter

};

export interface ModalHeaderProps extends PropsWithChildren {
    title?: string
    onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    prefix?: JSX.Element
    className?: string
    titleClassName?: string
    buttonClassName?: string
    titleStyle?: CSSProperties
    buttonStye?: CSSProperties
    style?: CSSProperties

}

export interface ModalFooterProps extends PropsWithChildren {
    onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    prefix?: JSX.Element
    className?: string
    buttonClassName?: string
    buttonStye?: CSSProperties
    style?: CSSProperties
    onSubmit?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    submitText?: string
    calcelText?: string

}

export interface ModalBodyProps extends PropsWithChildren {
    className?: string
}

export type EdImagePropertyType = {
    edRotation: number,
    edFH: number,
    edFV: number,
    edOrigW: number,
    edOrigH: number
}

export type ModalPropertyType = {
    title:string,
    isOpen:boolean
    hint:string
    
}

