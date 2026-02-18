import {
  BOOKMARK_CONTENT_TYPES,
  type BookmarkContentType,
} from "@/server/models/Bookmark"

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
 * Classifies a bookmark URL into `domain`, `platform`, and `contentType`.
 * @param url Bookmark URL.
 * @returns Classification object with safe fallback values.
 */
const classifyUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const domain = normalizeHostname(parsedUrl.hostname)
    const candidates = getDomainCandidates(domain)

    const platformFromOverride = candidates
      .map((candidate) => PLATFORM_BY_DOMAIN[candidate])
      .find(Boolean)

    const platform = platformFromOverride ?? getPlatformFromHostname(domain)
    const contentType = isPdfPath(parsedUrl.pathname)
      ? "document"
      : (PLATFORM_TO_CONTENT_TYPE.get(platform) ?? "article")

    return { domain, platform, contentType }
  } catch {
    return { domain: "", platform: "unknown", contentType: "article" as const }
  }
}

export default { classifyUrl }
