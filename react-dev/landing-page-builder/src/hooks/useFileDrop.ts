import React, {useState} from 'react'

type Options = {
  multiFiles?: boolean
}

/**
 * React hook that provides drag-and-drop file handling for a drop target.
 * Returns drag event handlers and a dragging state flag.
 * 
 * @param {(file: FileList) => void} handleFile - Callback invoked with dropped files
 * @param {Options} [options] - Optional configuration settings
 * @param {boolean} [options.multiFiles=false] - Whether multiple files are allowed
 * @returns {object} Drag handlers and drag status
 * 
 * @example
 * const { dragHandlers, isDragging } = useFileDrop(handleUpload);
 */
function useFileDrop (
  handleFile: (file: FileList) => void,
  options: Options = {
    multiFiles: false
  }
) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files
    handleFile(files);
  }


  return {
    dragHandlers: {
      onDragOver,
      onDragLeave,
      onDrop
    },
    isDragging,
  }
}

export default useFileDrop