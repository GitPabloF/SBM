"use client"
import BookmarkCard from "@/components/block/bookmarkCard"
import { useBookmark } from "@/lib/hooks/useBookmark"

export default function HomePage() {
  const { bookmarks, loading, error } = useBookmark()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {loading && <p>Loading...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && bookmarks.length === 0 ? (
        <p>No bookmarks found</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark._id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </div>
  )
}
