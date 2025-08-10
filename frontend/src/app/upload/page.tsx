"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const handleUploadComplete = (images: UploadedImage[]) => {
    setUploadedImages(images)
    console.log("Upload complete:", images)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to upload images</h1>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Upload Images</h1>
          </div>
          <div className="text-sm text-gray-600">Welcome, {user.displayName || user.email}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Your Memories</h2>
            <p className="text-gray-600">
              Upload your favorite photos to create your personal life log. Drag and drop multiple images or click to
              browse.
            </p>
          </div>

          <ImageUpload onUploadComplete={handleUploadComplete} maxFiles={20} />

          {uploadedImages.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upload Summary</h3>
                <div className="text-sm text-gray-600">
                  {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} uploaded
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Total size: {(uploadedImages.reduce((acc, img) => acc + img.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
