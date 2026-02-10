import extractMetadata from "@/server/utils/metadata-extractor"
import { Bookmark } from "../models/Bookmark"
import { redisUtils, CACHE_TTL } from "@/server/utils/redis"

const CACHE_KEYS = {
  bookmarks: (userId: string, title?: string, tags?: string[]) =>
    `bookmarks:${userId}${title ? `-${title}` : ""}${tags ? `-${tags}` : ""}`,
  bookmark: (userId: string, bookmarkId: string) =>
    `bookmark:${userId}:${bookmarkId}`,
  userPattern: (userId: string) => `bookmarks:${userId}*`,
}

interface BookmarkQuery {
  userId: string
  tags?: {
    $in: string[]
  }
  title?: {
    $regex: string
    $options: string
  }
}

interface UpdatedData {
  title?: string
  coverUrl?: string
  tags?: string[]
}

/**
 * Get all bookmarks for a specific user
 * @param userId - The user ID to fetch bookmarks for
 * @returns Promise resolving to array of bookmarks
 */
const getBookmarks = async (
  userId: string,
  tags?: string[],
  title?: string,
) => {
  const cacheKey = CACHE_KEYS.bookmarks(userId, title, tags)

  const cached = await redisUtils.get(cacheKey)
  if (cached) {
    console.log(`Cache hit for key: ${cacheKey}`)
    return cached
  }
  console.log(`Cache miss for key: ${cacheKey}`)

  const query: BookmarkQuery = { userId }
  if (tags && tags.length > 0) {
    query.tags = { $in: tags }
  }
  if (title) {
    query.title = { $regex: title, $options: "i" }
  }

  const bookmarks = await Bookmark.find(query)
  await redisUtils.set(cacheKey, bookmarks, CACHE_TTL.BOOKMARKS)

  return bookmarks
}

/**
 * Get a bookmark by ID
 * @param userId - The user ID
 * @param bookmarkId - The bookmark ID
 * @returns The bookmark
 */
const getBookmarkByID = async (userId: string, bookmarkId: string) => {
  if (!userId || !bookmarkId) throw new Error("NO_USER_ID_OR_BOOKMARK_ID")

  const cacheKey = CACHE_KEYS.bookmark(userId, bookmarkId)
  const cached = await redisUtils.get(cacheKey)
  if (cached) return cached

  const bookmark = await Bookmark.findById(bookmarkId)
  if (!bookmark) throw new Error("BOOKMARK_NOT_FOUND")
  if (bookmark.userId.toString() !== userId) throw new Error("UNAUTHORIZED")

  await redisUtils.set(cacheKey, bookmark, CACHE_TTL.BOOKMARK)

  return bookmark
}

/**
 * Update a bookmark
 * @param userId - The user ID
 * @param bookmarkId - The bookmark ID
 * @param title - The title of the bookmark
 * @param coverUrl - The cover URL of the bookmark
 * @param tags - The tags of the bookmark
 * @returns The updated bookmark
 */
const updateBookmark = async (
  userId: string,
  bookmarkId: string,
  title?: string,
  coverUrl?: string,
  tags?: string[],
) => {
  if (!userId || !bookmarkId) throw new Error("NO_USER_ID_OR_BOOKMARK_ID")

  const bookmark = await Bookmark.findById(bookmarkId)
  if (!bookmark) throw new Error("BOOKMARK_NOT_FOUND")
  if (bookmark.userId.toString() !== userId) throw new Error("UNAUTHORIZED")

  const updatedData: UpdatedData = {}

  if (title !== undefined) updatedData.title = title
  if (coverUrl !== undefined) updatedData.coverUrl = coverUrl
  if (tags !== undefined) updatedData.tags = tags

  const updatedBookmark = await Bookmark.findByIdAndUpdate(
    bookmarkId,
    updatedData,
    { new: true },
  )

  await redisUtils.deleteKeysByPattern(CACHE_KEYS.userPattern(userId))
  await redisUtils.del(CACHE_KEYS.bookmark(userId, bookmarkId))

  return updatedBookmark
}

/**
 * Create a new bookmark
 * @param userId - The user ID
 * @param url - The URL of the bookmark
 * @param tags - The tags of the bookmark
 * @returns The created bookmark
 */
const createBookmark = async (userId: string, url: string, tags?: string[]) => {
  if (!userId || !url) throw new Error("NO_USER_ID_OR_URL")
  const metadata = await extractMetadata.extractMetadata(url)
  const bookmark = await Bookmark.create({
    userId,
    url,
    title: metadata.title,
    coverUrl: metadata.coverUrl,
    tags,
  })

  await redisUtils.deleteKeysByPattern(CACHE_KEYS.userPattern(userId))

  return bookmark
}

/**
 * Delete a bookmark
 * @param userId - The user ID
 * @param bookmarkId - The bookmark ID
 * @returns The deleted bookmark
 */
const deleteBookmark = async (userId: string, bookmarkId: string) => {
  if (!userId || !bookmarkId) throw new Error("NO_USER_ID_OR_BOOKMARK_ID")

  const bookmark = await Bookmark.findById(bookmarkId)
  if (!bookmark) throw new Error("BOOKMARK_NOT_FOUND")

  if (bookmark.userId.toString() !== userId) throw new Error("UNAUTHORIZED")

  await Bookmark.findByIdAndDelete(bookmarkId)

  await redisUtils.deleteKeysByPattern(CACHE_KEYS.userPattern(userId))
  await redisUtils.del(CACHE_KEYS.bookmark(userId, bookmarkId))

  return { message: "Bookmark removed" }
}

export default {
  getBookmarks,
  createBookmark,
  deleteBookmark,
  updateBookmark,
  getBookmarkByID,
}
