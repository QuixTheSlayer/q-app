import {useEffect} from "react";

/**
 * Configuration object for key combination matching.
 * Supports modifier keys and a base key trigger.
 */
type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/**
 * Checks whether a keyboard event matches the specified key combination.
 * Ignores events that occur inside inputs, textareas, or editable content.
 * 
 * @param {KeyboardEvent} event - The keyboard event to evaluate
 * @param {KeyCombo} combo - The combo definition to match against
 * @returns {boolean} True when the event matches the combo
 */
const matchCombo = (event: KeyboardEvent, combo: KeyCombo) => {
  const target = event.target as HTMLElement;
  if (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.isContentEditable
	) {
		return false;
	}

  return (
    event.key.toLowerCase() === combo.key.toLowerCase() &&
    (combo.ctrl ?? false) === event.ctrlKey &&
    (combo.meta ?? false) === event.metaKey &&
    (combo.shift ?? false) === event.shiftKey &&
    (combo.alt ?? false) === event.altKey
  );
};

/**
 * React hook that binds a keyboard shortcut to a callback.
 * Prevents shortcuts from firing in input, textarea, or contenteditable fields.
 * 
 * @param {KeyCombo} combo - The key combination to listen for
 * @param {(event: KeyboardEvent) => void} callback - Callback invoked when combination is matched
 * @param {boolean} [disabled=false] - If true, disables the shortcut listener
 */
const useKeyCombo = (
  combo: KeyCombo,
  callback: (event: KeyboardEvent) => void,
  disabled = false
) => {
  useEffect(() => {
    if(disabled) return;

    const onKeyDown = (event: KeyboardEvent) => {

      if(matchCombo(event, combo)) {
        callback(event);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, callback, disabled]);
};

export default useKeyCombo;
