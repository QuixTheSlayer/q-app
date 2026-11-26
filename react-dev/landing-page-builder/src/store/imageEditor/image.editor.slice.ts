// features/imageEditor/imageEditorSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImageEditorState, CropRect } from "./types";

const initialState: ImageEditorState = {
    imageUrl: null,
    imageFile:null,
    isEdit: false,

    scale: 1,
    rotation: 0,

    translateX: 0,
    translateY: 0,

    flipX: false,
    flipY: false,

    brightness: 100,
    contrast: 100,

    crop: {
        x: 20,
        y: 20,
        width: 100,
        height: 100
    },
};

const imageEditorSlice = createSlice({
    name: "imageEditor",
    initialState,
    reducers: {
        setImage(state, action: PayloadAction<string | null>) {
            state.imageUrl = action.payload;
        },
        setImageFile(state, action: PayloadAction<File | null>) {
            state.imageFile = action.payload;
        },

        toggleIsEdit(state,action:PayloadAction<boolean | undefined>) {
            state.isEdit = action.payload ?? !state.isEdit;
        },
        setScale(state, action: PayloadAction<number>) {
            state.scale = action.payload;
        },

        rotate(state, action: PayloadAction<number>) {
            state.rotation = action.payload;
        },

        pan(
            state,
            action: PayloadAction<{ x: number; y: number }>
        ) {
            state.translateX = + action.payload.x;
            state.translateY = + action.payload.y;
        },

         noPan(
            state
            
        ) {
            state.translateX =  state.translateX 
            state.translateY = state.translateY
        },

        toggleFlipX(state) {
            state.flipX = !state.flipX;
        },

        toggleFlipY(state) {
            state.flipY = !state.flipY;
        },

        setCrop(state, action: PayloadAction<CropRect>) {
            state.crop = action.payload;
        },

        setBrightness(state, action: PayloadAction<number>) {
            state.brightness = action.payload;
        },

        setContrast(state, action: PayloadAction<number>) {
            state.contrast = action.payload;
        },

        reset(state) {
            Object.assign(state, initialState);
        },
    },
});

export const {
    setImage,
    setImageFile,
    toggleIsEdit,
    setScale,
    rotate,
    pan,
    noPan,
    toggleFlipX,
    toggleFlipY,
    setCrop,
    setBrightness,
    setContrast,
    reset,
} = imageEditorSlice.actions;

export default imageEditorSlice.reducer;