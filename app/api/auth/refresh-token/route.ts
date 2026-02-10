import authService from "@/server/services/auth.service"
import { connectDatabase } from "@/server/config/database"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "You should provide a refresh token" },
        { status: 400 },
      )
    }

    await connectDatabase()

    const accessToken = await authService.refreshAccessToken(refreshToken)

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "NO_REFRESH_TOKEN" || message === "INVALID_REFRESH_TOKEN") {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
