import {useState, useEffect} from "react";

/**
 * React hook for syncing state with localStorage.
 * Initializes state from localStorage if available, then updates storage whenever value changes.
 * 
 * @template T
 * @param {string} key - Storage key used in localStorage
 * @param {T} initialValue - Default value if localStorage is empty or unavailable
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} Tuple containing stored value and setter
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
function useLocalStorage<T> (key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if(typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch(error) {
      console.warn("useLocalStorage get error:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch(error) {
      console.warn("useLocalStorage set error:", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
