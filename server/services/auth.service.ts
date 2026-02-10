import bcrypt from "bcrypt"
import { User, IUser } from "@/server/models/User"
import { createAccessToken, verifyRefreshToken } from "@/server/utils/jwt.utile"

/**
 * Create a new user
 * @param name - The name of the user
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The created user
 */
const createUser = async (name: string, email: string, password: string) => {
  if (!email || !password) throw new Error("must have email and password")

  const userName = name || "User"
  const user = await User.findOne({ email })
  if (user) throw new Error("USER_ALREADY_EXISTS")
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = await User.create({
    name: userName,
    email,
    role: "user",
    password: hashedPassword,
  })
  return newUser as IUser
}

/**
 * Validate a user
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The validated user
 */
const validateUser = async (email: string, password: string) => {
  if (!email || !password) throw new Error("must have email and password")

  const user = await User.findOne({ email })
  if (!user) throw new Error("USER_NOT_FOUND")
  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error("PASSWORD_INCORRECT")
  return user as IUser
}

/**
 * Refresh an access token
 * @param refreshToken - The refresh token to refresh
 * @returns The refreshed access token
 */
const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN")

  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) throw new Error("INVALID_REFRESH_TOKEN")

  const user = await User.findById(decoded.id)
  if (!user) throw new Error("USER_NOT_FOUND")

  const accessToken = createAccessToken({
    id: user._id.toString(),
    email: user.email,
  })
  return accessToken
}

/**
 * Delete a user
 * @param userId - The user ID to delete
 * @returns The deleted user
 */
const deleteUser = async (userId: string) => {
  if (!userId) throw new Error("NO_USER_ID")

  const user = await User.findById(userId)
  if (!user) throw new Error("USER_NOT_FOUND")

  await User.findByIdAndDelete(userId)
  return { message: "User deleted successfully" }
}

/**
 * Change a user's password
 * @param userId - The user ID
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns The message
 */
const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!userId || !newPassword) throw new Error("NO_USER_ID_OR_NEW_PASSWORD")

  const user = await User.findById(userId)
  if (!user) throw new Error("USER_NOT_FOUND")

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  )
  if (!isCurrentPasswordValid) throw new Error("CURRENT_PASSWORD_INCORRECT")

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  await user.save()

  return { message: "Password changed successfully" }
}

/**
 * Update a user
 * @param userId - The user ID
 * @param name - The name of the user
 * @param email - The email of the user
 * @returns The updated user
 */
const updateUser = async (userId: string, name?: string, email?: string) => {
  if (!userId) throw new Error("NO_USER_ID")
  if (!name && !email) throw new Error("NAME_OR_EMAIL_ARE_REQUIRED")

  const user = await User.findById(userId)
  if (!user) throw new Error("USER_NOT_FOUND")

  if (name) user.name = name
  if (email) user.email = email

  await user.save()

  return { message: "User updated successfully" }
}

/**
 * Get user by ID
 * @param userId - The user ID
 * @returns The user (without password)
 */
const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password")
  if (!user) throw new Error("USER_NOT_FOUND")
  return user
}

export default {
  validateUser,
  createUser,
  refreshAccessToken,
  deleteUser,
  changePassword,
  getUserById,
  updateUser,
}
