"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { BOOKMARKS_UPDATED_EVENT } from "@/lib/constants/bookmarks"
import { isHttpUrl, normalizeIncomingUrl } from "@/lib/utils/url"

export default function AddPage() {
  const params = useSearchParams()
  const router = useRouter()

  const incomingUrl = params.get("url") || ""
  const url = normalizeIncomingUrl(incomingUrl)
  const title = params.get("title") || ""

  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "error" | "need-login"
  >("idle")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!url) {
      setState("error")
      setError("Missing url")
      return
    }
    if (!isHttpUrl(url)) {
      setState("error")
      setError("Invalid url: must start with http:// or https://")
      return
    }

    ;(async () => {
      try {
        setState("saving")
        await apiFetch("/api/bookmark", {
          method: "POST",
          body: JSON.stringify({ url, title }),
        })
        localStorage.setItem(BOOKMARKS_UPDATED_EVENT, Date.now().toString())
        setState("saved")
      } catch (e: any) {
        // if your api returns 401 with error message, you can detect it here
        if (
          String(e?.message || "")
            .toLowerCase()
            .includes("unauthorized")
        ) {
          setState("need-login")
        } else {
          setState("error")
          setError(e?.message || "Save failed")
        }
      }
    })()
  }, [url, title])

  if (state === "saving") return <Box>Saving…</Box>
  if (state === "saved") return <Box>Saved ✅ You can close this tab.</Box>

  if (state === "need-login")
    return (
      <Box>
        <p className="mb-3">You need to log in first.</p>
        <button
          className="border rounded px-3 py-2"
          onClick={() =>
            router.push(
              `/login?next=/add?url=${encodeURIComponent(incomingUrl)}&title=${encodeURIComponent(title)}`,
            )
          }
        >
          Go to login
        </button>
      </Box>
    )

  return <Box>Error: {error}</Box>
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">{children}</div>
    </div>
  )
}
