import { RootState } from "@/store";
import { rotate, setScale } from "@/store/imageEditor/image.editor.slice";
import { useSelector, useDispatch } from "react-redux";

function Toolbar() {
  const dispatch = useDispatch();

  const scale = useSelector(
    (state: RootState) => state.imageEditor.scale
  );

  return (
    <>
      <button onClick={() => dispatch(setScale(scale + 0.1))}>
        Zoom In
      </button>

      <button onClick={() => dispatch(rotate(90))}>
        Rotate 90°
      </button>
    </>
  );
}