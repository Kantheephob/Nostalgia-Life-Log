"use client"

import { useAuth } from "@/contexts/auth-context"

export function UserDebug() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">User Debug Info:</h3>
      <p><strong>Display Name:</strong> {user.displayName || "Not set"}</p>
      <p><strong>Email:</strong> {user.email || "Not set"}</p>
      <p><strong>Photo URL:</strong> {user.photoURL ? "✅ Available" : "❌ Not available"}</p>
      <p><strong>UID:</strong> {user.uid}</p>
      {user.photoURL && (
        <div className="mt-2">
          <p><strong>Photo Preview:</strong></p>
          <img 
            src={user.photoURL || "/placeholder.svg"} 
            alt="Profile" 
            className="w-8 h-8 rounded-full mt-1"
            onError={(e) => {
              console.log("Image failed to load:", user.photoURL)
              e.currentTarget.style.display = 'none'
            }}
            onLoad={() => console.log("Image loaded successfully:", user.photoURL)}
          />
        </div>
      )}
    </div>
  )
}
