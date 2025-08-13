'use client'

import { useState, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  FileText, 
  X, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Job } from '@/types/database'

interface ResumeUploadStepProps {
  form: UseFormReturn<any>
  job: Job
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
}

export function ResumeUploadStep({ form, job }: ResumeUploadStepProps) {
  const [uploadedResume, setUploadedResume] = useState<UploadedFile | null>(null)
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document.',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      })
      return
    }

    const uploadFile: UploadedFile = {
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading',
    }

    setUploadedResume(uploadFile)

    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedResume(prev => {
          if (!prev) return null
          const newProgress = Math.min(prev.progress + 10, 90)
          return { ...prev, progress: newProgress }
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      setUploadedResume(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'completed',
        url: result.url,
      } : null)

      form.setValue('resumeFile', result)
      
      toast({
        title: 'Resume uploaded successfully',
        description: 'Your resume has been uploaded and is ready for submission.',
      })
    } catch (error) {
      setUploadedResume(prev => prev ? {
        ...prev,
        status: 'error',
      } : null)
      
      toast({
        title: 'Upload failed',
        description: 'Failed to upload your resume. Please try again.',
        variant: 'destructive',
      })
    }
  }, [form, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setUploadedResume(null)
    form.setValue('resumeFile', undefined)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return <FileText className="h-8 w-8 text-primary" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Resume Upload
          </CardTitle>
          <CardDescription>
            Upload your resume to showcase your experience and qualifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadedResume ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop your file here, or click to browse
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX (max 5MB)
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadedResume.file.name)}
                  <div>
                    <p className="font-medium">{uploadedResume.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedResume.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadedResume.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {uploadedResume.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadedResume.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={uploadedResume.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {uploadedResume.status === 'uploading' && (
                <div className="mt-3">
                  <Progress value={uploadedResume.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadedResume.progress}%
                  </p>
                </div>
              )}
              
              {uploadedResume.status === 'error' && (
                <div className="mt-3">
                  <p className="text-sm text-red-500">
                    Upload failed. Please try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Portfolio (Optional)
          </CardTitle>
          <CardDescription>
            Share a link to your portfolio, website, or work samples.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio URL</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://your-portfolio.com" 
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-muted-foreground mt-2">
                  Include links to your best work, LinkedIn profile, or personal website
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}