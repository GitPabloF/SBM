import mongoose, { Document } from "mongoose"

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId
  url: string
  title: string
  coverUrl?: string
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
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export const Bookmark =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema)
