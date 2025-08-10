"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, LogOut, X } from "lucide-react"
import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ImageManager } from "@/components/image-manager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [pictureCount, setPictureCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("") // State for search input

  // Wrap handleImageCountChange with useCallback
  const handleImageCountChange = useCallback(
    (count: number) => {
      setPictureCount(count)
    },
    [setPictureCount],
  ) // Dependency array includes setPictureCount

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
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
            <ImageManager userId={user.uid} onImageCountChange={handleImageCountChange} triggerClassName="z-10" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all">
                  <AvatarImage
                    src={user.photoURL || ""}
                    alt={user.displayName || user.email || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="border border-gray-300 bg-gray-100 text-gray-600 font-medium">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback className="text-xs">
                      {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
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
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-12 text-center">Nostlgia Life Log</h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-4xl mb-8">
          {" "}
          {/* Changed to max-w-3xl for wider */}
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search your memories..."
            className="w-full h-16 pl-16 pr-12 text-xl rounded-full bg-white shadow-md transition-shadow duration-200 focus:shadow-lg focus:ring-0 focus:border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch} // Add onKeyDown handler
          />
          {searchQuery && ( // Conditionally render the clear button
            <button
              onClick={() => setSearchQuery("")} // Clear the input on click
              className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Picture Count (only show when logged in) */}
        {user ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">{pictureCount} pictures in the system</p>
            <p className="text-sm text-gray-500">Welcome back, {user.displayName || user.email}!</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">Sign in to manage your memories.</p>
            <p className="text-sm text-gray-500">Your personal life log awaits!</p>
          </div>
        )}
      </main>
    </div>
  )
}
