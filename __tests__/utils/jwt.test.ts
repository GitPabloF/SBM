import { describe, it, expect, beforeAll } from "vitest"
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/server/utils/jwt.utile"

beforeAll(() => {
  process.env.JWT_SECRET = "test-access-secret"
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret"
  process.env.JWT_ACCESS_TOKEN_EXPIRATION = "15m"
  process.env.JWT_REFRESH_TOKEN_EXPIRATION = "7d"
})

const payload = { id: "user123", email: "test@example.com" }

describe("Access Token", () => {
  it("creates and verifies an access token", () => {
    const token = createAccessToken(payload)
    expect(token).toBeTypeOf("string")

    const decoded = verifyAccessToken(token)
    expect(decoded.id).toBe(payload.id)
    expect(decoded.email).toBe(payload.email)
  })

  it("throws on invalid access token", () => {
    expect(() => verifyAccessToken("invalid-token")).toThrow(
      "INVALID_ACCESS_TOKEN",
    )
  })

  it("throws on empty token", () => {
    expect(() => verifyAccessToken("")).toThrow()
  })
})

describe("Refresh Token", () => {
  it("creates and verifies a refresh token", () => {
    const token = createRefreshToken(payload)
    expect(token).toBeTypeOf("string")

    const decoded = verifyRefreshToken(token)
    expect(decoded.id).toBe(payload.id)
    expect(decoded.email).toBe(payload.email)
  })

  it("throws on invalid refresh token", () => {
    expect(() => verifyRefreshToken("invalid-token")).toThrow(
      "INVALID_REFRESH_TOKEN",
    )
  })

  it("rejects an access token used as refresh token", () => {
    const accessToken = createAccessToken(payload)
    expect(() => verifyRefreshToken(accessToken)).toThrow(
      "INVALID_REFRESH_TOKEN",
    )
  })

  it("rejects a refresh token used as access token", () => {
    const refreshToken = createRefreshToken(payload)
    expect(() => verifyAccessToken(refreshToken)).toThrow(
      "INVALID_ACCESS_TOKEN",
    )
  })
})
