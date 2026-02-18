import {
  BOOKMARK_CONTENT_TYPES,
  type BookmarkContentType,
  IBookmark as Bookmark,
} from "@/server/models/Bookmark"

interface UrlClassification extends Pick<
  Bookmark,
  "domain" | "platform" | "contentType"
> {}

/**
 * Explicit hostname-to-platform overrides for domains that cannot be inferred
 * correctly using generic hostname parsing.
 */
const PLATFORM_BY_DOMAIN: Record<string, string> = {
  "apple.news": "apple-news",
  "music.apple.com": "apple-music",
  "docs.google.com": "google-docs",
  "drive.google.com": "google-drive",
  "youtu.be": "youtube",
}

/**
 * Prefixes used by common second-level TLD patterns such as `co.uk`.
 * When matched, the platform label is selected one segment earlier.
 */
const MULTI_PART_TLD_PREFIXES = new Set([
  "co",
  "com",
  "org",
  "net",
  "gov",
  "edu",
])

/**
 * Platform groups used to resolve `contentType` from a classified platform.
 */
const CONTENT_TYPE_PLATFORMS: Record<BookmarkContentType, string[]> = {
  article: [],
  document: ["google-docs", "google-drive", "notion"],
  music: ["apple-music", "deezer", "soundcloud", "spotify"],
  other: [],
  podcast: ["apple-news", "substack"],
  video: ["dailymotion", "tiktok", "vimeo", "youtube"],
}

const PLATFORM_TO_CONTENT_TYPE = new Map<string, BookmarkContentType>(
  BOOKMARK_CONTENT_TYPES.flatMap((contentType) =>
    CONTENT_TYPE_PLATFORMS[contentType].map((platform) => [
      platform,
      contentType,
    ]),
  ),
)

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3/videos"
const YOUTUBE_MUSIC_CATEGORY_ID = "10"
const YOUTUBE_MUSIC_TOPIC_HINTS = ["/wiki/Music", "/m/04rlf"]

/**
 * Normalizes a hostname for deterministic matching.
 * @param value Raw hostname value.
 * @returns Lowercased hostname without `www.` prefix.
 */
const normalizeHostname = (value: string) =>
  value
    .toLowerCase()
    .replace(/^www\./, "")
    .trim()

/**
 * Derives the platform label from a hostname by removing TLD parts.
 * @param hostname URL hostname.
 * @returns Platform slug or `unknown` when extraction is not possible.
 */
const getPlatformFromHostname = (hostname: string): string => {
  const parts = normalizeHostname(hostname).split(".").filter(Boolean)

  if (parts.length === 0) return "unknown"
  if (parts.length === 1) return parts[0]
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] &&
    MULTI_PART_TLD_PREFIXES.has(parts[parts.length - 2])
  ) {
    return parts[parts.length - 3]
  }

  return parts[parts.length - 2]
}

/**
 * Builds ordered hostname candidates used for platform override lookups.
 * @param hostname URL hostname.
 * @returns Array containing full hostname and root-domain candidate.
 */
const getDomainCandidates = (hostname: string): string[] => {
  const normalized = normalizeHostname(hostname)
  const parts = normalized.split(".").filter(Boolean)

  if (parts.length < 2) return [normalized]

  return [normalized, `${parts[parts.length - 2]}.${parts[parts.length - 1]}`]
}

/**
 * Checks whether a URL path points to a PDF resource.
 * @param pathname URL pathname.
 * @returns `true` when pathname ends with `.pdf` (case-insensitive).
 */
const isPdfPath = (pathname: string): boolean =>
  pathname.toLowerCase().endsWith(".pdf")

/**
 * Returns true when the value looks like a YouTube video ID.
 */
const isValidYoutubeVideoId = (value: string): boolean =>
  /^[a-zA-Z0-9_-]{11}$/.test(value)

/**
 * Extracts a YouTube video ID from common URL patterns.
 */
const extractYoutubeVideoId = (parsedUrl: URL): string | null => {
  const hostname = normalizeHostname(parsedUrl.hostname)
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean)

  if (hostname === "youtu.be") {
    const candidate = pathParts[0] ?? ""
    return isValidYoutubeVideoId(candidate) ? candidate : null
  }

  if (!hostname.endsWith("youtube.com")) return null

  const fromQuery = parsedUrl.searchParams.get("v")
  if (fromQuery && isValidYoutubeVideoId(fromQuery)) return fromQuery

  const firstPathPart = pathParts[0] ?? ""
  const secondPathPart = pathParts[1] ?? ""
  if (
    ["embed", "shorts", "live", "v"].includes(firstPathPart) &&
    isValidYoutubeVideoId(secondPathPart)
  ) {
    return secondPathPart
  }

  return null
}

/**
 * Resolves YouTube content type using the Videos API.
 */
const classifyYoutubeContentType = async (
  videoId: string,
): Promise<BookmarkContentType | undefined> => {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return undefined

  try {
    const url = new URL(YOUTUBE_API_BASE_URL)
    url.searchParams.set("part", "snippet,topicDetails")
    url.searchParams.set("id", videoId)
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return undefined

    const payload = (await response.json()) as {
      items?: Array<{
        snippet?: { categoryId?: string }
        topicDetails?: { topicCategories?: string[] }
      }>
    }

    const video = payload.items?.[0]
    if (!video) return undefined

    if (video.snippet?.categoryId === YOUTUBE_MUSIC_CATEGORY_ID) {
      return "music"
    }

    const topicCategories = video.topicDetails?.topicCategories ?? []
    const isMusicTopic = topicCategories.some((topicCategory) =>
      YOUTUBE_MUSIC_TOPIC_HINTS.some((hint) =>
        topicCategory.toLowerCase().includes(hint.toLowerCase()),
      ),
    )
    return isMusicTopic ? "music" : "video"
  } catch {
    return undefined
  }
}

/**
 * Classifies a bookmark URL into `domain`, `platform`, and `contentType`.
 * @param url Bookmark URL.
 * @returns Classification object with safe fallback values.
 */
const classifyUrl = async (url: string): Promise<UrlClassification> => {
  try {
    const parsedUrl = new URL(url)
    const domain = normalizeHostname(parsedUrl.hostname)
    const candidates = getDomainCandidates(domain)

    const platformFromOverride = candidates
      .map((candidate) => PLATFORM_BY_DOMAIN[candidate])
      .find(Boolean)

    const platform = platformFromOverride ?? getPlatformFromHostname(domain)
    let contentType: BookmarkContentType = isPdfPath(parsedUrl.pathname)
      ? "document"
      : (PLATFORM_TO_CONTENT_TYPE.get(platform) ?? "article")

    if (platform === "youtube" && contentType === "video") {
      const videoId = extractYoutubeVideoId(parsedUrl)
      if (videoId) {
        const youtubeContentType = await classifyYoutubeContentType(videoId)
        if (youtubeContentType) contentType = youtubeContentType
      }
    }

    return { domain, platform, contentType }
  } catch {
    return { domain: "", platform: "unknown", contentType: "article" as const }
  }
}

export default { classifyUrl }
