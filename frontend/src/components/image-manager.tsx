"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload, CheckCircle, AlertCircle, Trash2, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoredImage {
  url: string
  filename: string
  size: number
  uploadedAt: string
}

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

interface ImageManagerProps {
  userId: string | null | undefined // Added userId prop
  onImageCountChange?: (count: number) => void
  className?: string
  triggerClassName?: string
  showUploadButton?: boolean
  showEditButton?: boolean
}

export function ImageManager({
  userId, // Destructure userId
  onImageCountChange,
  className,
  triggerClassName,
  showUploadButton = true,
  showEditButton = true,
}: ImageManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [storedImages, setStoredImages] = useState<StoredImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch stored images
  const fetchStoredImages = useCallback(async () => {
    if (!userId) {
      setStoredImages([])
      onImageCountChange?.(0)
      return
    }

    setIsLoadingImages(true)
    try {
      const response = await fetch(`/api/images?userId=${userId}`) // Pass userId to API
      if (response.ok) {
        const data = await response.json()
        setStoredImages(data.images || [])
        onImageCountChange?.(data.count || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch images")
        setStoredImages([])
        onImageCountChange?.(0)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      setError("Failed to fetch images")
      setStoredImages([])
      onImageCountChange?.(0)
    } finally {
      setIsLoadingImages(false)
    }
  }, [userId, onImageCountChange]) // Depend on userId

  // Load images when dialog opens or tab changes to edit
  useEffect(() => {
    if (isOpen && activeTab === "edit") {
      fetchStoredImages()
    }
  }, [isOpen, activeTab, fetchStoredImages])

  // Load initial count on mount or when userId changes
  useEffect(() => {
    fetchStoredImages()
  }, [fetchStoredImages, userId]) // Depend on userId

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Only JPEG, PNG, WebP, and SVG images are allowed."
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return "File too large. Maximum size is 10MB."
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    if (!userId) {
      throw new Error("User not authenticated for upload.")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId) // Pass userId to the upload API

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
          setUploadProgress(((index + 1) / fileArray.length) * 100)
          return result
        })

        const results = await Promise.all(uploadPromises)
        const newImages = [...uploadedImages, ...results]
        setUploadedImages(newImages)

        // Refresh stored images and count
        await fetchStoredImages() // Refresh count
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [uploadedImages, fetchStoredImages], // Depend on uploadFile
  )

  const deleteImage = async (imageUrl: string) => {
    if (!userId) {
      setError("User not authenticated to delete images.")
      return
    }
    // Basic check to ensure the URL belongs to the current user's prefix
    if (!imageUrl.includes(`${userId}/`)) {
      setError("Unauthorized: Cannot delete images not belonging to this account.")
      return
    }

    try {
      const response = await fetch(`/api/images/delete?url=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setStoredImages((prev) => prev.filter((img) => img.url !== imageUrl))
        await fetchStoredImages() // Refresh count
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to delete image")
      }
    } catch (error) {
      setError("Failed to delete image")
    }
  }

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
      e.target.value = ""
    },
    [handleFiles],
  )

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Disable buttons if user is not logged in
  const isDisabled = !userId

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("flex items-center gap-4", className)}>
        {showEditButton && (
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-full px-8 py-2 text-lg font-medium border-gray-300 hover:bg-gray-100 bg-transparent",
                triggerClassName,
              )}
              onClick={() => setActiveTab("edit")}
              disabled={isDisabled} // Disable if no userId
            >
              Edit Images
            </Button>
          </DialogTrigger>
        )}

        {showUploadButton && (
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-full px-8 py-2 text-lg font-medium border-gray-300 hover:bg-gray-100 bg-transparent",
                triggerClassName,
              )}
              onClick={() => setActiveTab("upload")}
              disabled={isDisabled} // Disable if no userId
            >
              Upload Image
            </Button>
          </DialogTrigger>
        )}
      </div>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Your Images</DialogTitle>
        </DialogHeader>

        {isDisabled ? (
          <div className="text-center py-8 text-gray-600">Please log in to upload and manage your images.</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
              <TabsTrigger value="edit">Edit Images ({storedImages.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                    <Upload
                      className={cn("h-8 w-8 transition-colors", isDragOver ? "text-blue-600" : "text-gray-600")}
                    />
                  </div>

                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {isDragOver ? "Drop your images here" : "Upload your memories"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Drag & drop images or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      JPEG, PNG, WebP, SVG • Max 10MB each
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

              {/* Recently Uploaded */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Recently Uploaded ({uploadedImages.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{image.filename}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 max-h-[60vh] overflow-y-auto">
              {isLoadingImages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading images...</div>
                </div>
              ) : storedImages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No images uploaded yet</div>
                  <Button onClick={() => setActiveTab("upload")}>Upload Your First Image</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {storedImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Image Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary" onClick={() => window.open(image.url, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const a = document.createElement("a")
                              a.href = image.url
                              a.download = image.filename.split("/").pop() || "download" // Get original filename
                              a.click()
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteImage(image.url)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {image.filename.split("/").pop()}
                        </div>{" "}
                        {/* Show only actual filename */}
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{formatFileSize(image.size)}</span>
                          <span>{formatDate(image.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
