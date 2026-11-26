import React from 'react'
import { cn } from '@/libs/cn'

export interface FileUploadInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onFilesSelected: (files: FileList) => void
}

function FileUploadInput({ className, accept = 'image/*', onFilesSelected, ...props }: FileUploadInputProps) {
  return (
    <input
      type="file"
      accept={accept}
      className={cn('hidden', className)}
      onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      {...props}
    />
  )
}

export default FileUploadInput
