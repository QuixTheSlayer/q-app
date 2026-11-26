export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageEditorState {
    imageUrl: string | null;
    imageFile: File | null
    isEdit: boolean
    scale: number;
    rotation: number;

    translateX: number;
    translateY: number;

    flipX: boolean;
    flipY: boolean;

    brightness: number;
    contrast: number;

    crop: CropRect;
}

export interface HistoryState {
    past: ImageEditorState[];
    present: ImageEditorState;
    future: ImageEditorState[];
}