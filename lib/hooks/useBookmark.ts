"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { ApiResponse } from "@/lib/types/api"
import { IBookmark as Bookmark } from "@/server/models/Bookmark"

type UseBookmarkResult = {
  bookmarks: Bookmark[]
  loading: boolean
  error: string
  deleteBookmark: (id: string) => Promise<void>
  fetchBookmarks: () => Promise<void>
}

export function useBookmark(): UseBookmarkResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const bookmarksResponse =
        await apiFetch<ApiResponse<Bookmark[]>>("/api/bookmark")
      setBookmarks(bookmarksResponse.data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBookmark = async (id: string) => {
    try {
      await apiFetch(`/api/bookmark/${id}`, {
        method: "DELETE",
      })
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((b) => b._id.toString() !== id),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred"
      setError(message)
    }
  }

  useEffect(() => {
    void fetchBookmarks()
  }, [fetchBookmarks])

  return { bookmarks, loading, error, deleteBookmark, fetchBookmarks }
}
