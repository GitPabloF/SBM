import mongoose, { Document } from "mongoose"

export const BOOKMARK_CONTENT_TYPES = [
  "article",
  "music",
  "video",
  "document",
  "podcast",
  "other",
] as const

export type BookmarkContentType = (typeof BOOKMARK_CONTENT_TYPES)[number]

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId
  url: string
  title: string
  coverUrl?: string
  domain: string
  platform: string
  contentType: BookmarkContentType
  tags?: string[]
}

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    coverUrl: {
      type: String,
      required: false,
    },
    domain: {
      type: String,
      required: true,
      default: "",
    },
    platform: {
      type: String,
      required: true,
      default: "unknown",
    },
    contentType: {
      type: String,
      enum: BOOKMARK_CONTENT_TYPES,
      required: true,
      default: "article",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

export const Bookmark =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema)
