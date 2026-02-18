import { afterEach, describe, expect, it, vi } from "vitest"
import bookmarkClassifier from "@/server/utils/bookmark-classifier"

describe("bookmarkClassifier.classifyUrl", () => {
  const originalYoutubeApiKey = process.env.YOUTUBE_API_KEY
  const originalFetch = global.fetch

  afterEach(() => {
    process.env.YOUTUBE_API_KEY = originalYoutubeApiKey
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("classifies known music platforms", async () => {
    const result = await bookmarkClassifier.classifyUrl(
      "https://open.spotify.com/track/1",
    )

    expect(result).toEqual({
      domain: "open.spotify.com",
      platform: "spotify",
      contentType: "music",
    })
  })

  it("classifies known video platforms", async () => {
    process.env.YOUTUBE_API_KEY = ""
    const result = await bookmarkClassifier.classifyUrl(
      "https://youtu.be/dQw4w9WgXcQ",
    )

    expect(result).toEqual({
      domain: "youtu.be",
      platform: "youtube",
      contentType: "video",
    })
  })

  it("classifies youtube music videos using YouTube API", async () => {
    process.env.YOUTUBE_API_KEY = "test-api-key"
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ snippet: { categoryId: "10" } }] }),
    }) as unknown as typeof fetch

    const result = await bookmarkClassifier.classifyUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      domain: "youtube.com",
      platform: "youtube",
      contentType: "music",
    })
  })

  it("classifies known document platforms", async () => {
    const result = await bookmarkClassifier.classifyUrl(
      "https://docs.google.com/document/d/abc123/edit",
    )

    expect(result).toEqual({
      domain: "docs.google.com",
      platform: "google-docs",
      contentType: "document",
    })
  })

  it("derives platform from domain and defaults contentType to article", async () => {
    const result = await bookmarkClassifier.classifyUrl(
      "https://example.com/page",
    )

    expect(result).toEqual({
      domain: "example.com",
      platform: "example",
      contentType: "article",
    })
  })

  it("classifies pdf URLs as document", async () => {
    const result = await bookmarkClassifier.classifyUrl(
      "https://cdn.example.com/files/guide.PDF?download=1",
    )

    expect(result).toEqual({
      domain: "cdn.example.com",
      platform: "example",
      contentType: "document",
    })
  })
})
