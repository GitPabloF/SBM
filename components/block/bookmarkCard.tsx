import { IBookmark as Bookmark } from "@/server/models/Bookmark"

type BookmarkCardProps = {
  bookmark: Bookmark
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border p-4 rounded-xl hover:bg-gray-50"
    >
      <div className="font-medium">{bookmark.title}</div>
      <div className="text-sm text-gray-500">{bookmark.url}</div>
      {/* // to put as backgroundImage */}
      <img src={bookmark.coverUrl} alt={bookmark.title} />
    </a>
  )
}
