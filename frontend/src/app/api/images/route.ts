import { list } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required to list images" }, { status: 401 })
    }

    // IMPORTANT: In a production app, verify the userId on the server using Firebase Admin SDK
    // to ensure the user is authorized to list these images.
    const response = await list({ prefix: `${userId}/` }) // List blobs prefixed with the user's UID

    return NextResponse.json({
      success: true,
      images: response.blobs.map((blob) => ({
        url: blob.url,
        filename: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
      count: response.blobs.length,
    })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
