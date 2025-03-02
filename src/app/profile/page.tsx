"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  ShoppingCart,
  User,
  Sun,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" })
        if (!res.ok) {
          router.push("/login")
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        router.push("/login")
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })

      if (res.ok) {
        router.push("/login")
      } else {
        console.error("Failed to log out")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="p-8 rounded-lg shadow-md bg-white">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pt-9 h-5/6 bg-amber-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-200 transform transition-all duration-300 hover:scale-102 hover:shadow-xl max-w-md w-full">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-800">Welcome, {user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="h-0.5 bg-amber-300 my-4 rounded-full"></div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">Last login: {new Date().toLocaleDateString()}</div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-amber-500 text-white rounded-md font-medium 
                      shadow-md hover:shadow-lg transition-all duration-300 
                      hover:bg-amber-600
                      focus:ring-2 focus:ring-amber-300 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}