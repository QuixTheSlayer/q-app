import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";
import {setupListeners} from "@reduxjs/toolkit/query";
import imageEditorReducer from "./imageEditor/image.editor.slice"
import globalReducer from "./global.slice"

import {editorQuery} from "./query";

export const store = configureStore({
  reducer: {
    [editorQuery.reducerPath]: editorQuery.reducer,
        imageEditor: imageEditorReducer,
        globalState:globalReducer

  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat([editorQuery.middleware])
  }
});

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch
