import editorConfig from "@/configs/editor.config";

/**
 * Converts em units to pixels using the configured root font size.
 * 
 * @param {number} em - Value in em units
 * @param {number} [rootFontSize=editorConfig.root_font_size] - Root font size used for conversion
 * @returns {number} The equivalent pixel value
 */
function emToPx (em: number, rootFontSize = editorConfig.root_font_size) {
  return em * rootFontSize;
}

/**
 * Converts pixel values to em units based on the configured root font size.
 * 
 * @param {number} px - Value in pixels
 * @param {number} [rootFontSize=editorConfig.root_font_size] - Root font size used for conversion
 * @returns {number} The equivalent em value
 */
function pxToEm (px: number, rootFontSize = editorConfig.root_font_size) {
  // return Math.round((px / rootFontSize) * 100) / 100;
  return px / rootFontSize
}

/**
 * Extracts the numeric em value from a CSS length string or converts pixels to em.
 * Returns NaN for invalid inputs.
 * 
 * @param {string|number} [value] - The CSS value to parse, such as '1.5em' or a number
 * @returns {number} The equivalent em value or NaN if invalid
 */
function extractEmValue (value?: string | number) {
  if(!value) return NaN;


  if(typeof value === 'number') return pxToEm(value)

  const match = value.match(/^([\d.]+)em$/);

  const isEm = value.includes("em")

    // console.log(match,"match from extractEm")

    if(isEm){
      const newVal = value.split("em") 


      return emToPx(parseFloat ((newVal[0])))  
    }


  // return match ? emToPx(parseFloat(match[1])) : NaN;
}

/**
 * Converts a numeric pixel value into a CSS em string.
 * 
 * @param {number} value - The pixel value to convert
 * @returns {string} The value as a CSS em string
 */
function setEmValue (value: number) {
  const emValue = pxToEm(value)
  // console.log("emValue", emValue)
  return   emValue + 'em'
}

// function hasNumericValue (value?: string | number): boolean {
//   if(!value) return false;
//   if(typeof value === 'number') return true;
//   return /\d/.test(value);
// }

/**
 * Determines whether a CSS value is a numeric value or an em unit string.
 * 
 * @param {string|number} [value] - The value to validate
 * @returns {boolean} True when the value is numeric or an em unit string
 */
function hasNumericValue (value?: string | number): boolean {
  if(typeof value === 'number') return true;
  if(typeof value === 'string') {
    return /^\d*\.?\d+em$/.test(value.trim());
  }
  return false;
}


/**
 * Parses a CSS grid template string and returns the number of columns.
 * Returns NaN when the value is not a repeat-based grid.
 * 
 * @param {string} gridValue - The CSS grid template string
 * @returns {number} The number of columns or NaN if invalid
 */
function getGridCount (gridValue: string) {
  if(gridValue?.includes('repeat')) {
    return parseInt(gridValue.match(/\d+/)?.[0] || '0', 10); // Extract number from repeat()
  }
  return NaN
};


const DESIGN_WIDTH = 1200;
const GOLDEN_RATIO = 1.618;

function getScale(deviceWidth: number) {
  const ratio = deviceWidth / DESIGN_WIDTH;

  // Smooth the scaling using the golden ratio
  return Math.pow(ratio, 1 / GOLDEN_RATIO);
}

/**
 * Drops properties whose value is exactly `null` from a style object.
 * motion.div's layout-projection scale-correctors (borderRadius/boxShadow)
 * call into an internal CSS value parser that throws on a literal `null`
 * (as opposed to `undefined`, which React/Motion already skip) — a stray
 * `null` in saved node style data crashes the whole projection step.
 */
function stripNullStyleValues<T extends object>(style: T): T {
  const result = {} as T;
  for (const key in style) {
    if (style[key] !== null) result[key] = style[key];
  }
  return result;
}

export default {
  emToPx,
  pxToEm,
  extractEmValue,
  setEmValue,
  hasNumericValue,
  getGridCount,
  getScale,
  stripNullStyleValues,
}
