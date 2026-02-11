import { describe, it, expect, beforeAll } from "vitest"
import { auth } from "@/server/middleware/auth"
import { createAccessToken } from "@/server/utils/jwt.utile"

beforeAll(() => {
  process.env.JWT_SECRET = "test-access-secret"
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret"
})

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader) headers.set("authorization", authHeader)
  return new Request("http://localhost/api/test", { headers })
}

describe("auth middleware", () => {
  it("returns success with valid Bearer token", () => {
    const token = createAccessToken({ id: "user1", email: "a@b.com" })
    const result = auth(makeRequest(`Bearer ${token}`))

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.user.id).toBe("user1")
      expect(result.user.email).toBe("a@b.com")
    }
  })

  it("returns 401 when no authorization header", () => {
    const result = auth(makeRequest())

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })

  it("returns 401 when header is not Bearer", () => {
    const result = auth(makeRequest("Basic abc123"))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })

  it("returns 401 with invalid token", () => {
    const result = auth(makeRequest("Bearer invalid-token"))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })

  it("returns 401 with Bearer but no token", () => {
    const result = auth(makeRequest("Bearer "))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })
})
