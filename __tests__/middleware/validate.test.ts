import { describe, it, expect } from "vitest"
import { z } from "zod"
import { validate } from "@/server/middleware/validate"

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe("validate middleware", () => {
  it("returns success with valid data", () => {
    const result = validate(testSchema, { name: "Alice", age: 25 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: "Alice", age: 25 })
    }
  })

  it("returns 400 with invalid data", () => {
    const result = validate(testSchema, { name: "", age: -1 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })

  it("returns 400 with missing fields", () => {
    const result = validate(testSchema, {})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })

  it("returns 400 with wrong types", () => {
    const result = validate(testSchema, { name: 123, age: "twenty" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })

  it("response body contains error details", async () => {
    const result = validate(testSchema, { name: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe("Invalid request data")
      expect(body.details).toBeDefined()
    }
  })
})
