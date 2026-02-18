import { describe, expect, it } from "vitest"
import bookmarkClassifier from "@/server/utils/bookmark-classifier"

describe("bookmarkClassifier.classifyUrl", () => {
  it("classifies known music platforms", () => {
    const result = bookmarkClassifier.classifyUrl("https://open.spotify.com/track/1")

    expect(result).toEqual({
      domain: "open.spotify.com",
      platform: "spotify",
      contentType: "music",
    })
  })

  it("classifies known video platforms", () => {
    const result = bookmarkClassifier.classifyUrl("https://youtu.be/abcd")

    expect(result).toEqual({
      domain: "youtu.be",
      platform: "youtube",
      contentType: "video",
    })
  })

  it("classifies known document platforms", () => {
    const result = bookmarkClassifier.classifyUrl(
      "https://docs.google.com/document/d/abc123/edit",
    )

    expect(result).toEqual({
      domain: "docs.google.com",
      platform: "google-docs",
      contentType: "document",
    })
  })

  it("derives platform from domain and defaults contentType to article", () => {
    const result = bookmarkClassifier.classifyUrl("https://example.com/page")

    expect(result).toEqual({
      domain: "example.com",
      platform: "example",
      contentType: "article",
    })
  })

  it("classifies pdf URLs as document", () => {
    const result = bookmarkClassifier.classifyUrl(
      "https://cdn.example.com/files/guide.PDF?download=1",
    )

    expect(result).toEqual({
      domain: "cdn.example.com",
      platform: "example",
      contentType: "document",
    })
  })
})
