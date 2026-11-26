import {useCallback, useState} from 'react'
import axios from 'axios'
import { toUploadUrl } from '@/utils/s3DevProxy'

/**
 * Upload status values used by the upload hook.
 * @typedef {'idle'|'loading'|'success'|'error'} ASYNC_STATUS
 */
export type ASYNC_STATUS = 'idle' | 'loading' | 'success' | 'error'

/**
 * Represents file upload state, including progress and access URLs.
 * @typedef {Object} AsyncFile
 * @property {string} name - Original filename
 * @property {number} size - File size in bytes
 * @property {string} type - MIME type of the file
 * @property {File} cachedFile - The original File object
 * @property {ASYNC_STATUS} status - Current upload status
 * @property {number} progress - Upload progress percentage
 * @property {string} [object_url] - Local preview URL for the file
 * @property {string} [access_url] - S3 access URL after upload completes
 */
export type AsyncFile = {
  name: string
  size: number
  type: string
  cachedFile: File
  status: ASYNC_STATUS
  progress: number
  object_url?: string
  access_url?: string
}

interface Options {
  subFolder?: string
}

/**
 * React hook that uploads files to S3 using backend-generated signed URLs.
 * Tracks upload progress and maintains selected file state.
 * Supports uploading a single file or multiple files in parallel.
 * 
 * @param {Options} [options] - Optional upload settings
 * @param {string} [options.subFolder] - Optional subfolder path for uploaded files
 * @returns {object} Hook API containing upload handlers and current state
 * @returns {(file: File) => Promise<{access_url: string}>} .handleUpload - Uploads a single file
 * @returns {(files: File[]) => Promise<Array>} .handleMultipleUploads - Uploads multiple files simultaneously
 * @returns {AsyncFile|null} .selectedFile - Current file upload state
 * @returns {React.Dispatch<React.SetStateAction<AsyncFile|null>>} .setSelectedFile - Setter for file state
 * @returns {() => void} .clearFile - Clears the selected file state
 */
function useUploadToS3 (options: Options = {}) {
  const [selectedFile, setSelectedFile] = useState<AsyncFile | null>(null)

  const scanner = ''

  const handleUpload = useCallback(async (file: File,componentId?:string) => {


// console.log("FileData", file)

    setSelectedFile({
      name: file?.name||"Sub_template",
      size: file.size,
      type: file.type,
      cachedFile: file,
      object_url: URL.createObjectURL(file),
      status: 'loading',
      progress: 0
    })

    try {
      // Call Route to get signed URL
      const {data} = await axios.post('/landing-page-builder/generate_upload_url', {
        filename: file.name,
        type: file.type,
        subfolder: options.subFolder ||componentId|| ''
      })
      
      const signedUrl = data.data?.url
      const access_url = data.data?.access_url;

      // Upload file directly to S3 using PUT
      await axios.put(toUploadUrl(signedUrl), file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setSelectedFile(prev => prev && {
            ...prev,
            progress: percent
          })
        }
      })
      
      // const access_url_2 = `https://s3.ap-southeast-1.amazonaws.com/dev-landingpage.judgify.me/${key}`
      // const access_url = `https://${import.meta.env.VITE_AWS_LANDING_PAGE_BUILDER_BUCKET}.s3.amazonaws.com/${key}`
      
      
      // Success
      setSelectedFile(prev => prev && {
        ...prev,
        status: 'success',
        access_url,
        signedUrl
      })
      
      return {
        access_url,
        signedUrl
      };

    } catch(error) {
      setSelectedFile(prev => prev && {
        ...prev,
        status: 'error',
        progress: 0
      })
      throw error
    }
  }, [options.subFolder])

  const handleMultipleUploads = async (files: File[]) => {
    const promises = files.map((file) => handleUpload(file));
    return await Promise.all(promises);
  };

  const clearFile = () => {
    setSelectedFile(null)
  }
  return {
		handleUpload,
		handleMultipleUploads,
		selectedFile,
		setSelectedFile,
		clearFile,
	};
}

export default useUploadToS3
