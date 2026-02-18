import { type MouseEvent } from "react"
import { X } from "lucide-react"

type BookmarkTagChipProps = {
  tag: string
  onRemove: (tag: string) => Promise<void> | void
}

export default function BookmarkTagChip({
  tag,
  onRemove,
}: BookmarkTagChipProps) {
  const onRemoveClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    await onRemove(tag)
  }

  return (
    <span className="group/tag relative inline-flex items-center rounded-full border border-violet-200 bg-violet-50 py-1 pl-2.5 pr-2.5 text-xs font-medium text-violet-700 transition-all group-hover/tag:pr-6">
      <span className="transition-opacity duration-150 group-hover/tag:opacity-10">
        #{tag}
      </span>
      <button
        type="button"
        aria-label={`Remove tag ${tag}`}
        onClick={(event) => void onRemoveClick(event)}
        className="pointer-events-none absolute right-1 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center text-slate-500 opacity-0 transition-all duration-150 group-hover/tag:pointer-events-auto group-hover/tag:opacity-100 hover:text-slate-900 focus-visible:opacity-100"
      >
        <X size={12} strokeWidth={2} aria-hidden="true" />
      </button>
    </span>
  )
}
