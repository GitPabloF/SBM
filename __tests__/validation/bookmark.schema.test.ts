import { describe, it, expect } from "vitest"
import { createBookmarkSchema } from "@/server/validation/bookmark.schemas"

describe("createBookmarkSchema", () => {
  it("accepts a valid URL", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
    })
    expect(result.success).toBe(true)
  })

  it("accepts URL with optional title and tags", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
      title: "Example",
      tags: ["dev", "tools"],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Example")
      expect(result.data.tags).toEqual(["dev", "tools"])
    }
  })

  it("rejects non-http URL", () => {
    const result = createBookmarkSchema.safeParse({
      url: "ftp://example.com",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid URL", () => {
    const result = createBookmarkSchema.safeParse({
      url: "not a url",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing URL", () => {
    const result = createBookmarkSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("sanitizes XSS in title", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
      title: "<script>alert('xss')</script>",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).not.toContain("<")
      expect(result.data.title).not.toContain(">")
    }
  })

  it("sanitizes XSS in tags", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
      tags: ["<script>alert('xss')</script>", "normal-tag"],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags![0]).not.toContain("<")
      expect(result.data.tags![1]).toBe("normal-tag")
    }
  })

  it("defaults tags to empty array when omitted", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual([])
    }
  })

  it("accepts valid coverUrl", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
      coverUrl: "https://img.example.com/cover.jpg",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid coverUrl", () => {
    const result = createBookmarkSchema.safeParse({
      url: "https://example.com",
      coverUrl: "not-a-url",
    })
    expect(result.success).toBe(false)
  })
})
