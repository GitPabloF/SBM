import mongoose, { Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  role: "user" | "admin"
  password: string
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
