"use client"
import { useEffect } from "react"
import BookmarkCard from "@/components/block/bookmarkCard"
import { BOOKMARKS_UPDATED_EVENT } from "@/lib/constants/bookmarks"
import { useBookmark } from "@/lib/hooks/useBookmark"

export default function HomePage() {
  const { bookmarks, loading, error, deleteBookmark, fetchBookmarks } =
    useBookmark()

  /**
   * Listen to storage events to refetch bookmarks when they are updated
   */
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === BOOKMARKS_UPDATED_EVENT) {
        void fetchBookmarks()
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [fetchBookmarks])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Your bookmarks
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            A minimal view of saved links and tags.
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading bookmarks...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No bookmarks found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark._id.toString()}
                bookmark={bookmark}
                handleDeleteBookmark={deleteBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
