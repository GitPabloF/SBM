import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import bcrypt from "bcrypt"

// Mock Mongoose User model
vi.mock("@/server/models/User", () => {
  const mockUser = {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  }
  return { User: mockUser, IUser: {} }
})

// Mock JWT utils
vi.mock("@/server/utils/jwt.utile", () => ({
  createAccessToken: vi.fn(() => "mock-access-token"),
  verifyRefreshToken: vi.fn(),
}))

import authService from "@/server/services/auth.service"
import { User } from "@/server/models/User"
import { verifyRefreshToken } from "@/server/utils/jwt.utile"

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret"
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret"
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe("authService.createUser", () => {
  it("creates a user with hashed password", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null)
    vi.mocked(User.create).mockResolvedValue({
      _id: "id1",
      name: "John",
      email: "john@test.com",
      role: "user",
      password: "hashed",
    })

    const user = await authService.createUser(
      "John",
      "john@test.com",
      "Password1",
    )
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@test.com" })
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "John",
        email: "john@test.com",
        role: "user",
      }),
    )
    // Password should be hashed, not plain
    const createCall = vi.mocked(User.create).mock.calls[0][0] as {
      password: string
    }
    expect(createCall.password).not.toBe("Password1")
    expect(user).toBeDefined()
  })

  it("throws if user already exists", async () => {
    vi.mocked(User.findOne).mockResolvedValue({ email: "john@test.com" })

    await expect(
      authService.createUser("John", "john@test.com", "Password1"),
    ).rejects.toThrow("USER_ALREADY_EXISTS")
  })

  it("throws if email or password missing", async () => {
    await expect(authService.createUser("John", "", "Password1")).rejects.toThrow(
      "must have email and password",
    )
    await expect(
      authService.createUser("John", "a@b.com", ""),
    ).rejects.toThrow("must have email and password")
  })

  it("defaults name to 'User' when empty", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null)
    vi.mocked(User.create).mockResolvedValue({
      _id: "id1",
      name: "User",
      email: "a@b.com",
      role: "user",
    })

    await authService.createUser("", "a@b.com", "Password1")
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "User" }),
    )
  })
})

describe("authService.validateUser", () => {
  it("returns user on valid credentials", async () => {
    const hashed = await bcrypt.hash("Password1", 10)
    vi.mocked(User.findOne).mockResolvedValue({
      _id: "id1",
      email: "a@b.com",
      password: hashed,
    })

    const user = await authService.validateUser("a@b.com", "Password1")
    expect(user).toBeDefined()
    expect(user.email).toBe("a@b.com")
  })

  it("throws USER_NOT_FOUND for unknown email", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null)

    await expect(
      authService.validateUser("unknown@test.com", "Password1"),
    ).rejects.toThrow("USER_NOT_FOUND")
  })

  it("throws PASSWORD_INCORRECT on wrong password", async () => {
    const hashed = await bcrypt.hash("Password1", 10)
    vi.mocked(User.findOne).mockResolvedValue({
      _id: "id1",
      email: "a@b.com",
      password: hashed,
    })

    await expect(
      authService.validateUser("a@b.com", "WrongPass1"),
    ).rejects.toThrow("PASSWORD_INCORRECT")
  })
})

describe("authService.refreshAccessToken", () => {
  it("returns a new access token for valid refresh token", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({
      id: "id1",
      email: "a@b.com",
    })
    vi.mocked(User.findById).mockResolvedValue({
      _id: "id1",
      email: "a@b.com",
    })

    const token = await authService.refreshAccessToken("valid-refresh")
    expect(token).toBe("mock-access-token")
  })

  it("throws when no refresh token provided", async () => {
    await expect(authService.refreshAccessToken("")).rejects.toThrow(
      "NO_REFRESH_TOKEN",
    )
  })

  it("throws when user not found", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({
      id: "id1",
      email: "a@b.com",
    })
    vi.mocked(User.findById).mockResolvedValue(null)

    await expect(
      authService.refreshAccessToken("valid-refresh"),
    ).rejects.toThrow("USER_NOT_FOUND")
  })
})

describe("authService.deleteUser", () => {
  it("deletes an existing user", async () => {
    vi.mocked(User.findById).mockResolvedValue({ _id: "id1" })
    vi.mocked(User.findByIdAndDelete).mockResolvedValue(null)

    const result = await authService.deleteUser("id1")
    expect(result.message).toBe("User deleted successfully")
    expect(User.findByIdAndDelete).toHaveBeenCalledWith("id1")
  })

  it("throws USER_NOT_FOUND for unknown ID", async () => {
    vi.mocked(User.findById).mockResolvedValue(null)

    await expect(authService.deleteUser("unknown")).rejects.toThrow(
      "USER_NOT_FOUND",
    )
  })

  it("throws when no userId provided", async () => {
    await expect(authService.deleteUser("")).rejects.toThrow("NO_USER_ID")
  })
})

describe("authService.changePassword", () => {
  it("changes password successfully", async () => {
    const hashed = await bcrypt.hash("OldPass1", 10)
    const mockUser = { _id: "id1", password: hashed, save: vi.fn() }
    vi.mocked(User.findById).mockResolvedValue(mockUser)

    const result = await authService.changePassword("id1", "OldPass1", "NewPass1")
    expect(result.message).toBe("Password changed successfully")
    expect(mockUser.save).toHaveBeenCalled()
    // New password should be hashed
    expect(mockUser.password).not.toBe("NewPass1")
  })

  it("throws on incorrect current password", async () => {
    const hashed = await bcrypt.hash("OldPass1", 10)
    vi.mocked(User.findById).mockResolvedValue({
      _id: "id1",
      password: hashed,
      save: vi.fn(),
    })

    await expect(
      authService.changePassword("id1", "WrongPass1", "NewPass1"),
    ).rejects.toThrow("CURRENT_PASSWORD_INCORRECT")
  })
})

describe("authService.updateUser", () => {
  it("updates user name", async () => {
    const mockUser = {
      _id: "id1",
      name: "Old",
      email: "a@b.com",
      save: vi.fn(),
    }
    vi.mocked(User.findById).mockResolvedValue(mockUser)

    const result = await authService.updateUser("id1", "New Name")
    expect(result.message).toBe("User updated successfully")
    expect(mockUser.name).toBe("New Name")
    expect(mockUser.save).toHaveBeenCalled()
  })

  it("throws when neither name nor email provided", async () => {
    await expect(authService.updateUser("id1")).rejects.toThrow(
      "NAME_OR_EMAIL_ARE_REQUIRED",
    )
  })
})

describe("authService.getUserById", () => {
  it("returns user without password", async () => {
    const selectMock = vi.fn().mockResolvedValue({
      _id: "id1",
      name: "John",
      email: "a@b.com",
    })
    vi.mocked(User.findById).mockReturnValue({ select: selectMock } as never)

    const user = await authService.getUserById("id1")
    expect(selectMock).toHaveBeenCalledWith("-password")
    expect(user.name).toBe("John")
  })

  it("throws USER_NOT_FOUND when user doesn't exist", async () => {
    const selectMock = vi.fn().mockResolvedValue(null)
    vi.mocked(User.findById).mockReturnValue({ select: selectMock } as never)

    await expect(authService.getUserById("unknown")).rejects.toThrow(
      "USER_NOT_FOUND",
    )
  })
})
