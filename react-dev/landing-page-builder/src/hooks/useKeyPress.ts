import {useEffect} from "react";

type Key =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "Escape"
  | "Backspace"
  | "Tab";


/**
 * React hook that listens for a single key press and triggers a callback.
 * Useful for global keyboard shortcuts where only one key is required.
 * 
 * @param {string} key - The key to listen for (e.g. 'Escape', 'Enter')
 * @param {() => void} callback - Function called when the key is pressed
 * @param {boolean} [disabled=false] - When true, disables the listener
 */
const useKeyPress = (key: string, callback: () => void, disabled = false) => {
  useEffect(() => {
    if(disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // event.preventDefault();
      event.stopPropagation();
      if(event.key === key) callback();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [callback, key, disabled]);
};

export default useKeyPress;