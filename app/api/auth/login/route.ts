import { validate } from "@/server/middleware/validate"
import { loginSchema } from "@/server/validation/auth.schema"
import authService from "@/server/services/auth.service"
import { createAccessToken, createRefreshToken } from "@/server/utils/jwt.utile"
import { connectDatabase } from "@/server/config/database"
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextResponse } from "next/server"

/**
 * Handle user login requests. Validates the request body, checks user credentials, and returns access and refresh tokens if successful.
 * @param request
 * @returns
 */
export async function POST(request: Request) {
  try {
    // Limit to 10 requests per 15 minutes to prevent brute-force attacks
    const limited = await checkRateLimit(request, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    })
    if (limited) return limited

    const body = await request.json()

    // validate the request body
    const validation = validate(loginSchema, body)
    if (!validation.success) return validation.response

    const { email, password } = validation.data

    await connectDatabase()

    const user = await authService.validateUser(email, password)
    const accessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    })
    const refreshToken = createRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND" || message === "PASSWORD_INCORRECT") {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
