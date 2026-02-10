import { validate } from "@/server/middleware/validate"
import { signupSchema } from "@/server/validation/auth.schema"
import authService from "@/server/services/auth.service"
import { createAccessToken, createRefreshToken } from "@/server/utils/jwt.utile"
import { connectDatabase } from "@/server/config/database"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      accessToken,
      refreshToken,
    })
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
        error: `an error has occured: ${error}`,
      },
      { status: 500 },
    )
  }
}
