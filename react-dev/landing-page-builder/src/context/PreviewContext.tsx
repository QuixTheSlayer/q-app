import React, { createContext, PropsWithChildren, useContext, useRef } from "react";

interface PreviewContextProps {
    previewRef: React.MutableRefObject<HTMLDivElement | null>
    captureRef: React.MutableRefObject<HTMLDivElement | null>
}

interface ProviderProps extends PropsWithChildren { }

// @ts-ignore
export const PreviewContext = createContext<PreviewContextProps>(undefined);

/**
 * Context provider for preview mode components.
 * Exposes a ref to the preview container so children can access rendered DOM nodes.
 *
 * @param {ProviderProps} props - Standard React provider props
 */
const PreviewContextProvider: React.FC<ProviderProps> = ({ children }) => {

    const previewRef = useRef(null)
    const captureRef = useRef(null)

    return <PreviewContext.Provider value={{ previewRef, captureRef }} >
        {children}

    </PreviewContext.Provider>

}

export default PreviewContextProvider;

/**
 * Custom hook to access the preview context.
 * @returns {PreviewContextProps} Context value containing the preview container ref
 */
export const usePreview = () => (useContext(PreviewContext));