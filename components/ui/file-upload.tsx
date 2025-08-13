'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (files: File | File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  description?: string
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  description,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('')

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`)
        return
      }
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type')
        return
      }
      if (rejection.errors[0]?.code === 'too-many-files') {
        setError(`Too many files. Maximum is ${maxFiles}`)
        return
      }
    }

    const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles
    
    if (newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`)
      return
    }

    setFiles(newFiles)
    onFileSelect(multiple ? newFiles : newFiles[0])
  }, [files, multiple, maxSize, maxFiles, onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxSize,
    maxFiles
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFileSelect(multiple ? newFiles : newFiles[0])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          error && 'border-red-500 bg-red-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        
        {isDragActive ? (
          <p className="text-sm font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-sm font-medium mb-2">
              Drag and drop files here, or click to select
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}