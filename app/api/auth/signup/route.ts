import { validate } from "@/server/middleware/validate"
import { signupSchema } from "@/server/validation/auth.schema"
import authService from "@/server/services/auth.service"
import { createAccessToken, createRefreshToken } from "@/server/utils/jwt.utile"
import { connectDatabase } from "@/server/config/database"
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextResponse } from "next/server"
import { accessCookieOptions, refreshCookieOptions, isProd } from "@/server/utils/cookies"


export async function POST(request: Request) {
  try {
    // Limit to 10 requests per 15 minutes to prevent brute-force attacks
    const limited = await checkRateLimit(request, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    })
    if (limited) return limited

    const body = await request.json()
    const validation = validate(signupSchema, body)
    if (!validation.success) return validation.response

    const { name, email, password } = validation.data

    await connectDatabase()

    const user = await authService.createUser(name, email, password)
    const accessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    })
    const refreshToken = createRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    const res = NextResponse.json({
      success: true,
      message: "User created successfully",
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      ...(isProd ? {} : { accessToken, refreshToken }),
    })

    res.cookies.set("accessToken", accessToken, accessCookieOptions)
    res.cookies.set("refreshToken", refreshToken, refreshCookieOptions)

    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
        },
        { status: 400 },
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: "an error has occured",
      },
      { status: 500 },
    )
  }
}
