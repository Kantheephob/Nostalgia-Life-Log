"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, LogOut, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ImageManager } from "@/components/image-manager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [currentSearchQuery, setCurrentSearchQuery] = useState("")

  // Get the initial query from URL search params
  useEffect(() => {
    const query = searchParams.get("query") || ""
    setCurrentSearchQuery(query)
  }, [searchParams])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentSearchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(currentSearchQuery.trim())}`)
    }
  }

  const handleClearSearch = () => {
    setCurrentSearchQuery("")
    router.push("/search") // Navigate to search page without query
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
      <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
        <Link href="/" className="text-2xl font-bold text-black">
          Nostalgia Life Log
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            // Logged in state
            <>
              <ImageManager userId={user.uid} showUploadButton={true} showEditButton={true} />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {/* Search Bar */}
        <div className="relative w-full max-w-8xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search your memories..."
            className="w-full h-16 pl-16 pr-12 text-xl rounded-full bg-white shadow-md transition-shadow duration-200 focus:shadow-lg focus:ring-0 focus:border-0"
            value={currentSearchQuery}
            onChange={(e) => setCurrentSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          {currentSearchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Search Results Grid */}
        <div className="w-full max-w-6xl">
          {currentSearchQuery ? (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Results for "{currentSearchQuery}"</h2>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Memories</h2>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder Images - Replace with actual search results */}
            {/* <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
              <img
                src="/placeholder.svg?height=600&width=400"
                alt="Anime girl in school uniform"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
              <img
                src="/placeholder.svg?height=300&width=200"
                alt="Anime girl in blue swimsuit"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
              <img
                src="/placeholder.svg?height=300&width=200"
                alt="Anime comic strip"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
              <img
                src="/placeholder.svg?height=300&width=200"
                alt="Anime girl with Japanese text"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div> */}
            {/* Add more placeholder images or dynamic content here */}
          </div>
        </div>
      </main>
    </div>
  )
}
