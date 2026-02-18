import Image from "next/image"
import {
  File,
  FileText,
  Mic2,
  Music,
  PlayCircle,
  Shapes,
  Users,
  type LucideIcon,
} from "lucide-react"
import DeleteButton from "@/components/block/deleteButton"
import { getPlatformMetadata } from "@/lib/constants/platforms"
import { IBookmark as Bookmark } from "@/server/models/Bookmark"

type BookmarkCardProps = {
  bookmark: Bookmark
  handleDeleteBookmark: (id: string) => Promise<void> | void
}

const CONTENT_TYPE_ICON: Record<Bookmark["contentType"], LucideIcon> = {
  article: FileText,
  music: Music,
  video: PlayCircle,
  document: File,
  podcast: Mic2,
  social: Users,
  other: Shapes,
}

export default function BookmarkCard({
  bookmark,
  handleDeleteBookmark,
}: BookmarkCardProps) {
  const ContentTypeIcon = CONTENT_TYPE_ICON[bookmark.contentType]
  const platformMeta = getPlatformMetadata(bookmark.platform)
  const platformChipClassName = `rounded-full border px-2.5 py-1 text-xs font-medium ${platformMeta.chip.border} ${platformMeta.chip.background} ${platformMeta.chip.text}`
  const title = bookmark.title || bookmark.url

  const onDeleteClick = async () => {
    await handleDeleteBookmark(bookmark._id.toString())
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <DeleteButton
        ariaLabel={`Delete bookmark ${title}`}
        onDelete={onDeleteClick}
        className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      />

      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-5"
      >
        <div className="flex items-start justify-between gap-3 pr-10">
          <div className="min-w-0">
            <h2 className="mt-1 truncate text-base font-semibold text-slate-900">
              {title}
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            title={bookmark.contentType}
            aria-label={`Content type: ${bookmark.contentType}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700"
          >
            <ContentTypeIcon size={14} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">{bookmark.contentType}</span>
          </span>
          <span className={platformChipClassName}>
            {platformMeta.label}
          </span>
          {bookmark.tags?.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {bookmark.coverUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50">
            <Image
              src={bookmark.coverUrl}
              alt={bookmark.title || "Bookmark cover"}
              width={800}
              height={400}
              className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        )}
      </a>
    </article>
  )
}
