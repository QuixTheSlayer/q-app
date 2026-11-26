import { ModalPropertyType } from "@/types/imageEdType";
import { useEffect, useState } from "react";
import React, { createContext, type PropsWithChildren, useContext } from "react";

interface ModalProps extends ModalPropertyType {
    closeModal: () => void
    setModalProperty: React.Dispatch<React.SetStateAction<ModalPropertyType>>
    openModal: () => void
    updateModalProp: (prop: ModalPropertyType) => void
    hint: string
    modalType: string
     setModalType: React.Dispatch<React.SetStateAction<string>>
     title:string
     isOpen:boolean
}

// @ts-ignore 
export const ModalContext = createContext<ModalProps>(undefined);

const ModalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {


    const [modalType, setModalType] = useState<string>("")
    const [modalProperty, setModalProperty] = useState<ModalPropertyType>({
        isOpen: false,
        title: "Modal Title",
        hint: "Recommended: 120 × 75px"
    })

    const { isOpen, title, hint } = modalProperty

    function closeModal() {

        setModalProperty(prev => ({
            ...prev,
            isOpen: false
        }))

    }

    function updateModalProp(prop: ModalPropertyType) {
        setModalProperty(prop)
    }

    function openModal() {
        setModalProperty(prev => ({
            ...prev,
            isOpen: true
        }))

    }


    useEffect(()=>{
        const toastEl = document.getElementById('toast')

        const hideToast = setTimeout(()=>{
            if(toastEl?.classList.contains('show')){
                toastEl.classList.remove('show')
            }
        },2000)

        return () => clearTimeout(hideToast)
    },[isOpen])


    return <ModalContext.Provider value={{
        closeModal,
        setModalProperty,
        isOpen,
        title,
        openModal,
        updateModalProp,
        hint,
        modalType, setModalType
    }} >
        {children}
    </ModalContext.Provider>

}

export default ModalContextProvider;


export const useModal = () => (useContext(ModalContext));

