// features/imageEditor/imageEditorSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalStateType {
    isLoading: boolean
    isConfirmModalOpen: boolean
    confirmModalData: {
        title: string
        description: string
        onSubmit?: () => void
        onCancel?: () => void
    },
    thumbnail: string
    title: string
    isAllow:boolean,
}
const initialState: GlobalStateType = {
    isLoading: false,
    isConfirmModalOpen: false,
    confirmModalData: {
        title: 'Modal Title',
        description: "Modal Description",

    },
    thumbnail: '',
    title: 'Blank Template',
     isAllow:false,
};

const globalSlice = createSlice({
    name: "globalState",
    initialState,
    reducers: {

        updatePageDetail(state, action: PayloadAction<{
            thumbnail: string
            title: string
        }>) {
            state.title = action.payload.title
            state.thumbnail = action.payload.thumbnail

        },

        toggleLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        setIsAllow(state, action: PayloadAction<boolean>) {
            state.isAllow = action.payload
        },

        openModal(state, action: PayloadAction<{
            title: string
            description: string
            onSubmit?: () => void
            onCancel?: () => void
        }>) {
            state.isConfirmModalOpen = true

            state.confirmModalData = action.payload
        },
        closeModal(state) {
            state.isConfirmModalOpen = false

            state.confirmModalData = initialState.confirmModalData
        },


    },
});

export const {
    toggleLoading,
    openModal,
    closeModal,
    updatePageDetail,
    setIsAllow
} = globalSlice.actions;

export default globalSlice.reducer;