import CryptoJs from 'crypto-js'


/**
 * Removes the final extension from a filename string.
 * Returns the original filename if no extension is found.
 * 
 * @param {string} fileName - The filename to process
 * @returns {string} The filename without its final extension
 * 
 * @example
 * sliceFileExtension('document.pdf'); // Returns: 'document'
 */
export function sliceFileExtension (fileName: string) {
  if(!fileName) return '';

  const lastDotIndex = fileName?.lastIndexOf('.');
  if(lastDotIndex === -1) {
    return fileName; // Return the file name if no dot is found
  }
  return fileName.slice(0, lastDotIndex); // Slice off the last extension
}

/**
 * Reads the file extension from a filename string.
 * Returns the extension without the leading dot, or undefined if no extension exists.
 * 
 * @param {string} fileName - The filename to inspect
 * @returns {string | undefined} The lowercase file extension
 * 
 * @example
 * readFileExtension('photo.jpg'); // Returns: 'jpg'
 */
export function readFileExtension (fileName: string) {
  return fileName?.split('.').at(-1)
}


/**
 * Converts a file size value between binary units (B, KB, MB, GB).
 * Uses 1024 as the unit multiplier for conversion.
 * 
 * @param {number} size - The source file size to convert
 * @param {{from: 'B'|'KB'|'MB'|'GB', to: 'B'|'KB'|'MB'|'GB'}}
 *        unit options specifying conversion from and to units
 * @param {boolean} [autoFormatToLower=false] - Unused in current implementation
 * @returns {number} The converted file size rounded to two decimal places
 * 
 * @example
 * convertFileSize(2048, {from: 'B', to: 'KB'}); // Returns: 2
 */
export function convertFileSize (size: number, {from, to}: {
  from: 'B' | 'KB' | 'MB' | 'GB',
  to: 'B' | 'KB' | 'MB' | 'GB'
}, autoFormatToLower = false) {
  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
  };

  const sizeInBytes = size * units[from];

  const convertedSize = sizeInBytes / units[to];

  return parseFloat(convertedSize.toFixed(2));

}

/**
 * Converts a browser File object to a Buffer using FileReader.
 * Resolves with the file contents as a buffer when reading completes.
 * 
 * @param {File} file - The file to convert to a buffer
 * @returns {Promise<Buffer>} A promise resolving to the file buffer
 * 
 * @example
 * const buffer = await fileToBuffer(file);
 */
export function fileToBuffer (file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as unknown as Buffer<ArrayBufferLike>);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates a unique filename by hashing the original base name and appending a timestamp.
 * Optionally prefixes the result with an event ID.
 * 
 * @param {string} filename - The original filename
 * @param {string | number} [eventId] - Optional event ID used as a filename prefix
 * @returns {string} The transformed filename
 * 
 * @example
 * transformFilename('image.png', 123); // Returns: '123_<hash>_<timestamp>.png'
 */
export function transformFilename (filename: string, eventId?: string | number) {
  const file_ext = filename.split('.').pop();``
  const current_time = new Date().getTime();
  let new_filename = filename.replace("." + file_ext, "");
  const hash_name = CryptoJs.MD5(new_filename);
  const jeventid = eventId == "" ? eventId : eventId + "_";
  new_filename = jeventid + hash_name + "_" + current_time + "." + file_ext;

  return new_filename
  // s3configs.s3key = s3configs.s3key.replace('${user_id}', userid).replace('${filename}', new_filename);
  // option_fileupload.s3key = s3configs.s3key;
}

/**
 * Creates a new File object with a different filename while preserving content metadata.
 * Useful when renaming files before upload or display.
 * 
 * @param {File} originalFile - The original file object
 * @param {string} newName - The new filename to assign
 * @returns {File} A new File instance with the renamed filename
 * 
 * @example
 * const renamed = renameFile(file, 'new-name.png');
 */
export function renameFile (originalFile: File, newName: string) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}