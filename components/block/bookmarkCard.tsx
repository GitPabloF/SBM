import Image from "next/image"
import DeleteButton from "@/components/block/deleteButton"
import { IBookmark as Bookmark } from "@/server/models/Bookmark"

type BookmarkCardProps = {
  bookmark: Bookmark
  handleDeleteBookmark: (id: string) => Promise<void> | void
}

export default function BookmarkCard({
  bookmark,
  handleDeleteBookmark,
}: BookmarkCardProps) {
  const hostname =
    bookmark.url.replace(/^https?:\/\//, "").split("/")[0] || bookmark.url

  const onDeleteClick = async () => {
    await handleDeleteBookmark(bookmark._id.toString())
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <DeleteButton
        ariaLabel={`Delete bookmark ${bookmark.title || hostname}`}
        onDelete={onDeleteClick}
        className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      />

      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-4"
      >
        <div className="flex items-start justify-between gap-3 pr-10">
          <div className="min-w-0">
            <h2 className="truncate text-base font-medium text-slate-900">
              {bookmark.title || hostname}
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500">{hostname}</p>
          </div>
        </div>

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {bookmark.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {bookmark.coverUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            <Image
              src={bookmark.coverUrl}
              alt={bookmark.title || "Bookmark cover"}
              width={800}
              height={400}
              className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}
      </a>
    </article>
  )
}
