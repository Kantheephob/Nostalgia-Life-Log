import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string // Get userId from form data

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required for upload" }, { status: 401 })
    }

    // Validate file type (images only, no GIFs)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and SVG images are allowed." },
        { status: 400 },
      ) 
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Generate unique filename with timestamp, prefixed by user ID
    // IMPORTANT: In a production app, verify the userId on the server using Firebase Admin SDK
    // to prevent unauthorized uploads.
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false, // We're already adding our own unique naming
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname, // Use blob.pathname which includes the prefix
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
