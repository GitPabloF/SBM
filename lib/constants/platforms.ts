export type BookmarkContentType =
  | "article"
  | "music"
  | "video"
  | "document"
  | "podcast"
  | "social"
  | "other"

export type PlatformChipStyles = {
  border: string
  background: string
  text: string
}

export type PlatformMetadata = {
  label: string
  domains: string[]
  chip: PlatformChipStyles
}

type PlatformDefinition = {
  label: string
  domains?: string[]
  chip?: PlatformChipStyles
  contentType: BookmarkContentType
}

const DEFAULT_PLATFORM_CHIP: PlatformChipStyles = {
  border: "border-slate-200",
  background: "bg-slate-100",
  text: "text-slate-700",
}

const PLATFORM_DEFINITIONS_BY_SLUG: Record<string, PlatformDefinition> = {
  "amazon-music": {
    label: "Amazon Music",
    domains: ["music.amazon.com"],
    chip: {
      border: "border-cyan-200",
      background: "bg-cyan-50",
      text: "text-cyan-700",
    },
    contentType: "music",
  },
  "apple-music": {
    label: "Apple Music",
    domains: ["music.apple.com"],
    chip: {
      border: "border-rose-200",
      background: "bg-rose-50",
      text: "text-rose-700",
    },
    contentType: "music",
  },
  "apple-news": {
    label: "Apple News",
    domains: ["apple.news"],
    chip: {
      border: "border-red-200",
      background: "bg-red-50",
      text: "text-red-700",
    },
    contentType: "podcast",
  },
  "apple-podcasts": {
    label: "Apple Podcasts",
    domains: ["podcasts.apple.com"],
    chip: {
      border: "border-fuchsia-200",
      background: "bg-fuchsia-50",
      text: "text-fuchsia-700",
    },
    contentType: "podcast",
  },
  audible: {
    label: "Audible",
    domains: ["audible.com"],
    chip: {
      border: "border-amber-200",
      background: "bg-amber-50",
      text: "text-amber-700",
    },
    contentType: "podcast",
  },
  audiomack: { label: "Audiomack", contentType: "music" },
  bandcamp: { label: "Bandcamp", contentType: "music" },
  bilibili: { label: "Bilibili", contentType: "video" },
  bluesky: {
    label: "Bluesky",
    domains: ["bluesky.app"],
    chip: {
      border: "border-sky-200",
      background: "bg-sky-50",
      text: "text-sky-700",
    },
    contentType: "social",
  },
  canva: {
    label: "Canva",
    domains: ["canva.com"],
    contentType: "document",
  },
  castbox: { label: "Castbox", contentType: "podcast" },
  dailymotion: { label: "Dailymotion", contentType: "video" },
  deezer: { label: "Deezer", contentType: "music" },
  discord: {
    label: "Discord",
    domains: ["discord.gg"],
    contentType: "social",
  },
  dropbox: {
    label: "Dropbox",
    domains: ["dropbox.com"],
    contentType: "document",
  },
  facebook: { label: "Facebook", contentType: "social" },
  figma: { label: "Figma", contentType: "document" },
  "google-docs": {
    label: "Google Docs",
    domains: ["docs.google.com"],
    chip: {
      border: "border-blue-200",
      background: "bg-blue-50",
      text: "text-blue-700",
    },
    contentType: "document",
  },
  "google-drive": {
    label: "Google Drive",
    domains: ["drive.google.com"],
    chip: {
      border: "border-teal-200",
      background: "bg-teal-50",
      text: "text-teal-700",
    },
    contentType: "document",
  },
  "hacker-news": {
    label: "Hacker News",
    domains: ["news.ycombinator.com"],
    chip: {
      border: "border-orange-200",
      background: "bg-orange-50",
      text: "text-orange-700",
    },
    contentType: "social",
  },
  instagram: { label: "Instagram", contentType: "social" },
  linkedin: {
    label: "LinkedIn",
    domains: ["linkedin.com"],
    chip: {
      border: "border-blue-300",
      background: "bg-blue-100",
      text: "text-blue-800",
    },
    contentType: "social",
  },
  loom: { label: "Loom", contentType: "video" },
  mastodon: { label: "Mastodon", contentType: "social" },
  notion: { label: "Notion", contentType: "document" },
  onedrive: {
    label: "OneDrive",
    domains: ["onedrive.live.com"],
    contentType: "document",
  },
  other: { label: "Other", contentType: "other" },
  overcast: { label: "Overcast", contentType: "podcast" },
  "pocket-casts": {
    label: "Pocket Casts",
    domains: ["pca.st"],
    contentType: "podcast",
  },
  pinterest: { label: "Pinterest", contentType: "social" },
  reddit: {
    label: "Reddit",
    domains: ["reddit.com"],
    chip: {
      border: "border-orange-200",
      background: "bg-orange-50",
      text: "text-orange-700",
    },
    contentType: "social",
  },
  scribd: { label: "Scribd", contentType: "document" },
  sharepoint: {
    label: "SharePoint",
    domains: ["sharepoint.com"],
    contentType: "document",
  },
  slideshare: { label: "SlideShare", contentType: "document" },
  snapchat: { label: "Snapchat", contentType: "social" },
  soundcloud: { label: "SoundCloud", contentType: "music" },
  spotify: {
    label: "Spotify",
    domains: ["spotify.com", "open.spotify.com"],
    chip: {
      border: "border-emerald-200",
      background: "bg-emerald-50",
      text: "text-emerald-700",
    },
    contentType: "music",
  },
  substack: { label: "Substack", contentType: "podcast" },
  threads: {
    label: "Threads",
    domains: ["threads.net"],
    chip: {
      border: "border-neutral-300",
      background: "bg-neutral-100",
      text: "text-neutral-800",
    },
    contentType: "social",
  },
  tidal: { label: "Tidal", contentType: "music" },
  tiktok: {
    label: "TikTok",
    domains: ["tiktok.com"],
    chip: {
      border: "border-zinc-300",
      background: "bg-zinc-100",
      text: "text-zinc-800",
    },
    contentType: "video",
  },
  twitch: {
    label: "Twitch",
    domains: ["twitch.tv"],
    chip: {
      border: "border-violet-200",
      background: "bg-violet-50",
      text: "text-violet-700",
    },
    contentType: "video",
  },
  twitter: {
    label: "Twitter",
    domains: ["twitter.com"],
    contentType: "social",
  },
  vimeo: { label: "Vimeo", contentType: "video" },
  x: {
    label: "X",
    domains: ["x.com"],
    chip: {
      border: "border-zinc-300",
      background: "bg-zinc-100",
      text: "text-zinc-800",
    },
    contentType: "social",
  },
  youtube: {
    label: "YouTube",
    domains: ["youtube.com", "youtu.be"],
    chip: {
      border: "border-red-200",
      background: "bg-red-50",
      text: "text-red-700",
    },
    contentType: "video",
  },
  "youtube-music": {
    label: "YouTube Music",
    domains: ["music.youtube.com"],
    chip: {
      border: "border-rose-200",
      background: "bg-rose-50",
      text: "text-rose-700",
    },
    contentType: "music",
  },
}

export const PLATFORM_METADATA_BY_SLUG: Record<string, PlatformMetadata> =
  Object.fromEntries(
    Object.entries(PLATFORM_DEFINITIONS_BY_SLUG).map(([slug, definition]) => [
      slug,
      {
        label: definition.label,
        domains: definition.domains ?? [],
        chip: definition.chip ?? DEFAULT_PLATFORM_CHIP,
      },
    ]),
  )

export const PLATFORM_CONTENT_TYPE_BY_SLUG: Record<
  string,
  BookmarkContentType
> = Object.fromEntries(
  Object.entries(PLATFORM_DEFINITIONS_BY_SLUG).map(([slug, definition]) => [
    slug,
    definition.contentType,
  ]),
)

export const PLATFORM_SLUG_BY_DOMAIN: Record<string, string> =
  Object.fromEntries(
    Object.entries(PLATFORM_METADATA_BY_SLUG).flatMap(([slug, metadata]) =>
      metadata.domains.map((domain) => [domain.toLowerCase(), slug]),
    ),
  )

export const normalizePlatformSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const getPlatformMetadata = (platform: string) => {
  const slug = normalizePlatformSlug(platform)
  const metadata = PLATFORM_METADATA_BY_SLUG[slug]
  if (metadata) return { slug, ...metadata }

  return {
    slug,
    label: platform,
    domains: [],
    chip: DEFAULT_PLATFORM_CHIP,
  }
}
