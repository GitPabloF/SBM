import { describe, it, expect, vi, beforeEach } from "vitest"
import bookmarkService from "@/server/services/bookmark.service"
import { Bookmark } from "@/server/models/Bookmark"
import { redisUtils } from "@/server/utils/redis"

// Type for mocked bookmark data - independent from IBookmark to avoid ObjectId conflicts
interface MockBookmark {
  _id?: string
  userId?: string | { toString: () => string }
  url?: string
  title?: string
  coverUrl?: string
  tags?: string[]
}

// Mock dependencies
vi.mock("@/server/models/Bookmark", () => {
  return {
    Bookmark: {
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      create: vi.fn(),
    },
  }
})

vi.mock("@/server/utils/redis", () => ({
  redisUtils: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
    deleteKeysByPattern: vi.fn().mockResolvedValue(undefined),
  },
  CACHE_TTL: { BOOKMARKS: 900, BOOKMARK: 900 },
}))

vi.mock("@/server/utils/metadata-extractor", () => ({
  default: {
    extractMetadata: vi.fn().mockResolvedValue({
      title: "Example Page",
      coverUrl: "https://example.com/img.jpg",
    }),
  },
}))

// Type-safe mock helpers
const mockBookmarkCreate = (value: MockBookmark) =>
  (Bookmark.create as ReturnType<typeof vi.fn>).mockResolvedValue(value)

const mockBookmarkFind = (value: MockBookmark[]) =>
  (Bookmark.find as ReturnType<typeof vi.fn>).mockResolvedValue(value)

const mockBookmarkFindById = (value: MockBookmark | null) =>
  (Bookmark.findById as ReturnType<typeof vi.fn>).mockResolvedValue(value)

const mockBookmarkFindByIdAndUpdate = (value: MockBookmark | null) =>
  (Bookmark.findByIdAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue(value)

const mockBookmarkFindByIdAndDelete = (value: MockBookmark | null) =>
  (Bookmark.findByIdAndDelete as ReturnType<typeof vi.fn>).mockResolvedValue(value)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("bookmarkService.createBookmark", () => {
  it("creates a bookmark with auto-extracted metadata", async () => {
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: "user1",
      url: "https://example.com",
      title: "Example Page",
      coverUrl: "https://example.com/img.jpg",
      tags: ["dev"],
    }
    mockBookmarkCreate(mockBookmark)

    const result = await bookmarkService.createBookmark(
      "user1",
      "https://example.com",
      ["dev"],
    )

    expect(Bookmark.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        url: "https://example.com",
        title: "Example Page",
        tags: ["dev"],
      }),
    )
    expect(redisUtils.deleteKeysByPattern).toHaveBeenCalled()
    expect(result.url).toBe("https://example.com")
  })

  it("throws when userId or url missing", async () => {
    await expect(
      bookmarkService.createBookmark("", "https://example.com"),
    ).rejects.toThrow("NO_USER_ID_OR_URL")
    await expect(bookmarkService.createBookmark("user1", "")).rejects.toThrow(
      "NO_USER_ID_OR_URL",
    )
  })
})

describe("bookmarkService.getBookmarks", () => {
  it("returns cached result on cache hit", async () => {
    const cached: MockBookmark[] = [{ _id: "bm1", url: "https://example.com" }]
    vi.mocked(redisUtils.get).mockResolvedValue(cached)

    const result = await bookmarkService.getBookmarks("user1")
    expect(result).toEqual(cached)
    expect(Bookmark.find).not.toHaveBeenCalled()
  })

  it("queries DB on cache miss and caches result", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    const bookmarks: MockBookmark[] = [{ _id: "bm1", url: "https://example.com" }]
    mockBookmarkFind(bookmarks)

    const result = await bookmarkService.getBookmarks("user1")
    expect(Bookmark.find).toHaveBeenCalledWith({ userId: "user1" })
    expect(redisUtils.set).toHaveBeenCalled()
    expect(result).toEqual(bookmarks)
  })

  it("builds query with tags filter", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    mockBookmarkFind([])

    await bookmarkService.getBookmarks("user1", ["js", "react"])
    expect(Bookmark.find).toHaveBeenCalledWith({
      userId: "user1",
      tags: { $in: ["js", "react"] },
    })
  })

  it("builds query with title filter", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    mockBookmarkFind([])

    await bookmarkService.getBookmarks("user1", undefined, "tutorial")
    expect(Bookmark.find).toHaveBeenCalledWith({
      userId: "user1",
      title: { $regex: "tutorial", $options: "i" },
    })
  })
})

describe("bookmarkService.getBookmarkByID", () => {
  it("returns bookmark for valid owner", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "user1" },
      url: "https://example.com",
    }
    mockBookmarkFindById(mockBookmark)

    const result = await bookmarkService.getBookmarkByID("user1", "bm1")
    expect(result.url).toBe("https://example.com")
  })

  it("throws UNAUTHORIZED for wrong owner", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "other-user" },
    }
    mockBookmarkFindById(mockBookmark)

    await expect(
      bookmarkService.getBookmarkByID("user1", "bm1"),
    ).rejects.toThrow("UNAUTHORIZED")
  })

  it("throws BOOKMARK_NOT_FOUND for unknown id", async () => {
    vi.mocked(redisUtils.get).mockResolvedValue(null)
    mockBookmarkFindById(null)

    await expect(
      bookmarkService.getBookmarkByID("user1", "unknown"),
    ).rejects.toThrow("BOOKMARK_NOT_FOUND")
  })
})

describe("bookmarkService.updateBookmark", () => {
  it("updates bookmark fields and invalidates cache", async () => {
    const existingBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "user1" },
    }
    const updatedBookmark: MockBookmark = {
      _id: "bm1",
      title: "New Title",
    }
    mockBookmarkFindById(existingBookmark)
    mockBookmarkFindByIdAndUpdate(updatedBookmark)

    const result = await bookmarkService.updateBookmark(
      "user1",
      "bm1",
      "New Title",
      undefined,
      ["updated"],
    )

    expect(Bookmark.findByIdAndUpdate).toHaveBeenCalledWith(
      "bm1",
      { title: "New Title", tags: ["updated"] },
      { new: true },
    )
    expect(redisUtils.deleteKeysByPattern).toHaveBeenCalled()
    expect(redisUtils.del).toHaveBeenCalled()
    expect(result!.title).toBe("New Title")
  })

  it("throws UNAUTHORIZED for wrong owner", async () => {
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "other-user" },
    }
    mockBookmarkFindById(mockBookmark)

    await expect(
      bookmarkService.updateBookmark("user1", "bm1", "title"),
    ).rejects.toThrow("UNAUTHORIZED")
  })
})

describe("bookmarkService.deleteBookmark", () => {
  it("deletes bookmark and invalidates cache", async () => {
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "user1" },
    }
    mockBookmarkFindById(mockBookmark)
    mockBookmarkFindByIdAndDelete(null)

    const result = await bookmarkService.deleteBookmark("user1", "bm1")
    expect(result.message).toBe("Bookmark removed")
    expect(Bookmark.findByIdAndDelete).toHaveBeenCalledWith("bm1")
    expect(redisUtils.deleteKeysByPattern).toHaveBeenCalled()
    expect(redisUtils.del).toHaveBeenCalled()
  })

  it("throws UNAUTHORIZED for wrong owner", async () => {
    const mockBookmark: MockBookmark = {
      _id: "bm1",
      userId: { toString: () => "other-user" },
    }
    mockBookmarkFindById(mockBookmark)

    await expect(
      bookmarkService.deleteBookmark("user1", "bm1"),
    ).rejects.toThrow("UNAUTHORIZED")
  })

  it("throws BOOKMARK_NOT_FOUND for unknown id", async () => {
    mockBookmarkFindById(null)

    await expect(
      bookmarkService.deleteBookmark("user1", "unknown"),
    ).rejects.toThrow("BOOKMARK_NOT_FOUND")
  })

  it("throws when missing params", async () => {
    await expect(bookmarkService.deleteBookmark("", "bm1")).rejects.toThrow(
      "NO_USER_ID_OR_BOOKMARK_ID",
    )
  })
})
