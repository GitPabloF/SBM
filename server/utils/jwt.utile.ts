import jwt from "jsonwebtoken"
import { authTtl } from "./auth"

const accessTokenExpiration = authTtl.access.jwt
const refreshTokenExpiration = authTtl.refresh.jwt

export interface JWTPayload {
  id: string
  email: string
}

/**
 * Create an access token
 * @returns The access token
 */
export const createAccessToken = (payload: JWTPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: accessTokenExpiration,
  })
}

/**
 * Create a refresh token
 * @param payload - The payload to sign
 * @returns The refresh token
 */
export const createRefreshToken = (payload: JWTPayload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: refreshTokenExpiration,
  })
}

/**
 * Verify a token
 * @param token - The token to verify
 * @param secret - The secret to verify the token with
 * @returns The decoded token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET as string
  if (!token || !secret) throw new Error("NO_TOKEN_OR_SECRET")
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload

    if (!decoded || !decoded.id) {
      throw new Error("INVALID_TOKEN")
    }

    return decoded
  } catch (error) {
    throw new Error("INVALID_ACCESS_TOKEN")
  }
}

/**
 * Verify a refresh token
 * @param token - The token to verify
 * @returns The decoded token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET as string
  if (!token || !secret) throw new Error("NO_TOKEN_OR_SECRET")
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload

    if (!decoded || !decoded.id) {
      throw new Error("INVALID_TOKEN")
    }

    return decoded
  } catch (error) {
    throw new Error("INVALID_REFRESH_TOKEN")
  }
}
