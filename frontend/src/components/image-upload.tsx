"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

interface ImageUploadProps {
  onUploadComplete?: (images: UploadedImage[]) => void
  maxFiles?: number
  className?: string
}

export function ImageUpload({ onUploadComplete, maxFiles = 10, className }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Only JPEG, PNG, WebP, and SVG images are allowed."
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return "File too large. Maximum size is 10MB."
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    return response.json()
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null)
      const fileArray = Array.from(files)

      // Check if adding these files would exceed maxFiles
      if (uploadedImages.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate all files first
      for (const file of fileArray) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const uploadPromises = fileArray.map(async (file, index) => {
          const result = await uploadFile(file)
          // Update progress
          setUploadProgress(((index + 1) / fileArray.length) * 100)
          return result
        })

        const results = await Promise.all(uploadPromises)
        const newImages = [...uploadedImages, ...results]
        setUploadedImages(newImages)
        onUploadComplete?.(newImages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [uploadedImages, maxFiles, onUploadComplete],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
      // Reset input value so same file can be selected again
      e.target.value = ""
    },
    [handleFiles],
  )

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    onUploadComplete?.(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              isDragOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800",
            )}
          >
            <Upload className={cn("h-8 w-8 transition-colors", isDragOver ? "text-blue-600" : "text-gray-600")} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragOver ? "Drop your images here" : "Upload your memories"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop images or click to browse</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              JPEG, PNG, WebP, SVG • Max 10MB each • Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
            <span className="text-gray-600 dark:text-gray-400">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Uploaded Images ({uploadedImages.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{image.filename}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
