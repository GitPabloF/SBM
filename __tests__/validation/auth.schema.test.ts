import { describe, it, expect } from "vitest"
import { loginSchema, signupSchema } from "@/server/validation/auth.schema"

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "Password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Pass1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password without uppercase letter", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password without lowercase letter", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "PASSWORD1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password without digit", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password",
    })
    expect(result.success).toBe(false)
  })

  it("trims whitespace from email", () => {
    const result = loginSchema.safeParse({
      email: "  user@example.com  ",
      password: "Password1",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("user@example.com")
    }
  })
})

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "Password1",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = signupSchema.safeParse({
      name: "",
      email: "john@example.com",
      password: "Password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing name", () => {
    const result = signupSchema.safeParse({
      email: "john@example.com",
      password: "Password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      name: "John",
      email: "bad",
      password: "Password1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects weak password", () => {
    const result = signupSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "weak",
    })
    expect(result.success).toBe(false)
  })
})
