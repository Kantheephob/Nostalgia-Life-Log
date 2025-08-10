"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, LogOut } from 'lucide-react'
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [pictureCount, setPictureCount] = useState(0)
  const router = useRouter()

  const handleUploadImage = () => {
    router.push("/upload")
    console.log("Upload image clicked")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-end items-center gap-4 p-6">
        {user ? (
          // Logged in state
          <>
            <Button
              onClick={handleUploadImage}
              variant="outline"
              className="rounded-full px-8 py-2 text-lg font-medium border-gray-300 hover:bg-gray-100 bg-transparent z-10"
            >
              Upload Image
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all">
                  <AvatarImage 
                    src={user.photoURL || ""} 
                    alt={user.displayName || user.email || "User"} 
                    className="object-cover"
                  />
                  <AvatarFallback className="border border-gray-300 bg-gray-100 text-gray-600 font-medium">
                    {user.displayName?.charAt(0)?.toUpperCase() || 
                     user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback className="text-xs">
                      {user.displayName?.charAt(0)?.toUpperCase() || 
                       user.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || "User"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          // Logged out state
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="rounded-full px-8 py-2 text-lg font-medium border-gray-300 hover:bg-gray-100 bg-transparent z-10"
          >
            Login With Google
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-12 text-center">
          Nostlgia Life Log
        </h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search your memories..."
            className="w-full h-16 pl-16 pr-6 text-lg rounded-full border-gray-300 focus:border-gray-400 focus:ring-gray-400 bg-white"
          />
        </div>

        {/* Picture Count (only show when logged in) */}
        {user && (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">
              {pictureCount} pictures in the system
            </p>
            <p className="text-sm text-gray-500">
              Welcome back, {user.displayName || user.email}!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
