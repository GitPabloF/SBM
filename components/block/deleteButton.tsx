import type { MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DeleteButtonProps = {
  ariaLabel: string
  onDelete: () => Promise<void> | void
  className?: string
}

export default function DeleteButton({
  ariaLabel,
  onDelete,
  className,
}: DeleteButtonProps) {
  const onDeleteClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    await onDelete()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={ariaLabel}
      onClick={onDeleteClick}
      className={cn(
        "rounded-full border-slate-200 bg-white text-slate-500 shadow-none transition-opacity duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </Button>
  )
}
