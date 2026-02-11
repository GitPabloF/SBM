"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ApiResponse } from "@/lib/types/api"
import { IBookmark as Bookmark } from "@/server/models/Bookmark"
import { IUser as User } from "@/server/models/User"

type UseBookmarkResult = {
  bookmarks: Bookmark[]
  loading: boolean
  error: string
}

const isAuthError = (errorMessage: string) =>
  /unauthorized|forbidden|token|auth/i.test(errorMessage)

export function useBookmark(): UseBookmarkResult {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      setError("")

      try {
        await apiFetch<ApiResponse<User>>("/api/auth/me")
        const bookmarksResponse = await apiFetch<ApiResponse<Bookmark[]>>(
          "/api/bookmark",
        )

        if (!cancelled) {
          setBookmarks(bookmarksResponse.data)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"

        if (isAuthError(message)) {
          router.replace("/login")
          return
        }

        if (!cancelled) {
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [router])

  return { bookmarks, loading, error }
}
