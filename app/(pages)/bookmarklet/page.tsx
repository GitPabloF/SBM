"use client"

import { useEffect, useMemo, useRef, useState } from "react"

export default function BookmarkletPage() {
  const linkRef = useRef<HTMLAnchorElement | null>(null)
  const [copied, setCopied] = useState(false)

  const bookmarklet = useMemo(() => {
    const base =
      typeof window === "undefined" ? "" : `${window.location.origin}/add`

    return `javascript:(function(){const u=encodeURIComponent(location.href);const t=encodeURIComponent(document.title);window.open('${base}?url='+u+'&title='+t,'_blank','noopener,noreferrer,width=520,height=420');})();`
  }, [])

  useEffect(() => {
    if (linkRef.current) {
      // React blocks javascript: in JSX props, so set it after render.
      linkRef.current.setAttribute("href", bookmarklet)
    }
  }, [bookmarklet])

  async function copyBookmarklet() {
    await navigator.clipboard.writeText(bookmarklet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Install Save Button</h1>

      <ol className="list-decimal pl-5 space-y-2">
        <li>Show bookmarks bar (Cmd/Ctrl + Shift + B).</li>
        <li>Drag this button to the bookmarks bar.</li>
        <li>Click it on any page (YouTube, etc.) to save.</li>
      </ol>

      <a ref={linkRef} className="inline-block border rounded-lg px-4 py-2">
        Save to MyBookmarks
      </a>

      <button
        onClick={copyBookmarklet}
        className="border rounded-lg px-4 py-2 ml-2"
      >
        {copied ? "Copied" : "Copy bookmarklet code"}
      </button>
    </div>
  )
}
